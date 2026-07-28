-- CreateTable: ShiftTemplate for reusable shift schedule templates
-- Uses IF NOT EXISTS to prevent errors on re-run and ensure no data loss
CREATE TABLE IF NOT EXISTS "auraos"."aura_shift_template" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Briefcase',
    "accent" TEXT NOT NULL DEFAULT 'from-blue-500/15 to-blue-500/5 border-blue-500/30',
    "shiftCode" TEXT NOT NULL,
    "shiftName" TEXT NOT NULL,
    "shiftDescription" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "workHours" DOUBLE PRECISION NOT NULL,
    "graceInMinutes" INTEGER NOT NULL DEFAULT 15,
    "graceOutMinutes" INTEGER NOT NULL DEFAULT 15,
    "breakDuration" INTEGER NOT NULL DEFAULT 60,
    "overtimeAllowed" BOOLEAN NOT NULL DEFAULT true,
    "maxOvertimeHours" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_shift_template_pkey" PRIMARY KEY ("id")
);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS "ShiftTemplate_tenantId_idx" ON "auraos"."aura_shift_template"("tenantId");
CREATE INDEX IF NOT EXISTS "ShiftTemplate_tenantId_isActive_idx" ON "auraos"."aura_shift_template"("tenantId", "isActive");

-- Create unique constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ShiftTemplate_tenantId_name_key'
    AND conrelid = 'auraos.aura_shift_template'::regclass
  ) THEN
    ALTER TABLE "auraos"."aura_shift_template"
      ADD CONSTRAINT "ShiftTemplate_tenantId_name_key"
      UNIQUE ("tenantId", "name");
  END IF;
END
$$;

-- Add FK constraint to Tenant table (ON DELETE RESTRICT, ON UPDATE CASCADE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ShiftTemplate_tenantId_fkey'
    AND conrelid = 'auraos.aura_shift_template'::regclass
  ) THEN
    ALTER TABLE "auraos"."aura_shift_template"
      ADD CONSTRAINT "ShiftTemplate_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "auraos"."aura_tenant"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;
