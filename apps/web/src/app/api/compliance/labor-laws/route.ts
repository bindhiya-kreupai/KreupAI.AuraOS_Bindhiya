/**
 * Labor Law Compliance API — list + create.
 * Tenant-scoped. Backed by the LaborLawEntry model (aura_compliance_labor_law).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  lawName: z.string().min(1),
  lawNameAr: z.string().optional(),
  description: z.string().optional(),
  jurisdiction: z.enum(['federal', 'state', 'local', 'international']).optional(),
  category: z.string().optional(),
  effectiveDate: z.string().optional().nullable(),
  responsibleDept: z.string().optional(),
  status: z.string().optional(),
  lastAuditDate: z.string().optional().nullable(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  referenceUrl: z.string().optional(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'laborLawEntry',
  codeField: 'lawCode',
  codePrefix: 'LAW',
  createSchema: CreateSchema,
  toCreateData: (b) => parseDates(b, ['effectiveDate', 'lastAuditDate']),
});

export { GET, POST };
