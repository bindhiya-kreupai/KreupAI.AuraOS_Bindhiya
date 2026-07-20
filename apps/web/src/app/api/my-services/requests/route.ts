import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

/**
 * ESS Request Center — backed by the HelpdeskTicket model.
 * Employees see only tickets they raised (requesterId === employeeId).
 */

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
};
const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'High',
};
const PRIORITY_MAP: Record<string, string> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
};

function toClient(row: any) {
  return {
    id: row.ticketNumber,
    ticketId: row.id,
    subject: row.subject,
    description: row.description ?? '',
    category: row.category,
    status: STATUS_LABEL[row.status] ?? 'Pending',
    priority: PRIORITY_LABEL[row.priority] ?? 'Medium',
    createdAt: row.createdAt,
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
      requesterId: employeeId,
      isDeleted: false,
    };
    const statusFilter = searchParams.get('status');
    if (statusFilter) where.status = statusFilter.toUpperCase();

    const [rows, total] = await Promise.all([
      (prisma as any).helpdeskTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).helpdeskTicket.count({ where }),
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
    console.error('[My Services Requests] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch requests',
        messageAr: 'فشل في جلب الطلبات',
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
    if (!body?.subject || !body?.category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category and subject are required',
          messageAr: 'الفئة والموضوع مطلوبان',
        },
        { status: 400 }
      );
    }

    const ticketNumber = `TIC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const created = await (prisma as any).helpdeskTicket.create({
      data: {
        tenantId: user.tenantId,
        ticketNumber,
        subject: body.subject,
        description: body.description ?? null,
        category: body.category,
        priority: PRIORITY_MAP[body.priority] ?? 'MEDIUM',
        status: 'OPEN',
        requesterId: employeeId,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: toClient(created) }, { status: 201 });
  } catch (error) {
    console.error('[My Services Requests] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create request',
        messageAr: 'فشل في إنشاء الطلب',
      },
      { status: 500 }
    );
  }
});
