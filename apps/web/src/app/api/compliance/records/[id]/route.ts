/**
 * Compliance Records API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  requirement: z.string().optional(),
  lawId: z.string().optional(),
  lawName: z.string().optional(),
  complianceType: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  status: z.string().optional(),
  responsiblePerson: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedDate: z.string().optional().nullable(),
  findings: z.string().optional(),
  notes: z.string().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'complianceRecordEntry',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['dueDate', 'completedDate', 'verifiedDate']),
});

export { GET, PUT, DELETE };
