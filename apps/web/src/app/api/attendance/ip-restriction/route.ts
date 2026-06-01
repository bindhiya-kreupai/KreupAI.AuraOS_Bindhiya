import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const IpRestrictionConfigSchema = z.object({
  ipAddresses: z.array(z.string()),
  ipRanges: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
  employees: z.array(z.string()).optional(),
});

const IpRestrictionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  restrictionType: z.enum(['WHITELIST', 'BLACKLIST']),
  strictMode: z.boolean().default(false),
  config: IpRestrictionConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'ipRestriction',
  createSchema: IpRestrictionSchema,
  resourceLabel: 'IP Restriction',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
