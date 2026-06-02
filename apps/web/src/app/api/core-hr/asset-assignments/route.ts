// @ts-nocheck — Uses prisma models / relations / fields not in current schema (salaryStructure, eRCase, grievance, BenefitClaim.employee, AssetAssignment.employee, etc.). Tracked under #29.
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  assetId: z.string().min(1),
  employeeId: z.string().min(1),
  assignedDate: z.string().min(1),
  returnedDate: z.string().optional(),
  expectedReturnDate: z.string().optional(),
  conditionAtAssignment: z.string().optional(),
  assignedBy: z.string().optional(),
  status: z.enum(['ACTIVE', 'RETURNED', 'LOST', 'DAMAGED']).optional().default('ACTIVE'),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const assetId = searchParams.get('assetId');
    const status = searchParams.get('status');

    const where: any = {
      tenantId: user.tenantId,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (assetId) {
      where.assetId = assetId;
    }

    if (status) {
      where.status = status;
    }

    const assignments = await prisma.assetAssignment.findMany({
      where,
      include: {
        asset: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
      orderBy: { assignedDate: 'desc' },
    });

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching asset assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createAssignmentSchema.parse(body);

    const data: any = {
      ...validated,
      tenantId: user.tenantId,
      assignedDate: new Date(validated.assignedDate),
    };

    if (validated.returnedDate) {
      data.returnedDate = new Date(validated.returnedDate);
    }
    if (validated.expectedReturnDate) {
      data.expectedReturnDate = new Date(validated.expectedReturnDate);
    }
    if (!validated.assignedBy) {
      data.assignedBy = user.userId;
    }

    // Use a transaction to create the assignment and update the asset status
    const assignment = await prisma.$transaction(async (tx) => {
      const newAssignment = await tx.assetAssignment.create({
        data,
        include: {
          asset: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: true,
            },
          },
        },
      });

      // Update the parent asset's status to ASSIGNED
      await tx.asset.update({
        where: { id: validated.assetId },
        data: { status: 'ASSIGNED' },
      });

      return newAssignment;
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating asset assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const existing = await prisma.assetAssignment.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Asset assignment not found' }, { status: 404 });
    }

    if (data.assignedDate) {
      data.assignedDate = new Date(data.assignedDate);
    }
    if (data.returnedDate) {
      data.returnedDate = new Date(data.returnedDate);
    }
    if (data.expectedReturnDate) {
      data.expectedReturnDate = new Date(data.expectedReturnDate);
    }

    // If assignment is being returned, update asset status back to AVAILABLE
    const assignment = await prisma.$transaction(async (tx) => {
      const updatedAssignment = await tx.assetAssignment.update({
        where: { id },
        data,
        include: {
          asset: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: true,
            },
          },
        },
      });

      if (data.status === 'RETURNED') {
        // Check if there are other active assignments for this asset
        const activeAssignments = await tx.assetAssignment.count({
          where: {
            assetId: existing.assetId,
            status: 'ACTIVE',
            id: { not: id },
          },
        });

        if (activeAssignments === 0) {
          await tx.asset.update({
            where: { id: existing.assetId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      return updatedAssignment;
    });

    return NextResponse.json({ assignment }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating asset assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
