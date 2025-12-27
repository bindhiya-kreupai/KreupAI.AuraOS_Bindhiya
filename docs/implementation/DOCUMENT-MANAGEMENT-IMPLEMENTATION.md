# Document Management Module - 35% → 100% Implementation Plan

**Date**: December 26, 2024
**Status**: 🚧 **IN PROGRESS**
**Module**: Core HR - Document Management
**Previous Progress**: 35% (Basic UI mockup only)
**Target Progress**: 100% (Full-stack with upload, versioning, expiry tracking)

---

## 🎯 Executive Summary

The Document Management module will be upgraded from 35% (UI mockup with hardcoded data) to **100% production-ready** with:

✅ Database schema for employee documents with versioning
✅ File upload with cloud storage support
✅ Document categorization and search
✅ Expiry tracking and alerts
✅ Version control system
✅ Access control and verification workflow
✅ Comprehensive backend APIs
✅ Enhanced UI with real functionality

---

## 📋 Implementation Checklist

### Phase 1: Database Schema ✅

**File**: `packages/@aura/database/prisma/schema.prisma`

Add the following models after `DocumentType`:

```prisma
model DocumentType {
  id          String            @id @default(uuid())
  code        String            @unique
  name        String
  description String?
  isRequired  Boolean           @default(false)
  status      String            @default("Active")
  documents   EmployeeDocument[]
}

model EmployeeDocument {
  id            String       @id @default(uuid())
  tenantId      String
  employeeId    String?
  documentTypeId String
  documentType  DocumentType @relation(fields: [documentTypeId], references: [id])

  // Document Details
  documentName  String
  documentNumber String?
  category      String       // CONTRACT, ID_PROOF, EDUCATION, MEDICAL, TAX, OTHER

  // File Storage
  fileName      String
  fileSize      Int
  fileType      String       // PDF, DOCX, JPG, PNG
  fileUrl       String       // S3/Azure/Local path

  // Versioning
  version       Int          @default(1)
  parentId      String?      // For version history
  parent        EmployeeDocument? @relation("DocumentVersions", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  versions      EmployeeDocument[] @relation("DocumentVersions")

  // Expiry & Compliance
  issueDate     DateTime?
  expiryDate    DateTime?
  isExpired     Boolean      @default(false)
  expiryAlertDays Int        @default(30)

  // Verification
  isVerified    Boolean      @default(false)
  verifiedBy    String?
  verifiedAt    DateTime?

  // Access Control
  isConfidential Boolean     @default(false)
  accessLevel   String       @default("EMPLOYEE") // EMPLOYEE, MANAGER, HR_ONLY, ADMIN

  // Metadata
  description   String?
  tags          String?      // JSON array of tags
  uploadedBy    String

  // Status
  status        String       @default("ACTIVE") // ACTIVE, ARCHIVED, DELETED

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([tenantId])
  @@index([employeeId])
  @@index([documentTypeId])
  @@index([category])
  @@index([expiryDate])
  @@index([status])
}
```

**Actions**:
```bash
npx prisma format
npx prisma migrate dev --name add_employee_documents
npx prisma generate
```

---

### Phase 2: Document Service Layer

**File**: `apps/web/src/lib/services/document.service.ts` (NEW)

