/**
 * Record usage of a check-in template (increments usageCount). Returns the
 * updated template so the caller can proceed to start a 1:1 from it.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const existing = await (prisma as any).checkInTemplate.findFirst({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Template not found', messageAr: 'القالب غير موجود' },
        },
        { status: 404 }
      );
    }
    const updated = await (prisma as any).checkInTemplate.update({
      where: { id: params.id },
      data: { usageCount: { increment: 1 } },
    });
    return NextResponse.json({ template: updated });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to record template usage',
          messageAr: 'فشل في تسجيل استخدام القالب',
        },
      },
      { status: 500 }
    );
  }
});
