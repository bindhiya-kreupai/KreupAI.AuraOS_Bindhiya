import { prisma } from '@aura/database';
import { LeaveService } from '@/lib/services/leave.service';
import type { HRRetrievalContext } from './hr-agent-types';

export async function loadHRRetrievalContext(
  tenantId: string,
  employeeId: string | null
): Promise<HRRetrievalContext> {
  if (!employeeId) return {};

  const employee = await prisma.employee
    .findFirst({
      where: { id: employeeId, isDeleted: false, company: { tenantId } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
        jobProfile: { select: { title: true } },
      },
    })
    .catch(() => null);

  if (!employee) return {};

  const balances = await LeaveService.getBalanceByEmployee(tenantId, employeeId).catch(() => []);
  const requests = await prisma.leaveRequest
    .findMany({
      where: { tenantId, employeeId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, status: true, startDate: true, endDate: true },
    })
    .catch(() => []);

  const policies = await prisma.leavePolicy
    .findMany({
      where: { tenantId, isDeleted: false, isActive: true },
      take: 20,
      select: { name: true, code: true },
      orderBy: { name: 'asc' },
    })
    .catch(() => []);

  return {
    employee: {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      department: employee.department?.name,
      jobTitle: employee.jobProfile?.title,
    },
    leaveBalances: balances.map((b) => ({
      type: b.policy?.name || b.policyId,
      code: b.policy?.code || undefined,
      balance: Number(b.currentBalance),
      used: Number(b.taken),
      pending: 0,
    })),
    recentLeaveRequests: requests.map((r) => ({
      id: r.id,
      status: r.status,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    })),
    policies: policies.map((p) => ({ title: p.name, category: p.code })),
  };
}

export function retrievalToCitations(ctx: HRRetrievalContext) {
  const citations: { title: string; source: string }[] = [];
  if (ctx.leaveBalances?.length) {
    citations.push({ title: 'Leave Balance', source: 'aura_leave_balance' });
  }
  for (const p of ctx.policies || []) {
    citations.push({ title: p.title, source: 'leave_policy' });
  }
  return citations;
}
