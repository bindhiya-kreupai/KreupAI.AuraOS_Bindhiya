import { deleteHandler, getHandler, updateHandler } from '../../_shared';

const opts = {
  model: 'helpdeskServiceRequest',
  permission: 'helpdesk',
  resource: 'Service request',
  softDelete: true,
};

export const GET = getHandler(opts);
export const PUT = updateHandler(opts);
export const DELETE = deleteHandler(opts);
