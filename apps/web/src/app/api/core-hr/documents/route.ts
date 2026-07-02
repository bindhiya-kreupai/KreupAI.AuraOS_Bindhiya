import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Validation schemas
const CreateDocumentSchema = z.object({
  employeeId: z.string().optional(),
  documentTypeId: z.string().min(1, 'Document type ID is required'),
  documentName: z.string().min(1, 'Document name is required'),
  documentNumber: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive('File size must be positive'),
  fileType: z.string().min(1, 'File type is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  version: z.number().int().positive().optional(),
  parentId: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  isConfidential: z.boolean().optional(),
  accessLevel: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employeeId') || undefined;
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
      isDeleted: false,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { documentName: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.employeeDocument.findMany({
        where,
        include: {
          documentType: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employeeDocument.count({ where }),
    ]);

    return NextResponse.json(
      {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const validated = CreateDocumentSchema.parse(body);

    const document = await prisma.employeeDocument.create({
      data: {
        tenantId: user.tenantId,
        employeeId: validated.employeeId,
        documentTypeId: validated.documentTypeId,
        documentName: validated.documentName,
        documentNumber: validated.documentNumber,
        category: validated.category,
        fileName: validated.fileName,
        fileSize: validated.fileSize,
        fileType: validated.fileType,
        fileUrl: validated.fileUrl,
        version: validated.version ?? 1,
        parentId: validated.parentId,
        issueDate: validated.issueDate ? new Date(validated.issueDate) : undefined,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined,
        isConfidential: validated.isConfidential ?? false,
        accessLevel: validated.accessLevel ?? 'EMPLOYEE',
        description: validated.description,
        tags: validated.tags,
        uploadedBy: user.userId,
        status: 'ACTIVE',
      },
      include: {
        documentType: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
});
