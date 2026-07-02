import { createHandler, listHandler } from '../_shared';

const opts = {
  model: 'helpdeskAutomation',
  permission: 'helpdesk',
  resource: 'Automation',
  orderBy: { createdAt: 'desc' as const },
  required: ['name'],
  onCreate: (body: Record<string, any>) => ({
    stepCount: Array.isArray(body.steps) ? body.steps.length : (body.stepCount ?? 0),
    status: body.status ?? 'ACTIVE',
  }),
};

export const GET = listHandler(opts);
export const POST = createHandler(opts);
