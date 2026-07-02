import { createHandler, listHandler } from '../_shared';

const opts = {
  model: 'helpdeskCannedResponse',
  permission: 'helpdesk',
  resource: 'Canned response',
  softDelete: true,
  orderBy: { title: 'asc' as const },
  required: ['title', 'content'],
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
