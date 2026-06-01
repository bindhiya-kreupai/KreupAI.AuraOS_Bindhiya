import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const CompOffConfigSchema = z.object({
  earnsCompOffOn: z.enum(['WEEKEND', 'HOLIDAY', 'BOTH']),
  minHoursForCompOff: z.number().nonnegative(),
  maxAccumulation: z.number().int().nonnegative(),
  expiryDays: z.number().int().nonnegative(),
  requiresApproval: z.boolean().default(true),
});

const CompOffSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: CompOffConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'compOffPolicy',
  createSchema: CompOffSchema,
  resourceLabel: 'Comp-Off Policy',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
