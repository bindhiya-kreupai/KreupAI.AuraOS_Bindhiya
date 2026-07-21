import { prisma } from '@aura/database';

export async function retrieveContinuousFeedback(tenantId: string, daysBack = 90) {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  return prisma.continuousFeedback.findMany({
    where: { tenantId, createdAt: { gte: since }, isDeleted: false },
    select: { id: true, message: true, createdAt: true, type: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function retrieveFeedbackById(tenantId: string, feedbackId: string) {
  return prisma.continuousFeedback.findFirst({
    where: { id: feedbackId, tenantId, isDeleted: false },
    select: { id: true, message: true, createdAt: true, type: true },
  });
}
