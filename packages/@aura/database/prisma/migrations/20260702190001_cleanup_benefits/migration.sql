-- Benefits Module backlog — AURA-295 (benefit notification campaigns).
-- Defensive: repo builds the deployed DB via `prisma db push` (enums stored as
-- TEXT). All statements are idempotent so this is safe to re-run.

-- ── Benefit notification campaigns ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_benefit_campaign" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'Info',
  "channel" TEXT NOT NULL DEFAULT 'Email',
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_benefit_campaign_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BenefitCampaign_tenantId_idx" ON "aura_benefit_campaign"("tenantId");
CREATE INDEX IF NOT EXISTS "BenefitCampaign_status_idx" ON "aura_benefit_campaign"("status");
