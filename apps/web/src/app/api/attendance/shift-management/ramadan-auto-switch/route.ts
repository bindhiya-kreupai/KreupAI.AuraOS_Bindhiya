import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSessionOrError, type Session } from '@/lib/auth/session';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest) {
  try {
    const sessionResult = getSessionOrError(request);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session: Session = sessionResult;
    const tenantId = session.tenantId;

    let config = await prisma.ramadanAutoSwitchConfig.findUnique({
      where: { tenantId },
    });

    // Return default if not found
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
        error:
          error instanceof Error ? error.message : 'Failed to fetch Ramadan auto-switch config',
        errorAr: 'فشل في جلب إعدادات التبديل التلقائي لرمضان',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionResult = getSessionOrError(request);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session: Session = sessionResult;
    const tenantId = session.tenantId;

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
        error: error instanceof Error ? error.message : 'Failed to save Ramadan auto-switch config',
        errorAr: 'فشل في حفظ إعدادات التبديل التلقائي لرمضان',
      },
      { status: 500 }
    );
  }
}
