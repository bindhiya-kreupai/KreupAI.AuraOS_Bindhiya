// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
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
          anniversaryDate: new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate()),
        };
      })
      .sort(
        (a, b) => new Date(a.anniversaryDate).getTime() - new Date(b.anniversaryDate).getTime()
      );

    return NextResponse.json({ anniversaries }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching anniversaries:', error);
    return NextResponse.json(
      { error: 'Internal server error', messageAr: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
});

// Sends an anniversary notification (gift/wish) to the employee. Persists a real
// Notification row (+ recipient when the employee has a linked user account).
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const employeeId = String(body?.employeeId || '').trim();
    const notificationType = String(body?.notificationType || 'wish').toLowerCase();
    const yearsOfService = Number(body?.yearsOfService) || undefined;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required', messageAr: 'معرّف الموظف مطلوب' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, tenantId: user.tenantId },
      select: { id: true, firstName: true, lastName: true, userId: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found', messageAr: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const isGift = notificationType === 'gift';
    const yearsLabel = yearsOfService
      ? ` (${yearsOfService} year${yearsOfService === 1 ? '' : 's'})`
      : '';
    const title = isGift
      ? `Work Anniversary Gift for ${employeeName}`
      : `Work Anniversary Wishes for ${employeeName}`;
    const bodyText = isGift
      ? `Congratulations on your work anniversary${yearsLabel}! A recognition gift has been arranged for you.`
      : `Congratulations on your work anniversary${yearsLabel}! Wishing you many more successful years with us.`;

    const notification = await prisma.notification.create({
      data: {
        tenantId: user.tenantId,
        title,
        body: bodyText,
        type: 'anniversary',
        priority: 'medium',
        targetType: 'user',
        targetValue: employee.userId ?? employee.id,
        status: 'sent',
        sentAt: new Date(),
        sentCount: employee.userId ? 1 : 0,
        metadata: { employeeId: employee.id, notificationType, yearsOfService },
        createdBy: user.userId,
        ...(employee.userId
          ? {
              recipients: {
                create: {
                  userId: employee.userId,
                  status: 'delivered',
                  deliveredAt: new Date(),
                  channel: 'in_app',
                },
              },
            }
          : {}),
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error: any) {
    console.error('Error sending anniversary notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', messageAr: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
});
