/**
 * POSH Committees API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../../_shared/crud-factory';

const UpdateSchema = z.object({
  committeeName: z.string().optional(),
  location: z.string().optional(),
  establishedDate: z.string().optional().nullable(),
  members: z.array(z.any()).optional(),
  nextMeetingDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'poshCommittee',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['establishedDate', 'nextMeetingDate']),
});

export { GET, PUT, DELETE };
