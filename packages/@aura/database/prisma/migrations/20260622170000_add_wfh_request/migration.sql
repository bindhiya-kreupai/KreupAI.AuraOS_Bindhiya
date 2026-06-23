-- CreateTable
CREATE TABLE "aura_wfh_request" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "numberOfDays" DECIMAL(5, 1) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "requiresCheckIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInRequired" TIMESTAMP(3),
    "checkOutRequired" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkFromHomeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkFromHomeRequest_employeeId_idx" ON "aura_wfh_request"("employeeId");

-- CreateIndex
CREATE INDEX "WorkFromHomeRequest_status_idx" ON "aura_wfh_request"("status");

-- CreateIndex
CREATE INDEX "WorkFromHomeRequest_tenantId_idx" ON "aura_wfh_request"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkFromHomeRequest_tenantId_requestCode_key" ON "aura_wfh_request"("tenantId", "requestCode");
