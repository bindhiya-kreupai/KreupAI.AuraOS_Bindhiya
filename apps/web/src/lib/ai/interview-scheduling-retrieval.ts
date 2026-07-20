import { prisma } from '@aura/database';

export async function recentInterviewProposals(tenantId: string) {
  return prisma.aIRunRecord
    .findMany({
      where: { tenantId, runType: 'interview_scheduling', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    .catch(() => []);
}
