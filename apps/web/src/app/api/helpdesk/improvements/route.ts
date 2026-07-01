import { createHandler, listHandler } from '../_shared';

const opts = {
  model: 'helpdeskImprovement',
  permission: 'helpdesk',
  resource: 'Improvement',
  orderBy: { createdAt: 'desc' as const },
  required: ['title'],
  onCreate: (body: Record<string, any>) => ({ status: body.status ?? 'PLANNED' }),
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
