/**
 * Whistleblower Reports API — get/update by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  status: z.string().optional(),
  severity: z.string().optional(),
  assignedInvestigator: z.string().optional(),
  findings: z.string().optional(),
  retaliationReported: z.boolean().optional(),
  detailedDescription: z.string().optional(),
  dateOfIncident: z.string().optional().nullable(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'whistleblowerReport',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['dateOfIncident']),
});

export { GET, PUT, DELETE };
