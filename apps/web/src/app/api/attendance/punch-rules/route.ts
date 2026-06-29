import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const PunchRuleConfigSchema = z.object({
  punchType: z.enum(['BIOMETRIC', 'MOBILE', 'WEB', 'BADGE', 'MIXED']),
  allowedMethods: z.array(z.string()),
  requirePhoto: z.boolean().default(false),
  requireGeoLocation: z.boolean().default(false),
  maxPunchesPerDay: z.number().int().positive(),

  lateInTolerance: z.number().int().nonnegative().default(15),
  earlyOutTolerance: z.number().int().nonnegative().default(10),
  maxLogins: z.number().int().positive().default(4),
  deductLeave: z.boolean().default(true),
  autoLogoutTime: z.string().default('23:59'),
  sessionTimeout: z.number().int().positive().default(30),
  markAbsentBy: z.boolean().default(true),
  crossDayLogic: z.boolean().default(true),
  nightShiftAllowance: z.boolean().default(false),
});

const PunchRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: PunchRuleConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'punchRule',
  createSchema: PunchRuleSchema,
  resourceLabel: 'Punch Rule',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
