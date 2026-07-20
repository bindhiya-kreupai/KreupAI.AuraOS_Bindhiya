/**
 * Compliance Audits API — list + create. Tenant-scoped.
 * Backed by ComplianceAuditEntry (aura_compliance_audit_entry).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  auditName: z.string().min(1),
  auditType: z.enum(['internal', 'external', 'regulatory', 'surprise', 'follow_up']).optional(),
  scope: z.string().optional(),
  scheduledDate: z.string().optional().nullable(),
  status: z.string().optional(),
  auditors: z.array(z.any()).optional(),
  departments: z.array(z.any()).optional(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'complianceAuditEntry',
  codeField: 'auditCode',
  codePrefix: 'AUD',
  createSchema: CreateSchema,
  toCreateData: (b) => ({
    ...parseDates(b, ['scheduledDate']),
    auditors: b.auditors ?? [],
    departments: b.departments ?? [],
  }),
});

export { GET, POST };
