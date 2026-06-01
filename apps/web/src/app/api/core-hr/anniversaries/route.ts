import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-based
    const currentDay = today.getDate();

    // Calculate the date range for upcoming anniversaries
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    // Fetch all employees for this tenant who have a joiningDate
    const employees = await prisma.employee.findMany({
      where: {
        tenantId: user.tenantId,
        joiningDate: { not: null },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        department: true,
        joiningDate: true,
      },
    });

    const anniversaries = employees
      .filter((emp) => {
        if (!emp.joiningDate) return false;
        const joinDate = new Date(emp.joiningDate);
        const joinMonth = joinDate.getMonth() + 1;
        const joinDay = joinDate.getDate();

        // Check if the anniversary falls within the date range
        // Build a date for this year's anniversary
        const anniversaryThisYear = new Date(today.getFullYear(), joinMonth - 1, joinDay);

        // If anniversary already passed this year, don't include unless within range
        const diffTime = anniversaryThisYear.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= days;
      })
      .map((emp) => {
        const joinDate = new Date(emp.joiningDate!);
        const yearsOfService = today.getFullYear() - joinDate.getFullYear();

        return {
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.employeeCode,
          department: emp.departmentId,
          joiningDate: emp.joiningDate,
          yearsOfService,
          anniversaryDate: new Date(
            today.getFullYear(),
            joinDate.getMonth(),
            joinDate.getDate()
          ),
        };
      })
      .sort((a, b) => new Date(a.anniversaryDate).getTime() - new Date(b.anniversaryDate).getTime());

    return NextResponse.json({ anniversaries }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching anniversaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
