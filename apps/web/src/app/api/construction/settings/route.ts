import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { constructionService } from '@/lib/services/construction/construction.service';
import { buildConstructionContext, constructionError, serverError } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const ctx = buildConstructionContext(context);
    return NextResponse.json(await constructionService.getSettings(ctx));
  } catch (error) {
    return serverError('GET settings', error);
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const ctx = buildConstructionContext(context);
    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return constructionError('A JSON object body is required.', 'يلزم إرسال كائن JSON.', 400);
    }
    return NextResponse.json(await constructionService.updateSettings(ctx, body));
  } catch (error) {
    return serverError('PUT settings', error);
  }
});
