/**
 * Aggregate continuous-feedback stats for the authenticated actor
 * (or a specified employeeId). Backed by aura_continuous_feedback.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

function actor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('employeeId') || actor(user);

    const base = { tenantId: user.tenantId, isDeleted: false };

    const [given, received, rows] = await Promise.all([
      (prisma as any).continuousFeedback.count({ where: { ...base, fromUserId: subjectId } }),
      (prisma as any).continuousFeedback.count({ where: { ...base, toEmployeeId: subjectId } }),
      (prisma as any).continuousFeedback.findMany({
        where: { ...base, toEmployeeId: subjectId },
        select: { type: true, visibility: true, isAnonymous: true, tags: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let praiseCount = 0;
    let constructiveCount = 0;
    let suggestionCount = 0;
    let anonymousCount = 0;
    const tagCounts = new Map<string, number>();

    for (const r of rows as any[]) {
      const t = r.type;
      if (t === 'RECOGNITION' || t === 'PRAISE' || t === 'CONTINUOUS') praiseCount += 1;
      else if (t === 'SUGGESTION') suggestionCount += 1;
      else constructiveCount += 1;
      if (r.isAnonymous || r.visibility === 'ANONYMOUS') anonymousCount += 1;
      for (const tag of r.tags || []) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    // Streak: consecutive days (ending today) with at least one received item.
    const days = new Set<string>();
    for (const r of rows as any[]) {
      days.add(new Date(r.createdAt).toISOString().slice(0, 10));
    }
    let streak = 0;
    const cursor = new Date();
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalGiven: given,
        totalReceived: received,
        praiseCount,
        constructiveCount,
        suggestionCount,
        anonymousCount,
        streak,
        topTags,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to compute feedback stats',
          messageAr: 'فشل في حساب إحصائيات الملاحظات',
        },
      },
      { status: 500 }
    );
  }
});
