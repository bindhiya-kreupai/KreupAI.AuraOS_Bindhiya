/**
 * Email Parser API Routes
 * Phase 3: Intelligence Layer - Email Automation
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { commitEmailParse, parseEmail } from '@/lib/ai/email-parsing-ai';
import { getEmailParsingSummary } from '@/lib/ai/email-parsing-retrieval';

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canWriteAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const body = await request.json().catch(() => ({}));
    if (body.action === 'commit') {
      if (!body.parseId)
        return NextResponse.json(
          { error: 'parseId is required', errorAr: 'معرف التحليل مطلوب' },
          { status: 400 }
        );
      const run = await commitEmailParse(auth.tenantId, auth.userId, body.parseId);
      if (!run)
        return NextResponse.json(
          { error: 'Parse run not found', errorAr: 'لم يتم العثور على عملية التحليل' },
          { status: 404 }
        );
      return NextResponse.json({
        success: true,
        data: { runId: run.id, status: 'PENDING_HUMAN_CONFIRMATION' },
      });
    }
    if (body.action !== 'parse' && body.action !== 'extract')
      return NextResponse.json(
        { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
        { status: 400 }
      );
    const content = String(body.rawEmail || body.email || '');
    if (!content)
      return NextResponse.json(
        { error: 'Email content is required', errorAr: 'محتوى البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    return NextResponse.json({
      success: true,
      data: await parseEmail(auth.tenantId, auth.userId, content),
    });
  } catch (error) {
    console.error('[email-parser POST]', error);
    return NextResponse.json(
      { error: 'Failed to parse email', errorAr: 'فشل تحليل البريد الإلكتروني' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const summary = await getEmailParsingSummary(auth.tenantId);
    const emails = summary.runs.map((run) => ({
      id: run.id,
      parsedAt: run.createdAt,
      ...(run.output as Record<string, unknown>),
    }));
    return NextResponse.json({
      success: true,
      data: { processed: summary.runs.length, categories: summary.categories, emails },
    });
  } catch (error) {
    console.error('[email-parser GET]', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch email parser stats',
        errorAr: 'فشل جلب إحصاءات تحليل البريد الإلكتروني',
      },
      { status: 500 }
    );
  }
}
