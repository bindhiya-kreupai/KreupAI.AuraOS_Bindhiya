import { createHandler, listHandler, refNumber } from '../_shared';

const opts = {
  model: 'helpdeskCase',
  permission: 'helpdesk',
  resource: 'Case',
  softDelete: true,
  orderBy: { createdAt: 'desc' as const },
  required: ['title'],
  onCreate: (body: Record<string, any>, ctx: { userId: string }) => ({
    caseNumber: refNumber('CASE'),
    reporterId: body.reporterId ?? ctx.userId,
    status: body.status ?? 'OPEN',
  }),
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
