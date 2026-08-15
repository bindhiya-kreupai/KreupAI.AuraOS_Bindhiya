-- Manual Migration for Workforce Extensions Module (Themes E, F, I)
-- Target Database: Neon PostgreSQL (schema: auraos)
-- Safe Execution Mode: TRANSACTION

BEGIN;

-- 1. Contractor Assignment Table
CREATE TABLE IF NOT EXISTS auraos.aura_contractor_assignment (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    domain TEXT NOT NULL,
    "vendorId" TEXT,
    "vendorName" TEXT,
    "contractRef" TEXT,
    "siteId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS aura_contractor_assignment_unique 
    ON auraos.aura_contractor_assignment ("tenantId", "subjectId", domain, "startDate");
CREATE INDEX IF NOT EXISTS aura_contractor_assignment_tenant_status_idx 
    ON auraos.aura_contractor_assignment ("tenantId", status);
CREATE INDEX IF NOT EXISTS aura_contractor_assignment_tenant_domain_idx 
    ON auraos.aura_contractor_assignment ("tenantId", domain);
CREATE INDEX IF NOT EXISTS aura_contractor_assignment_tenant_site_idx 
    ON auraos.aura_contractor_assignment ("tenantId", "siteId");

-- 2. Employee Loan Schedule Table
CREATE TABLE IF NOT EXISTS auraos.aura_employee_loan_schedule (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "loanCode" TEXT NOT NULL,
    principal DOUBLE PRECISION NOT NULL,
    "annualRatePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    installments INTEGER NOT NULL,
    "monthlyPayment" DOUBLE PRECISION NOT NULL,
    balance DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS aura_employee_loan_schedule_unique 
    ON auraos.aura_employee_loan_schedule ("tenantId", "loanCode");
CREATE INDEX IF NOT EXISTS aura_employee_loan_schedule_tenant_employee_idx 
    ON auraos.aura_employee_loan_schedule ("tenantId", "employeeId");
CREATE INDEX IF NOT EXISTS aura_employee_loan_schedule_tenant_status_idx 
    ON auraos.aura_employee_loan_schedule ("tenantId", status);

-- 3. Uniform PPE Issuance Table
CREATE TABLE IF NOT EXISTS auraos.aura_uniform_ppe_issuance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemLabel" TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'UNIFORM',
    quantity INTEGER NOT NULL DEFAULT 1,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT,
    "returnedAt" TIMESTAMP(3),
    "returnedBy" TEXT,
    condition TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS aura_uniform_ppe_issuance_tenant_employee_idx 
    ON auraos.aura_uniform_ppe_issuance ("tenantId", "employeeId");
CREATE INDEX IF NOT EXISTS aura_uniform_ppe_issuance_tenant_category_idx 
    ON auraos.aura_uniform_ppe_issuance ("tenantId", category);

-- 4. Accommodation Transport Route Table
CREATE TABLE IF NOT EXISTS auraos.aura_accommodation_transport_route (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "routeCode" TEXT NOT NULL,
    label TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'BUS',
    capacity INTEGER NOT NULL DEFAULT 0,
    "departureFromSite" TEXT,
    "arrivalAtSite" TEXT,
    "worksiteAddress" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS aura_accommodation_transport_route_unique 
    ON auraos.aura_accommodation_transport_route ("tenantId", "siteId", "routeCode");
CREATE INDEX IF NOT EXISTS aura_accommodation_transport_route_tenant_site_idx 
    ON auraos.aura_accommodation_transport_route ("tenantId", "siteId");

-- 5. Accommodation Clinic Table
CREATE TABLE IF NOT EXISTS auraos.aura_accommodation_clinic (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "clinicCode" TEXT NOT NULL,
    label TEXT NOT NULL,
    "isOnSite" BOOLEAN NOT NULL DEFAULT TRUE,
    "nearestHospital" TEXT,
    "nearestHospitalDistanceKm" DOUBLE PRECISION,
    "operatingHours" TEXT,
    "doctorOnCall" BOOLEAN NOT NULL DEFAULT FALSE,
    "lastInspectionAt" TIMESTAMP(3),
    "lastInspectionResult" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS aura_accommodation_clinic_unique 
    ON auraos.aura_accommodation_clinic ("tenantId", "siteId", "clinicCode");
CREATE INDEX IF NOT EXISTS aura_accommodation_clinic_tenant_site_idx 
    ON auraos.aura_accommodation_clinic ("tenantId", "siteId");

-- 6. Accommodation Maintenance Ticket Table
CREATE TABLE IF NOT EXISTS auraos.aura_accommodation_maintenance_ticket (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'OPEN',
    description TEXT NOT NULL,
    "reportedBy" TEXT,
    "assignedTo" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slaDueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS aura_accommodation_maintenance_ticket_tenant_site_idx 
    ON auraos.aura_accommodation_maintenance_ticket ("tenantId", "siteId");
CREATE INDEX IF NOT EXISTS aura_accommodation_maintenance_ticket_tenant_status_sev_idx 
    ON auraos.aura_accommodation_maintenance_ticket ("tenantId", status, severity);

COMMIT;
