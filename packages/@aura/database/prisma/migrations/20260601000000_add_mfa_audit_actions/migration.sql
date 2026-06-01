-- Add MFA audit actions to the AuditAction enum.
-- Required by:
--   apps/web/src/services/auth/mfa.service.ts (MFA_ENABLED, MFA_DISABLED)
--   apps/web/src/app/api/auth/mfa/verify/route.ts (MFA_ENABLED)
--   apps/web/src/app/api/auth/mfa/disable/route.ts (MFA_DISABLED)
--   services/auth-service/src/services/mfa.service.ts (MFA_VERIFIED, MFA_DISABLED)
--
-- Postgres requires ALTER TYPE ... ADD VALUE to run outside an explicit transaction,
-- so each statement runs in its own implicit transaction.

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MFA_ENABLED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MFA_VERIFIED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MFA_DISABLED';
