/**
 * Compliance Records API — list + create. Tenant-scoped.
 * Backed by ComplianceRecordEntry (aura_compliance_record).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  requirement: z.string().min(1),
  lawId: z.string().optional(),
  lawName: z.string().optional(),
  complianceType: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  status: z.string().optional(),
  responsiblePerson: z.string().optional(),
  findings: z.string().optional(),
  notes: z.string().optional(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'complianceRecordEntry',
  codeField: 'recordCode',
  codePrefix: 'CR',
  createSchema: CreateSchema,
  filters: (sp) => (sp.get('lawId') ? { lawId: sp.get('lawId') } : {}),
  toCreateData: (b) => parseDates(b, ['dueDate', 'completedDate']),
});

export { GET, POST };
