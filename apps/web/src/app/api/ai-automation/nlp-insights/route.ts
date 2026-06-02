import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// NLP insights = sentiment ratios over recent ContinuousFeedback notes.
const POS = new Set([
  'great',
  'excellent',
  'amazing',
  'love',
  'happy',
  'good',
  'awesome',
  'helpful',
]);
const NEG = new Set([
  'poor',
  'bad',
  'terrible',
  'unhappy',
  'frustrated',
  'slow',
  'broken',
  'failed',
]);

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const feedback = await prisma.continuousFeedback.findMany({
      where: { tenantId: user.tenantId, createdAt: { gte: since } },
      select: { content: true } as any,
    });
    let pos = 0,
      neg = 0,
      neutral = 0;
    for (const f of feedback) {
      const tokens = String((f as any).content || '')
        .toLowerCase()
        .split(/\s+/);
      const p = tokens.filter((t) => POS.has(t)).length;
      const n = tokens.filter((t) => NEG.has(t)).length;
      if (p > n) pos++;
      else if (n > p) neg++;
      else neutral++;
    }
    const total = feedback.length;
    const output = {
      total,
      positive: pos,
      negative: neg,
      neutral,
      positivePercent: total ? Math.round((pos / total) * 100) : 0,
      negativePercent: total ? Math.round((neg / total) * 100) : 0,
      generatedAt: new Date().toISOString(),
    };
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'nlp_insights',
        output: output as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem(output);
  } catch (error: any) {
    return serverError(error, 'compute NLP insights');
  }
});
