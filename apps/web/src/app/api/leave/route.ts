/**
 * Leave Management API Routes
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/leave
 * Get leave requests with filters
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type') || 'requests';
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');
      const leaveTypeId = searchParams.get('leaveTypeId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const year = searchParams.get('year') || new Date().getFullYear().toString();
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      const tenantId = user.tenantId;

      switch (type) {
        case 'balances': {
          if (!employeeId) {
            return NextResponse.json(
              { error: 'employeeId is required for balances', errorAr: 'معرف الموظف مطلوب للأرصدة' },
              { status: 400 }
            );
          }

          const balances = await prisma.leaveBalance.findMany({
            where: {
              tenantId,
              employeeId,
              leaveYear: parseInt(year),
            },
            include: { policy: true },
            orderBy: { lastUpdated: 'desc' },
          });

          return NextResponse.json({
            success: true,
            data: {
              employeeId,
              year: parseInt(year),
              balances,
            },
          });
        }

        case 'policies': {
          const policies = await prisma.leavePolicy.findMany({
            where: { tenantId, isActive: true },
            orderBy: { createdAt: 'desc' },
          });

          return NextResponse.json({
            success: true,
            data: {
              policies,
            },
          });
        }

        case 'requests':
        default: {
          const where: Record<string, unknown> = { tenantId };
          if (employeeId) where.employeeId = employeeId;
          if (status) where.status = status;
          if (leaveTypeId) where.leaveTypeId = leaveTypeId;
          if (startDate) where.startDate = { gte: new Date(startDate) };
          if (endDate) where.endDate = { lte: new Date(endDate) };

          const [total, requests] = await Promise.all([
            prisma.leaveRequest.count({ where }),
            prisma.leaveRequest.findMany({
              where,
              orderBy: { appliedAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
          ]);

          return NextResponse.json({
            success: true,
            requests,
            leaveRequests: requests,
            data: {
              requests,
              pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
              },
            },
          });
        }
      }
    } catch (error: any) {
      logger.error('Error fetching leave data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leave data', errorAr: 'فشل في جلب بيانات الإجازات' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/leave
 * Submit leave request
 */
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const tenantId = user.tenantId;
      const employeeId = body.employeeId || user.userId;

      // Validate required fields
      const required = ['leaveTypeId', 'startDate', 'endDate', 'reason'];
      for (const field of required) {
        if (!body[field]) {
          return NextResponse.json(
            { error: `${field} is required`, errorAr: `${field} مطلوب` },
            { status: 400 }
          );
        }
      }

      // Validate dates
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date cannot be before start date', errorAr: 'لا يمكن أن يكون تاريخ الانتهاء قبل تاريخ البدء' },
          { status: 400 }
        );
      }

      // Calculate total days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const totalDays = body.totalDays || Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const leaveRequest = await prisma.leaveRequest.create({
        data: {
          tenantId,
          employeeId,
          leaveTypeId: body.leaveTypeId,
          policyId: body.policyId || null,
          startDate,
          endDate,
          totalDays,
          halfDayStart: body.halfDayStart || false,
          halfDayEnd: body.halfDayEnd || false,
          reason: body.reason,
          contactNumber: body.contactNumber || null,
          addressDuringLeave: body.addressDuringLeave || null,
          delegateToEmployeeId: body.delegateToEmployeeId || null,
          documents: body.documents || null,
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        request: leaveRequest,
        leaveRequest: leaveRequest,
      });
    } catch (error: any) {
      logger.error('Error submitting leave request:', error);
      return NextResponse.json(
        { error: 'Failed to submit leave request', errorAr: 'فشل في تقديم طلب الإجازة' },
        { status: 500 }
      );
    }
  }
);
