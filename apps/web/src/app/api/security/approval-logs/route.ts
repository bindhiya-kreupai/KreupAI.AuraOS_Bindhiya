import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

// Explicit APPROVE_*/REJECT_* action set (enum-as-text safe; startsWith not usable on enum).
const APPROVE_ACTIONS = [
  'APPROVE_ATTENDANCE_REGULARIZATION',
  'APPROVE_COMP_OFF_REQUEST',
  'APPROVE_CONFIRMATION_REQUEST',
  'APPROVE_EMPLOYMENT_HISTORY_CHANGE',
  'APPROVE_EXIT_REQUEST',
  'APPROVE_EXPENSE_CLAIM',
  'APPROVE_INTER_COMPANY_TRANSFER',
  'APPROVE_LEAVE_REQUEST',
  'APPROVE_OVERTIME_REQUEST',
  'APPROVE_SHIFT_SWAP_REQUEST',
];

const REJECT_ACTIONS = [
  'REJECT_ATTENDANCE_REGULARIZATION',
  'REJECT_COMP_OFF_REQUEST',
  'REJECT_CONFIRMATION_REQUEST',
  'REJECT_EMPLOYMENT_HISTORY_CHANGE',
  'REJECT_EXIT_REQUEST',
  'REJECT_EXPENSE_CLAIM',
  'REJECT_INTER_COMPANY_TRANSFER',
  'REJECT_LEAVE_REQUEST',
  'REJECT_OVERTIME_REQUEST',
  'REJECT_SHIFT_SWAP_REQUEST',
];

const ALL_APPROVAL_ACTIONS = [...APPROVE_ACTIONS, ...REJECT_ACTIONS];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/approval-logs:read')) {
      return forbidden('security/approval-logs:read');
    }
    const tenantId = user.tenantId;
    const sp = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(sp);
    const actionFilter = sp.get('action') || undefined;
    const q = sp.get('q') || undefined;

    const actions =
      actionFilter && ALL_APPROVAL_ACTIONS.includes(actionFilter)
        ? [actionFilter]
        : ALL_APPROVAL_ACTIONS;

    const where: any = { tenantId, action: { in: actions } };
    if (q) {
      where.OR = [
        { userEmail: { contains: q, mode: 'insensitive' } },
        { module: { contains: q, mode: 'insensitive' } },
        { details: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      (prisma as any).auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).auditLog.count({ where }),
    ]);

    const [totalApprovals, totalRejections] = await Promise.all([
      (prisma as any).auditLog.count({ where: { tenantId, action: { in: APPROVE_ACTIONS } } }),
      (prisma as any).auditLog.count({ where: { tenantId, action: { in: REJECT_ACTIONS } } }),
    ]);

    return successList(rows, page, limit, total, {
      summary: {
        totalApprovals,
        totalRejections,
        totalDecisions: totalApprovals + totalRejections,
      },
    });
  } catch (error: any) {
    return serverError(error, 'list approval logs');
  }
});
