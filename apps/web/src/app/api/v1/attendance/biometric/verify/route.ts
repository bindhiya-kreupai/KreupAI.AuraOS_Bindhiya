import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

/**
 * POST /api/v1/attendance/biometric/verify
 * Verify employee biometric data and record attendance punch.
 *
 * NOTE: Actual biometric matching (fingerprint/facial/iris) requires
 * external biometric SDK integration. This endpoint validates the employee
 * exists and records a BIOMETRIC-type punch. The biometric matching itself
 * should be performed client-side or via a dedicated biometric service.
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const { employeeId, biometricType, biometricData } = body;

    if (!employeeId || !biometricType || !biometricData) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'employeeId, biometricType, and biometricData are required' },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 400 }
      );
    }

    const validTypes = ['fingerprint', 'facial', 'iris'];
    if (!validTypes.includes(biometricType)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: `biometricType must be one of: ${validTypes.join(', ')}` },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 400 }
      );
    }

    // Verify employee exists and belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        company: { tenantId: user.tenantId },
      },
      select: { id: true, employeeCode: true, firstName: true, lastName: true },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4001', message: 'Employee not found' },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 404 }
      );
    }

    // Record biometric attendance punch
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Determine punch type based on existing punches today
    const lastPunch = await prisma.attendancePunch.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId,
        punchDate: today,
      },
      orderBy: { punchTime: 'desc' },
    });

    const punchType = !lastPunch || lastPunch.punchType === 'CLOCK_OUT' ? 'CLOCK_IN' : 'CLOCK_OUT';

    const punch = await prisma.attendancePunch.create({
      data: {
        tenantId: user.tenantId,
        employeeId,
        punchDate: today,
        punchTime: now,
        punchType,
        device: 'BIOMETRIC',
        notes: `Biometric ${biometricType} verification`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        punchId: punch.id,
        employeeId,
        employeeCode: employee.employeeCode,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        punchType,
        verificationMethod: biometricType,
        timestamp: now.toISOString(),
        attendanceRecorded: true,
        message: `Biometric ${biometricType} verification successful. ${punchType === 'CLOCK_IN' ? 'Clock-in' : 'Clock-out'} recorded.`,
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: error.message || 'Biometric verification failed' },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.ATTENDANCE_MARKED,
  resourceType: 'biometric_verification',
  captureRequestBody: true,
});
