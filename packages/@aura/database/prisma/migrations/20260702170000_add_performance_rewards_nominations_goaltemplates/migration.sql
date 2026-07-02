-- Performance Module backlog (AURA-664, AURA-683, AURA-684, AURA-690, AURA-657/669/693).
-- Defensive: repo uses `prisma db push`, enums stored as TEXT. All statements idempotent.
-- 1) Reward catalog + redemptions + point ledger  (reward-linkage).
-- 2) 360 feedback nominations                      (360-feedback nominations tab).
-- 3) Goal templates library                        (goal-setting/library).

-- ── 1) Reward catalog ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_reward_catalog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'Perks',
  "cost" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "stock" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_reward_catalog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RewardCatalog_tenantId_idx" ON "aura_reward_catalog"("tenantId");
CREATE INDEX IF NOT EXISTS "RewardCatalog_category_idx" ON "aura_reward_catalog"("category");

-- ── 2) Reward point ledger (per employee balance is SUM(points)) ─────────────
CREATE TABLE IF NOT EXISTS "aura_reward_point_ledger" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "reason" TEXT,
  "source" TEXT NOT NULL DEFAULT 'manual',
  "referenceId" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_reward_point_ledger_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RewardPointLedger_tenant_emp_idx"
  ON "aura_reward_point_ledger"("tenantId", "employeeId");

-- ── 3) Reward redemptions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_reward_redemption" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "rewardId" TEXT NOT NULL,
  "rewardName" TEXT NOT NULL,
  "cost" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_reward_redemption_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RewardRedemption_tenant_emp_idx"
  ON "aura_reward_redemption"("tenantId", "employeeId");

-- ── 4) 360 feedback nominations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_feedback360_nomination" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "nominatorId" TEXT NOT NULL,
  "nomineeId" TEXT,
  "nomineeName" TEXT NOT NULL,
  "cycleId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_feedback360_nomination_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Feedback360Nomination_tenant_nominator_idx"
  ON "aura_feedback360_nomination"("tenantId", "nominatorId");

-- ── 5) Goal templates library ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aura_goal_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'General',
  "metric" TEXT,
  "suggestedTarget" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_goal_template_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GoalTemplate_tenantId_idx" ON "aura_goal_template"("tenantId");
CREATE INDEX IF NOT EXISTS "GoalTemplate_category_idx" ON "aura_goal_template"("category");
