/**
 * Strikes API — get/update/delete by id. Tenant-scoped.
 * Supports Deploy / Standby via the responseMode field.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  strikeName: z.string().optional(),
  status: z.string().optional(),
  strikeType: z.string().optional(),
  responseMode: z.enum(['standby', 'deployed']).optional(),
  affectedEmployeeCount: z.number().int().optional(),
  actualStartDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  resolutionDate: z.string().optional().nullable(),
  resolutionTerms: z.string().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'strikeEntry',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['actualStartDate', 'endDate', 'resolutionDate']),
});

export { GET, PUT, DELETE };