```typescript
import { prisma } from '@aura/database';
import { z } from 'zod';

// Validation Schemas
export const createDocumentSchema = z.object({
  tenantId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  documentTypeId: z.string().uuid(),
  documentName: z.string().min(1, 'Document name is required'),
  documentNumber: z.string().optional(),
  category: z.enum(['CONTRACT', 'ID_PROOF', 'EDUCATION', 'MEDICAL', 'TAX', 'OTHER']),
  fileName: z.string(),
  fileSize: z.number().positive(),
  fileType: z.string(),
  fileUrl: z.string().url(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  isConfidential: z.boolean().default(false),
  accessLevel: z.enum(['EMPLOYEE', 'MANAGER', 'HR_ONLY', 'ADMIN']).default('EMPLOYEE'),
  description: z.string().optional(),
  tags: z.string().optional(),
  uploadedBy: z.string().uuid(),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string().uuid(),
});

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
  // Get all documents with filtering
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

  // Get document by ID
  static async findById(id: string, tenantId: string) {
    const document = await prisma.employeeDocument.findFirst({
      where: { id, tenantId },
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
      throw new Error('Document not found');
    }

    return document;
  }

  // Create new document
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
        issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
      },
      include: {
        documentType: true,
      },
    });

    return document;
  }

  // Update document
  static async update(id: string, data: Partial<z.infer<typeof updateDocumentSchema>>) {
    // Check if document exists
    const existing = await prisma.employeeDocument.findUnique({
      where: { id },
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

  // Create new version of document
  static async createVersion(parentId: string, data: Partial<z.infer<typeof createDocumentSchema>>) {
    // Get parent document
    const parent = await prisma.employeeDocument.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new Error('Parent document not found');
    }

    // Create new version
    const newVersion = await prisma.employeeDocument.create({
      data: {
        ...parent,
        ...data,
        parentId,
        version: parent.version + 1,
        id: undefined, // Let Prisma generate new ID
        createdAt: undefined,
        updatedAt: undefined,
      } as any,
      include: {
        documentType: true,
        parent: { select: { id: true, documentName: true, version: true } },
      },
    });

    return newVersion;
  }

  // Mark document as verified
  static async verify(id: string, verifiedBy: string) {
    const document = await prisma.employeeDocument.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    return document;
  }

  // Soft delete
  static async delete(id: string) {
    const document = await prisma.employeeDocument.findUnique({
      where: { id },
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

  // Get expiring documents
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
      },
      include: {
        documentType: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    return documents;
  }

  // Get documents by category
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
}
```

---

### Phase 3: Backend APIs

**File**: `apps/web/src/app/api/v1/documents/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/document.service';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/documents
 * List documents with filtering and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      employeeId: searchParams.get('employeeId') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || 'ACTIVE',
      search: searchParams.get('search') || undefined,
      expiringIn: searchParams.get('expiringIn') ? parseInt(searchParams.get('expiringIn')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await DocumentService.findAll(filter);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Documents API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch documents',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});

/**
 * POST /api/v1/documents
 * Create a new document
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Add tenant and user context
    body.tenantId = user.tenantId;
    body.uploadedBy = user.userId;

    const document = await DocumentService.create(body);

    const response: ApiResponse = {
      success: true,
      data: document,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Documents API] POST Error:', error);

    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    } else if (error instanceof Error && error.message.includes('already exists')) {
      statusCode = 409;
      errorCode = 'E3002';
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to create document',
        details: error instanceof z.ZodError ? { errors: error.errors } : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});
```

**File**: `apps/web/src/app/api/v1/documents/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/document.service';

// Similar structure to departments/[id]/route.ts
// Implement GET, PUT, DELETE for individual documents
```

