/**
 * @module access-governance/review-items/_decision
 * @description Shared decision handler for approve/revoke of an AccessReviewItem.
 *              Updates the item decision + reviewer metadata and recomputes the
 *              parent campaign's reviewedItems / status.
 */
import { prisma } from '@aura/database';
import type { ReviewItemRow } from '../_shared';

export async function applyReviewDecision(opts: {
  itemId: string;
  tenantId: string;
  userId: string;
  decision: 'approved' | 'revoked';
  comment?: string;
}): Promise<ReviewItemRow | null> {
  const { itemId, tenantId, userId, decision, comment } = opts;

  const existing = await (prisma as any).accessReviewItem.findFirst({
    where: { id: itemId, tenantId, isDeleted: false },
  });
  if (!existing) return null;

  const updated: ReviewItemRow = await (prisma as any).accessReviewItem.update({
    where: { id: itemId },
    data: {
      decision,
      comment: comment ?? existing.comment ?? null,
      reviewedBy: userId,
      reviewedAt: new Date(),
      updatedBy: userId,
    },
  });

  // Recompute the campaign's reviewed count from persisted decisions.
  const reviewedItems = await (prisma as any).accessReviewItem.count({
    where: {
      campaignId: existing.campaignId,
      tenantId,
      isDeleted: false,
      decision: { in: ['approved', 'revoked'] },
    },
  });
  const totalItems = await (prisma as any).accessReviewItem.count({
    where: { campaignId: existing.campaignId, tenantId, isDeleted: false },
  });

  await (prisma as any).accessReviewCampaign.update({
    where: { id: existing.campaignId },
    data: {
      reviewedItems,
      ...(totalItems > 0 && reviewedItems >= totalItems
        ? { status: 'completed', completedAt: new Date() }
        : { status: 'active' }),
      updatedBy: userId,
    },
  });

  return updated;
}
