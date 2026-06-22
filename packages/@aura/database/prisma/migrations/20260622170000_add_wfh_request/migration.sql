-- CreateTable
CREATE TABLE "aura_wfh_request" (
    "id" UUID NOT NULL,
    "requestCode" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT,
    "startDate" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ NOT NULL,
    "numberOfDays" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMPTZ,
    "rejectionReason" TEXT,
    "requiresCheckIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInRequired" TIMESTAMPTZ,
    "checkOutRequired" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMPTZ,
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
CREATE INDEX "WorkFromHomeRequest_requestCode_idx" ON "aura_wfh_request"("requestCode");
