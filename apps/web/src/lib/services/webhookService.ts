import { BaseService } from './base.service';
import crypto from 'crypto';

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  failureCount: number;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  statusCode: number;
  response?: string;
  deliveredAt: Date;
  duration: number;
}

const WEBHOOK_EVENTS = [
  'employee.created',
  'employee.updated',
  'employee.terminated',
  'leave.requested',
  'leave.approved',
  'leave.rejected',
  'payroll.completed',
  'attendance.clockin',
  'attendance.clockout',
  'performance.review_completed',
  'recruitment.application_received',
  'recruitment.offer_sent',
] as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[number];

export class WebhookService extends BaseService {
  constructor() {
    super('WebhookService');
  }

  async createWebhook(data: {
    url: string;
    events: string[];
    tenantId: string;
    createdBy: string;
  }): Promise<WebhookConfig> {
    const secret = crypto.randomBytes(32).toString('hex');

    this.logger.info('Creating webhook', { url: data.url, events: data.events });

    const webhook = await this.prisma.webhook.create({
      data: {
        url: data.url,
        secret,
        events: data.events,
        active: true,
        tenantId: data.tenantId,
        createdBy: data.createdBy,
      },
    });

    await this.createAuditLog({
      userId: data.createdBy,
      action: 'CREATE',
      module: 'Webhooks',
      details: `Created webhook for ${data.url}`,
    });

    return {
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events as string[],
      active: webhook.active,
      createdAt: webhook.createdAt,
      failureCount: 0,
    };
  }

  async listWebhooks(tenantId: string): Promise<WebhookConfig[]> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks.map((w) => ({
      id: w.id,
      url: w.url,
      secret: w.secret,
      events: w.events as string[],
      active: w.active,
      createdAt: w.createdAt,
      lastTriggered: w.lastTriggered || undefined,
      failureCount: w.failureCount || 0,
    }));
  }

  async getWebhookById(id: string): Promise<WebhookConfig | null> {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) return null;
    return {
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events as string[],
      active: webhook.active,
      createdAt: webhook.createdAt,
      lastTriggered: webhook.lastTriggered || undefined,
      failureCount: webhook.failureCount || 0,
    };
  }

  async updateWebhook(id: string, data: Partial<{ url: string; events: string[]; active: boolean }>): Promise<WebhookConfig> {
    const webhook = await this.prisma.webhook.update({
      where: { id },
      data,
    });
    return {
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events as string[],
      active: webhook.active,
      createdAt: webhook.createdAt,
      failureCount: webhook.failureCount || 0,
    };
  }

  async deleteWebhook(id: string, userId: string): Promise<void> {
    await this.prisma.webhook.delete({ where: { id } });
    await this.createAuditLog({
      userId,
      action: 'DELETE',
      module: 'Webhooks',
      details: `Deleted webhook ${id}`,
    });
  }

  async dispatchEvent(event: WebhookEventType, payload: Record<string, unknown>, tenantId: string): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        active: true,
        events: { has: event },
      },
    });

    for (const webhook of webhooks) {
      await this.deliverWebhook(webhook.id, webhook.url, webhook.secret, event, payload);
    }
  }

  private async deliverWebhook(
    webhookId: string,
    url: string,
    secret: string,
    event: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        body,
      });

      const duration = Date.now() - startTime;

      await this.prisma.webhookLog.create({
        data: {
          webhookId,
          event,
          payload: payload as any,
          statusCode: response.status,
          response: await response.text().catch(() => ''),
          duration,
          success: response.ok,
        },
      });

      if (!response.ok) {
        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: { failureCount: { increment: 1 } },
        });
      } else {
        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: { lastTriggered: new Date(), failureCount: 0 },
        });
      }
    } catch (error) {
      this.logger.error('Webhook delivery failed', { webhookId, url, error });
      await this.prisma.webhook.update({
        where: { id: webhookId },
        data: { failureCount: { increment: 1 } },
      });
    }
  }

  async getDeliveryLogs(webhookId: string, limit = 50): Promise<WebhookDeliveryLog[]> {
    const logs = await this.prisma.webhookLog.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((l) => ({
      id: l.id,
      webhookId: l.webhookId,
      event: l.event,
      payload: l.payload as Record<string, unknown>,
      statusCode: l.statusCode,
      response: l.response || undefined,
      deliveredAt: l.createdAt,
      duration: l.duration,
    }));
  }

  async testWebhook(id: string): Promise<{ success: boolean; statusCode: number; duration: number }> {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) throw new Error('Webhook not found');

    const testPayload = { test: true, message: 'This is a test delivery', timestamp: new Date().toISOString() };
    const body = JSON.stringify({ event: 'webhook.test', payload: testPayload });
    const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');

    const startTime = Date.now();
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'webhook.test',
      },
      body,
    });

    return { success: response.ok, statusCode: response.status, duration: Date.now() - startTime };
  }

  getAvailableEvents(): string[] {
    return [...WEBHOOK_EVENTS];
  }
}

export const webhookService = new WebhookService();
