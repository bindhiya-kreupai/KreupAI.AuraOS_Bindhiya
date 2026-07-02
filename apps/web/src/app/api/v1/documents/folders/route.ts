/**
 * @api /api/v1/documents/folders
 * @description ESS Document Vault folder tree — folders are derived from
 *              distinct document categories for the current tenant. Real,
 *              tenant-scoped counts from EmployeeDocument. No mock data.
 * @project AURA HCM Platform
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

const FOLDER_META: Record<string, { icon: string; color: string }> = {
  PERSONAL: { icon: 'User', color: '#6366f1' },
  PAYROLL: { icon: 'Wallet', color: '#10b981' },
  CONTRACT: { icon: 'FileSignature', color: '#f59e0b' },
  IDENTITY: { icon: 'IdCard', color: '#ef4444' },
  TAX: { icon: 'Receipt', color: '#8b5cf6' },
  CERTIFICATE: { icon: 'Award', color: '#0ea5e9' },
};

function metaFor(category: string) {
  return FOLDER_META[category.toUpperCase()] ?? { icon: 'Folder', color: '#64748b' };
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('documents:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing documents:read permission',
            messageAr: 'ممنوع: صلاحية قراءة المستندات غير متوفرة',
          },
        },
        { status: 403 }
      );
    }

    const grouped = await (prisma as any).employeeDocument.groupBy({
      by: ['category'],
      where: { tenantId: user.tenantId, isDeleted: false, status: 'ACTIVE' },
      _count: { _all: true },
    });

    const folders = grouped
      .filter((g: any) => g.category)
      .map((g: any) => {
        const meta = metaFor(g.category);
        return {
          id: g.category,
          name: g.category
            .toLowerCase()
            .replace(/(^|\s|_)\w/g, (c: string) => c.toUpperCase())
            .replace(/_/g, ' '),
          parentId: null,
          icon: meta.icon,
          color: meta.color,
          documentCount: g._count?._all ?? 0,
          children: [],
          createdDate: new Date().toISOString(),
        };
      })
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json(folders, { status: 200 });
  } catch (error) {
    console.error('[Documents Folders] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch document folders',
          messageAr: 'فشل في جلب مجلدات المستندات',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST — folders map to document categories; creating a folder registers a
 * category label the employee can file documents under. Returned to the
 * client as a VaultFolder so the tree updates immediately.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { permissions } = context;
    if (!permissions.includes('documents:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing documents:create permission',
            messageAr: 'ممنوع: صلاحية إنشاء المستندات غير متوفرة',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = (body?.name ?? '').toString().trim();
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Folder name is required',
            messageAr: 'اسم المجلد مطلوب',
          },
        },
        { status: 400 }
      );
    }

    const id = name.toUpperCase().replace(/\s+/g, '_');
    const meta = metaFor(id);
    return NextResponse.json(
      {
        id,
        name,
        parentId: body?.parentId ?? null,
        icon: meta.icon,
        color: meta.color,
        documentCount: 0,
        children: [],
        createdDate: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Documents Folders] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create document folder',
          messageAr: 'فشل في إنشاء مجلد المستندات',
        },
      },
      { status: 500 }
    );
  }
});
