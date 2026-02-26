/**
 * Document Service - Entry Point
 * Proper Fastify microservice for document management operations.
 *
 * Routes (all prefixed /api/v1):
 *   GET    /documents                         — list with filters
 *   GET    /documents/:id                     — get document
 *   POST   /documents                         — upload document metadata
 *   PUT    /documents/:id                     — update document
 *   DELETE /documents/:id                     — soft-delete
 *   GET    /documents/:id/download            — signed download URL (stub)
 *   POST   /documents/verify                  — verify document
 *   GET    /document-types                    — list document types
 *   GET    /templates                         — list letter/document templates
 *   POST   /templates/:id/generate            — generate document from template
 *   GET    /health                            — health check
 */

import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

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

// ── App ───────────────────────────────────────────────────────────────────────

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req) =>
    (req.headers['x-request-id'] as string) ||
    `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

// ── CORS / Security headers ───────────────────────────────────────────────────

app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
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
    service: 'document-service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// ── LIST DOCUMENTS ────────────────────────────────────────────────────────────

interface ListDocumentsQuery {
  employeeId?: string;
  type?: string;
  status?: string;
  category?: string;
  tenantId?: string;
  page?: string;
  limit?: string;
}

app.get('/api/v1/documents', async (
  request: FastifyRequest<{ Querystring: ListDocumentsQuery }>,
  reply: FastifyReply
) => {
  try {
    const {
      employeeId,
      type,
      status,
      category,
      tenantId,
      page = '1',
      limit = '20',
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (category) where.category = category;
    if (tenantId) where.tenantId = tenantId;
    if (type) {
      where.documentType = { code: type };
    }

    const [documents, total] = await Promise.all([
      prisma.employeeDocument.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          documentType: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employeeDocument.count({ where }),
    ]);

    return reply.code(200).send({
      data: documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list documents');
    return reply.code(500).send({ error: 'Failed to retrieve documents' });
  }
});

// ── GET SINGLE DOCUMENT ───────────────────────────────────────────────────────

app.get('/api/v1/documents/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const document = await prisma.employeeDocument.findUnique({
      where: { id },
      include: {
        documentType: true,
        parent: { select: { id: true, documentName: true, version: true } },
        versions: {
          select: { id: true, documentName: true, version: true, createdAt: true },
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!document) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    return reply.code(200).send({ data: document });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to get document');
    return reply.code(500).send({ error: 'Failed to retrieve document' });
  }
});

// ── UPLOAD DOCUMENT METADATA ──────────────────────────────────────────────────

interface CreateDocumentBody {
  tenantId: string;
  employeeId?: string;
  documentTypeId: string;
  documentName: string;
  documentNumber?: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  issueDate?: string;
  expiryDate?: string;
  expiryAlertDays?: number;
  isConfidential?: boolean;
  accessLevel?: string;
  description?: string;
  tags?: string;
  uploadedBy: string;
}

app.post('/api/v1/documents', async (
  request: FastifyRequest<{ Body: CreateDocumentBody }>,
  reply: FastifyReply
) => {
  try {
    const body = request.body;

    const required = ['tenantId', 'documentTypeId', 'documentName', 'category', 'fileName', 'fileSize', 'fileType', 'fileUrl', 'uploadedBy'];
    const missing = required.filter((f) => !body[f as keyof CreateDocumentBody]);
    if (missing.length > 0) {
      return reply.code(400).send({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const document = await prisma.employeeDocument.create({
      data: {
        tenantId: body.tenantId,
        employeeId: body.employeeId,
        documentTypeId: body.documentTypeId,
        documentName: body.documentName,
        documentNumber: body.documentNumber,
        category: body.category,
        fileName: body.fileName,
        fileSize: body.fileSize,
        fileType: body.fileType,
        fileUrl: body.fileUrl,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        expiryAlertDays: body.expiryAlertDays ?? 30,
        isConfidential: body.isConfidential ?? false,
        accessLevel: body.accessLevel ?? 'EMPLOYEE',
        description: body.description,
        tags: body.tags,
        uploadedBy: body.uploadedBy,
        status: 'ACTIVE',
      },
      include: {
        documentType: { select: { id: true, name: true, code: true } },
      },
    });

    return reply.code(201).send({ data: document });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to create document');
    return reply.code(500).send({ error: 'Failed to create document' });
  }
});

// ── UPDATE DOCUMENT ───────────────────────────────────────────────────────────

app.put('/api/v1/documents/:id', async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateDocumentBody> }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const body = request.body;

    const existing = await prisma.employeeDocument.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'documentName', 'documentNumber', 'category', 'fileName', 'fileSize',
      'fileType', 'fileUrl', 'expiryAlertDays', 'isConfidential', 'accessLevel',
      'description', 'tags', 'status',
    ];

    for (const field of allowedFields) {
      if (body[field as keyof typeof body] !== undefined) {
        updateData[field] = body[field as keyof typeof body];
      }
    }

    if (body.issueDate) updateData.issueDate = new Date(body.issueDate);
    if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate);

    const document = await prisma.employeeDocument.update({
      where: { id },
      data: updateData,
      include: {
        documentType: { select: { id: true, name: true, code: true } },
      },
    });

    return reply.code(200).send({ data: document });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to update document');
    return reply.code(500).send({ error: 'Failed to update document' });
  }
});

// ── SOFT DELETE DOCUMENT ──────────────────────────────────────────────────────

app.delete('/api/v1/documents/:id', async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const existing = await prisma.employeeDocument.findUnique({ where: { id } });
    if (!existing) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    await prisma.employeeDocument.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return reply.code(200).send({ message: 'Document deleted successfully', id });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to delete document');
    return reply.code(500).send({ error: 'Failed to delete document' });
  }
});

// ── DOWNLOAD (signed URL stub) ────────────────────────────────────────────────

app.get('/api/v1/documents/:id/download', async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { expirySeconds?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const expirySeconds = parseInt(request.query.expirySeconds || '3600', 10);

    const document = await prisma.employeeDocument.findUnique({
      where: { id },
      select: { id: true, fileUrl: true, fileName: true, fileType: true, status: true },
    });

    if (!document) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    if (document.status === 'DELETED') {
      return reply.code(410).send({ error: 'Document has been deleted' });
    }

    // In production: generate presigned S3 URL using @aws-sdk/s3-request-presigner
    // const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new GetObjectCommand({ Bucket, Key: extractKeyFromUrl(document.fileUrl) });
    // const signedUrl = await getSignedUrl(s3, command, { expiresIn: expirySeconds });

    const signedUrl = `${document.fileUrl}?token=${Buffer.from(`${id}:${Date.now()}`).toString('base64')}&expires=${Date.now() + expirySeconds * 1000}`;

    return reply.code(200).send({
      data: {
        documentId: id,
        signedUrl,
        fileName: document.fileName,
        fileType: document.fileType,
        expiresAt: new Date(Date.now() + expirySeconds * 1000).toISOString(),
      },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to generate download URL');
    return reply.code(500).send({ error: 'Failed to generate download URL' });
  }
});

// ── VERIFY DOCUMENT ───────────────────────────────────────────────────────────

interface VerifyDocumentBody {
  documentId: string;
  verifiedBy: string;
  notes?: string;
}

app.post('/api/v1/documents/verify', async (
  request: FastifyRequest<{ Body: VerifyDocumentBody }>,
  reply: FastifyReply
) => {
  try {
    const { documentId, verifiedBy, notes } = request.body;

    if (!documentId || !verifiedBy) {
      return reply.code(400).send({ error: 'documentId and verifiedBy are required' });
    }

    const document = await prisma.employeeDocument.findUnique({ where: { id: documentId } });
    if (!document) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    const updated = await prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
        ...(notes ? { description: notes } : {}),
      },
      include: {
        documentType: { select: { id: true, name: true } },
      },
    });

    return reply.code(200).send({
      data: updated,
      message: 'Document verified successfully',
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to verify document');
    return reply.code(500).send({ error: 'Failed to verify document' });
  }
});

// ── DOCUMENT TYPES ────────────────────────────────────────────────────────────

app.get('/api/v1/document-types', async (
  request: FastifyRequest<{ Querystring: { status?: string; search?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { status, search } = request.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documentTypes = await prisma.documentType.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return reply.code(200).send({ data: documentTypes, total: documentTypes.length });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list document types');
    return reply.code(500).send({ error: 'Failed to retrieve document types' });
  }
});

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

app.get('/api/v1/templates', async (
  request: FastifyRequest<{ Querystring: { tenantId?: string; type?: string; status?: string; page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { tenantId, type, status, page = '1', limit = '20' } = request.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (type) where.type = type;
    if (status) where.status = status;

    // Letter templates stored in the Letter model's related LetterTemplate pattern
    // Using NotificationTemplate as a proxy for document/letter templates from schema
    const [templates, total] = await Promise.all([
      prisma.notificationTemplate.findMany({
        where: {
          ...(tenantId ? { tenantId } : {}),
          ...(type ? { type } : {}),
          isActive: status === 'inactive' ? false : true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notificationTemplate.count({
        where: {
          ...(tenantId ? { tenantId } : {}),
          ...(type ? { type } : {}),
          isActive: status === 'inactive' ? false : true,
        },
      }),
    ]);

    return reply.code(200).send({
      data: templates,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to list templates');
    return reply.code(500).send({ error: 'Failed to retrieve templates' });
  }
});

// ── GENERATE DOCUMENT FROM TEMPLATE ──────────────────────────────────────────

interface GenerateDocumentBody {
  employeeId: string;
  variables?: Record<string, unknown>;
  outputFormat?: 'pdf' | 'docx' | 'html';
  uploadedBy: string;
  tenantId: string;
}

app.post('/api/v1/templates/:id/generate', async (
  request: FastifyRequest<{ Params: { id: string }; Body: GenerateDocumentBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { employeeId, variables = {}, outputFormat = 'pdf', uploadedBy, tenantId } = request.body;

    if (!employeeId || !uploadedBy || !tenantId) {
      return reply.code(400).send({ error: 'employeeId, uploadedBy, and tenantId are required' });
    }

    const template = await prisma.notificationTemplate.findUnique({ where: { id } });
    if (!template) {
      return reply.code(404).send({ error: 'Template not found' });
    }

    // Interpolate template body with variables
    let rendered = template.body;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }

    // In production: generate actual PDF/DOCX using a library (puppeteer, docxtemplater)
    // For now return a stub generated document record
    const generatedFileName = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.${outputFormat}`;
    const generatedFileUrl = `/generated/${tenantId}/${generatedFileName}`;

    // Find or create a document type for generated letters
    let docType = await prisma.documentType.findFirst({ where: { code: 'GENERATED_LETTER' } });
    if (!docType) {
      docType = await prisma.documentType.create({
        data: {
          code: 'GENERATED_LETTER',
          name: 'Generated Letter',
          description: 'Auto-generated letters and documents from templates',
        },
      });
    }

    const document = await prisma.employeeDocument.create({
      data: {
        tenantId,
        employeeId,
        documentTypeId: docType.id,
        documentName: `${template.name} - Generated`,
        category: 'GENERATED',
        fileName: generatedFileName,
        fileSize: rendered.length,
        fileType: outputFormat,
        fileUrl: generatedFileUrl,
        description: `Generated from template: ${template.name}`,
        uploadedBy,
        status: 'ACTIVE',
      },
    });

    return reply.code(201).send({
      data: {
        documentId: document.id,
        templateId: id,
        templateName: template.name,
        generatedFileName,
        generatedFileUrl,
        outputFormat,
        renderedContent: rendered,
      },
      message: 'Document generated successfully',
    });
  } catch (error) {
    request.log.error({ err: error }, 'Failed to generate document from template');
    return reply.code(500).send({ error: 'Failed to generate document' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3002', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Document service listening on ${HOST}:${PORT}`);
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
