import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('webhooks:test')) return forbidden('webhooks:test');
    const webhook = await prisma.webhook.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!webhook) return notFound('Webhook');
    const payload = {
      event: 'test.ping',
      timestamp: new Date().toISOString(),
      tenantId: user.tenantId,
    };
    const body = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
    const start = Date.now();
    let statusCode = 0;
    let responseBody: string | null = null;
    let success = false;
    let errorMsg: string | null = null;
    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auraos-Signature': signature,
          ...((webhook.headers as any) || {}),
        },
        body,
      });
      statusCode = res.status;
      responseBody = (await res.text()).slice(0, 500);
      success = res.ok;
    } catch (e: any) {
      errorMsg = e?.message || String(e);
    }
    const durationMs = Date.now() - start;
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: 'test.ping',
        payload: payload as any,
        statusCode,
        responseBody,
        success,
        error: errorMsg,
        durationMs,
      } as any,
    });
    return successItem({ statusCode, success, durationMs, responseBody, error: errorMsg });
  } catch (error: any) {
    return serverError(error, 'test webhook');
  }
});
