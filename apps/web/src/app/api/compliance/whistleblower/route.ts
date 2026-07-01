/**
 * Whistleblower Reports API — list + create. Tenant-scoped.
 * Backed by WhistleblowerReport (aura_compliance_whistleblower).
 * The reporter may stay anonymous; reporterIdentity controls disclosure.
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  subject: z.string().min(1),
  allegationType: z
    .enum([
      'fraud',
      'corruption',
      'misconduct',
      'safety_violation',
      'legal_violation',
      'ethical_violation',
      'other',
    ])
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  reporterIdentity: z.enum(['anonymous', 'confidential', 'disclosed']).optional(),
  reporterName: z.string().optional(),
  reporterContact: z.string().optional(),
  detailedDescription: z.string().optional(),
  locationOfIncident: z.string().optional(),
  dateOfIncident: z.string().optional().nullable(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'whistleblowerReport',
  codeField: 'reportCode',
  codePrefix: 'WB',
  createSchema: CreateSchema,
  filters: (sp) => (sp.get('reportCode') ? { reportCode: sp.get('reportCode') } : {}),
  toCreateData: (b) => parseDates(b, ['dateOfIncident']),
});

export { GET, POST };
