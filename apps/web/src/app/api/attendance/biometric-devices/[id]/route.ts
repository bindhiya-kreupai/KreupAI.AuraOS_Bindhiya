import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSessionOrError, type Session } from '@/lib/auth/session';
import { prisma } from '@aura/database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionResult = getSessionOrError(request);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session: Session = sessionResult;
    const tenantId = session.tenantId;
    const { id } = params;

    const body = await request.json();

    // Verify ownership
    const existing = await prisma.biometricDevice.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Device not found', errorAr: 'الجهاز غير موجود' },
        { status: 404 }
      );
    }

    const updated = await prisma.biometricDevice.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        brand: body.brand !== undefined ? body.brand : undefined,
        model: body.model !== undefined ? body.model : undefined,
        type: body.type !== undefined ? body.type : undefined,
        status: body.status !== undefined ? body.status : undefined,
        location: body.location !== undefined ? body.location : undefined,
        building: body.building !== undefined ? body.building : undefined,
        ipAddress:
          body.ipAddress !== undefined
            ? body.ipAddress
            : body.ip !== undefined
              ? body.ip
              : undefined,
        serialNumber: body.serialNumber !== undefined ? body.serialNumber : undefined,
        firmwareVersion: body.firmwareVersion !== undefined ? body.firmwareVersion : undefined,
        enrolledEmployees:
          body.enrolledEmployees !== undefined
            ? Number(body.enrolledEmployees)
            : body.employees !== undefined
              ? Number(body.employees)
              : undefined,
        totalCapacity: body.totalCapacity !== undefined ? Number(body.totalCapacity) : undefined,
        pendingPunches: body.pendingPunches !== undefined ? Number(body.pendingPunches) : undefined,
        successRate: body.successRate !== undefined ? Number(body.successRate) : undefined,
        avgScanTimeMs: body.avgScanTimeMs !== undefined ? Number(body.avgScanTimeMs) : undefined,
        dailyScans: body.dailyScans !== undefined ? Number(body.dailyScans) : undefined,
        failedScans: body.failedScans !== undefined ? Number(body.failedScans) : undefined,
        peakHour: body.peakHour !== undefined ? body.peakHour : undefined,
        uptime: body.uptime !== undefined ? Number(body.uptime) : undefined,
        lastSyncAt: body.lastSyncAt !== undefined ? new Date(body.lastSyncAt) : undefined,
        lastHeartbeatAt:
          body.lastHeartbeatAt !== undefined ? new Date(body.lastHeartbeatAt) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('[PUT Device] Error updating device:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update biometric device',
        errorAr: 'فشل في تحديث جهاز القياس الحيوي',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionResult = getSessionOrError(request);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session: Session = sessionResult;
    const tenantId = session.tenantId;
    const { id } = params;

    // Verify ownership
    const existing = await prisma.biometricDevice.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!existing) {
      console.warn(`[DELETE Device] Device with ID ${id} not found for tenant ${tenantId}`);
      return NextResponse.json(
        { error: 'Device not found', errorAr: 'الجهاز غير موجود' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.biometricDevice.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully',
      messageAr: 'تم حذف الجهاز بنجاح',
    });
  } catch (error: any) {
    console.error('[DELETE Device] Error deleting device:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete biometric device',
        errorAr: 'فشل في حذف جهاز القياس الحيوي',
      },
      { status: 500 }
    );
  }
}
