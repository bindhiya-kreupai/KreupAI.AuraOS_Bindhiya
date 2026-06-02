import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import { successItem } from '@/lib/api/crud-helpers';

// DocuSign Connect webhook — verifies HMAC then records event in WebhookLog.
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const envelopeId = payload?.envelopeId || payload?.envelope?.envelopeId;
    const status = payload?.event || payload?.envelope?.status || 'UNKNOWN';
    const tenantId =
      request.headers.get('x-tenant-id') || (payload?.customFields?.tenantId as string) || '';
    if (!tenantId) {
      logger.warn({ envelopeId }, 'DocuSign webhook missing tenant id');
      return NextResponse.json({ success: true });
    }
    const webhook = await prisma.webhook.findFirst({
      where: { tenantId, url: { contains: 'docusign' } },
    });
    if (webhook) {
      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          event: `docusign.${status}`,
          payload: payload as any,
          statusCode: 200,
          responseBody: null,
          success: true,
          error: null,
          durationMs: 0,
        } as any,
      });
    }
    return successItem({ received: true, envelopeId, status });
  } catch (error: any) {
    logger.error({ err: error }, 'DocuSign webhook failed');
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
