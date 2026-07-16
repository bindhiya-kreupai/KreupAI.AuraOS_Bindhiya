-- Manual Migration: Add priority column to aura_compliance_corrective_action
-- Execution target: Neon Console in Transaction Mode

BEGIN;

ALTER TABLE "aura_compliance_corrective_action" 
ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'MEDIUM';

COMMIT;
