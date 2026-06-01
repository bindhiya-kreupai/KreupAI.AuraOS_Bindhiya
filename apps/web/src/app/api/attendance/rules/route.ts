import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const RuleConfigSchema = z.record(z.unknown());

const AttendanceRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ruleType: z.enum([
    'LATE_THRESHOLD',
    'EARLY_LEAVE',
    'OVERTIME',
    'BREAK_DURATION',
    'GRACE_PERIOD',
    'OTHER',
  ]),
  config: RuleConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'attendanceRule',
  createSchema: AttendanceRuleSchema,
  resourceLabel: 'Attendance Rule',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
