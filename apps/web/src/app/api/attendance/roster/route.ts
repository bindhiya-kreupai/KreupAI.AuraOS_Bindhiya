import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const RosterConfigPayloadSchema = z.object({
  rosterType: z.enum(['FIXED', 'ROTATIONAL', 'FLEXIBLE']),
  weekStartsOn: z.number().int().min(0).max(6),
  shifts: z.array(
    z.object({
      shiftId: z.string(),
      daysOfWeek: z.array(z.number().int().min(0).max(6)),
      hours: z.object({ start: z.string(), end: z.string() }),
    })
  ),
  rotationPattern: z.string().optional(),
});

const RosterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: RosterConfigPayloadSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'rosterConfig',
  createSchema: RosterSchema,
  resourceLabel: 'Roster Configuration',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
