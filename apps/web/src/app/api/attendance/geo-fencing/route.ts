import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

// Geofence has typed columns (lat/lng/radius) rather than a config blob
// because geo queries benefit from indexed scalar columns. The factory
// still works — extra typed fields are accepted via .passthrough() on the
// schema if needed in the future.
const GeofenceConfigPayloadSchema = z
  .object({
    allowedEmployees: z.array(z.string()).optional(),
    allowedDepartments: z.array(z.string()).optional(),
    allowedDesignations: z.array(z.string()).optional(),
  })
  .partial()
  .optional();

const GeofenceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fenceType: z.enum(['OFFICE', 'BRANCH', 'SITE', 'CUSTOM']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive(),
  address: z.string().optional(),
  strictMode: z.boolean().default(false),
  config: GeofenceConfigPayloadSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'geofenceConfig',
  createSchema: GeofenceSchema,
  resourceLabel: 'Geofence',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
