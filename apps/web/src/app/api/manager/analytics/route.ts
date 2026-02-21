import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, employeeId } = context;
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || employeeId;
    const period = searchParams.get('period') || 'monthly';

    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager employee ID not found' },
        { status: 400 }
      );
    }

    const teamMembers = await prisma.employee.findMany({
      where: {
        managerId,
        company: { tenantId: user.tenantId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        joiningDate: true,
        status: { select: { code: true } },
      },
    });

    const teamMemberIds = teamMembers.map((m) => m.id);
    const now = new Date();

    let periodStart: Date;
    switch (period) {
      case 'weekly':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [attendanceRecords, leaveRequests, overtimeRequests, performanceReviews] =
      await Promise.all([
        prisma.attendanceRecord.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            date: { gte: periodStart, lte: now },
          },
          select: {
            employeeId: true,
            status: true,
            workHours: true,
            overtimeHours: true,
            isLate: true,
          },
        }),
        prisma.leaveRequest.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            startDate: { gte: periodStart },
          },
          select: {
            status: true,
            totalDays: true,
            employeeId: true,
          },
        }),
        prisma.overtimeRequest.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            overtimeDate: { gte: periodStart },
          },
          select: {
            employeeId: true,
            totalHours: true,
            status: true,
          },
        }),
        prisma.performanceReview.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
          },
          select: {
            employeeId: true,
            finalRating: true,
            managerRating: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length;
    const lateCount = attendanceRecords.filter((r) => r.isLate).length;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 1000) / 10
        : 100;

    const approvedLeaves = leaveRequests.filter((l) => l.status === 'APPROVED');
    const totalLeavesTaken = approvedLeaves.reduce(
      (sum, l) => sum + Number(l.totalDays),
      0
    );

    const overtimeHours = overtimeRequests
      .filter((o) => o.status === 'APPROVED')
      .reduce((sum, o) => sum + o.totalHours, 0);

    const overtimeByEmployee: Record<string, number> = {};
    for (const ot of overtimeRequests.filter((o) => o.status === 'APPROVED')) {
      overtimeByEmployee[ot.employeeId] =
        (overtimeByEmployee[ot.employeeId] || 0) + ot.totalHours;
    }

    const overtimeData = Object.entries(overtimeByEmployee)
      .map(([empId, hours]) => {
        const emp = teamMembers.find((m) => m.id === empId);
        return {
          name: emp ? `${emp.firstName} ${emp.lastName}` : empId,
          hours,
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    const latestReviews = new Map<string, number>();
    for (const review of performanceReviews) {
      if (!latestReviews.has(review.employeeId)) {
        const rating = review.finalRating || review.managerRating || 0;
        if (rating > 0) {
          latestReviews.set(review.employeeId, rating);
        }
      }
    }
    const allRatings = Array.from(latestReviews.values());
    const avgPerformance =
      allRatings.length > 0
        ? Math.round(
            (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10
          ) / 10
        : 0;

    const performanceDistribution = [1, 2, 3, 4, 5].map((rating) => {
      const count = allRatings.filter(
        (r) => Math.round(r) === rating
      ).length;
      return {
        rating,
        label:
          rating === 5
            ? 'Exceptional (5)'
            : rating === 4
              ? 'Exceeds (4)'
              : rating === 3
                ? 'Meets (3)'
                : rating === 2
                  ? 'Below (2)'
                  : 'Needs Improvement (1)',
        count,
        percentage:
          allRatings.length > 0
            ? Math.round((count / allRatings.length) * 100)
            : 0,
      };
    });

    const activeCount = teamMembers.filter(
      (m) => m.status?.code === 'ACTIVE'
    ).length;
    const separations = teamMembers.filter(
      (m) =>
        m.status?.code === 'SEPARATED' || m.status?.code === 'TERMINATED'
    ).length;
    const attritionRate =
      teamMembers.length > 0
        ? Math.round((separations / teamMembers.length) * 1000) / 10
        : 0;

    const leaveOnToday = leaveRequests.filter((l) => {
      return l.status === 'APPROVED';
    }).length;

    const analytics = {
      period,
      periodStart,
      periodEnd: now,
      teamMetrics: {
        totalHeadcount: teamMembers.length,
        activeEmployees: activeCount,
        attritionRate,
        avgPerformanceRating: avgPerformance,
        attendanceRate,
        totalLeavesTaken,
        pendingLeaveRequests: leaveRequests.filter(
          (l) => l.status === 'PENDING'
        ).length,
        lateComings: lateCount,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
      },
      performanceDistribution,
      overtimeData,
      leaveUtilization: {
        totalLeavesTaken,
        onLeaveToday: leaveOnToday,
      },
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
