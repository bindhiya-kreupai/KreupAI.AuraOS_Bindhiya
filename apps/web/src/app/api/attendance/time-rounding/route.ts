import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const TimeRoundingConfigSchema = z.object({
  checkInRounding: z.enum(['NONE', 'NEAREST', 'UP', 'DOWN']),
  checkOutRounding: z.enum(['NONE', 'NEAREST', 'UP', 'DOWN']),
  roundingInterval: z.number().int().positive(),
  graceMinutes: z.number().int().nonnegative().optional(),
  applyToCheckIn: z.boolean().default(true),
  applyToCheckOut: z.boolean().default(true),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
});

const TimeRoundingSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  config: TimeRoundingConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'timeRoundingRule',
  createSchema: TimeRoundingSchema,
  resourceLabel: 'Time Rounding Rule',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
