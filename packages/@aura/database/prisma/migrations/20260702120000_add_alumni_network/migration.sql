-- Alumni Network module domain models (AURA-218..222, 313..316).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Alumni PROFILES derive from completed ExitRequest records; these tables hold
-- the alumni-owned data: events, jobs, registrations, applications, saves, connections.

CREATE TABLE IF NOT EXISTS "aura_alumni_event" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "eventType" TEXT NOT NULL DEFAULT 'networking',
  "eventFormat" TEXT NOT NULL DEFAULT 'in_person',
  "description" TEXT,
  "eventDate" TIMESTAMP(3) NOT NULL,
  "eventTime" TEXT,
  "endDate" TIMESTAMP(3),
  "location" TEXT,
  "virtualLink" TEXT,
  "status" TEXT NOT NULL DEFAULT 'published',
  "maxAttendees" INTEGER,
  "currentAttendees" INTEGER NOT NULL DEFAULT 0,
  "isFree" BOOLEAN NOT NULL DEFAULT true,
  "ticketPrice" DECIMAL(12,2),
  "currency" TEXT,
  "organizerName" TEXT,
  "isReunion" BOOLEAN NOT NULL DEFAULT false,
  "batchYear" INTEGER,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_alumni_event_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AlumniEvent_tenantId_idx" ON "aura_alumni_event"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_alumni_event_registration" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "attendeeName" TEXT,
  "attendeeEmail" TEXT,
  "registrationStatus" TEXT NOT NULL DEFAULT 'confirmed',
  "guestCount" INTEGER NOT NULL DEFAULT 0,
  "checkInStatus" TEXT NOT NULL DEFAULT 'not_checked_in',
  "checkInTime" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_alumni_event_registration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AlumniEventReg_uq" ON "aura_alumni_event_registration"("tenantId", "eventId", "employeeId");
CREATE INDEX IF NOT EXISTS "AlumniEventReg_tenant_event_idx" ON "aura_alumni_event_registration"("tenantId", "eventId");

CREATE TABLE IF NOT EXISTS "aura_alumni_job" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "jobType" TEXT NOT NULL DEFAULT 'full_time',
  "workLocation" TEXT NOT NULL DEFAULT 'on_site',
  "locationCity" TEXT,
  "locationCountry" TEXT,
  "jobDescription" TEXT,
  "applicationUrl" TEXT,
  "applicationEmail" TEXT,
  "salaryMin" DECIMAL(15,2),
  "salaryMax" DECIMAL(15,2),
  "currency" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "isReferralAvailable" BOOLEAN NOT NULL DEFAULT false,
  "postedByEmployeeId" TEXT NOT NULL,
  "postedByName" TEXT,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "applicationCount" INTEGER NOT NULL DEFAULT 0,
  "savedCount" INTEGER NOT NULL DEFAULT 0,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "expiryDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_alumni_job_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AlumniJob_tenantId_idx" ON "aura_alumni_job"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_alumni_job_application" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "applicantId" TEXT NOT NULL,
  "applicantName" TEXT,
  "applicantEmail" TEXT,
  "applicationStatus" TEXT NOT NULL DEFAULT 'submitted',
  "coverLetter" TEXT,
  "resumeUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_alumni_job_application_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AlumniJobApp_uq" ON "aura_alumni_job_application"("tenantId", "jobId", "applicantId");
CREATE INDEX IF NOT EXISTS "AlumniJobApp_tenant_job_idx" ON "aura_alumni_job_application"("tenantId", "jobId");

CREATE TABLE IF NOT EXISTS "aura_alumni_saved_job" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_alumni_saved_job_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AlumniSavedJob_uq" ON "aura_alumni_saved_job"("tenantId", "jobId", "employeeId");
CREATE INDEX IF NOT EXISTS "AlumniSavedJob_tenant_emp_idx" ON "aura_alumni_saved_job"("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS "aura_alumni_connection" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "fromEmployeeId" TEXT NOT NULL,
  "toEmployeeId" TEXT NOT NULL,
  "connectionStatus" TEXT NOT NULL DEFAULT 'pending',
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_alumni_connection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AlumniConnection_uq" ON "aura_alumni_connection"("tenantId", "fromEmployeeId", "toEmployeeId");
CREATE INDEX IF NOT EXISTS "AlumniConnection_tenant_from_idx" ON "aura_alumni_connection"("tenantId", "fromEmployeeId");
