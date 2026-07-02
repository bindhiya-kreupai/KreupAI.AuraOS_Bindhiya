/**
 * Collective Bargaining Agreements API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../../_shared/crud-factory';

const UpdateSchema = z.object({
  agreementName: z.string().optional(),
  unionId: z.string().optional(),
  unionName: z.string().optional(),
  negotiationStartDate: z.string().optional().nullable(),
  agreementDate: z.string().optional().nullable(),
  effectiveDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  status: z.string().optional(),
  terms: z.array(z.any()).optional(),
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'cbaEntry',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) =>
    parseDates(b, ['negotiationStartDate', 'agreementDate', 'effectiveDate', 'expiryDate']),
});

export { GET, PUT, DELETE };
