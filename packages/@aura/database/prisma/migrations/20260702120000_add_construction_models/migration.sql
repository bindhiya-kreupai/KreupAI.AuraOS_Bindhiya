-- Construction & Real Estate module domain models (AURA-186..194).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.

CREATE TABLE IF NOT EXISTS "aura_construction_project" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectName" TEXT NOT NULL,
  "projectNumber" TEXT NOT NULL,
  "projectType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'planning',
  "clientName" TEXT,
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_project_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionProject_tenantId_idx" ON "aura_construction_project"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionProject_status_idx" ON "aura_construction_project"("status");

CREATE TABLE IF NOT EXISTS "aura_construction_task" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "taskName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_started',
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_task_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionTask_tenantId_idx" ON "aura_construction_task"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionTask_projectId_idx" ON "aura_construction_task"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_safety_inspection" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "inspectionType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_safety_inspection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionSafetyInspection_tenantId_idx" ON "aura_construction_safety_inspection"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionSafetyInspection_projectId_idx" ON "aura_construction_safety_inspection"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_safety_incident" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "incidentType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'reported',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_safety_incident_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionSafetyIncident_tenantId_idx" ON "aura_construction_safety_incident"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionSafetyIncident_projectId_idx" ON "aura_construction_safety_incident"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_safety_training" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "trainingName" TEXT NOT NULL,
  "trainingType" TEXT NOT NULL,
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_safety_training_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionSafetyTraining_tenantId_idx" ON "aura_construction_safety_training"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_construction_hazard" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "hazardType" TEXT NOT NULL,
  "hazardLevel" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'identified',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_hazard_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionHazard_tenantId_idx" ON "aura_construction_hazard"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionHazard_projectId_idx" ON "aura_construction_hazard"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_equipment_lease" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "equipmentName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_equipment_lease_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionEquipmentLease_tenantId_idx" ON "aura_construction_equipment_lease"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionEquipmentLease_projectId_idx" ON "aura_construction_equipment_lease"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_subcontractor" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_subcontractor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionSubcontractor_tenantId_idx" ON "aura_construction_subcontractor"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_construction_bid_invitation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_bid_invitation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionBidInvitation_tenantId_idx" ON "aura_construction_bid_invitation"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_construction_bid" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "subcontractorId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_bid_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionBid_tenantId_idx" ON "aura_construction_bid"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionBid_projectId_idx" ON "aura_construction_bid"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_contract" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "subcontractorId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_contract_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionContract_tenantId_idx" ON "aura_construction_contract"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionContract_projectId_idx" ON "aura_construction_contract"("projectId");

CREATE TABLE IF NOT EXISTS "aura_construction_invoice" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_invoice_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionInvoice_tenantId_idx" ON "aura_construction_invoice"("tenantId");
CREATE INDEX IF NOT EXISTS "ConstructionInvoice_contractId_idx" ON "aura_construction_invoice"("contractId");

CREATE TABLE IF NOT EXISTS "aura_construction_settings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "data" JSONB NOT NULL DEFAULT '{}',
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_construction_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_construction_settings_tenantId_key" ON "aura_construction_settings"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_construction_alert" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "alertType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_alert_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionAlert_tenantId_idx" ON "aura_construction_alert"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_construction_staffing_allocation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "projectName" TEXT NOT NULL,
  "location" TEXT,
  "crewSize" INTEGER NOT NULL DEFAULT 0,
  "workType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "data" JSONB NOT NULL DEFAULT '{}',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_construction_staffing_allocation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ConstructionStaffingAllocation_tenantId_idx" ON "aura_construction_staffing_allocation"("tenantId");
