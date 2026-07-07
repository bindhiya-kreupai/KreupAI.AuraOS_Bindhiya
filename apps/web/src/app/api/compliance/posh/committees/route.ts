/**
 * POSH Committees API — list + create. Tenant-scoped.
 * Backed by PoshCommittee (aura_compliance_posh_committee).
 */
import { z } from 'zod';
import { makeListRoutes, parseDates } from '../../_shared/crud-factory';

const MemberSchema = z.object({
  memberId: z.string().optional(),
  memberName: z.string(),
  role: z.string().optional(),
  organization: z.string().optional(),
  isActive: z.boolean().optional(),
});

const CreateSchema = z.object({
  committeeName: z.string().min(1),
  location: z.string().optional(),
  establishedDate: z.string().optional().nullable(),
  members: z.array(MemberSchema).optional(),
  nextMeetingDate: z.string().optional().nullable(),
});

const { GET, POST } = makeListRoutes({
  delegate: 'poshCommittee',
  codeField: 'committeeCode',
  codePrefix: 'ICC',
  createSchema: CreateSchema,
  toCreateData: (b) => ({
    ...parseDates(b, ['establishedDate', 'nextMeetingDate']),
    members: b.members ?? [],
  }),
});

export { GET, POST };
