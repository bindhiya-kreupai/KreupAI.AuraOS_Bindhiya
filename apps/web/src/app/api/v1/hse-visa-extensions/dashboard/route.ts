import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { TRANSFER_PRO_ACTIONS } from '@/lib/services/hse-visa-extensions';
import { forbidden, hasAny, ok, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  return ok({
    transferProActions: TRANSFER_PRO_ACTIONS,
    workspaces: [
      {
        story: 'EPIC-24-S02',
        label: 'Safety Officer Registry',
        route: '/api/v1/hse-visa-extensions/safety-officers',
      },
      {
        story: 'EPIC-24-S04',
        label: 'Heat-Stress Rules (country × month)',
        route: '/api/v1/hse-visa-extensions/heat-stress',
      },
      {
        story: 'EPIC-24-S07',
        label: 'Toolbox-Talk Log',
        route: '/api/v1/hse-visa-extensions/toolbox-talks',
      },
      {
        story: 'EPIC-24-S11',
        label: 'Emergency Drill Tracker',
        route: '/api/v1/hse-visa-extensions/drills',
      },
      {
        story: 'EPIC-24-S12',
        label: 'First-Aid Station Register',
        route: '/api/v1/hse-visa-extensions/first-aid',
      },
      {
        story: 'EPIC-24-S14',
        label: 'Welfare Inspection (distinct from accommodation)',
        route: '/api/v1/hse-visa-extensions/welfare-inspections',
      },
      {
        story: 'EPIC-29-S04',
        label: 'TRANSFER scenario PRO chain (seeded list)',
        route: 'TRANSFER_PRO_ACTIONS export',
      },
      {
        story: 'EPIC-29-S06',
        label: 'Per-Dependent Visa Register',
        route: '/api/v1/hse-visa-extensions/visa-dependents',
      },
      {
        story: 'EPIC-29-S10',
        label: 'Benefits Closure Cascade (insurance/accommodation/EOS/loan)',
        route: '/api/v1/hse-visa-extensions/benefits-closure',
      },
      {
        story: 'EPIC-29-S12',
        label: 'Employee Comm Templates (bilingual)',
        route: '/api/v1/hse-visa-extensions/comm-templates',
      },
    ],
  });
});
