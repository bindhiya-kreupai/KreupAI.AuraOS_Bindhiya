-- Safe migration: Add ON DELETE RESTRICT to Shift FK constraints and composite indexes
-- This migration is data-safe: it only modifies constraints and indexes, never touches data.

-- 1. Drop existing FK constraints (default is no action on delete)
-- ShiftAssignment.shiftId → Shift.id
ALTER TABLE "aura_shift_assignment" DROP CONSTRAINT IF EXISTS "ShiftAssignment_shiftId_fkey";
-- ShiftRoster.shiftId → Shift.id
ALTER TABLE "aura_shift_roster" DROP CONSTRAINT IF EXISTS "ShiftRoster_shiftId_fkey";
-- ShiftSwapRequest.requestorShiftId → Shift.id
ALTER TABLE "aura_shift_swap_request" DROP CONSTRAINT IF EXISTS "ShiftSwapRequest_requestorShiftId_fkey";
-- ShiftSwapRequest.swapWithShiftId → Shift.id
ALTER TABLE "aura_shift_swap_request" DROP CONSTRAINT IF EXISTS "ShiftSwapRequest_swapWithShiftId_fkey";

-- 2. Re-create FK constraints with ON DELETE RESTRICT ON UPDATE CASCADE
ALTER TABLE "aura_shift_assignment"
  ADD CONSTRAINT "ShiftAssignment_shiftId_fkey"
  FOREIGN KEY ("shiftId") REFERENCES "aura_shift"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "aura_shift_roster"
  ADD CONSTRAINT "ShiftRoster_shiftId_fkey"
  FOREIGN KEY ("shiftId") REFERENCES "aura_shift"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "aura_shift_swap_request"
  ADD CONSTRAINT "ShiftSwapRequest_requestorShiftId_fkey"
  FOREIGN KEY ("requestorShiftId") REFERENCES "aura_shift"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "aura_shift_swap_request"
  ADD CONSTRAINT "ShiftSwapRequest_swapWithShiftId_fkey"
  FOREIGN KEY ("swapWithShiftId") REFERENCES "aura_shift"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Add composite indexes for common query patterns
-- ShiftAssignment: filter by tenant + employee + active status (overlap detection)
CREATE INDEX IF NOT EXISTS "ShiftAssignment_tenant_employee_active_idx"
  ON "aura_shift_assignment"("tenantId", "employeeId", "isActive");

-- ShiftSwapRequest: filter by tenant + status (pending swaps dashboard)
CREATE INDEX IF NOT EXISTS "ShiftSwapRequest_tenant_status_idx"
  ON "aura_shift_swap_request"("tenantId", "status");
