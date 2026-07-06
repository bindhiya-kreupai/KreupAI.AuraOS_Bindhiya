-- Performance Components Module (AURA-230..AURA-237).
-- Defensive: repo uses `prisma db push`, enums stored as TEXT. All idempotent.
-- 1) Extend existing aura_continuous_feedback with tags/status columns.
-- 2) New reaction + comment tables for feedback/recognition items.
-- 3) Reusable check-in template table.

-- ── 1) Extend continuous feedback ────────────────────────────────────────────
ALTER TABLE "aura_continuous_feedback"
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "aura_continuous_feedback"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';

-- ── 2) Reactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_continuous_feedback_reaction" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "feedbackId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_continuous_feedback_reaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CFReaction_feedback_user_type_key"
  ON "aura_continuous_feedback_reaction"("feedbackId", "userId", "type");
CREATE INDEX IF NOT EXISTS "CFReaction_tenantId_idx"
  ON "aura_continuous_feedback_reaction"("tenantId");
CREATE INDEX IF NOT EXISTS "CFReaction_feedbackId_idx"
  ON "aura_continuous_feedback_reaction"("feedbackId");

-- ── 3) Comments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_continuous_feedback_comment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "feedbackId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_continuous_feedback_comment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CFComment_tenantId_idx"
  ON "aura_continuous_feedback_comment"("tenantId");
CREATE INDEX IF NOT EXISTS "CFComment_feedbackId_idx"
  ON "aura_continuous_feedback_comment"("feedbackId");

-- ── 4) Check-in templates ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_check_in_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'one_on_one',
  "cadence" TEXT NOT NULL DEFAULT 'weekly',
  "questions" JSONB NOT NULL DEFAULT '[]',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_check_in_template_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CheckInTemplate_tenantId_idx"
  ON "aura_check_in_template"("tenantId");
CREATE INDEX IF NOT EXISTS "CheckInTemplate_tenant_category_idx"
  ON "aura_check_in_template"("tenantId", "category");
