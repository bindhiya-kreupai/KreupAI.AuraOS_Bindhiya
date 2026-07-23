import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { enrollInCourse, getRecommendations, getSkillGaps } from '@/lib/ai/ld-recommendation-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canReadAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    if (new URL(request.url).searchParams.get('view') === 'skill-gaps') {
      return NextResponse.json({
        success: true,
        data: { gaps: await getSkillGaps(auth.tenantId, auth.userId) },
      });
    }
    return NextResponse.json({
      success: true,
      data: await getRecommendations(auth.tenantId, auth.userId),
    });
  } catch (error) {
    console.error('[learning GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning recommendations', errorAr: 'فشل جلب توصيات التعلم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    if (!canWriteAiAutomation(auth.permissions, auth.roles))
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    const body = await request.json().catch(() => ({}));
    if (body.action !== 'enroll' || !body.courseId)
      return NextResponse.json(
        { error: 'courseId is required for enroll', errorAr: 'معرف الدورة مطلوب للتسجيل' },
        { status: 400 }
      );
    const result = await enrollInCourse(auth.tenantId, auth.userId, String(body.courseId));
    if ('error' in result)
      return NextResponse.json(
        { error: result.error, errorAr: 'لم يتم العثور على الدورة' },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[learning POST]', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course', errorAr: 'فشل التسجيل في الدورة' },
      { status: 500 }
    );
  }
}
