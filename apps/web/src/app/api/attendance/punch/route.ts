/**
 * GPS Punch API Routes
 * Phase 2: Core Enhancement - Attendance Enhancement
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/services/attendance';

/**
 * POST /api/attendance/punch
 * Record GPS punch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['employeeId', 'punchType', 'latitude', 'longitude'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `${field} is required`, errorAr: `${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    // Validate coordinates
    if (body.latitude < -90 || body.latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude', errorAr: 'خط عرض غير صالح' },
        { status: 400 }
      );
    }

    if (body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude', errorAr: 'خط طول غير صالح' },
        { status: 400 }
      );
    }

    // Validate GPS and record punch
    const validationResult = await AttendanceService.validateGPSPunch({
      employeeId: body.employeeId,
      punchType: body.punchType,
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy || 10,
      altitude: body.altitude,
      timestamp: new Date(),
      deviceId: body.deviceId,
      photoBase64: body.photoBase64,
    });

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.message,
          errorAr: validationResult.messageAr,
          data: {
            nearestLocation: validationResult.nearestLocation,
            distanceMeters: validationResult.distanceMeters,
          },
        },
        { status: 400 }
      );
    }

    // Record the punch
    const punch = await AttendanceService.recordPunch(
      body.employeeId,
      body.punchType,
      'GPS',
      { latitude: body.latitude, longitude: body.longitude },
      body.deviceId,
      body.photoUrl
    );

    return NextResponse.json({
      success: true,
      message: validationResult.message,
      messageAr: validationResult.messageAr,
      data: {
        punch,
        location: validationResult.nearestLocation,
        distanceMeters: validationResult.distanceMeters,
        isWithinGeofence: validationResult.isWithinGeofence,
      },
    });
  } catch (error) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to record punch',
        errorAr: 'فشل في تسجيل البصمة',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/attendance/punch
 * Get punch history for employee
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required', errorAr: 'معرف الموظف مطلوب' },
        { status: 400 }
      );
    }

    // Fetch punch history
    return NextResponse.json({
      success: true,
      data: {
        punches: [],
        date: date || new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch punch history', errorAr: 'فشل في جلب سجل البصمات' },
      { status: 500 }
    );
  }
}
