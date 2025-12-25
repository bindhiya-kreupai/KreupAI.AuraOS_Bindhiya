import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const GarnishmentSchema = z.object({
  employeeId: z.string(),
  type: z.string().min(1),
  amount: z.number().positive(),
  percentage: z.number().min(0).max(100).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  courtOrderNumber: z.string().optional(),
});

// GET - Fetch garnishments
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');

      const mockGarnishments = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          type: 'Child Support',
          amount: 500,
          percentage: 15,
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          courtOrderNumber: 'CS-2024-001',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          type: 'Tax Levy',
          amount: 300,
          percentage: 10,
          startDate: '2024-06-01',
          courtOrderNumber: 'TL-2024-045',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ];

      let filteredData = mockGarnishments;
      if (employeeId) {
        filteredData = mockGarnishments.filter(g => g.employeeId === employeeId);
      }
      if (status) {
        filteredData = filteredData.filter(g => g.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching garnishments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch garnishments' },
        { status: 500 }
      );
    }
  }
);

// POST - Create garnishment
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = GarnishmentSchema.parse(body);

      const newGarnishment = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Garnishments',
          details: `Created garnishment: ${data.type} - $${data.amount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newGarnishment }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating garnishment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create garnishment' },
        { status: 500 }
      );
    }
  }
);
