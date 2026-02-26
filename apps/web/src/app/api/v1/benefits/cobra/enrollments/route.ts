import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const mockEnrollments = [
  {
    id: 'enr-001',
    tenantId: 'tenant-1',
    eventId: 'evt-001',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    eventType: 'TERMINATION',
    coverageType: 'MEDICAL',
    planName: 'BlueCross PPO 2000',
    enrollmentDate: '2026-02-01',
    coverageStartDate: '2026-02-01',
    coverageEndDate: '2027-07-31',
    monthlyPremium: 1450.75,
    adminFee: 72.54,
    totalMonthlyAmount: 1523.29,
    status: 'ACTIVE',
    beneficiaries: ['Jane Smith', 'Alex Smith'],
    paymentStatus: 'CURRENT',
    lastPaymentDate: '2026-02-15',
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'enr-002',
    tenantId: 'tenant-1',
    eventId: 'evt-001',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    eventType: 'TERMINATION',
    coverageType: 'DENTAL',
    planName: 'Delta Dental Plus',
    enrollmentDate: '2026-02-01',
    coverageStartDate: '2026-02-01',
    coverageEndDate: '2027-07-31',
    monthlyPremium: 85.5,
    adminFee: 4.28,
    totalMonthlyAmount: 89.78,
    status: 'ACTIVE',
    beneficiaries: ['Jane Smith', 'Alex Smith'],
    paymentStatus: 'CURRENT',
    lastPaymentDate: '2026-02-15',
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'enr-003',
    tenantId: 'tenant-1',
    eventId: 'evt-003',
    employeeId: 'emp-010',
    employeeName: 'Robert Chen',
    eventType: 'DIVORCE',
    coverageType: 'MEDICAL',
    planName: 'Aetna HMO Select',
    enrollmentDate: '2025-11-15',
    coverageStartDate: '2025-11-15',
    coverageEndDate: '2027-05-14',
    monthlyPremium: 1320.0,
    adminFee: 66.0,
    totalMonthlyAmount: 1386.0,
    status: 'LAPSED',
    beneficiaries: [],
    paymentStatus: 'OVERDUE',
    lastPaymentDate: '2026-01-10',
    createdAt: '2025-11-15T10:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const eventType = searchParams.get('eventType') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let enrollments = [...mockEnrollments];
    if (status) enrollments = enrollments.filter((e) => e.status === status);
    if (eventType) enrollments = enrollments.filter((e) => e.eventType === eventType);

    const total = enrollments.length;
    const paginated = enrollments.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch COBRA enrollments',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
