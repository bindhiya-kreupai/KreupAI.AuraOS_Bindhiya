import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

/**
 * ESS grievance channel — backed by the ErGrievanceCase model.
 * Employees see only cases they raised (complainantId === employeeId).
 */

const SEVERITY_MAP: Record<string, string> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
};
const SEVERITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

function toClient(row: any) {
  return {
    id: row.caseNumber,
    caseId: row.id,
    category: row.grievanceType,
    subject: row.subject,
    description: row.description ?? '',
    severity: SEVERITY_LABEL[row.severity] ?? 'Low',
    status: STATUS_LABEL[row.status] ?? 'Open',
    createdAt: row.raisedAt ?? row.createdAt,
    updates: [
      {
        date: new Date(row.raisedAt ?? row.createdAt).toLocaleString(),
        author: 'You',
        text: 'Grievance raised.',
      },
      ...(row.resolvedAt
        ? [
            {
              date: new Date(row.resolvedAt).toLocaleString(),
              author: 'HR',
              text: row.outcome ? `Resolved: ${row.outcome}` : 'Case resolved.',
            },
          ]
        : []),
    ],
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, employeeId } = context;
    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: 'No employee profile linked to this account',
          messageAr: 'لا يوجد ملف موظف مرتبط بهذا الحساب',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: user.tenantId,
      complainantId: employeeId,
      isDeleted: false,
    };
    const statusFilter = searchParams.get('status');
    if (statusFilter) where.status = statusFilter.toUpperCase();

    const [rows, total] = await Promise.all([
      (prisma as any).erGrievanceCase.findMany({
        where,
        orderBy: { raisedAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).erGrievanceCase.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: rows.map(toClient),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[My Services Grievances] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch grievances',
        messageAr: 'فشل في جلب الشكاوى',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, employeeId } = context;
    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: 'No employee profile linked to this account',
          messageAr: 'لا يوجد ملف موظف مرتبط بهذا الحساب',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body?.subject || !body?.description || !body?.category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category, subject and description are required',
          messageAr: 'الفئة والموضوع والوصف مطلوبة',
        },
        { status: 400 }
      );
    }

    const caseNumber = `GRV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const created = await (prisma as any).erGrievanceCase.create({
      data: {
        tenantId: user.tenantId,
        caseNumber,
        channel: 'ESS',
        grievanceType: body.category,
        severity: SEVERITY_MAP[body.severity] ?? 'LOW',
        subject: body.subject,
        description: body.description,
        complainantId: employeeId,
        status: 'OPEN',
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: toClient(created) }, { status: 201 });
  } catch (error) {
    console.error('[My Services Grievances] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit grievance',
        messageAr: 'فشل في تقديم الشكوى',
      },
      { status: 500 }
    );
  }
});
