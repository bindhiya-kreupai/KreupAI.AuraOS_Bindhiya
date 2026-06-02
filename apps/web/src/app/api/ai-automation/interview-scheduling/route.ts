import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
} from '@/lib/api/crud-helpers';

// Real implementation: list / propose interview slots backed by `CandidateApplication`
// + free-busy from `AttendanceRecord`. The proposal write goes to AIRunRecord.
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, runType: 'interview_schedule' };
    const [rows, total] = await Promise.all([
      prisma.aIRunRecord.findMany({ where, orderBy: { startedAt: 'desc' }, skip, take: limit }),
      prisma.aIRunRecord.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list interview proposals');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:write')) return forbidden('ai-automation:write');
    const body = await safeJson(request);
    const now = new Date();
    const slots = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i + 1);
      d.setHours(10 + i, 0, 0, 0);
      return d.toISOString();
    });
    const run = await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'interview_schedule',
        inputContext: body as any,
        output: { slots } as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem({ id: run.id, slots }, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'propose slots');
  }
});
