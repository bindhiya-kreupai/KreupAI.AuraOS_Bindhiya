/**
 * Notification Service - Entry Point
 * Proper Fastify microservice for notification management with Socket.IO real-time delivery.
 *
 * Routes (all prefixed /api/v1):
 *   POST   /notifications/send              — send single notification
 *   POST   /notifications/bulk             — send bulk notifications
 *   GET    /notifications                  — list notifications (userId, read, category)
 *   GET    /notifications/unread-count     — unread count for a user
 *   PATCH  /notifications/:id/read         — mark as read
 *   PATCH  /notifications/read-all         — mark all as read
 *   DELETE /notifications/:id              — delete notification
 *   GET    /notifications/preferences      — get preferences
 *   PUT    /notifications/preferences      — update preferences
 *   GET    /notification-templates         — list templates
 *   GET    /health                         — health check
 *
 * Real-time: Socket.IO on /notifications namespace (ws://<host>:3003/socket.io)
 */

import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  sendNotification,
  sendBulkNotifications,
  NotificationPayload,
} from './services/notification-orchestrator';
import { initSocketServer, emitNewNotification, emitUnreadCount, getConnectedCount } from './socket/socket-server';

// ── Prisma singleton ──────────────────────────────────────────────────────────

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ── Fastify app ───────────────────────────────────────────────────────────────

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req) =>
    (req.headers['x-request-id'] as string) ||
    `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

// ── Security / CORS hooks ─────────────────────────────────────────────────────

app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  if (request.method === 'OPTIONS') {
    reply.code(204).send();
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.setErrorHandler(async (error, request, reply) => {
  request.log.error({ err: error }, 'Unhandled error');
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : error.message,
    statusCode,
    requestId: request.id,
  });
});

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', async (_request: FastifyRequest, _reply: FastifyReply) => {
  return {
    status: 'ok',
    service: 'notification-service',
    uptime: process.uptime(),
    connectedSockets: getConnectedCount(),
    timestamp: new Date().toISOString(),
  };
});

// ── SEND SINGLE NOTIFICATION ──────────────────────────────────────────────────

app.post('/api/v1/notifications/send', async (
  request: FastifyRequest<{ Body: NotificationPayload }>,
  reply: FastifyReply
) => {
  try {
    const payload = request.body;

    if (!payload.recipients || !payload.channels || !payload.subject || !payload.body) {
      return reply.code(400).send({
        error: 'recipients, channels, subject, and body are required',
      });
    }

    if (!payload.category) {
      return reply.code(400).send({ error: 'category is required' });
    }

    const result = await sendNotification(payload);

    // Persist to DB for audit trail
    try {
      const recipients = Array.isArray(payload.recipients) ? payload.recipients : [payload.recipients];
      const tenantId = (payload.metadata?.tenantId as string) || 'SYSTEM';

      const notification = await prisma.notification.create({
        data: {
          tenantId,
          title: payload.subject,
          body: payload.body,
          type: payload.category,
          priority: payload.priority || 'normal',
          status: result.failureCount === result.recipientCount ? 'failed' : 'sent',
          sentAt: new Date(),
          sentCount: result.successCount,
          metadata: { ...payload.metadata, notificationId: result.notificationId },
          createdBy: (payload.metadata?.requestedBy as string) || 'system',
          recipients: {
            create: recipients.map((r) => ({
              userId: r.userId,
              status: 'delivered',
              deliveredAt: new Date(),
              channel: payload.channels[0] || 'in-app',
            })),
          },
        },
      });

      // Emit real-time event for in-app channel
      if (payload.channels.includes('in-app')) {
        for (const recipient of recipients) {
          emitNewNotification(recipient.userId, {
            id: notification.id,
            title: payload.subject,
            body: payload.body,
            category: payload.category,
            actionUrl: payload.actionUrl,
            icon: payload.icon,
            priority: payload.priority || 'normal',
            read: false,
          });
        }
      }
    } catch (dbErr) {
      request.log.warn({ err: dbErr }, 'Failed to persist notification to DB');
    }

    return reply.code(200).send({ data: result });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to send notification');
    return reply.code(500).send({ error: 'Failed to send notification' });
  }
});

// ── SEND BULK NOTIFICATIONS ───────────────────────────────────────────────────

app.post('/api/v1/notifications/bulk', async (
  request: FastifyRequest<{ Body: { notifications: NotificationPayload[]; batchSize?: number; rateLimitMs?: number } }>,
  reply: FastifyReply
) => {
  try {
    const { notifications, batchSize = 50, rateLimitMs = 200 } = request.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return reply.code(400).send({ error: 'notifications array is required' });
    }

    if (notifications.length > 1000) {
      return reply.code(400).send({ error: 'Bulk send limited to 1000 notifications per request' });
    }

    const result = await sendBulkNotifications(notifications, {
      batchSize,
      rateLimitMs,
      onProgress: (sent, total) => {
        request.log.info(`Bulk send progress: ${sent}/${total}`);
      },
    });

    return reply.code(200).send({ data: result });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to send bulk notifications');
    return reply.code(500).send({ error: 'Failed to send bulk notifications' });
  }
});

// ── LIST NOTIFICATIONS ────────────────────────────────────────────────────────

interface ListNotificationsQuery {
  userId?: string;
  read?: string;
  category?: string;
  tenantId?: string;
  page?: string;
  limit?: string;
}

app.get('/api/v1/notifications', async (
  request: FastifyRequest<{ Querystring: ListNotificationsQuery }>,
  reply: FastifyReply
) => {
  try {
    const {
      userId,
      read,
      category,
      tenantId,
      page = '1',
      limit = '20',
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (category) where.type = category;

    // Filter by userId via recipients relation
    if (userId) {
      where.recipients = { some: { userId } };
      if (read !== undefined) {
        const isRead = read === 'true';
        (where.recipients as Record<string, unknown>) = {
          some: {
            userId,
            readAt: isRead ? { not: null } : null,
          },
        };
      }
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          recipients: userId ? { where: { userId }, select: { status: true, readAt: true, deliveredAt: true, channel: true } } : false,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return reply.code(200).send({
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list notifications');
    return reply.code(500).send({ error: 'Failed to retrieve notifications' });
  }
});

// ── UNREAD COUNT ──────────────────────────────────────────────────────────────

app.get('/api/v1/notifications/unread-count', async (
  request: FastifyRequest<{ Querystring: { userId: string; tenantId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { userId, tenantId } = request.query;

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }

    const count = await prisma.notificationRecipient.count({
      where: {
        userId,
        readAt: null,
        notification: tenantId ? { tenantId } : undefined,
      },
    });

    return reply.code(200).send({ data: { userId, unreadCount: count } });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get unread count');
    return reply.code(500).send({ error: 'Failed to retrieve unread count' });
  }
});

// ── MARK AS READ ──────────────────────────────────────────────────────────────

app.patch('/api/v1/notifications/:id/read', async (
  request: FastifyRequest<{ Params: { id: string }; Body: { userId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { userId } = request.body || {};

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required in request body' });
    }

    // Mark the recipient record as read
    const updated = await prisma.notificationRecipient.updateMany({
      where: { notificationId: id, userId, readAt: null },
      data: { readAt: new Date(), status: 'read' },
    });

    if (updated.count === 0) {
      // Either not found or already read
      const exists = await prisma.notificationRecipient.findFirst({
        where: { notificationId: id, userId },
      });
      if (!exists) {
        return reply.code(404).send({ error: 'Notification not found for this user' });
      }
    }

    // Emit updated unread count via Socket.IO
    try {
      const newCount = await prisma.notificationRecipient.count({
        where: { userId, readAt: null },
      });
      emitUnreadCount(userId, newCount);
    } catch {
      // Non-fatal
    }

    return reply.code(200).send({ message: 'Notification marked as read', notificationId: id });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to mark notification as read');
    return reply.code(500).send({ error: 'Failed to mark notification as read' });
  }
});

// ── MARK ALL AS READ ──────────────────────────────────────────────────────────

app.patch('/api/v1/notifications/read-all', async (
  request: FastifyRequest<{ Body: { userId: string; tenantId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { userId, tenantId } = request.body || {};

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }

    const updated = await prisma.notificationRecipient.updateMany({
      where: {
        userId,
        readAt: null,
        ...(tenantId
          ? { notification: { tenantId } }
          : {}),
      },
      data: { readAt: new Date(), status: 'read' },
    });

    // Emit zero unread count
    emitUnreadCount(userId, 0);

    return reply.code(200).send({
      message: 'All notifications marked as read',
      count: updated.count,
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to mark all notifications as read');
    return reply.code(500).send({ error: 'Failed to mark all notifications as read' });
  }
});

// ── DELETE NOTIFICATION ───────────────────────────────────────────────────────

app.delete('/api/v1/notifications/:id', async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return reply.code(404).send({ error: 'Notification not found' });
    }

    await prisma.notification.delete({ where: { id } });

    return reply.code(200).send({ message: 'Notification deleted', id });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to delete notification');
    return reply.code(500).send({ error: 'Failed to delete notification' });
  }
});

// ── NOTIFICATION PREFERENCES ──────────────────────────────────────────────────

// For now, preferences are stored in SystemSetting keyed by userId
app.get('/api/v1/notifications/preferences', async (
  request: FastifyRequest<{ Querystring: { userId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.query;

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: `notification_prefs:${userId}` },
    });

    const defaultPreferences = {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      categories: {
        leave: true,
        payroll: true,
        performance: true,
        onboarding: true,
        compliance: true,
        announcement: true,
        approval: true,
        system: true,
        recognition: true,
        alert: true,
      },
    };

    const preferences = setting ? JSON.parse(setting.value) : defaultPreferences;

    return reply.code(200).send({ data: { userId, preferences } });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get notification preferences');
    return reply.code(500).send({ error: 'Failed to retrieve preferences' });
  }
});

app.put('/api/v1/notifications/preferences', async (
  request: FastifyRequest<{ Body: { userId: string; preferences: Record<string, unknown> } }>,
  reply: FastifyReply
) => {
  try {
    const { userId, preferences } = request.body;

    if (!userId || !preferences) {
      return reply.code(400).send({ error: 'userId and preferences are required' });
    }

    await prisma.systemSetting.upsert({
      where: { key: `notification_prefs:${userId}` },
      update: { value: JSON.stringify(preferences) },
      create: {
        key: `notification_prefs:${userId}`,
        value: JSON.stringify(preferences),
        group: 'notification_preferences',
        description: `Notification preferences for user ${userId}`,
      },
    });

    return reply.code(200).send({ data: { userId, preferences }, message: 'Preferences updated' });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to update notification preferences');
    return reply.code(500).send({ error: 'Failed to update preferences' });
  }
});

// ── NOTIFICATION TEMPLATES ────────────────────────────────────────────────────

app.get('/api/v1/notification-templates', async (
  request: FastifyRequest<{ Querystring: { tenantId?: string; type?: string; category?: string; isActive?: string; page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const {
      tenantId,
      type,
      category,
      isActive,
      page = '1',
      limit = '20',
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [templates, total] = await Promise.all([
      prisma.notificationTemplate.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notificationTemplate.count({ where }),
    ]);

    return reply.code(200).send({
      data: templates,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list notification templates');
    return reply.code(500).send({ error: 'Failed to retrieve templates' });
  }
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3003', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // Fastify exposes its underlying Node.js HTTP server via app.server.
    // We initialize Socket.IO BEFORE calling app.listen() so it attaches
    // to the same server instance.  app.ready() ensures all plugins are loaded.
    await app.ready();

    // Fastify's server is available after ready() is called
    const server = app.server as import('http').Server;

    // Initialize Socket.IO on the same HTTP server as Fastify
    await initSocketServer(server);

    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Notification service listening on ${HOST}:${PORT}`);
    app.log.info(`Socket.IO available at ws://${HOST}:${PORT}/socket.io (namespace: /notifications)`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  app.log.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  app.log.error({ reason }, 'Unhandled rejection');
  process.exit(1);
});

start();

export default app;
