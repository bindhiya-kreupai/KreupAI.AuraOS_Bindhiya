import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const WFHConfigSchema = z.object({
  maxDaysPerMonth: z.number().int().nonnegative(),
  maxConsecutiveDays: z.number().int().nonnegative(),
  requiresApproval: z.boolean(),
  approverChain: z.enum(['MANAGER', 'HR', 'BOTH']),
  allowedDepartments: z.array(z.string()).optional(),
  allowedRoles: z.array(z.string()).optional(),
});

const WFHSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: WFHConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'workFromHomePolicy',
  createSchema: WFHSchema,
  resourceLabel: 'Work From Home Policy',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
