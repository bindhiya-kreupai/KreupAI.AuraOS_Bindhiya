import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const POST = withEnhancedAuth<{ params?: { id?: string } }>(
  async (request: NextRequest, context) => {
    try {
      const { user, permissions, params } = context;
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const id = params?.id;
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Record ID is required', messageAr: 'معرف السجل مطلوب' },
          { status: 400 }
        );
      }

      const existing = await prisma.externalTraining.findFirst({
        where: { id, tenantId: user.tenantId },
      });
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            message: 'External training not found',
            messageAr: 'التدريب الخارجي غير موجود',
          },
          { status: 404 }
        );
      }

      const body = await request.json().catch(() => ({}));
      const decision = body.decision === 'reject' ? 'rejected' : 'approved';

      const record = await prisma.externalTraining.update({
        where: { id },
        data: {
          status: decision,
          approvedBy: user.userId,
          approvedAt: new Date(),
          updatedBy: user.userId,
        },
      });

      logger.info(`External training ${id} ${decision} by ${user.userId}`);
      return NextResponse.json({ success: true, data: record });
    } catch (error: unknown) {
      logger.error({ err: error }, 'Error approving external training');
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update external training',
          messageAr: 'فشل في تحديث التدريب الخارجي',
        },
        { status: 500 }
      );
    }
  }
);
