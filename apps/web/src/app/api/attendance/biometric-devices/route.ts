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

    const devices = await prisma.biometricDevice.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: devices,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch biometric devices',
        errorAr: 'فشل في جلب أجهزة القياس الحيوي',
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

    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: 'Name and location are required', errorAr: 'الاسم والموقع مطلوبان' },
        { status: 400 }
      );
    }

    const device = await prisma.biometricDevice.create({
      data: {
        tenantId,
        name: body.name,
        brand: body.brand || 'ZKTeco',
        model: body.model || 'Unknown',
        type: body.type || 'Fingerprint',
        status: body.status || 'Online',
        location: body.location,
        building: body.building || 'Main Building',
        ipAddress: body.ipAddress || body.ip || '127.0.0.1',
        serialNumber: body.serialNumber || `SN-${Date.now()}`,
        firmwareVersion: body.firmwareVersion || '1.0.0',
        enrolledEmployees: Number(body.enrolledEmployees || body.employees || 0),
        totalCapacity: Number(body.totalCapacity || 5000),
      },
    });

    return NextResponse.json({
      success: true,
      data: device,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create biometric device',
        errorAr: 'فشل في إنشاء جهاز القياس الحيوي',
      },
      { status: 500 }
    );
  }
}
