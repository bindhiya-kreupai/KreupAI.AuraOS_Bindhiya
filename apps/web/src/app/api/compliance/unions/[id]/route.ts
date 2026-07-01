/**
 * Unions API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../_shared/crud-factory';

const UpdateSchema = z.object({
  unionName: z.string().optional(),
  registrationNumber: z.string().optional(),
  status: z.string().optional(),
  unionType: z.string().optional(),
  memberCount: z.number().int().optional(),
  eligibleEmployees: z.number().int().optional(),
  representativeName: z.string().optional(),
  representativeContact: z.string().optional(),
  officeAddress: z.string().optional(),
  recognitionDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'unionEntry',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['recognitionDate']),
});

export { GET, PUT, DELETE };
