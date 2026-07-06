import { createHandler, listHandler } from '../_shared';

const opts = {
  model: 'helpdeskCatalogItem',
  permission: 'helpdesk',
  resource: 'Catalog item',
  softDelete: true,
  orderBy: { title: 'asc' as const },
  required: ['title'],
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
