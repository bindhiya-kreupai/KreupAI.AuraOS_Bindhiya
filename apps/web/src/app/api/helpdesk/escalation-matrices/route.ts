import { createHandler, listHandler } from '../_shared';

const opts = {
  model: 'helpdeskEscalationMatrix',
  permission: 'helpdesk',
  resource: 'Escalation matrix',
  softDelete: true,
  orderBy: { createdAt: 'desc' as const },
  required: ['name'],
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
