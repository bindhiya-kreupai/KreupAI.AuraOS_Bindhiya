import { prisma } from '@aura/database';

export async function retrieveRecentAccruals(tenantId: string) {
  return prisma.leaveAccrual.findMany({
    where: { tenantId, isDeleted: false },
    orderBy: { accrualDate: 'desc' },
    take: 50,
    select: { id: true, employeeId: true, policyId: true, accruedDays: true, accrualDate: true },
  });
}
