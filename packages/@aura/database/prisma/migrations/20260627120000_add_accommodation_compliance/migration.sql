-- ============================================================================
-- EPIC-23 (Accommodation & Labour Camp Compliance)
-- ============================================================================

CREATE TABLE "aura_accommodation_site" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "siteType" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "address" TEXT,
  "totalCapacity" INTEGER NOT NULL DEFAULT 0,
  "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
  "managerId" TEXT,
  "contractorId" TEXT,
  "femaleOnly" BOOLEAN NOT NULL DEFAULT false,
  "familyAllowed" BOOLEAN NOT NULL DEFAULT false,
  "lastInspectionAt" TIMESTAMP(3),
  "nextInspectionAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_site_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_accommodation_site_tenant"
  ON "aura_accommodation_site"("tenantId");

CREATE TABLE "aura_accommodation_assignment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "roomNumber" TEXT,
  "bedNumber" TEXT,
  "checkInAt" TIMESTAMP(3) NOT NULL,
  "checkOutAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "monthlyAllowance" DECIMAL(12,2),
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_assignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_accommodation_assignment_site"
  ON "aura_accommodation_assignment"("tenantId", "siteId");
CREATE INDEX "aura_accommodation_assignment_employee"
  ON "aura_accommodation_assignment"("tenantId", "employeeId");

CREATE TABLE "aura_accommodation_inspection" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "inspectionDate" TIMESTAMP(3) NOT NULL,
  "inspectorId" TEXT,
  "category" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "criticalFindings" INTEGER NOT NULL DEFAULT 0,
  "majorFindings" INTEGER NOT NULL DEFAULT 0,
  "minorFindings" INTEGER NOT NULL DEFAULT 0,
  "findingsJson" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_inspection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_accommodation_inspection_site"
  ON "aura_accommodation_inspection"("tenantId", "siteId");

CREATE TABLE "aura_accommodation_complaint" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "employeeId" TEXT,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "subject" TEXT NOT NULL,
  "description" TEXT,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "raisedBy" TEXT,
  "assigneeId" TEXT,
  "slaHours" INTEGER NOT NULL DEFAULT 48,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_complaint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_accommodation_complaint_site"
  ON "aura_accommodation_complaint"("tenantId", "siteId");

CREATE TABLE "aura_accommodation_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "sitesTotal" INTEGER NOT NULL DEFAULT 0,
  "sitesOvercapacity" INTEGER NOT NULL DEFAULT 0,
  "inspectionsDue" INTEGER NOT NULL DEFAULT 0,
  "openCriticalFindings" INTEGER NOT NULL DEFAULT 0,
  "openComplaints" INTEGER NOT NULL DEFAULT 0,
  "complaintsSlaBreached" INTEGER NOT NULL DEFAULT 0,
  "averageInspectionScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_accommodation_certificate_unique"
  ON "aura_accommodation_certificate"("tenantId", "period");
