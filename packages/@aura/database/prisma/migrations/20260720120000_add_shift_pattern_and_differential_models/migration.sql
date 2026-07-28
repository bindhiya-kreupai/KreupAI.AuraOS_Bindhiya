-- CreateTable: ShiftPattern (replaces hardcoded mock data in /shifts/patterns)
CREATE TABLE "aura_shift_pattern" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FIXED',
    "departmentId" TEXT,
    "rotationDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "shifts" JSONB NOT NULL DEFAULT '[]',
    "weeklyHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employeesAssigned" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_shift_pattern_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShiftPattern_tenantId_idx" ON "aura_shift_pattern"("tenantId");
CREATE INDEX "ShiftPattern_tenantId_isActive_idx" ON "aura_shift_pattern"("tenantId", "isActive");
CREATE INDEX "ShiftPattern_tenantId_status_idx" ON "aura_shift_pattern"("tenantId", "status");

-- CreateTable: ShiftDifferential (replaces hardcoded mock data in /shifts/differentials)
CREATE TABLE "aura_shift_differential" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL,
    "timeRange" JSONB,
    "differentialType" TEXT NOT NULL DEFAULT 'FLAT_AMOUNT',
    "amount" DOUBLE PRECISION,
    "percentAmount" DOUBLE PRECISION,
    "multiplier" DOUBLE PRECISION,
    "applicableDays" JSONB,
    "eligibleRoles" JSONB,
    "jurisdiction" TEXT NOT NULL DEFAULT 'DEFAULT',
    "regulatoryBasis" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_shift_differential_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShiftDifferential_tenantId_idx" ON "aura_shift_differential"("tenantId");
CREATE INDEX "ShiftDifferential_tenantId_jurisdiction_idx" ON "aura_shift_differential"("tenantId", "jurisdiction");
CREATE INDEX "ShiftDifferential_tenantId_isActive_idx" ON "aura_shift_differential"("tenantId", "isActive");
