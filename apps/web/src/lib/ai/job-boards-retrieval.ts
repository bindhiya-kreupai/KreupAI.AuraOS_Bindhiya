import { prisma } from '@aura/database';
export const getBoardRuns = (tenantId: string) =>
  prisma.aIRunRecord
    .findMany({
      where: { tenantId, runType: 'job_board_posting', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    .catch(() => []);
