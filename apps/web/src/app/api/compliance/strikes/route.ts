/**
 * Strikes API — list + create. Tenant-scoped.
 * Backed by StrikeEntry (aura_compliance_strike).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../_shared/crud-factory';

const CreateSchema = z.object({
  strikeName: z.string().min(1),
  unionId: z.string().optional(),
  unionName: z.string().optional(),
  strikeType: z.enum(['full', 'partial', 'sit_in', 'work_to_rule', 'slowdown']).optional(),
  status: z.string().optional(),
  noticeDate: z.string().optional().nullable(),
  proposedStartDate: z.string().optional().nullable(),
  affectedDepartments: z.array(z.any()).optional(),
  affectedEmployeeCount: z.number().int().optional(),
  responseMode: z.enum(['standby', 'deployed']).optional(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'strikeEntry',
  codeField: 'strikeCode',
  codePrefix: 'STK',
  createSchema: CreateSchema,
  toCreateData: (b) => ({
    ...parseDates(b, ['noticeDate', 'proposedStartDate']),
    affectedDepartments: b.affectedDepartments ?? [],
  }),
});

export { GET, POST };
