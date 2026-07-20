import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { user } = context;
  try {
    const tenantId = user.tenantId;

    const employees = await prisma.employee.findMany({
      where: {
        company: { tenantId },
        isDeleted: false,
      },
      include: {
        department: true,
        location: true,
        jobProfile: true,
      },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      designation: emp.jobProfile?.title || '',
      department: emp.department?.name || '',
      location: emp.location?.name || '',
      email: emp.email,
      phone: emp.employeeCode, // or another field if available
      isFavorite: false,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('[Directory API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch directory',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
