/**
 * @api /api/v1/documents/[id]/star
 * @description Toggle the starred state of an employee document. Starred state
 *              is persisted in the document's `tags` field (real column on
 *              EmployeeDocument) so it survives reloads. Tenant-scoped.
 * @project AURA HCM Platform
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

const STAR_TAG = 'starred';

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('documents:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing documents:update permission',
            messageAr: 'ممنوع: صلاحية تعديل المستندات غير متوفرة',
          },
        },
        { status: 403 }
      );
    }

    const id = params?.id ?? new URL(request.url).pathname.split('/').slice(-2)[0];
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Document id is required',
            messageAr: 'معرّف المستند مطلوب',
          },
        },
        { status: 400 }
      );
    }

    const doc = await (prisma as any).employeeDocument.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });

    if (!doc) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4040', message: 'Document not found', messageAr: 'المستند غير موجود' },
        },
        { status: 404 }
      );
    }

    const tags = parseTags(doc.tags);
    const isStarred = tags.includes(STAR_TAG);
    const nextTags = isStarred ? tags.filter((t) => t !== STAR_TAG) : [...tags, STAR_TAG];

    const updated = await (prisma as any).employeeDocument.update({
      where: { id: doc.id },
      data: { tags: nextTags.join(','), updatedBy: user.userId },
    });

    return NextResponse.json({ ...updated, isStarred: !isStarred }, { status: 200 });
  } catch (error) {
    console.error('[Documents Star] PUT Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to toggle document star',
          messageAr: 'فشل في تحديث تمييز المستند',
        },
      },
      { status: 500 }
    );
  }
});
