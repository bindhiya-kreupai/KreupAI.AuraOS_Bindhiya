-- Gamification module domain models (AURA-086..093).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.

CREATE TABLE IF NOT EXISTS "aura_gamification_points_account" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "totalPoints" INTEGER NOT NULL DEFAULT 0,
  "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
  "currentBalance" INTEGER NOT NULL DEFAULT 0,
  "currentLevel" INTEGER NOT NULL DEFAULT 1,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_points_account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GamPointsAccount_tenant_emp_uq" ON "aura_gamification_points_account"("tenantId", "employeeId");
CREATE INDEX IF NOT EXISTS "GamPointsAccount_tenantId_idx" ON "aura_gamification_points_account"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_gamification_points_transaction" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'earn',
  "category" TEXT NOT NULL DEFAULT 'engagement',
  "source" TEXT NOT NULL DEFAULT 'manual',
  "reason" TEXT,
  "balanceAfter" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_points_transaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GamPointsTxn_tenant_emp_idx" ON "aura_gamification_points_transaction"("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS "aura_gamification_badge" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "badgeCode" TEXT NOT NULL,
  "badgeName" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT NOT NULL DEFAULT 'Medal',
  "tier" TEXT NOT NULL DEFAULT 'bronze',
  "category" TEXT NOT NULL DEFAULT 'achievement',
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_badge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GamBadge_tenantId_idx" ON "aura_gamification_badge"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_gamification_user_badge" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "reason" TEXT,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_user_badge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GamUserBadge_uq" ON "aura_gamification_user_badge"("tenantId", "employeeId", "badgeId");
CREATE INDEX IF NOT EXISTS "GamUserBadge_tenant_emp_idx" ON "aura_gamification_user_badge"("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS "aura_gamification_challenge" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "challengeName" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'engagement',
  "difficulty" TEXT NOT NULL DEFAULT 'medium',
  "pointsReward" INTEGER NOT NULL DEFAULT 0,
  "targetValue" INTEGER NOT NULL DEFAULT 1,
  "targetUnit" TEXT NOT NULL DEFAULT 'tasks',
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_challenge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GamChallenge_tenantId_idx" ON "aura_gamification_challenge"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_gamification_challenge_participation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "currentValue" INTEGER NOT NULL DEFAULT 0,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_challenge_participation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GamChallengePart_uq" ON "aura_gamification_challenge_participation"("tenantId", "challengeId", "employeeId");
CREATE INDEX IF NOT EXISTS "GamChallengePart_tenant_emp_idx" ON "aura_gamification_challenge_participation"("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS "aura_gamification_mission" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "missionName" TEXT NOT NULL,
  "description" TEXT,
  "missionType" TEXT NOT NULL DEFAULT 'daily',
  "category" TEXT NOT NULL DEFAULT 'engagement',
  "pointsReward" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_mission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GamMission_tenantId_idx" ON "aura_gamification_mission"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_gamification_user_mission" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_user_mission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GamUserMission_uq" ON "aura_gamification_user_mission"("tenantId", "employeeId", "missionId");
CREATE INDEX IF NOT EXISTS "GamUserMission_tenant_emp_idx" ON "aura_gamification_user_mission"("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS "aura_gamification_currency_transaction" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'convert',
  "amount" INTEGER NOT NULL,
  "counterparty" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gamification_currency_transaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GamCurrencyTxn_tenant_emp_idx" ON "aura_gamification_currency_transaction"("tenantId", "employeeId");
