import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('attendance:read')) return forbidden('attendance:read');
    const sp = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(sp);
    const employeeId = sp.get('employeeId');
    const projectId = sp.get('projectId');
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (projectId) where.projectId = projectId;
    const model: any = (prisma as any).projectTimeEntry || (prisma as any).timeEntry;
    if (!model) {
      // Fall back to AttendanceRecord with project field
      const [rows, total] = await Promise.all([
        prisma.attendanceRecord.findMany({
          where: { ...where, project: projectId || undefined } as any,
          orderBy: { date: 'desc' },
          skip,
          take: limit,
        }),
        prisma.attendanceRecord.count({
          where: { ...where, project: projectId || undefined } as any,
        }),
      ]);
      return successList(rows, page, limit, total);
    }
    const [rows, total] = await Promise.all([
      model.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      model.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list time entries');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('attendance:write')) return forbidden('attendance:write');
    const body = await safeJson(request);
    if (!body?.projectId || !body?.hours)
      return validationError({ message: 'projectId + hours required' });
    const employeeId = body.employeeId || user.userId;
    const model: any = (prisma as any).projectTimeEntry || (prisma as any).timeEntry;
    if (!model) {
      // Persist to AttendanceRecord with project marker
      const created = await prisma.attendanceRecord.create({
        data: {
          tenantId: user.tenantId,
          employeeId,
          date: body.date ? new Date(body.date) : new Date(),
          workedHours: body.hours,
          project: body.projectId,
          notes: body.notes,
          source: 'PROJECT_TIME_ENTRY',
        } as any,
      });
      return successItem(created, { status: 201 });
    }
    const created = await model.create({ data: { tenantId: user.tenantId, employeeId, ...body } });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create time entry');
  }
});
