/**
 * POSH Complaints API — list + create. Tenant-scoped.
 * Backed by PoshComplaint (aura_compliance_posh_complaint).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../../_shared/crud-factory';

const CreateSchema = z.object({
  respondentName: z.string().min(1),
  respondentDept: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  complainantName: z.string().optional(),
  incidentDate: z.string().optional().nullable(),
  incidentLocation: z.string().optional(),
  incidentDescription: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.string().optional(),
  committeeId: z.string().optional(),
  committeeName: z.string().optional(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'poshComplaint',
  codeField: 'complaintCode',
  codePrefix: 'POSH',
  createSchema: CreateSchema,
  toCreateData: (b) => parseDates(b, ['incidentDate']),
});

export { GET, POST };
