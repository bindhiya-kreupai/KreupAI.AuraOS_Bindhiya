import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

const FieldForceConfigSchema = z.object({
  trackingMode: z.enum(['CONTINUOUS', 'CHECK_IN_OUT', 'PERIODIC']),
  periodicIntervalMinutes: z.number().int().positive().optional(),
  allowedRegions: z
    .array(
      z.object({
        name: z.string(),
        lat: z.number(),
        lng: z.number(),
        radius: z.number().int().positive(),
      })
    )
    .optional(),
  requirePhotoOnCheckIn: z.boolean().default(false),
  allowOfflineMode: z.boolean().default(false),
});

const FieldForceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: FieldForceConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'fieldForceConfig',
  createSchema: FieldForceSchema,
  resourceLabel: 'Field Force Config',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
