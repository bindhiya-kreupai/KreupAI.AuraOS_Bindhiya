import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const BonusCycleSchema = z.object({
  name: z.string().min(1),
  totalPool: z.number().positive(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED']).optional().default('DRAFT'),
  fiscalYear: z.string().optional(),
});

// GET - Fetch bonus cycles
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      // Mock data - replace with actual database query
      const mockCycles = [
        {
          id: '1',
          name: 'Annual Performance Bonus 2024',
          totalPool: 1200000,
          status: 'IN_PROGRESS',
          fiscalYear: '2024',
          createdAt: new Date('2024-01-01').toISOString(),
          disbursementDate: null,
        },
        {
          id: '2',
          name: 'Diwali Bonus 2024',
          totalPool: 450000,
          status: 'COMPLETED',
          fiscalYear: '2024',
          createdAt: new Date('2024-10-01').toISOString(),
          disbursementDate: new Date('2024-10-15').toISOString(),
        },
        {
          id: '3',
          name: 'Q3 Sales Incentive',
          totalPool: 120000,
          status: 'COMPLETED',
          fiscalYear: '2024',
          createdAt: new Date('2024-09-01').toISOString(),
          disbursementDate: new Date('2024-09-30').toISOString(),
        },
      ];

      let filteredData = mockCycles;
      if (status) {
        filteredData = mockCycles.filter(cycle => cycle.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching bonus cycles:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bonus cycles' },
        { status: 500 }
      );
    }
  }
);

// POST - Create bonus cycle
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = BonusCycleSchema.parse(body);

      // Mock creation - replace with actual database insert
      const newCycle = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Bonus Processing',
          details: `Created bonus cycle: ${data.name} - $${data.totalPool}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newCycle }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating bonus cycle:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create bonus cycle' },
        { status: 500 }
      );
    }
  }
);
