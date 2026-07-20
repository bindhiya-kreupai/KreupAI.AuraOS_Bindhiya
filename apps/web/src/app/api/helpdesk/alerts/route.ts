import { createHandler, listHandler } from '../_shared';

const opts = {
  model: 'helpdeskAlert',
  permission: 'helpdesk',
  resource: 'Alert',
  orderBy: { createdAt: 'desc' as const },
  required: ['title'],
  onCreate: (body: Record<string, any>) => ({ status: body.status ?? 'active' }),
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
