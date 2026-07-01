/**
 * Arbitrations API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  caseTitle: z.string().optional(),
  status: z.string().optional(),
  arbitratorName: z.string().optional(),
  venue: z.string().optional(),
  awardSummary: z.string().optional(),
  awardInFavorOf: z.string().optional(),
  claimAmount: z.number().optional(),
  filingDate: z.string().optional().nullable(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'arbitrationCase',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['filingDate']),
});

export { GET, PUT, DELETE };
