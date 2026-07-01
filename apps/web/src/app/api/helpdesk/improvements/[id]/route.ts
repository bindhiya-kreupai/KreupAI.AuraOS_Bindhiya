import { getHandler, updateHandler } from '../../_shared';

const opts = {
  model: 'helpdeskImprovement',
  permission: 'helpdesk',
  resource: 'Improvement',
};

export const GET = getHandler(opts);
export const PUT = updateHandler(opts);
