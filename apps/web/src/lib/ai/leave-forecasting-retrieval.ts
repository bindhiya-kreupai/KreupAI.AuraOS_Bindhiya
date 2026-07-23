import { prisma } from '@aura/database';

export type LeaveMonthBucket = { month: string; count: number };
export type LeaveTypeBucket = { leaveType: string; count: number };

export async function retrieveLeaveHistory(tenantId: string, daysBack = 365) {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const requests = await prisma.leaveRequest.findMany({
    where: { tenantId, createdAt: { gte: since }, isDeleted: false },
    select: {
      createdAt: true,
      startDate: true,
      endDate: true,
      leaveTypeId: true,
      status: true,
    },
  });

  const byMonth = new Map<string, number>();
  const byType = new Map<string, number>();

  for (const r of requests) {
    const m = r.createdAt.toISOString().slice(0, 7);
    byMonth.set(m, (byMonth.get(m) || 0) + 1);
    const lt = String(r.leaveTypeId || 'OTHER').slice(0, 8);
    byType.set(lt, (byType.get(lt) || 0) + 1);
  }

  const series: LeaveMonthBucket[] = Array.from(byMonth.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const byLeaveType: LeaveTypeBucket[] = Array.from(byType.entries()).map(([leaveType, count]) => ({
    leaveType,
    count,
  }));

  return { series, byLeaveType, total: requests.length };
}
