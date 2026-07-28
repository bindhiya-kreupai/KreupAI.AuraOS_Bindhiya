-- Add publishedAt and publishedBy columns to aura_shift_roster
ALTER TABLE "auraos"."aura_shift_roster" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMPTZ;
ALTER TABLE "auraos"."aura_shift_roster" ADD COLUMN IF NOT EXISTS "publishedBy" TEXT;

-- Add PUBLISH_SHIFT_ROSTER to AuditAction enum if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PUBLISH_SHIFT_ROSTER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AuditAction'::name LIMIT 1)) THEN
    ALTER TYPE "auraos"."AuditAction" ADD VALUE 'PUBLISH_SHIFT_ROSTER';
  END IF;
END
$$;
