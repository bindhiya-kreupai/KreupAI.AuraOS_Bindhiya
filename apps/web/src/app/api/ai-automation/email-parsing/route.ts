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
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, runType: 'email_parse' };
    const [rows, total] = await Promise.all([
      prisma.aIRunRecord.findMany({ where, orderBy: { startedAt: 'desc' }, skip, take: limit }),
      prisma.aIRunRecord.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list parses');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:write')) return forbidden('ai-automation:write');
    const body = await safeJson(request);
    if (!body?.body) return validationError({ message: 'body required' });
    const text: string = body.body;
    // Lightweight entity extraction
    const emails = Array.from(text.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)).map((m) => m[0]);
    const dates = Array.from(text.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)).map((m) => m[0]);
    const amounts = Array.from(text.matchAll(/\$\s?\d+(?:,\d{3})*(?:\.\d+)?/g)).map((m) => m[0]);
    const intent = /leave|vacation|pto/i.test(text)
      ? 'LEAVE_REQUEST'
      : /payroll|salary|pay/i.test(text)
        ? 'PAYROLL_INQUIRY'
        : /benefit|insurance/i.test(text)
          ? 'BENEFITS_QUESTION'
          : 'GENERAL';
    const output = { emails, dates, amounts, intent, length: text.length };
    const run = await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'email_parse',
        inputContext: { hash: text.length } as any,
        output: output as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem({ id: run.id, ...output }, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'parse email');
  }
});