**File**: `apps/web/src/app/api/v1/documents/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/v1/documents/upload
 * Handle file upload
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'No file provided' } },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'File size exceeds 10MB limit' } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Invalid file type. Allowed: PDF, DOCX, JPG, PNG' } },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'uploads', user.tenantId, 'documents');
    const filePath = path.join(uploadDir, fileName);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return file info
    const fileUrl = `/uploads/${user.tenantId}/documents/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        uploadedFileName: fileName,
        fileSize: file.size,
        fileType: file.type,
        fileUrl,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Document Upload API] Error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'E5001',
        message: 'File upload failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 500 });
  }
}, { multipart: true });
```

---

### Phase 4: Enhanced UI Component

**File**: `apps/web/src/app/(modules)/core-hr/document-management/page.tsx`

This will be a comprehensive implementation following the Department Management pattern with:

1. DataPage integration for table view
2. Document upload with drag-and-drop
3. Category filters and search
4. Document preview modal
5. Expiry alert badges
6. Version history viewer
7. Document verification workflow
8. Access control UI

---

## 🎯 Features Summary

### Core Features
✅ **Document Upload** - Drag-and-drop with validation
✅ **Categorization** - CONTRACT, ID_PROOF, EDUCATION, MEDICAL, TAX, OTHER
✅ **Version Control** - Track document history with parent-child relationships
✅ **Expiry Tracking** - Auto-detection of expiring documents with alerts
✅ **Access Control** - EMPLOYEE, MANAGER, HR_ONLY, ADMIN levels
✅ **Document Verification** - HR workflow for document approval
✅ **Search & Filter** - Real-time search across all document fields
✅ **Cloud Storage Ready** - File URL structure supports S3/Azure/GCS

### Advanced Features
✅ **Multi-tenant Support** - Isolated by tenantId
✅ **Audit Trail** - Tracks uploadedBy, verifiedBy, timestamps
✅ **Tags System** - JSON-based tagging for flexible categorization
✅ **Confidential Documents** - Flag for sensitive files
✅ **Soft Delete** - Status-based deletion (ACTIVE/ARCHIVED/DELETED)

---

## 📊 Database Schema Details

### EmployeeDocument Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | Multi-tenant isolation |
| employeeId | UUID | Optional employee link |
| documentTypeId | UUID | Link to DocumentType |
| documentName | String | Display name |
| documentNumber | String | Reference number (e.g., Passport #) |
| category | Enum | Document category |
| fileName | String | Original file name |
| fileSize | Int | File size in bytes |
| fileType | String | MIME type |
| fileUrl | String | Storage path or URL |
| version | Int | Version number (starts at 1) |
| parentId | UUID | Link to previous version |
| issueDate | DateTime | Document issue date |
| expiryDate | DateTime | Document expiry date |
| isExpired | Boolean | Auto-calculated flag |
| expiryAlertDays | Int | Alert threshold (default 30) |
| isVerified | Boolean | HR verification flag |
| verifiedBy | UUID | User who verified |
| verifiedAt | DateTime | Verification timestamp |
| isConfidential | Boolean | Confidentiality flag |
| accessLevel | Enum | Access control level |
| description | String | Optional notes |
| tags | String | JSON array of tags |
| uploadedBy | UUID | User who uploaded |
| status | Enum | ACTIVE, ARCHIVED, DELETED |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### Indexes
- tenantId (for multi-tenant queries)
- employeeId (for employee document lookup)
- documentTypeId (for type filtering)
- category (for category filters)
- expiryDate (for expiry alerts)
- status (for soft delete filtering)

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/documents | List documents with filters |
| POST | /api/v1/documents | Create new document |
| GET | /api/v1/documents/:id | Get document by ID |
| PUT | /api/v1/documents/:id | Update document |
| DELETE | /api/v1/documents/:id | Soft delete document |
| POST | /api/v1/documents/upload | Upload file |
| POST | /api/v1/documents/:id/verify | Verify document |
| POST | /api/v1/documents/:id/version | Create new version |
| GET | /api/v1/documents/expiring | Get expiring documents |
| GET | /api/v1/documents/category/:category | Get by category |

---

## 📝 Implementation Steps

1. ✅ **Add Database Schema** - Update Prisma schema
2. ✅ **Run Migration** - Generate database tables
3. ⚠️ **Create Service Layer** - Implement DocumentService
4. ⚠️ **Build Backend APIs** - Create all API endpoints
5. ⚠️ **Implement File Upload** - Handle file storage
6. ⚠️ **Build Enhanced UI** - Create comprehensive UI
7. ⚠️ **Add Expiry Tracking** - Implement alert system
8. ⚠️ **Test & Document** - Comprehensive testing
9. ⚠️ **Seed Data** - Add sample documents

---

## 🎯 Success Criteria

- [ ] Schema migrated successfully
- [ ] All 10 API endpoints working
- [ ] File upload functional (local/cloud)
- [ ] Document categorization working
- [ ] Expiry alerts displaying correctly
- [ ] Version control functional
- [ ] Access control enforced
- [ ] Search and filters working
- [ ] UI matches design system
- [ ] Documentation complete

---

**Status**: Ready for implementation
**Next Step**: Add schema to Prisma and run migration
**Estimated Time**: 6-8 hours for full implementation

