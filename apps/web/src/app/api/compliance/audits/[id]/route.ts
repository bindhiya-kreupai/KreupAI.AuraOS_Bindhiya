/**
 * Compliance Audits API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  auditName: z.string().optional(),
  auditType: z.string().optional(),
  scope: z.string().optional(),
  scheduledDate: z.string().optional().nullable(),
  actualStartDate: z.string().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  status: z.string().optional(),
  overallRating: z.string().optional(),
  complianceScore: z.number().int().optional(),
  findingsCount: z.number().int().optional(),
  criticalCount: z.number().int().optional(),
  recommendations: z.string().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'complianceAuditEntry',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['scheduledDate', 'actualStartDate', 'completionDate']),
});

export { GET, PUT, DELETE };
