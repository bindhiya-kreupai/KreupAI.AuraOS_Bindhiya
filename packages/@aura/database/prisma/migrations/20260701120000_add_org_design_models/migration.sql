-- CreateTable: Org Design Module (scenarios, succession pools/members, change initiatives)

CREATE TABLE IF NOT EXISTS "aura_org_scenario" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scenarioType" TEXT NOT NULL DEFAULT 'what_if',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "baselineChartId" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "currentHeadcount" INTEGER NOT NULL DEFAULT 0,
    "projectedHeadcount" INTEGER NOT NULL DEFAULT 0,
    "currentCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "projectedCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "changes" JSONB,
    "impactSummary" JSONB,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_org_scenario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_org_succession_pool" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "poolType" TEXT NOT NULL DEFAULT 'management',
    "description" TEXT,
    "criticalRole" TEXT NOT NULL,
    "incumbentId" TEXT,
    "incumbentName" TEXT,
    "retentionRisk" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_org_succession_pool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_org_succession_member" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "currentRole" TEXT,
    "readinessLevel" TEXT NOT NULL DEFAULT 'ready_2_3_years',
    "fitScore" INTEGER NOT NULL DEFAULT 0,
    "riskOfLoss" TEXT NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_org_succession_member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_org_change_initiative" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "changeType" TEXT NOT NULL DEFAULT 'restructure',
    "changeScope" TEXT NOT NULL DEFAULT 'department',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "impactLevel" TEXT NOT NULL DEFAULT 'medium',
    "ownerId" TEXT,
    "ownerName" TEXT,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "totalAffected" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_org_change_initiative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "aura_org_scenario_tenantId_idx" ON "aura_org_scenario"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_org_scenario_status_idx" ON "aura_org_scenario"("status");
CREATE INDEX IF NOT EXISTS "aura_org_succession_pool_tenantId_idx" ON "aura_org_succession_pool"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_org_succession_pool_status_idx" ON "aura_org_succession_pool"("status");
CREATE INDEX IF NOT EXISTS "aura_org_succession_member_tenantId_idx" ON "aura_org_succession_member"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_org_succession_member_poolId_idx" ON "aura_org_succession_member"("poolId");
CREATE INDEX IF NOT EXISTS "aura_org_change_initiative_tenantId_idx" ON "aura_org_change_initiative"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_org_change_initiative_status_idx" ON "aura_org_change_initiative"("status");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'aura_org_succession_member_poolId_fkey'
  ) THEN
    ALTER TABLE "aura_org_succession_member"
      ADD CONSTRAINT "aura_org_succession_member_poolId_fkey"
      FOREIGN KEY ("poolId") REFERENCES "aura_org_succession_pool"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
