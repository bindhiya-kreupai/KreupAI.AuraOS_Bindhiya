-- CreateTable
CREATE TABLE "RecruitmentVendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'under_review',
    "contactPersonName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "location" TEXT,
    "rating" DOUBLE PRECISION,
    "activePlacements" INTEGER NOT NULL DEFAULT 0,
    "totalPlacements" INTEGER NOT NULL DEFAULT 0,
    "totalHires" INTEGER NOT NULL DEFAULT 0,
    "averageTimeToFillDays" INTEGER,
    "monthlySpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "complianceStatus" TEXT NOT NULL DEFAULT 'not_reviewed',
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "specialties" TEXT[],
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentVendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecruitmentVendor_tenantId_idx" ON "RecruitmentVendor"("tenantId");

-- CreateIndex
CREATE INDEX "RecruitmentVendor_status_idx" ON "RecruitmentVendor"("status");

-- CreateIndex
CREATE INDEX "RecruitmentVendor_category_idx" ON "RecruitmentVendor"("category");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentVendor_tenantId_vendorCode_key" ON "RecruitmentVendor"("tenantId", "vendorCode");
