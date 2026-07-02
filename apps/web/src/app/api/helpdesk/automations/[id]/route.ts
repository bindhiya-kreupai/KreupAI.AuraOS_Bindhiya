import { getHandler, updateHandler } from '../../_shared';

const opts = {
  model: 'helpdeskAutomation',
  permission: 'helpdesk',
  resource: 'Automation',
};

export const GET = getHandler(opts);
export const PUT = updateHandler(opts);
