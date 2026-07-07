import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { careerService } from '@/lib/services/career/career.service';
import { buildCareerContext, careerError, serverError } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const ctx = buildCareerContext(context);
    const settings = await careerService.getSettings(ctx);
    return NextResponse.json(settings);
  } catch (error) {
    return serverError('GET settings', error);
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const ctx = buildCareerContext(context);
    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return careerError('A JSON object body is required.', 'يلزم إرسال كائن JSON.', 400);
    }
    const updated = await careerService.updateSettings(ctx, body);
    return NextResponse.json(updated);
  } catch (error) {
    return serverError('PUT settings', error);
  }
});
