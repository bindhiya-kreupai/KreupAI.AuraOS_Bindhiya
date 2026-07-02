/**
 * Labor Law Compliance API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  lawName: z.string().optional(),
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
  isActive: z.boolean().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'laborLawEntry',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['effectiveDate', 'lastAuditDate']),
});

export { GET, PUT, DELETE };
