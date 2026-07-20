import { deleteHandler, getHandler, updateHandler } from '../../_shared';

const opts = {
  model: 'helpdeskEscalationMatrix',
  permission: 'helpdesk',
  resource: 'Escalation matrix',
  softDelete: true,
};

export const GET = getHandler(opts);
export const PUT = updateHandler(opts);
export const DELETE = deleteHandler(opts);
