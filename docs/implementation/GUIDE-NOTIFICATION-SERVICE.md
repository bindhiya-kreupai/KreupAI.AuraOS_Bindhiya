# Notification Service Implementation Guide

**Document Version**: 1.0
**Last Updated**: January 22, 2026
**Owner**: Platform Engineering Team
**Status**: Implementation Ready
**Estimated Timeline**: 2 weeks
**Impact**: 1% of platform completion (97% → 98%)

---

## Table of Contents

1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Prerequisites](#prerequisites)
4. [Week 1: Core Implementation](#week-1-core-implementation)
5. [Week 2: Testing & Deployment](#week-2-testing--deployment)
6. [API Specification](#api-specification)
7. [RabbitMQ Integration](#rabbitmq-integration)
8. [Provider Integration](#provider-integration)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Procedures](#deployment-procedures)

---

## Overview

### Objective
Implement the Notification Service microservice to handle all notification delivery (email, SMS, push notifications) across the AuraOS platform.

### Service Characteristics
- **Technology Stack**: Fastify + TypeScript
- **Communication**: REST API + RabbitMQ
- **Architecture**: Stateless, async message-driven
- **Port**: 3003
- **Replicas**: 3 (production)

### Key Features
- Multi-channel notifications (email, SMS, push)
- Template management with variable substitution
- Async delivery via RabbitMQ
- Retry logic with exponential backoff
- Delivery tracking and status updates
- Rate limiting per tenant
- Webhook notifications for delivery status

### Performance Targets
- **Queue Processing**: 1,000 messages/minute
- **Email Delivery**: < 5 seconds (p95)
- **SMS Delivery**: < 3 seconds (p95)
- **Availability**: 99.95%
- **Error Rate**: < 0.5%

---

## Service Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Services (Auth, Employee, etc.)          │
│              Publish notification requests               │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │     RabbitMQ       │
    │  (Message Queue)   │
    │  - notification.   │
    │    email.queue     │
    │  - notification.   │
    │    sms.queue       │
    │  - notification.   │
    │    push.queue      │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Notification       │
    │ Service (Fastify)  │
    │ Port: 3003         │
    └────┬───────┬───────┬────┘
         │       │       │
         ▼       ▼       ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │AWS SES │ │Twilio  │ │Firebase│
    │(Email) │ │(SMS)   │ │(Push)  │
    └────────┘ └────────┘ └────────┘
         │       │       │
         └───────┴───────┘
               │
               ▼
    ┌────────────────────┐
    │   PostgreSQL       │
    │ (Delivery Logs)    │
    └────────────────────┘
```

### Technology Stack

**Backend Framework**: Fastify 4.x
- High performance HTTP server
- Schema-based validation
- Plugin architecture
- Low overhead

**Message Queue**: RabbitMQ 3.12
- Durable queues
- Dead letter queues
- Message TTL and expiry
- Priority queues

**Database**: PostgreSQL 15
- Notification logs
- Template storage
- Delivery status tracking

**Cache**: Redis 7.x
- Rate limiting
- Template caching
- Idempotency keys

**Providers**:
- **Email**: AWS SES (primary), SendGrid (backup)
- **SMS**: Twilio (primary), AWS SNS (backup)
- **Push**: Firebase Cloud Messaging (FCM)

---

## Prerequisites

### Development Environment Setup

**1. Install Dependencies**:
```bash
cd services/notification-service/

pnpm install
```

**2. Set Up RabbitMQ**:
```bash
# Using Docker
docker run --name notification-rabbitmq \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -p 5672:5672 \
  -p 15672:15672 \
  -d rabbitmq:3.12-management

# Verify connection
curl -u admin:admin123 http://localhost:15672/api/overview
```

**3. Set Up PostgreSQL**:
```bash
# Using Docker
docker run --name notification-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=notification_dev \
  -p 5434:5432 \
  -d postgres:15

# Verify connection
psql -h localhost -p 5434 -U admin -d notification_dev -c "SELECT version();"
```

**4. Set Up Redis**:
```bash
# Using Docker
docker run --name notification-redis \
  -p 6381:6379 \
  -d redis:7-alpine

# Verify connection
redis-cli -p 6381 PING
```

**5. Configure Environment Variables**:
```bash
# services/notification-service/.env.development

# Database
DATABASE_URL="postgresql://admin:admin123@localhost:5434/notification_dev"

# RabbitMQ
RABBITMQ_URL="amqp://admin:admin123@localhost:5672"
RABBITMQ_PREFETCH=10

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6381

# Email Provider (AWS SES)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
SES_FROM_EMAIL="noreply@auraos.com"
SES_FROM_NAME="AuraOS Notifications"

# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_FROM_NUMBER="+1234567890"

# Push Provider (Firebase)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CREDENTIALS_PATH="./firebase-credentials.json"

# Service
PORT=3003
NODE_ENV=development
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_EMAIL=100  # per tenant per hour
RATE_LIMIT_SMS=50     # per tenant per hour
```

**6. Initialize Database Schema**:
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

---

## Week 1: Core Implementation

### Day 1-2: Project Structure & Message Consumer

**1. Create Project Structure**:
```
services/notification-service/
├── src/
│   ├── app.ts                        # Fastify app setup
│   ├── server.ts                     # Server entry point
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── rabbitmq.config.ts
│   │   ├── providers.config.ts
│   │   └── redis.config.ts
│   ├── modules/
│   │   ├── notification/
│   │   │   ├── dto/
│   │   │   │   ├── send-email.dto.ts
│   │   │   │   ├── send-sms.dto.ts
│   │   │   │   └── send-push.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── notification-log.entity.ts
│   │   │   ├── services/
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   ├── sms.service.ts
│   │   │   │   └── push.service.ts
│   │   │   ├── consumers/
│   │   │   │   ├── email.consumer.ts
│   │   │   │   ├── sms.consumer.ts
│   │   │   │   └── push.consumer.ts
│   │   │   ├── routes/
│   │   │   │   └── notification.routes.ts
│   │   │   └── notification.module.ts
│   │   ├── template/
│   │   │   ├── services/
│   │   │   │   └── template.service.ts
│   │   │   └── template.module.ts
│   │   └── health/
│   │       └── health.routes.ts
│   └── common/
│       ├── providers/
│       │   ├── aws-ses.provider.ts
│       │   ├── twilio.provider.ts
│       │   └── firebase.provider.ts
│       ├── rabbitmq/
│       │   ├── rabbitmq.client.ts
│       │   └── rabbitmq.consumer.ts
│       └── utils/
│           ├── rate-limiter.ts
│           └── retry.utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
└── .env.development
```

**2. Implement Fastify App**:

**File**: `src/app.ts`
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import notificationRoutes from './modules/notification/routes/notification.routes';
import healthRoutes from './modules/health/health.routes';

export const prisma = new PrismaClient();

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Security
  await app.register(helmet);

  // CORS
  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  });

  // Routes
  await app.register(notificationRoutes, { prefix: '/api/v1/notifications' });
  await app.register(healthRoutes, { prefix: '/api/v1/health' });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
      },
    });
  });

  return app;
}
```

**3. Implement RabbitMQ Client**:

**File**: `src/common/rabbitmq/rabbitmq.client.ts`
```typescript
import amqp, { Connection, Channel } from 'amqplib';

export class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.reconnect();
      });

      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed, reconnecting...');
        this.reconnect();
      });

      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(parseInt(process.env.RABBITMQ_PREFETCH || '10'));

      console.log('✅ Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      await this.reconnect();
    }
  }

  private async reconnect(): Promise<void> {
    await this.sleep(5000);
    await this.connect();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async assertQueue(queueName: string, options: any = {}): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.assertQueue(queueName, {
      durable: true,
      ...options,
    });

    console.log(`✅ Queue asserted: ${queueName}`);
  }

  async consume(
    queueName: string,
    callback: (msg: any) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        await callback(content);

        this.channel!.ack(msg);
      } catch (error) {
        console.error(`Error processing message from ${queueName}:`, error);

        // Retry logic
        const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;

        if (retryCount < 3) {
          // Requeue with retry count
          this.channel!.nack(msg, false, false);
          await this.publish(queueName, JSON.parse(msg.content.toString()), {
            headers: { 'x-retry-count': retryCount },
          });
        } else {
          // Send to dead letter queue after 3 retries
          await this.publish(`${queueName}.dlq`, JSON.parse(msg.content.toString()));
          this.channel!.ack(msg);
        }
      }
    });

    console.log(`✅ Consumer started for queue: ${queueName}`);
  }

  async publish(
    queueName: string,
    message: any,
    options: any = {},
  ): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        ...options,
      },
    );
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  getChannel(): Channel | null {
    return this.channel;
  }
}
```

**4. Implement Email Consumer**:

**File**: `src/modules/notification/consumers/email.consumer.ts`
```typescript
import { RabbitMQClient } from '@/common/rabbitmq/rabbitmq.client';
import { EmailService } from '../services/email.service';
import { prisma } from '@/app';

const QUEUE_NAME = 'notification.email.queue';

export class EmailConsumer {
  constructor(
    private readonly rabbitmq: RabbitMQClient,
    private readonly emailService: EmailService,
  ) {}

  async start(): Promise<void> {
    // Assert queue
    await this.rabbitmq.assertQueue(QUEUE_NAME, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: `${QUEUE_NAME}.dlq`,
    });

    // Assert dead letter queue
    await this.rabbitmq.assertQueue(`${QUEUE_NAME}.dlq`, {
      durable: true,
    });

    // Start consuming
    await this.rabbitmq.consume(QUEUE_NAME, async (message) => {
      await this.processMessage(message);
    });

    console.log(`✅ Email consumer started`);
  }

  private async processMessage(message: any): Promise<void> {
    const { id, tenantId, to, subject, body, template, variables } = message;

    console.log(`Processing email notification: ${id}`);

    try {
      // Log notification attempt
      await prisma.notificationLog.create({
        data: {
          id,
          tenantId,
          type: 'EMAIL',
          recipient: to,
          status: 'PROCESSING',
          metadata: { subject, template },
        },
      });

      // Send email
      const result = await this.emailService.send({
        to,
        subject,
        body,
        template,
        variables,
      });

      // Update log
      await prisma.notificationLog.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          metadata: { ...result },
        },
      });

      console.log(`✅ Email sent: ${id}`);
    } catch (error: any) {
      console.error(`❌ Failed to send email: ${id}`, error);

      // Update log
      await prisma.notificationLog.update({
        where: { id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });

      throw error;
    }
  }
}
```

### Day 3-4: Email Service Implementation

**File**: `src/modules/notification/services/email.service.ts`
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { TemplateService } from '@/modules/template/services/template.service';

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  body?: string;
  template?: string;
  variables?: Record<string, any>;
  attachments?: any[];
}

export class EmailService {
  private sesClient: SESClient;

  constructor(private readonly templateService: TemplateService) {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async send(dto: SendEmailDto): Promise<any> {
    const { to, subject, body, template, variables } = dto;

    // Render template if provided
    let htmlBody = body;
    if (template) {
      htmlBody = await this.templateService.render(template, variables || {});
    }

    // Prepare recipients
    const recipients = Array.isArray(to) ? to : [to];

    // Send email via AWS SES
    const command = new SendEmailCommand({
      Source: `${process.env.SES_FROM_NAME} <${process.env.SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody!,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await this.sesClient.send(command);

    return {
      messageId: response.MessageId,
      provider: 'AWS_SES',
    };
  }

  async sendBulk(emails: SendEmailDto[]): Promise<any[]> {
    const results = await Promise.allSettled(
      emails.map((email) => this.send(email)),
    );

    return results.map((result, index) => ({
      email: emails[index].to,
      status: result.status === 'fulfilled' ? 'SENT' : 'FAILED',
      result: result.status === 'fulfilled' ? result.value : result.reason,
    }));
  }
}
```

**File**: `src/common/providers/aws-ses.provider.ts`
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export class AWSSESProvider {
  private client: SESClient;

  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async sendEmail(params: {
    to: string[];
    subject: string;
    htmlBody: string;
    textBody?: string;
  }): Promise<{ messageId: string }> {
    const command = new SendEmailCommand({
      Source: `${process.env.SES_FROM_NAME} <${process.env.SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: params.to,
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: params.htmlBody,
            Charset: 'UTF-8',
          },
          ...(params.textBody && {
            Text: {
              Data: params.textBody,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    });

    const response = await this.client.send(command);

    return {
      messageId: response.MessageId!,
    };
  }
}
```

### Day 5-6: SMS & Push Services

**File**: `src/modules/notification/services/sms.service.ts`
```typescript
import { Twilio } from 'twilio';

export interface SendSMSDto {
  to: string | string[];
  message: string;
  template?: string;
  variables?: Record<string, any>;
}

export class SMSService {
  private twilioClient: Twilio;

  constructor() {
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
  }

  async send(dto: SendSMSDto): Promise<any> {
    const { to, message } = dto;

    // Render template if provided (simplified)
    const body = message;

    // Prepare recipients
    const recipients = Array.isArray(to) ? to : [to];

    // Send SMS via Twilio
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        const response = await this.twilioClient.messages.create({
          from: process.env.TWILIO_FROM_NUMBER!,
          to: recipient,
          body,
        });

        return {
          messageId: response.sid,
          to: recipient,
          status: response.status,
        };
      }),
    );

    return results;
  }
}
```

**File**: `src/modules/notification/services/push.service.ts`
```typescript
import admin from 'firebase-admin';

export interface SendPushDto {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class PushService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          require(process.env.FIREBASE_CREDENTIALS_PATH!),
        ),
        projectId: process.env.FIREBASE_PROJECT_ID!,
      });
    }
  }

  async send(dto: SendPushDto): Promise<any> {
    const { tokens, title, body, data } = dto;

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses.map((r, i) => ({
        token: tokens[i],
        success: r.success,
        error: r.error?.message,
      })),
    };
  }
}
```

### Day 7: Template Service

**File**: `src/modules/template/services/template.service.ts`
```typescript
import Handlebars from 'handlebars';
import { prisma } from '@/app';

export class TemplateService {
  /**
   * Render template with variables
   */
  async render(templateName: string, variables: Record<string, any>): Promise<string> {
    // Fetch template from database
    const template = await prisma.notificationTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Compile template with Handlebars
    const compiledTemplate = Handlebars.compile(template.content);

    // Render with variables
    return compiledTemplate(variables);
  }

  /**
   * Create or update template
   */
  async upsert(name: string, content: string, subject?: string): Promise<void> {
    await prisma.notificationTemplate.upsert({
      where: { name },
      create: {
        name,
        content,
        subject,
      },
      update: {
        content,
        subject,
      },
    });
  }

  /**
   * Get all templates
   */
  async findAll(): Promise<any[]> {
    return prisma.notificationTemplate.findMany();
  }

  /**
   * Delete template
   */
  async delete(name: string): Promise<void> {
    await prisma.notificationTemplate.delete({
      where: { name },
    });
  }
}
```

### Day 8-9: API Routes & Rate Limiting

**File**: `src/modules/notification/routes/notification.routes.ts`
```typescript
import { FastifyPluginAsync } from 'fastify';
import { NotificationService } from '../services/notification.service';
import { rateLimiter } from '@/common/utils/rate-limiter';

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  const notificationService = new NotificationService();

  // Send email
  fastify.post(
    '/email',
    {
      preHandler: [rateLimiter('email')],
      schema: {
        body: {
          type: 'object',
          required: ['to', 'subject'],
          properties: {
            to: { oneOf: [{ type: 'string' }, { type: 'array' }] },
            subject: { type: 'string' },
            body: { type: 'string' },
            template: { type: 'string' },
            variables: { type: 'object' },
          },
        },
      },
    },
    async (request, reply) => {
      const result = await notificationService.sendEmail(request.body);
      reply.send({ success: true, data: result });
    },
  );

  // Send SMS
  fastify.post(
    '/sms',
    {
      preHandler: [rateLimiter('sms')],
      schema: {
        body: {
          type: 'object',
          required: ['to', 'message'],
          properties: {
            to: { oneOf: [{ type: 'string' }, { type: 'array' }] },
            message: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const result = await notificationService.sendSMS(request.body);
      reply.send({ success: true, data: result });
    },
  );

  // Send push notification
  fastify.post(
    '/push',
    {
      schema: {
        body: {
          type: 'object',
          required: ['tokens', 'title', 'body'],
          properties: {
            tokens: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            body: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    async (request, reply) => {
      const result = await notificationService.sendPush(request.body);
      reply.send({ success: true, data: result });
    },
  );

  // Get notification status
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const notification = await notificationService.getStatus(id);
    reply.send({ success: true, data: notification });
  });

  // Get notifications by tenant
  fastify.get('/', async (request, reply) => {
    const { tenantId, page = 1, limit = 20 } = request.query as any;
    const result = await notificationService.list(tenantId, { page, limit });
    reply.send({ success: true, data: result });
  });
};

export default notificationRoutes;
```

**File**: `src/common/utils/rate-limiter.ts`
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from 'redis';

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redis.connect();

const RATE_LIMITS = {
  email: parseInt(process.env.RATE_LIMIT_EMAIL || '100'), // per hour
  sms: parseInt(process.env.RATE_LIMIT_SMS || '50'), // per hour
};

export function rateLimiter(type: 'email' | 'sms') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (request.body as any)?.tenantId || 'default';
    const key = `rate-limit:${type}:${tenantId}`;
    const limit = RATE_LIMITS[type];

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, 3600); // 1 hour TTL
    }

    if (current > limit) {
      reply.status(429).send({
        success: false,
        error: {
          message: `Rate limit exceeded for ${type}. Max ${limit} per hour.`,
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
      return;
    }

    reply.header('X-RateLimit-Limit', limit);
    reply.header('X-RateLimit-Remaining', Math.max(0, limit - current));
  };
}
```

---

## Week 2: Testing & Deployment

### Day 10-12: Comprehensive Testing

Create tests following [TESTING-STANDARDS.md](d:\KreupAI\KreupAI.AuraOS\docs\testing\TESTING-STANDARDS.md):

**Unit Tests**: `test/unit/email.service.spec.ts`
**Integration Tests**: `test/integration/notification.integration.spec.ts`
**E2E Tests**: `test/e2e/notification.e2e.spec.ts`

**Target Coverage**: 80% (High priority module)

Run tests:
```bash
pnpm test                    # Unit tests
pnpm test:integration        # Integration tests
pnpm test:e2e               # E2E tests
pnpm test:coverage          # Coverage report
```

### Day 13-14: Deployment

**1. Build Docker Image**:
```bash
cd services/notification-service/

docker build -t notification-service:1.0.0 .
docker tag notification-service:1.0.0 your-registry/notification-service:1.0.0
docker push your-registry/notification-service:1.0.0
```

**2. Deploy to Kubernetes**:
```bash
kubectl apply -f k8s/notification-service-deployment.yaml
kubectl apply -f k8s/notification-service-service.yaml
kubectl apply -f k8s/rabbitmq-deployment.yaml
```

**3. Start Consumers**:
```bash
# Consumers run as part of the service deployment
kubectl logs -f deployment/notification-service -n default
```

---

## API Specification

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/notifications/email | Send email |
| POST | /api/v1/notifications/sms | Send SMS |
| POST | /api/v1/notifications/push | Send push notification |
| GET | /api/v1/notifications/:id | Get notification status |
| GET | /api/v1/notifications | List notifications |

---

## RabbitMQ Integration

### Queue Names
- `notification.email.queue` - Email notifications
- `notification.sms.queue` - SMS notifications
- `notification.push.queue` - Push notifications
- `*.dlq` - Dead letter queues for failed messages

### Message Format

**Email Queue Message**:
```json
{
  "id": "uuid",
  "tenantId": "tenant-id",
  "to": "user@example.com",
  "subject": "Welcome to AuraOS",
  "body": "<html>...</html>",
  "template": "welcome-email",
  "variables": {
    "firstName": "John",
    "activationLink": "https://..."
  }
}
```

---

## Database Schema

**Prisma Schema**: `prisma/schema.prisma`

```prisma
model NotificationLog {
  id          String    @id @default(uuid())
  tenantId    String    @map("tenant_id")
  type        NotificationType
  recipient   String
  status      NotificationStatus
  sentAt      DateTime?  @map("sent_at")
  error       String?
  metadata    Json?
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  @@index([tenantId, createdAt])
  @@index([status])
  @@map("notification_logs")
}

model NotificationTemplate {
  id        String   @id @default(uuid())
  name      String   @unique
  subject   String?
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("notification_templates")
}

enum NotificationType {
  EMAIL
  SMS
  PUSH
}

enum NotificationStatus {
  PENDING
  PROCESSING
  SENT
  FAILED
}
```

---

## Success Criteria

**Completion Checklist**:
- [ ] All 6 API endpoints implemented and tested
- [ ] RabbitMQ integration with 3 queues
- [ ] Email service (AWS SES) operational
- [ ] SMS service (Twilio) operational
- [ ] Push service (Firebase) operational
- [ ] Template service with Handlebars
- [ ] Rate limiting implemented
- [ ] Retry logic with exponential backoff
- [ ] Unit tests: 80% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Docker image built
- [ ] Deployed to Kubernetes
- [ ] Consumers running
- [ ] Datadog monitoring active
- [ ] Documentation complete

---

**Platform Progress**: 97% → 98% ✅

**Next Steps**: Proceed to [Document Service Implementation Guide](./GUIDE-DOCUMENT-SERVICE.md)
