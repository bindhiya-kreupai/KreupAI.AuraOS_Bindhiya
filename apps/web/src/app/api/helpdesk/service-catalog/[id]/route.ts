import { deleteHandler, getHandler, updateHandler } from '../../_shared';

const opts = {
  model: 'helpdeskCatalogItem',
  permission: 'helpdesk',
  resource: 'Catalog item',
  softDelete: true,
};

export const GET = getHandler(opts);
export const PUT = updateHandler(opts);
export const DELETE = deleteHandler(opts);
