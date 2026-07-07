/**
 * Unions API — list + create. Tenant-scoped.
 * Backed by UnionEntry (aura_compliance_union).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  unionName: z.string().min(1),
  registrationNumber: z.string().optional(),
  status: z.enum(['active', 'inactive', 'dissolved', 'suspended']).optional(),
  unionType: z.enum(['local', 'national', 'international']).optional(),
  memberCount: z.number().int().optional(),
  eligibleEmployees: z.number().int().optional(),
  representativeName: z.string().optional(),
  representativeContact: z.string().optional(),
  officeAddress: z.string().optional(),
  recognitionDate: z.string().optional().nullable(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'unionEntry',
  codeField: 'unionCode',
  codePrefix: 'UNI',
  createSchema: CreateSchema,
  toCreateData: (b) => parseDates(b, ['recognitionDate']),
});

export { GET, POST };
