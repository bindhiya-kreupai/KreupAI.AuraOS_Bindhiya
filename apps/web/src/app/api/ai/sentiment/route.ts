import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import {
  analyzeNlpText,
  getFeedbackAnalysis,
  getNlpInsightsDashboard,
} from '@/lib/ai/nlp-insights-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }
    const params = new URL(request.url).searchParams;
    const view = params.get('view') || 'dashboard';
    if (view === 'analyze') {
      const feedbackId = params.get('feedbackId');
      if (!feedbackId)
        return NextResponse.json(
          { error: 'feedbackId is required', errorAr: 'معرف الملاحظة مطلوب' },
          { status: 400 }
        );
      const data = await getFeedbackAnalysis(auth.tenantId, feedbackId);
      if (!data)
        return NextResponse.json(
          { error: 'Feedback not found', errorAr: 'لم يتم العثور على الملاحظة' },
          { status: 404 }
        );
      return NextResponse.json({ success: true, data });
    }
    if (!['dashboard', 'trends'].includes(view)) {
      return NextResponse.json({ error: 'Invalid view', errorAr: 'عرض غير صالح' }, { status: 400 });
    }
    const data = await getNlpInsightsDashboard(auth.tenantId, {
      userId: auth.userId,
      persist: view === 'dashboard',
    });
    return NextResponse.json({
      success: true,
      data: view === 'trends' ? { trends: data.trends } : data,
    });
  } catch (error) {
    console.error('[sentiment GET]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch sentiment data',
        errorAr: 'فشل في جلب بيانات المشاعر',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canWriteAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || 'recompute');
    if (action === 'recompute') {
      const data = await getNlpInsightsDashboard(auth.tenantId, {
        userId: auth.userId,
        persist: true,
      });
      return NextResponse.json({ success: true, data });
    }
    if (action === 'analyze') {
      if (typeof body.text === 'string' && body.text.trim()) {
        return NextResponse.json({ success: true, data: analyzeNlpText(body.text) });
      }
      if (typeof body.feedbackId === 'string' && body.feedbackId) {
        const data = await getFeedbackAnalysis(auth.tenantId, body.feedbackId);
        if (!data)
          return NextResponse.json(
            { error: 'Feedback not found', errorAr: 'لم يتم العثور على الملاحظة' },
            { status: 404 }
          );
        return NextResponse.json({ success: true, data });
      }
      const data = await getNlpInsightsDashboard(auth.tenantId, {
        userId: auth.userId,
        persist: true,
      });
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json(
      { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[sentiment POST]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
        errorAr: 'فشل في تحليل المشاعر',
      },
      { status: 500 }
    );
  }
}
