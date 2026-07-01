import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

// GET a single document (used for preview: returns metadata incl. fileUrl).
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const documentId = params?.documentId;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required', messageAr: 'معرّف المستند مطلوب' },
        { status: 400 }
      );
    }

    const document = await prisma.employeeDocument.findFirst({
      where: { id: documentId, tenantId: user.tenantId },
      include: { documentType: { select: { id: true, name: true, code: true } } },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found', messageAr: 'المستند غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document', messageAr: 'فشل في جلب المستند' },
      { status: 500 }
    );
  }
});

// DELETE soft-deletes a document (status ARCHIVED) so it drops off the list
// while preserving the record for audit/retention.
export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const documentId = params?.documentId;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required', messageAr: 'معرّف المستند مطلوب' },
        { status: 400 }
      );
    }

    const existing = await prisma.employeeDocument.findFirst({
      where: { id: documentId, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found', messageAr: 'المستند غير موجود' },
        { status: 404 }
      );
    }

    await prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        status: 'ARCHIVED',
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', messageAr: 'فشل في حذف المستند' },
      { status: 500 }
    );
  }
});
