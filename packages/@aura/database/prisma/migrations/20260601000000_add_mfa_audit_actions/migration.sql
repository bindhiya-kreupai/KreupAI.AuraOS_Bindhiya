-- Add MFA audit actions to the AuditAction enum.
-- Required by:
--   apps/web/src/services/auth/mfa.service.ts (MFA_ENABLED, MFA_DISABLED)
--   apps/web/src/app/api/auth/mfa/verify/route.ts (MFA_ENABLED)
--   apps/web/src/app/api/auth/mfa/disable/route.ts (MFA_DISABLED)
--   services/auth-service/src/services/mfa.service.ts (MFA_VERIFIED, MFA_DISABLED)
--
-- Defensive: some databases were built via `prisma db push`, which stores enums
-- as TEXT columns instead of Postgres ENUM types. In that case the "AuditAction"
-- type simply does not exist and the ALTER TYPE calls below are NO-OPs.
-- The DO block lets us short-circuit cleanly without failing the migration.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditAction') THEN
    -- ALTER TYPE … ADD VALUE is supported inside a DO block on Postgres 12+
    -- as long as the new value isn't used in the same transaction.
    ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MFA_ENABLED';
    ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MFA_VERIFIED';
    ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MFA_DISABLED';
  END IF;
END $$;
