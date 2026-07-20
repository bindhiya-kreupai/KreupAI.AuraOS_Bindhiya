import { createHandler, listHandler, refNumber } from '../_shared';

const opts = {
  model: 'helpdeskServiceRequest',
  permission: 'helpdesk',
  resource: 'Service request',
  softDelete: true,
  orderBy: { submittedAt: 'desc' as const },
  required: ['service'],
  onCreate: (body: Record<string, any>, ctx: { userId: string }) => ({
    requestNumber: refNumber('REQ'),
    requesterId: body.requesterId || ctx.userId,
    status: 'SUBMITTED',
  }),
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
