/**
 * @module document-pipeline
 * @description Document Pipeline Service — upload with versioning, OCR processing,
 *              watermarking, thumbnail generation, retention policies,
 *              and full-text search integration.
 * @project AuraOS Enterprise HCM Platform
 * @section 16 — Enterprise Backend Platform Services
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DocumentCategory =
  | 'employee-contract'
  | 'offer-letter'
  | 'id-proof'
  | 'payslip'
  | 'tax-document'
  | 'policy'
  | 'certificate'
  | 'medical-report'
  | 'compliance'
  | 'general';

export type DocumentStatus = 'processing' | 'active' | 'archived' | 'deleted' | 'expired';

export type RetentionAction = 'delete' | 'archive' | 'notify';

export interface DocumentMetadata {
  entityType: 'employee' | 'candidate' | 'vendor' | 'company';
  entityId: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  tags?: string[];
  confidential?: boolean;
  uploadedBy: string;
  tenantId: string;
}

export interface StoredDocument {
  id: string;
  version: number;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  checksum: string;
  metadata: DocumentMetadata;
  status: DocumentStatus;
  ocrText?: string;
  thumbnailUrl?: string;
  watermarked: boolean;
  retentionPolicy?: RetentionPolicy;
  uploadedAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface DocumentVersion {
  versionId: string;
  documentId: string;
  version: number;
  filename: string;
  sizeBytes: number;
  checksum: string;
  storageKey: string;
  uploadedBy: string;
  uploadedAt: string;
  changeNote?: string;
}

export interface RetentionPolicy {
  policyId: string;
  retentionYears: number;
  archiveAfterYears?: number;
  deleteAfterYears?: number;
  legalHold: boolean;
  action: RetentionAction;
  appliedAt: string;
  expiresAt: string;
}

export interface ProcessOperation {
  type: 'ocr' | 'watermark' | 'thumbnail' | 'compress' | 'encrypt';
  params?: Record<string, unknown>;
}

export interface ProcessResult {
  documentId: string;
  operations: Array<{
    type: ProcessOperation['type'];
    success: boolean;
    outputKey?: string;
    error?: string;
    durationMs: number;
  }>;
  processedAt: string;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  category: DocumentCategory;
  entityType: string;
  entityId: string;
  score: number;
  highlights: string[];
  uploadedAt: string;
  version: number;
}

// ============================================================================
// IN-MEMORY DOCUMENT STORE (replace with S3 + PostgreSQL in production)
// ============================================================================

const documentStore = new Map<string, StoredDocument>();
const versionStore = new Map<string, DocumentVersion[]>();

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function computeChecksum(buffer: Buffer): string {
  // In production: use crypto.createHash('sha256').update(buffer).digest('hex')
  let hash = 0;
  for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
    hash = ((hash << 5) - hash + buffer[i]) | 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

function detectMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    txt: 'text/plain',
    csv: 'text/csv',
  };
  return mimeMap[ext ?? ''] ?? 'application/octet-stream';
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * uploadDocument — store a document with automatic versioning.
 * If a document with the same entity+filename already exists, creates a new version.
 */
