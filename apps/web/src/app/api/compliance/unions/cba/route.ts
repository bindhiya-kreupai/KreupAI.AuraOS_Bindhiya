/**
 * Collective Bargaining Agreements API — list + create. Tenant-scoped.
 * Backed by CbaEntry (aura_compliance_cba).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../../_shared/crud-factory';

const CreateSchema = z.object({
  agreementName: z.string().min(1),
  unionId: z.string().optional(),
  unionName: z.string().optional(),
  negotiationStartDate: z.string().optional().nullable(),
  agreementDate: z.string().optional().nullable(),
  effectiveDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  status: z.enum(['draft', 'negotiation', 'active', 'expired', 'terminated']).optional(),
  terms: z.array(z.any()).optional(),
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'cbaEntry',
  codeField: 'agreementCode',
  codePrefix: 'CBA',
  createSchema: CreateSchema,
  toCreateData: (b) => ({
    ...parseDates(b, ['negotiationStartDate', 'agreementDate', 'effectiveDate', 'expiryDate']),
    terms: b.terms ?? [],
  }),
});

export { GET, POST };
