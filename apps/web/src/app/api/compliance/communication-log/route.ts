/**
 * Compliance Communication Log API — list + create. Tenant-scoped.
 * Backed by ComplianceCommunicationLog (aura_compliance_communication_log).
 * Supports filtering by category and communicationType (Filter Logs).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  subject: z.string().min(1),
  communicationType: z
    .enum(['meeting', 'negotiation', 'grievance_discussion', 'notice', 'other'])
    .optional(),
  category: z.enum(['union', 'grievance', 'disciplinary', 'audit', 'general']).optional(),
  summary: z.string().optional(),
  fromParty: z.string().optional(),
  toParty: z.string().optional(),
  relatedEntityId: z.string().optional(),
  communicationDate: z.string().optional().nullable(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'complianceCommunicationLog',
  createSchema: CreateSchema,
  orderBy: { communicationDate: 'desc' },
  filters: (sp) => {
    const f: Record<string, any> = {};
    if (sp.get('category')) f.category = sp.get('category');
    if (sp.get('communicationType')) f.communicationType = sp.get('communicationType');
    return f;
  },
  toCreateData: (b) => parseDates(b, ['communicationDate']),
});

export { GET, POST };