export async function uploadDocument(
  file: { buffer: Buffer; originalname: string },
  metadata: DocumentMetadata
): Promise<StoredDocument> {
  const id = generateId('doc');
  const checksum = computeChecksum(file.buffer);
  const mimeType = detectMimeType(file.originalname);
  const storageKey = `${metadata.tenantId}/${metadata.entityType}/${metadata.entityId}/${id}/${file.originalname}`;

  // Check for existing document to version
  const existing = Array.from(documentStore.values()).find(
    (d) =>
      d.metadata.entityId === metadata.entityId &&
      d.metadata.category === metadata.category &&
      d.originalFilename === file.originalname &&
      d.status === 'active'
  );

  const version = existing ? existing.version + 1 : 1;

  if (existing) {
    // Archive the previous version
    existing.status = 'archived';
  }

  const doc: StoredDocument = {
    id,
    version,
    filename: `v${version}_${file.originalname}`,
    originalFilename: file.originalname,
    mimeType,
    sizeBytes: file.buffer.length,
    storageKey,
    checksum,
    metadata,
    status: 'processing',
    watermarked: false,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  documentStore.set(id, doc);

  // Record version history
  const versions = versionStore.get(metadata.entityId + '_' + file.originalname) ?? [];
  versions.push({
    versionId: generateId('ver'),
    documentId: id,
    version,
    filename: file.originalname,
    sizeBytes: file.buffer.length,
    checksum,
    storageKey,
    uploadedBy: metadata.uploadedBy,
    uploadedAt: doc.uploadedAt,
  });
  versionStore.set(metadata.entityId + '_' + file.originalname, versions);

  // Simulate async post-processing (thumbnail, basic OCR)
  setTimeout(() => {
    const d = documentStore.get(id);
    if (d) {
      d.status = 'active';
      d.thumbnailUrl = `/api/v1/documents/${id}/thumbnail`;
      d.updatedAt = new Date().toISOString();
    }
  }, 100);

  return { ...doc };
}

/**
 * getDocument — retrieve a document with an access check.
 */
export async function getDocument(
  id: string,
  requestingUserId: string,
  tenantId: string
): Promise<StoredDocument> {
  const doc = documentStore.get(id);

  if (!doc) {
    throw new Error(`Document not found: ${id}`);
  }

  if (doc.metadata.tenantId !== tenantId) {
    throw new Error(`Access denied: document belongs to a different tenant`);
  }

  if (doc.status === 'deleted') {
    throw new Error(`Document has been deleted: ${id}`);
  }

  // In production: check requestingUserId against document ACL
  void requestingUserId;

  return { ...doc };
}

/**
 * processDocument — run one or more processing operations on a document.
 */
export async function processDocument(
  id: string,
  operations: ProcessOperation[]
): Promise<ProcessResult> {
  const doc = documentStore.get(id);
  if (!doc) throw new Error(`Document not found: ${id}`);

  const results: ProcessResult['operations'] = [];

  for (const op of operations) {
    const start = Date.now();
    try {
      switch (op.type) {
        case 'ocr':
          // In production: call AWS Textract / Google Vision
          doc.ocrText = `[OCR extracted text from ${doc.originalFilename} - ${doc.sizeBytes} bytes]`;
          break;

        case 'watermark':
          doc.watermarked = true;
          break;

        case 'thumbnail':
          doc.thumbnailUrl = `/api/v1/documents/${id}/thumbnail`;
          break;

        case 'compress':
          // Simulate ~20% compression
          // In production: use sharp for images, ghostscript for PDF
          break;

        case 'encrypt':
          // In production: encrypt storage key with KMS
          break;
      }

      doc.updatedAt = new Date().toISOString();
      results.push({ type: op.type, success: true, durationMs: Date.now() - start });
    } catch (err: any) {
      results.push({
        type: op.type,
        success: false,
        error: String(err),
        durationMs: Date.now() - start,
      });
    }
  }

  return {
    documentId: id,
    operations: results,
    processedAt: new Date().toISOString(),
  };
}

/**
 * addWatermark — overlay a text watermark on a document.
 */
export async function addWatermark(
  documentId: string,
  text: string,
  options: { opacity?: number; angle?: number; color?: string } = {}
): Promise<{ documentId: string; watermarkText: string; applied: boolean }> {
  const doc = documentStore.get(documentId);
  if (!doc) throw new Error(`Document not found: ${documentId}`);

  const { opacity = 0.3, angle = 45, color = '#cccccc' } = options;

  // In production: use pdf-lib for PDFs, sharp for images
  doc.watermarked = true;
  doc.updatedAt = new Date().toISOString();

  void opacity;
  void angle;
  void color;

  return { documentId, watermarkText: text, applied: true };
}

/**
 * setRetentionPolicy — assign a retention policy to a document.
 */
export async function setRetentionPolicy(
  documentId: string,
  policy: {
    retentionYears: number;
    archiveAfterYears?: number;
    deleteAfterYears?: number;
    legalHold?: boolean;
    action: RetentionAction;
  }
): Promise<RetentionPolicy> {
  const doc = documentStore.get(documentId);
  if (!doc) throw new Error(`Document not found: ${documentId}`);

  const appliedAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + policy.retentionYears * 365 * 24 * 60 * 60 * 1000
  ).toISOString();

  const retentionPolicy: RetentionPolicy = {
    policyId: generateId('pol'),
    retentionYears: policy.retentionYears,
    archiveAfterYears: policy.archiveAfterYears,
    deleteAfterYears: policy.deleteAfterYears,
    legalHold: policy.legalHold ?? false,
    action: policy.action,
    appliedAt,
    expiresAt,
  };

  doc.retentionPolicy = retentionPolicy;
  doc.expiresAt = expiresAt;
  doc.updatedAt = new Date().toISOString();

  return { ...retentionPolicy };
}

/**
 * getDocumentVersions — retrieve the version history of a document.
 */
export async function getDocumentVersions(id: string): Promise<DocumentVersion[]> {
  const doc = documentStore.get(id);
  if (!doc) throw new Error(`Document not found: ${id}`);

  const key = doc.metadata.entityId + '_' + doc.originalFilename;
  return [...(versionStore.get(key) ?? [])].sort((a, b) => b.version - a.version);
}

/**
 * searchDocuments — full-text search across document metadata and OCR content.
 */
export async function searchDocuments(
  query: string,
  filters?: {
    category?: DocumentCategory;
    entityId?: string;
    entityType?: string;
    tenantId?: string;
    uploadedBy?: string;
  }
): Promise<DocumentSearchResult[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: DocumentSearchResult[] = [];

  for (const doc of documentStore.values()) {
    if (doc.status === 'deleted') continue;
    if (filters?.category && doc.metadata.category !== filters.category) continue;
    if (filters?.entityId && doc.metadata.entityId !== filters.entityId) continue;
    if (filters?.entityType && doc.metadata.entityType !== filters.entityType) continue;
    if (filters?.tenantId && doc.metadata.tenantId !== filters.tenantId) continue;
    if (filters?.uploadedBy && doc.metadata.uploadedBy !== filters.uploadedBy) continue;

    const searchableText = [
      doc.metadata.title,
      doc.metadata.description ?? '',
      doc.originalFilename,
      doc.metadata.category,
      doc.ocrText ?? '',
      ...(doc.metadata.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    const highlights: string[] = [];

    terms.forEach((term) => {
      if (searchableText.includes(term)) {
        score += 1;
        const idx = searchableText.indexOf(term);
        const start = Math.max(0, idx - 30);
        const end = Math.min(searchableText.length, idx + term.length + 30);
        highlights.push(`...${searchableText.slice(start, end)}...`);
      }
    });

    if (score > 0) {
      results.push({
        id: doc.id,
        title: doc.metadata.title,
        category: doc.metadata.category,
        entityType: doc.metadata.entityType,
        entityId: doc.metadata.entityId,
        score,
        highlights,
        uploadedAt: doc.uploadedAt,
        version: doc.version,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
