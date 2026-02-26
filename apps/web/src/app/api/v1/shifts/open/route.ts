import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const mockOpenShifts = [
  {
    id: 'open-001',
    tenantId: 'tenant-1',
    departmentId: 'dept-operations',
    departmentName: 'Operations',
    date: '2026-03-05',
    startTime: '14:00',
    endTime: '22:00',
    hours: 8,
    shiftType: 'AFTERNOON',
    role: 'Operations Specialist',
    requiredSkills: ['Forklift Certification', 'Hazmat Level 1'],
    payRate: 28.5,
    differentialPay: 1.5,
    totalHourlyRate: 30.0,
    postedAt: '2026-02-25T09:00:00.000Z',
    claimedBy: null,
    status: 'OPEN',
    claimDeadline: '2026-03-04T22:00:00.000Z',
    notes: 'Coverage needed for scheduled absence',
  },
  {
    id: 'open-002',
    tenantId: 'tenant-1',
    departmentId: 'dept-customer-service',
    departmentName: 'Customer Service',
    date: '2026-03-06',
    startTime: '08:00',
    endTime: '16:00',
    hours: 8,
    shiftType: 'MORNING',
    role: 'Customer Service Representative',
    requiredSkills: ['CRM Software', 'Bilingual (English/Spanish)'],
    payRate: 22.0,
    differentialPay: 0,
    totalHourlyRate: 22.0,
    postedAt: '2026-02-25T10:30:00.000Z',
    claimedBy: null,
    status: 'OPEN',
    claimDeadline: '2026-03-05T20:00:00.000Z',
    notes: null,
  },
  {
    id: 'open-003',
    tenantId: 'tenant-1',
    departmentId: 'dept-warehouse',
    departmentName: 'Warehouse',
    date: '2026-03-04',
    startTime: '22:00',
    endTime: '06:00',
    hours: 8,
    shiftType: 'NIGHT',
    role: 'Warehouse Associate',
    requiredSkills: ['Inventory Management'],
    payRate: 20.0,
    differentialPay: 3.0,
    totalHourlyRate: 23.0,
    postedAt: '2026-02-24T08:00:00.000Z',
    claimedBy: 'emp-015',
    status: 'CLAIMED',
    claimDeadline: '2026-03-03T22:00:00.000Z',
    notes: 'Night differential applies',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const status = searchParams.get('status') || 'OPEN';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let shifts = [...mockOpenShifts];
    if (departmentId) shifts = shifts.filter((s) => s.departmentId === departmentId);
    if (startDate) shifts = shifts.filter((s) => s.date >= startDate);
    if (endDate) shifts = shifts.filter((s) => s.date <= endDate);
    if (status !== 'ALL') shifts = shifts.filter((s) => s.status === status);

    const total = shifts.length;
    const paginated = shifts.slice((page - 1) * limit, page * limit);

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
        message: 'Failed to list open shifts',
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
