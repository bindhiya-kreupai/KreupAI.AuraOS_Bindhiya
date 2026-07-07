/**
 * Arbitrations API — list + create. Tenant-scoped.
 * Backed by ArbitrationCase (aura_compliance_arbitration).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  caseTitle: z.string().min(1),
  claimantName: z.string().min(1),
  respondentName: z.string().min(1),
  disputeType: z.string().optional(),
  claimantType: z.enum(['employee', 'union', 'company']).optional(),
  respondentType: z.enum(['employee', 'union', 'company']).optional(),
  disputeDescription: z.string().optional(),
  claimAmount: z.number().optional(),
  currency: z.string().optional(),
  arbitratorName: z.string().optional(),
  status: z.string().optional(),
  venue: z.string().optional(),
  filingDate: z.string().optional().nullable(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'arbitrationCase',
  codeField: 'arbitrationCode',
  codePrefix: 'ARB',
  createSchema: CreateSchema,
  toCreateData: (b) => parseDates(b, ['filingDate']),
});

export { GET, POST };
