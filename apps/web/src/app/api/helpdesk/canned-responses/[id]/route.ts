import { deleteHandler, getHandler, updateHandler } from '../../_shared';

const opts = {
  model: 'helpdeskCannedResponse',
  permission: 'helpdesk',
  resource: 'Canned response',
  softDelete: true,
};

export const GET = getHandler(opts);
export const PUT = updateHandler(opts);
export const DELETE = deleteHandler(opts);
