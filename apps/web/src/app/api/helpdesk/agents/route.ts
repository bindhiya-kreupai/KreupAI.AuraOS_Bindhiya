import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    let agents: any[] = [];

    try {
      const employees = await prisma.employee.findMany({
        where: { tenantId: user.tenantId },
        take: 10,
      });

      agents = employees.map((emp: any, index: number) => ({
        agentId: `agent-${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Agent ${index + 1}`,
        email: emp.email || '',
        department: emp.departmentId || 'General',
        role: index === 0 ? 'supervisor' : 'agent',
        skillSet: [],
        availability: {
          schedule: [],
          timeZone: 'UTC',
          outOfOffice: false,
        },
        performance: {
          averageResponseTime: 0,
          averageResolutionTime: 0,
          ticketsResolved: 0,
          ticketsAssigned: 0,
          slaComplianceRate: 0,
          averageSatisfactionRating: 0,
          firstContactResolutionRate: 0,
          period: { startDate: new Date().toISOString(), endDate: new Date().toISOString() },
        },
        currentWorkload: 0,
        maxCapacity: 15,
        status: 'available',
        createdAt: new Date().toISOString(),
        tenantId: user.tenantId,
      }));
    } catch {
      agents = [];
    }

    return NextResponse.json(
      { success: true, data: agents },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching helpdesk agents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const agent = {
      ...body,
      agentId: `agent-${Date.now()}`,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: agent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
