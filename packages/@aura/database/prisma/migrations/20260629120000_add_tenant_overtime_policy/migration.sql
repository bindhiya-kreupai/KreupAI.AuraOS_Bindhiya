-- CreateTable
CREATE TABLE "aura_tenant_overtime_policy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "calculationBase" TEXT NOT NULL,
    "minimumDurationMinutes" INTEGER NOT NULL,
    "monthlyCapHours" INTEGER NOT NULL,
    "normalMultiplier" DECIMAL(65,30) NOT NULL,
    "weekendMultiplier" DECIMAL(65,30) NOT NULL,
    "holidayMultiplier" DECIMAL(65,30) NOT NULL,
    "payoutMode" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_tenant_overtime_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aura_tenant_overtime_policy_tenantId_effectiveFrom_key" ON "aura_tenant_overtime_policy"("tenantId", "effectiveFrom");
