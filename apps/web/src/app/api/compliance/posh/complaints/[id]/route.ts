/**
 * POSH Complaints API — get/update/delete by id. Tenant-scoped.
 */
import { z } from 'zod';
import { makeItemRoutes, parseDates } from '../../../_shared/crud-factory';

const UpdateSchema = z.object({
  respondentName: z.string().optional(),
  respondentDept: z.string().optional(),
  incidentDate: z.string().optional().nullable(),
  incidentLocation: z.string().optional(),
  incidentDescription: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.string().optional(),
  committeeId: z.string().optional(),
  committeeName: z.string().optional(),
  findings: z.string().optional(),
  resolutionDate: z.string().optional().nullable(),
  resolutionDetails: z.string().optional(),
});

const { GET, PUT, DELETE } = makeItemRoutes({
  delegate: 'poshComplaint',
  createSchema: UpdateSchema,
  updateSchema: UpdateSchema,
  toUpdateData: (b) => parseDates(b, ['incidentDate', 'resolutionDate']),
});

export { GET, PUT, DELETE };
