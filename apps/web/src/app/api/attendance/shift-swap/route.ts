import { z } from 'zod';
import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';

// NB: route name kept as `/shift-swap` for backward compatibility, but the
// underlying model is `ShiftSwapPolicy` (the policy/config). The runtime
// swap requests themselves are tracked separately as `ShiftSwapRequest`
// (out of scope for #35 — tracked in #35 follow-up).
const ShiftSwapConfigSchema = z.object({
  advanceNoticeHours: z.number().int().nonnegative(),
  requiresManagerApproval: z.boolean(),
  maxSwapsPerMonth: z.number().int().nonnegative(),
  allowedShiftTypes: z.array(z.string()).optional(),
});

const ShiftSwapSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: ShiftSwapConfigSchema,
  isActive: z.boolean().default(true),
});

const handlers = makeAttendanceConfigRoutes({
  model: 'shiftSwapPolicy',
  createSchema: ShiftSwapSchema,
  resourceLabel: 'Shift Swap Policy',
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
