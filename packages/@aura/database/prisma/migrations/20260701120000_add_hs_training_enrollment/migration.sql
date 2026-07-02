-- CreateTable
CREATE TABLE IF NOT EXISTS "aura_hs_training_enrollment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "certificateId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hs_training_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "aura_hs_training_enrollment_tenantId_trainingId_employeeId_key" ON "aura_hs_training_enrollment"("tenantId", "trainingId", "employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "aura_hs_training_enrollment_tenantId_idx" ON "aura_hs_training_enrollment"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "aura_hs_training_enrollment_tenantId_employeeId_idx" ON "aura_hs_training_enrollment"("tenantId", "employeeId");
