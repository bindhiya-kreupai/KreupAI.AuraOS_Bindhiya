-- ============================================================================
-- Themes E + F + I — Workforce extensions.
--   E (contractor flow tagging): generic ContractorAssignment consumed by
--     attendance/holidays/accommodation/HSE.
--   F (benefits sub-categories): EmployeeLoanSchedule (S22-S09 amortization),
--     UniformPpeIssuance (S22-S11 issuance register). Education/relocation/
--     wellness covered via new BenefitCatalogue seeds (no schema change).
--   I (accommodation ops): AccommodationTransportRoute, AccommodationClinic,
--     AccommodationMaintenanceTicket.
-- ============================================================================

CREATE TABLE "aura_contractor_assignment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "subjectName" TEXT NOT NULL,
  "vendorId" TEXT,
  "vendorName" TEXT,
  "contractRef" TEXT,
  "siteId" TEXT,
  "domain" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_contractor_assignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_contractor_assignment_unique"
  ON "aura_contractor_assignment"("tenantId", "subjectId", "domain", "startDate");
CREATE INDEX "aura_contractor_assignment_domain"
  ON "aura_contractor_assignment"("tenantId", "domain", "status");

CREATE TABLE "aura_employee_loan_schedule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "loanCode" TEXT NOT NULL,
  "loanType" TEXT NOT NULL DEFAULT 'GENERAL',
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "principal" DECIMAL(18,2) NOT NULL,
  "interestRatePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "installments" INTEGER NOT NULL,
  "installmentAmount" DECIMAL(18,2) NOT NULL,
  "balance" DECIMAL(18,2) NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_employee_loan_schedule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_employee_loan_schedule_unique"
  ON "aura_employee_loan_schedule"("tenantId", "employeeId", "loanCode");
CREATE INDEX "aura_employee_loan_schedule_status"
  ON "aura_employee_loan_schedule"("tenantId", "status");

CREATE TABLE "aura_uniform_ppe_issuance" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "itemLabel" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'UNIFORM',
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "issuedBy" TEXT,
  "returnedAt" TIMESTAMP(3),
  "returnedBy" TEXT,
  "condition" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_uniform_ppe_issuance_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_uniform_ppe_issuance_employee"
  ON "aura_uniform_ppe_issuance"("tenantId", "employeeId");
CREATE INDEX "aura_uniform_ppe_issuance_category"
  ON "aura_uniform_ppe_issuance"("tenantId", "category");

CREATE TABLE "aura_accommodation_transport_route" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "routeCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "vehicleType" TEXT NOT NULL DEFAULT 'BUS',
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "departureFromSite" TEXT,
  "arrivalAtSite" TEXT,
  "worksiteAddress" TEXT,
  "distanceKm" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_transport_route_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_accommodation_transport_route_unique"
  ON "aura_accommodation_transport_route"("tenantId", "siteId", "routeCode");

CREATE TABLE "aura_accommodation_clinic" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "clinicCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "isOnSite" BOOLEAN NOT NULL DEFAULT true,
  "nearestHospital" TEXT,
  "nearestHospitalDistanceKm" INTEGER,
  "operatingHours" TEXT,
  "doctorOnCall" BOOLEAN NOT NULL DEFAULT false,
  "lastInspectionAt" TIMESTAMP(3),
  "lastInspectionResult" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_clinic_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_accommodation_clinic_unique"
  ON "aura_accommodation_clinic"("tenantId", "siteId", "clinicCode");

CREATE TABLE "aura_accommodation_maintenance_ticket" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "ticketCode" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "description" TEXT NOT NULL,
  "reportedBy" TEXT,
  "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignedTo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "slaDueAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_accommodation_maintenance_ticket_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_accommodation_maintenance_ticket_unique"
  ON "aura_accommodation_maintenance_ticket"("tenantId", "siteId", "ticketCode");
CREATE INDEX "aura_accommodation_maintenance_ticket_status"
  ON "aura_accommodation_maintenance_ticket"("tenantId", "status", "severity");
