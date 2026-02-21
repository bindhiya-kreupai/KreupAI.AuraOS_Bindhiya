import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, employeeId } = context;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'performance';
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        department: { select: { name: true } },
        jobProfile: { select: { title: true } },
      },
    });

    const teamMemberIds = teamMembers.map((m) => m.id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodStartParam = searchParams.get('periodStart');
    const periodEndParam = searchParams.get('periodEnd');
    const periodStart = periodStartParam
      ? new Date(periodStartParam)
      : monthStart;
    const periodEnd = periodEndParam ? new Date(periodEndParam) : now;

    let reportData: any = {};

    switch (type) {
      case 'performance': {
        const reviews = await prisma.performanceReview.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
          },
          orderBy: { createdAt: 'desc' },
        });

        const latestByEmployee = new Map<string, any>();
        for (const review of reviews) {
          if (!latestByEmployee.has(review.employeeId)) {
            latestByEmployee.set(review.employeeId, review);
          }
        }

        const ratings = Array.from(latestByEmployee.values())
          .map((r) => r.finalRating || r.managerRating || 0)
          .filter((r) => r > 0);

        const distribution = [1, 2, 3, 4, 5].map((rating) => ({
          rating,
          count: ratings.filter(
            (r) => Math.round(r) === rating
          ).length,
          percentage:
            ratings.length > 0
              ? Math.round(
                  (ratings.filter((r) => Math.round(r) === rating).length /
                    ratings.length) *
                    1000
                ) / 10
              : 0,
        }));

        reportData = {
          totalEmployees: teamMembers.length,
          performanceDistribution: distribution,
          averageRating:
            ratings.length > 0
              ? Math.round(
                  (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
                ) / 10
              : 0,
          topPerformers: Array.from(latestByEmployee.entries())
            .filter(
              ([, r]) => (r.finalRating || r.managerRating || 0) >= 4
            )
            .map(([empId]) => {
              const emp = teamMembers.find((m) => m.id === empId);
              return emp
                ? `${emp.firstName} ${emp.lastName}`
                : empId;
            }),
          needsImprovement: Array.from(latestByEmployee.entries())
            .filter(
              ([, r]) => (r.finalRating || r.managerRating || 0) < 3
            )
            .map(([empId]) => {
              const emp = teamMembers.find((m) => m.id === empId);
              return emp
                ? `${emp.firstName} ${emp.lastName}`
                : empId;
            }),
          reviewedCount: latestByEmployee.size,
          pendingReviewCount: teamMembers.length - latestByEmployee.size,
        };
        break;
      }

      case 'attendance': {
        const records = await prisma.attendanceRecord.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            date: { gte: periodStart, lte: periodEnd },
          },
        });

        const totalRecords = records.length;
        const presentRecords = records.filter(
          (r) => r.status === 'PRESENT' || r.status === 'LATE'
        ).length;
        const absentRecords = records.filter(
          (r) => r.status === 'ABSENT'
        ).length;
        const lateRecords = records.filter(
          (r) => r.status === 'LATE' || r.isLate
        ).length;

        const attendanceByEmployee: Record<
          string,
          { total: number; present: number }
        > = {};
        for (const rec of records) {
          if (!attendanceByEmployee[rec.employeeId]) {
            attendanceByEmployee[rec.employeeId] = { total: 0, present: 0 };
          }
          attendanceByEmployee[rec.employeeId].total++;
          if (rec.status === 'PRESENT' || rec.status === 'LATE') {
            attendanceByEmployee[rec.employeeId].present++;
          }
        }

        const employeeAttendance = teamMembers.map((emp) => {
          const att = attendanceByEmployee[emp.id];
          return {
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            attendanceRate:
              att && att.total > 0
                ? Math.round((att.present / att.total) * 1000) / 10
                : 100,
            totalDays: att?.total || 0,
            presentDays: att?.present || 0,
          };
        });

        const leavesByType = await prisma.leaveRequest.groupBy({
          by: ['leaveTypeId'],
          where: {
            tenantId: user.tenantId,
            employeeId: { in: teamMemberIds },
            status: 'APPROVED',
            startDate: { gte: periodStart },
            endDate: { lte: periodEnd },
          },
          _count: true,
          _sum: { totalDays: true },
        });

        reportData = {
          totalEmployees: teamMembers.length,
          totalRecords,
          averageAttendance:
            totalRecords > 0
              ? Math.round((presentRecords / totalRecords) * 1000) / 10
              : 100,
          totalAbsences: absentRecords,
          totalLateComings: lateRecords,
          employeeAttendance,
          leavesByType: leavesByType.map((l) => ({
            leaveTypeId: l.leaveTypeId,
            count: l._count,
            totalDays: Number(l._sum.totalDays) || 0,
          })),
          periodStart,
          periodEnd,
        };
        break;
      }

      case 'compensation': {
        const bands = await prisma.compensationBand.findMany({
          where: { tenantId: user.tenantId, isActive: true },
          orderBy: { minSalary: 'asc' },
        });

        reportData = {
          totalEmployees: teamMembers.length,
          compensationBands: bands.map((b) => ({
            band: b.bandName,
            minSalary: Number(b.minSalary),
            maxSalary: Number(b.maxSalary),
            midSalary: b.midSalary ? Number(b.midSalary) : null,
            currency: b.currency,
          })),
        };
        break;
      }

      case 'skills_gap': {
        reportData = {
          totalEmployees: teamMembers.length,
          employeeSkills: teamMembers.map((emp) => ({
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            role: emp.jobProfile?.title || '',
          })),
          message:
            'Skills gap analysis requires competency framework data. Showing team composition.',
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown report type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        reportType: type,
        generatedAt: new Date(),
        managerId,
        data: reportData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
