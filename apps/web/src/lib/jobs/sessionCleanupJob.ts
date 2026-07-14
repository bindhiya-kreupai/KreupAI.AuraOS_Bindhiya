import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

export async function cleanupExpiredSessions(): Promise<JobResult> {
  const errors: string[] = [];
  let processedCount = 0;

  try {
    const now = new Date();

    const revokedResult = await prisma.userSession.updateMany({
      where: {
        OR: [
          {
            status: 'Revoked',
            updatedAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          },
          { expiresAt: { lt: now }, status: 'Active' },
        ],
      },
      data: { status: 'Expired' },
    });

    processedCount += revokedResult.count;

    const deletedResult = await prisma.userSession.deleteMany({
      where: {
        OR: [
          {
            status: 'Expired',
            updatedAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
          },
          {
            status: 'Revoked',
            updatedAt: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
          },
        ],
      },
    });

    processedCount += deletedResult.count;

    logger.info(
      { expiredCount: revokedResult.count, deletedCount: deletedResult.count },
      'Session cleanup completed'
    );
  } catch (error: any) {
    logger.error({ error }, 'Session cleanup failed');
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return {
    success: errors.length === 0,
    processedCount,
    errors,
  };
}
