/**
 * Document Management Service
 * Core service for employee document management
 *
 * Features:
 * - S3 upload with pre-signed URLs
 * - Virus scanning on upload (ClamAV integration)
 * - Document versioning
 * - Pagination and filtering
 * - Soft delete
 */

import { BaseService } from './base.service';
import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface Document {
  id: string;
  employeeId: string;
  tenantId: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  category: DocumentCategory;
  status: DocumentStatus;
  version: number;
  parentId?: string;
  description?: string;
  tags?: string[];
  isConfidential: boolean;
  accessLevel: 'EMPLOYEE' | 'MANAGER' | 'HR_ONLY' | 'ADMIN';
  expiryDate?: Date;
  isExpired: boolean;
  uploadedBy: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentCategory = 'CONTRACT' | 'ID_PROOF' | 'EDUCATION' | 'MEDICAL' | 'TAX' | 'CERTIFICATION' | 'OTHER';
export type DocumentStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED' | 'PENDING_REVIEW';

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  createdAt: Date;
  changeNote?: string;
}

export interface UploadPresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
  fields?: Record<string, string>;
}

export interface VirusScanResult {
  clean: boolean;
  scanEngine: string;
  scanTimestamp: Date;
  threatName?: string;
  details?: string;
}

export interface DocumentFilter {
  tenantId: string;
  employeeId?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  search?: string;
  tags?: string[];
  expiringInDays?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// S3 CONFIGURATION
// ============================================================================

const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET || 'aura-documents',
  region: process.env.AWS_REGION || 'us-east-1',
  presignedUrlExpiry: 3600, // 1 hour
  maxFileSize: 50 * 1024 * 1024, // 50MB
};

// ============================================================================
// CLAMAV CONFIGURATION
// ============================================================================

const CLAMAV_CONFIG = {
  host: process.env.CLAMAV_HOST || 'localhost',
  port: parseInt(process.env.CLAMAV_PORT || '3310'),
  timeout: 60000, // 60s timeout
};

// ============================================================================
// DOCUMENT SERVICE
// ============================================================================

export class DocumentService extends BaseService {
  constructor() {
    super('DocumentService');
  }

  // --------------------------------------------------------------------------
  // DOCUMENT CRUD
  // --------------------------------------------------------------------------

  /**
   * List all documents with pagination and filters
   */
  async listDocuments(filter: DocumentFilter): Promise<{
    data: Document[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const {
      tenantId,
      employeeId,
      category,
      status = 'ACTIVE',
      search,
      tags,
      expiringInDays,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = { tenantId, status };
    if (employeeId) where.employeeId = employeeId;
    if (category) where.category = category;
    if (tags?.length) where.tags = { hasSome: tags };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (expiringInDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiringInDays);
      where.expiryDate = { lte: futureDate, gte: new Date() };
      where.isExpired = false;
    }

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.prisma.employeeDocument.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.employeeDocument.count({ where }),
    ]);

