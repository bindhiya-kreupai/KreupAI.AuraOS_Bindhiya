// Shared constants for the data-retention routes.
// NOTE: kept in a non-route module because Next.js App Router `route.ts`
// files may only export route handlers (GET/POST/...) and a small set of
// config fields — arbitrary named exports break `next build`.

export const DEFAULT_POLICIES: {
  category: string;
  description: string;
  retentionDays: number;
  action: string;
}[] = [
  {
    category: 'audit-logs',
    description: 'System audit and access logs',
    retentionDays: 365,
    action: 'archive',
  },
  {
    category: 'employee-records',
    description: 'Employee records after termination',
    retentionDays: 2555,
    action: 'archive',
  },
  {
    category: 'payroll-records',
    description: 'Payroll history records',
    retentionDays: 2555,
    action: 'archive',
  },
  {
    category: 'application-data',
    description: 'Rejected candidate application data',
    retentionDays: 180,
    action: 'delete',
  },
  {
    category: 'session-logs',
    description: 'User session logs',
    retentionDays: 90,
    action: 'delete',
  },
];
