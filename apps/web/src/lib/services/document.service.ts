/**
 * @module DocumentService
 * @description Service layer for employee document management with versioning, expiry tracking, and verification
 * @project AURA HCM Platform
 */

import { prisma } from '@aura/database';
import { z } from 'zod';

// Validation Schemas
export const createDocumentSchema = z.object({
  tenantId: z.string().uuid(),
  employeeId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid(),
  documentName: z.string().min(1, 'Document name is required'),
  documentNumber: z.string().optional().nullable(),
  category: z.enum(['CONTRACT', 'ID_PROOF', 'EDUCATION', 'MEDICAL', 'TAX', 'OTHER']),
  fileName: z.string(),
  fileSize: z.number().positive('File size must be positive'),
  fileType: z.string(),
  fileUrl: z.string(),
  issueDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  isConfidential: z.boolean().default(false),
  accessLevel: z.enum(['EMPLOYEE', 'MANAGER', 'HR_ONLY', 'ADMIN']).default('EMPLOYEE'),
  description: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  uploadedBy: z.string().uuid(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

interface DocumentFilter {
  tenantId: string;
  employeeId?: string;
  category?: string;
  status?: string;
  search?: string;
  expiringIn?: number; // days
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class DocumentService {
  /**
   * Get all documents with filtering and pagination
   */
  static async findAll(filter: DocumentFilter) {
    const {
      tenantId,
      employeeId,
      category,
      status = 'ACTIVE',
      search,
      expiringIn,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId,
      status,
    };

    if (employeeId) where.employeeId = employeeId;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { documentName: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Expiring documents filter
    if (expiringIn) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiringIn);
      where.expiryDate = {
        lte: futureDate,
        gte: new Date(),
      };
      where.isExpired = false;
    }

    const [documents, total] = await Promise.all([
      prisma.employeeDocument.findMany({
        where,
        include: {
          documentType: { select: { id: true, name: true, code: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.employeeDocument.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get document by ID with version history
   */
  static async findById(id: string, tenantId: string) {
    const document = await prisma.employeeDocument.findFirst({
      where: { id, tenantId },
      include: {
        documentType: true,
        parent: { select: { id: true, documentName: true, version: true } },
        versions: {
          select: {
            id: true,
            documentName: true,
            version: true,
            createdAt: true,
            fileName: true,
            fileSize: true,
          },
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  /**
   * Create new document
   */
  static async create(data: z.infer<typeof createDocumentSchema>) {
    // Validate data
    const validated = createDocumentSchema.parse(data);

    // Check for duplicate document number if provided
    if (validated.documentNumber) {
      const existing = await prisma.employeeDocument.findFirst({
        where: {
          tenantId: validated.tenantId,
          documentNumber: validated.documentNumber,
          status: 'ACTIVE',
        },
      });

      if (existing) {
        throw new Error(`Document with number ${validated.documentNumber} already exists`);
      }
    }

    // Create document
    const document = await prisma.employeeDocument.create({
      data: {
        ...validated,
        employeeId: validated.employeeId || null,
        documentNumber: validated.documentNumber || null,
        issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        description: validated.description || null,
        tags: validated.tags || null,
      },
      include: {
        documentType: true,
      },
    });

    return document;
  }

  /**
   * Update document
   */
  static async update(id: string, tenantId: string, data: Partial<z.infer<typeof updateDocumentSchema>>) {
    // Check if document exists
    const existing = await prisma.employeeDocument.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error('Document not found');
    }

    // Update document
    const updated = await prisma.employeeDocument.update({
      where: { id },
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
      include: {
        documentType: true,
      },
    });

    return updated;
  }

  /**
   * Create new version of document
   */
  static async createVersion(parentId: string, tenantId: string, data: Partial<z.infer<typeof createDocumentSchema>>) {
    // Get parent document
    const parent = await prisma.employeeDocument.findFirst({
      where: { id: parentId, tenantId },
    });

    if (!parent) {
      throw new Error('Parent document not found');
    }

    // Create new version
    const newVersion = await prisma.employeeDocument.create({
      data: {
        tenantId: parent.tenantId,
        employeeId: parent.employeeId,
        documentTypeId: parent.documentTypeId,
        documentName: data.documentName || parent.documentName,
        documentNumber: parent.documentNumber,
        category: parent.category,
        fileName: data.fileName || parent.fileName,
        fileSize: data.fileSize || parent.fileSize,
        fileType: data.fileType || parent.fileType,
        fileUrl: data.fileUrl || parent.fileUrl,
        parentId,
        version: parent.version + 1,
        issueDate: data.issueDate ? new Date(data.issueDate) : parent.issueDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : parent.expiryDate,
        isConfidential: data.isConfidential ?? parent.isConfidential,
        accessLevel: data.accessLevel || parent.accessLevel,
        description: data.description || parent.description,
        tags: data.tags || parent.tags,
        uploadedBy: data.uploadedBy || parent.uploadedBy,
      },
      include: {
        documentType: true,
        parent: { select: { id: true, documentName: true, version: true } },
      },
    });

    return newVersion;
  }

  /**
   * Mark document as verified
   */
  static async verify(id: string, tenantId: string, verifiedBy: string) {
    const document = await prisma.employeeDocument.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const updated = await prisma.employeeDocument.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Soft delete document
   */
  static async delete(id: string, tenantId: string) {
    const document = await prisma.employeeDocument.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Soft delete
    await prisma.employeeDocument.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return { success: true };
  }

  /**
   * Get expiring documents
   */
  static async getExpiringDocuments(tenantId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const documents = await prisma.employeeDocument.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        isExpired: false,
      },
      include: {
        documentType: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    return documents;
  }

  /**
   * Get documents by category
   */
  static async getByCategory(tenantId: string, category: string) {
    const documents = await prisma.employeeDocument.findMany({
      where: {
        tenantId,
        category,
        status: 'ACTIVE',
      },
      include: {
        documentType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  /**
   * Update expired flag for documents
   */
  static async updateExpiredFlags(tenantId: string) {
    const now = new Date();

    // Mark expired documents
    await prisma.employeeDocument.updateMany({
      where: {
        tenantId,
        expiryDate: { lt: now },
        isExpired: false,
      },
      data: { isExpired: true },
    });

    // Un-mark documents that are no longer expired (if expiry date was updated)
    await prisma.employeeDocument.updateMany({
      where: {
        tenantId,
        expiryDate: { gte: now },
        isExpired: true,
      },
      data: { isExpired: false },
    });

    return { success: true };
  }
}
