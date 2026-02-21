import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, employeeId } = context;
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || employeeId;

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
      include: {
        department: { select: { name: true, code: true } },
        location: {
          select: {
            name: true,
            address: {
              select: {
                city: { select: { name: true } },
                state: { select: { name: true } },
              },
            },
          },
        },
        jobProfile: { select: { title: true, code: true } },
        grade: { select: { name: true, code: true } },
        status: { select: { name: true, code: true } },
        type: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const teamMemberIds = teamMembers.map((m) => m.id);

    const [attendanceRecords, leaveRequests, performanceReviews] =
      await Promise.all([
        prisma.attendanceRecord.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            date: { gte: monthStart, lte: now },
          },
          select: {
            employeeId: true,
            status: true,
            workHours: true,
            overtimeHours: true,
          },
        }),
        prisma.leaveRequest.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            status: 'PENDING',
          },
          select: { employeeId: true, id: true },
        }),
        prisma.performanceReview.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            status: { not: 'draft' },
          },
          select: {
            employeeId: true,
            finalRating: true,
            managerRating: true,
            selfRating: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const attendanceByEmployee = new Map<
      string,
      { total: number; present: number }
    >();
    for (const record of attendanceRecords) {
      const entry = attendanceByEmployee.get(record.employeeId) || {
        total: 0,
        present: 0,
      };
      entry.total++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        entry.present++;
      }
      attendanceByEmployee.set(record.employeeId, entry);
    }

    const reviewByEmployee = new Map<string, number>();
    for (const review of performanceReviews) {
      if (!reviewByEmployee.has(review.employeeId)) {
        const rating =
          review.finalRating || review.managerRating || review.selfRating || 0;
        reviewByEmployee.set(review.employeeId, rating);
      }
    }

    const members = teamMembers.map((emp) => {
      const attendance = attendanceByEmployee.get(emp.id);
      const attendanceRate =
        attendance && attendance.total > 0
          ? Math.round((attendance.present / attendance.total) * 1000) / 10
          : 100;
      const performanceRating = reviewByEmployee.get(emp.id) || 0;
      const cityName = emp.location?.address?.city?.name || '';
      const stateName = emp.location?.address?.state?.name || '';
      const locationStr = [cityName, stateName].filter(Boolean).join(', ');

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        designation: emp.jobProfile?.title || '',
        department: emp.department?.name || '',
        email: emp.email,
        dateOfJoining: emp.joiningDate,
        status: emp.status?.code?.toLowerCase() || 'active',
        location: locationStr || emp.location?.name || '',
        reportingTo: emp.managerId || '',
        performanceRating,
        attendanceRate,
        engagementScore: 75,
      };
    });

    const activeCount = members.filter((m) => m.status === 'active').length;
    const avgAttendance =
      members.length > 0
        ? Math.round(
            (members.reduce((sum, m) => sum + m.attendanceRate, 0) /
              members.length) *
              10
          ) / 10
        : 0;
    const avgPerformance =
      members.filter((m) => m.performanceRating > 0).length > 0
        ? Math.round(
            (members
              .filter((m) => m.performanceRating > 0)
              .reduce((sum, m) => sum + m.performanceRating, 0) /
              members.filter((m) => m.performanceRating > 0).length) *
              10
          ) / 10
        : 0;
    const pendingLeaves = leaveRequests.length;

    const metrics = {
      totalHeadcount: members.length,
      activeEmployees: activeCount,
      averageAttendance: avgAttendance,
      averagePerformanceRating: avgPerformance,
      pendingLeaveRequests: pendingLeaves,
      newJoiners: members.filter(
        (m) => new Date(m.dateOfJoining) >= monthStart
      ).length,
    };

    return NextResponse.json({ members, metrics }, { status: 200 });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