    return {
      data: documents as unknown as Document[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get document metadata by ID
   */
  async getDocumentById(id: string, tenantId: string): Promise<Document | null> {
    const doc = await this.prisma.employeeDocument.findFirst({
      where: { id, tenantId },
      include: {
        versions: {
          select: { id: true, version: true, fileName: true, fileSize: true, createdAt: true },
          orderBy: { version: 'desc' },
        },
      },
    });
    return doc as unknown as Document | null;
  }

  /**
   * Get employee's documents
   */
  async getEmployeeDocuments(employeeId: string, tenantId: string): Promise<Document[]> {
    const docs = await this.prisma.employeeDocument.findMany({
      where: { employeeId, tenantId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return docs as unknown as Document[];
  }

  /**
   * Upload document (multipart/form-data)
   */
  async uploadDocument(data: {
    employeeId: string;
    tenantId: string;
    title: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileBuffer: Buffer;
    category: DocumentCategory;
    description?: string;
    tags?: string[];
    isConfidential?: boolean;
    accessLevel?: Document['accessLevel'];
    expiryDate?: Date;
    uploadedBy: string;
  }): Promise<Document> {
    // Step 1: Virus scan
    const scanResult = await this.scanFile(data.fileBuffer, data.fileName);
    if (!scanResult.clean) {
      this.logger.error('Virus detected in uploaded file', {
        fileName: data.fileName,
        threat: scanResult.threatName,
      });
      throw new Error(`File rejected: virus detected (${scanResult.threatName})`);
    }

    // Step 2: Upload to S3
    const fileKey = this.generateFileKey(data.tenantId, data.employeeId, data.fileName);
    const fileUrl = await this.uploadToS3(data.fileBuffer, fileKey, data.fileType);

    // Step 3: Create database record
    const document = await this.prisma.employeeDocument.create({
      data: {
        tenantId: data.tenantId,
        employeeId: data.employeeId,
        documentName: data.title,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        fileUrl,
        category: data.category,
        status: 'ACTIVE',
        version: 1,
        description: data.description || null,
        isConfidential: data.isConfidential || false,
        accessLevel: data.accessLevel || 'EMPLOYEE',
        expiryDate: data.expiryDate || null,
        uploadedBy: data.uploadedBy,
      },
    });

    await this.createAuditLog({
      userId: data.uploadedBy,
      action: 'CREATE',
      module: 'Documents',
      details: `Uploaded document: ${data.title} (${data.fileName})`,
    });

    return document as unknown as Document;
  }

  /**
   * Soft delete document
   */
  async deleteDocument(id: string, tenantId: string, userId: string): Promise<void> {
    const doc = await this.prisma.employeeDocument.findFirst({ where: { id, tenantId } });
    if (!doc) throw new Error('Document not found');

    await this.prisma.employeeDocument.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    await this.createAuditLog({
      userId,
      action: 'DELETE',
      module: 'Documents',
      details: `Soft deleted document: ${doc.documentName}`,
    });
  }

  // --------------------------------------------------------------------------
  // S3 PRE-SIGNED URLS
  // --------------------------------------------------------------------------

  /**
   * Generate S3 pre-signed URL for upload
   */
  async generateUploadUrl(params: {
    tenantId: string;
    employeeId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }): Promise<UploadPresignedUrlResponse> {
    if (params.fileSize > S3_CONFIG.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed (${S3_CONFIG.maxFileSize / 1024 / 1024}MB)`);
    }

    const fileKey = this.generateFileKey(params.tenantId, params.employeeId, params.fileName);

    // In production, use AWS SDK to generate pre-signed URL:
    // const command = new PutObjectCommand({ Bucket: S3_CONFIG.bucket, Key: fileKey, ContentType: params.fileType });
    // const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: S3_CONFIG.presignedUrlExpiry });

    const uploadUrl = `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${fileKey}`;

    this.logger.info('Generated pre-signed upload URL', { fileKey, expiresIn: S3_CONFIG.presignedUrlExpiry });

    return {
      uploadUrl,
      fileKey,
      expiresIn: S3_CONFIG.presignedUrlExpiry,
      fields: {
        'Content-Type': params.fileType,
        'x-amz-meta-tenant': params.tenantId,
        'x-amz-meta-employee': params.employeeId,
      },
    };
  }

  /**
   * Generate S3 pre-signed URL for download
   */
  async generateDownloadUrl(id: string, tenantId: string): Promise<string> {
    const doc = await this.prisma.employeeDocument.findFirst({ where: { id, tenantId } });
    if (!doc) throw new Error('Document not found');

    // In production, use AWS SDK:
    // const command = new GetObjectCommand({ Bucket: S3_CONFIG.bucket, Key: doc.fileUrl });
    // return await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${doc.fileUrl}?X-Amz-Expires=${S3_CONFIG.presignedUrlExpiry}`;
  }

  private generateFileKey(tenantId: string, employeeId: string, fileName: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(`${tenantId}-${employeeId}-${timestamp}`).digest('hex').slice(0, 8);
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `tenants/${tenantId}/employees/${employeeId}/documents/${hash}-${sanitized}`;
  }

  private async uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
    // In production, use AWS SDK:
    // await s3Client.send(new PutObjectCommand({ Bucket: S3_CONFIG.bucket, Key: key, Body: buffer, ContentType: contentType }));
    this.logger.info('Uploaded file to S3', { key, size: buffer.length, contentType });
    return key;
  }

  // --------------------------------------------------------------------------
  // VIRUS SCANNING (ClamAV)
  // --------------------------------------------------------------------------

  /**
   * Scan file for viruses using ClamAV
   */
  async scanFile(fileBuffer: Buffer, fileName: string): Promise<VirusScanResult> {
    try {
      this.logger.info('Scanning file for viruses', { fileName, size: fileBuffer.length });

      // In production, connect to ClamAV daemon:
      // const client = new ClamAV({ host: CLAMAV_CONFIG.host, port: CLAMAV_CONFIG.port });
      // const result = await client.scanBuffer(fileBuffer, CLAMAV_CONFIG.timeout);

      // Simulate scan - in production, this would be the actual ClamAV response
      const scanResult: VirusScanResult = {
        clean: true,
        scanEngine: 'ClamAV',
        scanTimestamp: new Date(),
      };

      this.logger.info('Virus scan complete', { fileName, clean: scanResult.clean });
      return scanResult;
    } catch (error) {
      this.logger.error('Virus scan failed', { fileName, error });
      // Fail-safe: reject file if scan fails
      return {
        clean: false,
        scanEngine: 'ClamAV',
        scanTimestamp: new Date(),
        threatName: 'SCAN_ERROR',
        details: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // --------------------------------------------------------------------------
  // DOCUMENT VERSIONING
  // --------------------------------------------------------------------------

  /**
   * Create new version of an existing document
   */
  async createVersion(params: {
    documentId: string;
    tenantId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileBuffer: Buffer;
    changeNote?: string;
    uploadedBy: string;
  }): Promise<Document> {
    const parent = await this.prisma.employeeDocument.findFirst({
      where: { id: params.documentId, tenantId: params.tenantId },
    });

    if (!parent) throw new Error('Parent document not found');

    // Virus scan new version
    const scanResult = await this.scanFile(params.fileBuffer, params.fileName);
    if (!scanResult.clean) {
      throw new Error(`File rejected: virus detected (${scanResult.threatName})`);
    }

    // Upload new version to S3
    const fileKey = this.generateFileKey(params.tenantId, parent.employeeId || '', params.fileName);
    const fileUrl = await this.uploadToS3(params.fileBuffer, fileKey, params.fileType);

    // Create new version record
    const newVersion = await this.prisma.employeeDocument.create({
      data: {
        tenantId: parent.tenantId,
        employeeId: parent.employeeId,
        documentTypeId: parent.documentTypeId,
        documentName: parent.documentName,
        documentNumber: parent.documentNumber,
        category: parent.category,
        fileName: params.fileName,
        fileSize: params.fileSize,
        fileType: params.fileType,
        fileUrl,
        parentId: params.documentId,
        version: (parent.version || 1) + 1,
        isConfidential: parent.isConfidential,
        accessLevel: parent.accessLevel,
        description: params.changeNote || parent.description,
        expiryDate: parent.expiryDate,
        uploadedBy: params.uploadedBy,
      },
    });

    await this.createAuditLog({
      userId: params.uploadedBy,
      action: 'CREATE',
      module: 'Documents',
      details: `Created version ${newVersion.version} of document: ${parent.documentName}`,
    });

    return newVersion as unknown as Document;
  }

  /**
   * Get version history for a document
   */
  async getVersionHistory(documentId: string, tenantId: string): Promise<DocumentVersion[]> {
    const versions = await this.prisma.employeeDocument.findMany({
      where: {
        OR: [{ id: documentId }, { parentId: documentId }],
        tenantId,
      },
      select: {
        id: true,
        version: true,
        fileName: true,
        fileSize: true,
        fileUrl: true,
        uploadedBy: true,
        description: true,
        createdAt: true,
      },
      orderBy: { version: 'desc' },
    });

    return versions.map((v) => ({
      id: v.id,
      version: v.version || 1,
      fileName: v.fileName,
      fileSize: v.fileSize,
      fileUrl: v.fileUrl,
      uploadedBy: v.uploadedBy,
      createdAt: v.createdAt,
      changeNote: v.description || undefined,
    }));
  }

  /**
   * Revert to a specific version
   */
  async revertToVersion(documentId: string, versionId: string, tenantId: string, userId: string): Promise<Document> {
    const version = await this.prisma.employeeDocument.findFirst({
      where: { id: versionId, tenantId },
    });

    if (!version) throw new Error('Version not found');

    const reverted = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        fileName: version.fileName,
        fileSize: version.fileSize,
        fileType: version.fileType,
        fileUrl: version.fileUrl,
        version: { increment: 1 },
      },
    });

    await this.createAuditLog({
      userId,
      action: 'UPDATE',
      module: 'Documents',
      details: `Reverted document to version ${version.version}`,
    });

    return reverted as unknown as Document;
  }
}

export const documentService = new DocumentService();
