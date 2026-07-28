import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('attendance:read') && !permissions.includes('attendance:manage')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing attendance:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;

    let config = await prisma.ramadanAutoSwitchConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = {
        id: '',
        tenantId,
        enabled: true,
        mapping: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5000',
          message: 'Failed to fetch Ramadan auto-switch config',
          messageAr: 'فشل في جلب إعدادات التبديل التلقائي لرمضان',
        },
      },
      { status: 500 }
    );
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (
        !permissions.includes('attendance:update') &&
        !permissions.includes('attendance:manage')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing attendance:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      const tenantId = user.tenantId;
      const body = await request.json();
      const enabled = body.enabled !== undefined ? Boolean(body.enabled) : true;
      const mapping = body.mapping !== undefined ? body.mapping : {};

      const config = await prisma.ramadanAutoSwitchConfig.upsert({
        where: { tenantId },
        update: {
          enabled,
          mapping,
        },
        create: {
          tenantId,
          enabled,
          mapping,
        },
      });

      return NextResponse.json({
        success: true,
        data: config,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5000',
            message: 'Failed to save Ramadan auto-switch config',
            messageAr: 'فشل في حفظ إعدادات التبديل التلقائي لرمضان',
          },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'ramadanAutoSwitch',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
