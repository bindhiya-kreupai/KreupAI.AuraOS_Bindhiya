-- CreateTable
CREATE TABLE "aura_tenant_setting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_tenant_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_policy_document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "applicableTo" TEXT NOT NULL DEFAULT 'ALL_EMPLOYEES',
    "summary" TEXT,
    "contentMarkdown" TEXT,
    "acknowledgementsRequired" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "ownerName" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_policy_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_policy_acknowledgement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "aura_policy_acknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_admin_form" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_admin_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_form_submission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_form_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_data_import_job" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "errorLog" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_data_import_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ai_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enableChatbot" BOOLEAN NOT NULL DEFAULT false,
    "enableResumeAI" BOOLEAN NOT NULL DEFAULT false,
    "enableAttritionPrediction" BOOLEAN NOT NULL DEFAULT false,
    "llmProvider" TEXT,
    "llmModel" TEXT,
    "rateLimitPerMin" INTEGER NOT NULL DEFAULT 60,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_ai_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "prefs" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_helpdesk_ticket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assigneeId" TEXT,
    "requesterId" TEXT NOT NULL,
    "slaDueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_helpdesk_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_helpdesk_sla" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "responseHours" INTEGER NOT NULL DEFAULT 8,
    "resolutionHours" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_helpdesk_sla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_engagement_event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "location" TEXT,
    "capacity" INTEGER,
    "rsvpCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_engagement_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_engagement_survey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "responses" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_engagement_survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_esg_initiative" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pillar" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metrics" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_esg_initiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hs_incident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "incidentNumber" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "reportedBy" TEXT NOT NULL,
    "involvedIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "rootCause" TEXT,
    "correctiveActions" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hs_incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hs_checkup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "checkupType" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "result" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hs_checkup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hs_training" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "validityDays" INTEGER NOT NULL DEFAULT 365,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hs_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hs_emergency" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hs_emergency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_security_alert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedUser" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,

    CONSTRAINT "aura_security_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mass_update_job" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "filterCriteria" JSONB NOT NULL,
    "updateValue" JSONB NOT NULL,
    "affectedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorLog" JSONB,
    "executedAt" TIMESTAMP(3),
    "executedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_mass_update_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_travel_booking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT,
    "reference" TEXT,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cost" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bookedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_travel_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_equipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "serialNumber" TEXT,
    "manufacturer" TEXT,
    "installedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "oeeScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_mfg_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_maint_schedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "frequencyDays" INTEGER NOT NULL,
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "technician" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_mfg_maint_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_work_order" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderNumber" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_mfg_work_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_production_line" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "product" TEXT,
    "capacityPerHour" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_mfg_production_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_production_run" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "unitsProduced" INTEGER NOT NULL DEFAULT 0,
    "unitsRejected" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_mfg_production_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_oee_metric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "performance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quality" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oee" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "aura_mfg_oee_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_safety_inspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "findings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_mfg_safety_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_ppe_inventory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ppeType" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "reorderThreshold" INTEGER NOT NULL DEFAULT 10,
    "unitCost" DECIMAL(10,2),
    "lastRestocked" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_mfg_ppe_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfg_alert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "resourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_mfg_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_av_cabin_crew" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "certification" TEXT,
    "languages" TEXT[],
    "baseAirport" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "certExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_av_cabin_crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_av_pilot_training" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "trainingType" TEXT NOT NULL,
    "aircraftType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "certificateNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_av_pilot_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_av_ground_equipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "baseAirport" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_av_ground_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_av_ground_staff" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "baseAirport" TEXT NOT NULL,
    "certifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_av_ground_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_av_turnaround" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "airport" TEXT NOT NULL,
    "arrivedAt" TIMESTAMP(3) NOT NULL,
    "departedAt" TIMESTAMP(3),
    "targetMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "assignedStaff" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_av_turnaround_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_av_alert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "flightNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_av_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hc_credentialing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "issuingState" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "primarySpecialty" TEXT,
    "boardCertified" BOOLEAN NOT NULL DEFAULT false,
    "npiVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hc_credentialing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hc_locum_provider" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "npi" TEXT,
    "hourlyRate" DECIMAL(10,2),
    "availability" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hc_locum_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hc_locum_assignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "facilityId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "totalHours" DOUBLE PRECISION,
    "totalCost" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_hc_locum_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hc_nurse_roster" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "shiftType" TEXT NOT NULL,
    "unit" TEXT,
    "patientCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_hc_nurse_roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hc_alert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_hc_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_retail_store" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeCode" TEXT NOT NULL,
    "region" TEXT,
    "managerId" TEXT,
    "squareFeet" INTEGER,
    "openedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_retail_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_retail_commission_plan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "formula" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_retail_commission_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_retail_commission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "salesAmount" DECIMAL(12,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CALCULATED',
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_retail_commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_retail_seasonal_hiring" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "hiredCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_retail_seasonal_hiring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_retail_alert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "storeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_retail_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_tenant_branding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "emailFromName" TEXT,
    "emailFromAddress" TEXT,
    "customDomain" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_tenant_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_document_template" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_document_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_document_upload" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_document_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_meal_break_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "minHoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "mealBreakMins" INTEGER NOT NULL DEFAULT 30,
    "paidBreak" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_meal_break_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_predictive_scheduling_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "advanceNoticeDays" INTEGER NOT NULL DEFAULT 14,
    "predictabilityPayPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_predictive_scheduling_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ai_run_record" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "runType" TEXT NOT NULL,
    "inputContext" JSONB,
    "output" JSONB NOT NULL,
    "modelVersion" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "aura_ai_run_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_scheduled_job_run" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "error" TEXT,
    "output" JSONB,

    CONSTRAINT "aura_scheduled_job_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_auto_number_sequence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "suffix" TEXT,
    "padLength" INTEGER NOT NULL DEFAULT 4,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "incrementBy" INTEGER NOT NULL DEFAULT 1,
    "resetFrequency" TEXT NOT NULL DEFAULT 'never',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_auto_number_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aura_tenant_setting_tenantId_module_idx" ON "aura_tenant_setting"("tenantId", "module");

-- CreateIndex
CREATE UNIQUE INDEX "aura_tenant_setting_tenantId_module_key_key" ON "aura_tenant_setting"("tenantId", "module", "key");

-- CreateIndex
CREATE INDEX "aura_policy_document_tenantId_idx" ON "aura_policy_document"("tenantId");

-- CreateIndex
CREATE INDEX "aura_policy_document_tenantId_status_idx" ON "aura_policy_document"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_policy_acknowledgement_tenantId_idx" ON "aura_policy_acknowledgement"("tenantId");

-- CreateIndex
CREATE INDEX "aura_policy_acknowledgement_policyId_idx" ON "aura_policy_acknowledgement"("policyId");

-- CreateIndex
CREATE INDEX "aura_policy_acknowledgement_employeeId_idx" ON "aura_policy_acknowledgement"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_policy_acknowledgement_policyId_employeeId_key" ON "aura_policy_acknowledgement"("policyId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_admin_form_tenantId_idx" ON "aura_admin_form"("tenantId");

-- CreateIndex
CREATE INDEX "aura_form_submission_tenantId_idx" ON "aura_form_submission"("tenantId");

-- CreateIndex
CREATE INDEX "aura_form_submission_formId_idx" ON "aura_form_submission"("formId");

-- CreateIndex
CREATE INDEX "aura_form_submission_employeeId_idx" ON "aura_form_submission"("employeeId");

-- CreateIndex
CREATE INDEX "aura_data_import_job_tenantId_idx" ON "aura_data_import_job"("tenantId");

-- CreateIndex
CREATE INDEX "aura_data_import_job_tenantId_status_idx" ON "aura_data_import_job"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ai_config_tenantId_key" ON "aura_ai_config"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_user_preferences_userId_key" ON "aura_user_preferences"("userId");

-- CreateIndex
CREATE INDEX "aura_user_preferences_tenantId_idx" ON "aura_user_preferences"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_helpdesk_ticket_ticketNumber_key" ON "aura_helpdesk_ticket"("ticketNumber");

-- CreateIndex
CREATE INDEX "aura_helpdesk_ticket_tenantId_idx" ON "aura_helpdesk_ticket"("tenantId");

-- CreateIndex
CREATE INDEX "aura_helpdesk_ticket_tenantId_status_idx" ON "aura_helpdesk_ticket"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_helpdesk_ticket_assigneeId_idx" ON "aura_helpdesk_ticket"("assigneeId");

-- CreateIndex
CREATE INDEX "aura_helpdesk_ticket_requesterId_idx" ON "aura_helpdesk_ticket"("requesterId");

-- CreateIndex
CREATE INDEX "aura_helpdesk_sla_tenantId_idx" ON "aura_helpdesk_sla"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_helpdesk_sla_tenantId_category_priority_key" ON "aura_helpdesk_sla"("tenantId", "category", "priority");

-- CreateIndex
CREATE INDEX "aura_engagement_event_tenantId_idx" ON "aura_engagement_event"("tenantId");

-- CreateIndex
CREATE INDEX "aura_engagement_survey_tenantId_idx" ON "aura_engagement_survey"("tenantId");

-- CreateIndex
CREATE INDEX "aura_esg_initiative_tenantId_idx" ON "aura_esg_initiative"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hs_incident_incidentNumber_key" ON "aura_hs_incident"("incidentNumber");

-- CreateIndex
CREATE INDEX "aura_hs_incident_tenantId_idx" ON "aura_hs_incident"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hs_incident_tenantId_status_idx" ON "aura_hs_incident"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_hs_checkup_tenantId_idx" ON "aura_hs_checkup"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hs_checkup_employeeId_idx" ON "aura_hs_checkup"("employeeId");

-- CreateIndex
CREATE INDEX "aura_hs_training_tenantId_idx" ON "aura_hs_training"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hs_emergency_tenantId_idx" ON "aura_hs_emergency"("tenantId");

-- CreateIndex
CREATE INDEX "aura_security_alert_tenantId_idx" ON "aura_security_alert"("tenantId");

-- CreateIndex
CREATE INDEX "aura_security_alert_tenantId_status_idx" ON "aura_security_alert"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_security_alert_tenantId_severity_idx" ON "aura_security_alert"("tenantId", "severity");

-- CreateIndex
CREATE INDEX "aura_mass_update_job_tenantId_idx" ON "aura_mass_update_job"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mass_update_job_tenantId_status_idx" ON "aura_mass_update_job"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_travel_booking_tenantId_idx" ON "aura_travel_booking"("tenantId");

-- CreateIndex
CREATE INDEX "aura_travel_booking_employeeId_idx" ON "aura_travel_booking"("employeeId");

-- CreateIndex
CREATE INDEX "aura_mfg_equipment_tenantId_idx" ON "aura_mfg_equipment"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_equipment_tenantId_status_idx" ON "aura_mfg_equipment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_mfg_maint_schedule_tenantId_idx" ON "aura_mfg_maint_schedule"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_maint_schedule_equipmentId_idx" ON "aura_mfg_maint_schedule"("equipmentId");

-- CreateIndex
CREATE INDEX "aura_mfg_work_order_tenantId_idx" ON "aura_mfg_work_order"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_work_order_equipmentId_idx" ON "aura_mfg_work_order"("equipmentId");

-- CreateIndex
CREATE INDEX "aura_mfg_production_line_tenantId_idx" ON "aura_mfg_production_line"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_production_run_tenantId_idx" ON "aura_mfg_production_run"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_production_run_lineId_idx" ON "aura_mfg_production_run"("lineId");

-- CreateIndex
CREATE INDEX "aura_mfg_oee_metric_tenantId_idx" ON "aura_mfg_oee_metric"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_oee_metric_equipmentId_capturedAt_idx" ON "aura_mfg_oee_metric"("equipmentId", "capturedAt");

-- CreateIndex
CREATE INDEX "aura_mfg_safety_inspection_tenantId_idx" ON "aura_mfg_safety_inspection"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_ppe_inventory_tenantId_idx" ON "aura_mfg_ppe_inventory"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_alert_tenantId_idx" ON "aura_mfg_alert"("tenantId");

-- CreateIndex
CREATE INDEX "aura_mfg_alert_tenantId_status_idx" ON "aura_mfg_alert"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_av_cabin_crew_employeeId_key" ON "aura_av_cabin_crew"("employeeId");

-- CreateIndex
CREATE INDEX "aura_av_cabin_crew_tenantId_idx" ON "aura_av_cabin_crew"("tenantId");

-- CreateIndex
CREATE INDEX "aura_av_pilot_training_tenantId_idx" ON "aura_av_pilot_training"("tenantId");

-- CreateIndex
CREATE INDEX "aura_av_pilot_training_pilotId_idx" ON "aura_av_pilot_training"("pilotId");

-- CreateIndex
CREATE INDEX "aura_av_ground_equipment_tenantId_idx" ON "aura_av_ground_equipment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_av_ground_staff_employeeId_key" ON "aura_av_ground_staff"("employeeId");

-- CreateIndex
CREATE INDEX "aura_av_ground_staff_tenantId_idx" ON "aura_av_ground_staff"("tenantId");

-- CreateIndex
CREATE INDEX "aura_av_turnaround_tenantId_idx" ON "aura_av_turnaround"("tenantId");

-- CreateIndex
CREATE INDEX "aura_av_turnaround_flightNumber_idx" ON "aura_av_turnaround"("flightNumber");

-- CreateIndex
CREATE INDEX "aura_av_alert_tenantId_idx" ON "aura_av_alert"("tenantId");

-- CreateIndex
CREATE INDEX "aura_av_alert_tenantId_status_idx" ON "aura_av_alert"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_hc_credentialing_tenantId_idx" ON "aura_hc_credentialing"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hc_credentialing_providerId_idx" ON "aura_hc_credentialing"("providerId");

-- CreateIndex
CREATE INDEX "aura_hc_locum_provider_tenantId_idx" ON "aura_hc_locum_provider"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hc_locum_assignment_tenantId_idx" ON "aura_hc_locum_assignment"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hc_locum_assignment_providerId_idx" ON "aura_hc_locum_assignment"("providerId");

-- CreateIndex
CREATE INDEX "aura_hc_nurse_roster_tenantId_idx" ON "aura_hc_nurse_roster"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hc_nurse_roster_shiftDate_idx" ON "aura_hc_nurse_roster"("shiftDate");

-- CreateIndex
CREATE INDEX "aura_hc_alert_tenantId_idx" ON "aura_hc_alert"("tenantId");

-- CreateIndex
CREATE INDEX "aura_hc_alert_tenantId_status_idx" ON "aura_hc_alert"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_retail_store_storeCode_key" ON "aura_retail_store"("storeCode");

-- CreateIndex
CREATE INDEX "aura_retail_store_tenantId_idx" ON "aura_retail_store"("tenantId");

-- CreateIndex
CREATE INDEX "aura_retail_commission_plan_tenantId_idx" ON "aura_retail_commission_plan"("tenantId");

-- CreateIndex
CREATE INDEX "aura_retail_commission_tenantId_idx" ON "aura_retail_commission"("tenantId");

-- CreateIndex
CREATE INDEX "aura_retail_commission_employeeId_period_idx" ON "aura_retail_commission"("employeeId", "period");

-- CreateIndex
CREATE INDEX "aura_retail_seasonal_hiring_tenantId_idx" ON "aura_retail_seasonal_hiring"("tenantId");

-- CreateIndex
CREATE INDEX "aura_retail_alert_tenantId_idx" ON "aura_retail_alert"("tenantId");

-- CreateIndex
CREATE INDEX "aura_retail_alert_tenantId_status_idx" ON "aura_retail_alert"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_tenant_branding_tenantId_key" ON "aura_tenant_branding"("tenantId");

-- CreateIndex
CREATE INDEX "aura_document_template_tenantId_idx" ON "aura_document_template"("tenantId");

-- CreateIndex
CREATE INDEX "aura_document_template_tenantId_category_idx" ON "aura_document_template"("tenantId", "category");

-- CreateIndex
CREATE INDEX "aura_document_upload_tenantId_idx" ON "aura_document_upload"("tenantId");

-- CreateIndex
CREATE INDEX "aura_document_upload_uploadedById_idx" ON "aura_document_upload"("uploadedById");

-- CreateIndex
CREATE INDEX "aura_meal_break_rule_tenantId_idx" ON "aura_meal_break_rule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_meal_break_rule_tenantId_countryCode_key" ON "aura_meal_break_rule"("tenantId", "countryCode");

-- CreateIndex
CREATE INDEX "aura_predictive_scheduling_rule_tenantId_idx" ON "aura_predictive_scheduling_rule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_predictive_scheduling_rule_tenantId_jurisdiction_key" ON "aura_predictive_scheduling_rule"("tenantId", "jurisdiction");

-- CreateIndex
CREATE INDEX "aura_ai_run_record_tenantId_idx" ON "aura_ai_run_record"("tenantId");

-- CreateIndex
CREATE INDEX "aura_ai_run_record_tenantId_runType_idx" ON "aura_ai_run_record"("tenantId", "runType");

-- CreateIndex
CREATE INDEX "aura_ai_run_record_startedAt_idx" ON "aura_ai_run_record"("startedAt");

-- CreateIndex
CREATE INDEX "aura_scheduled_job_run_jobName_idx" ON "aura_scheduled_job_run"("jobName");

-- CreateIndex
CREATE INDEX "aura_scheduled_job_run_tenantId_idx" ON "aura_scheduled_job_run"("tenantId");

-- CreateIndex
CREATE INDEX "aura_scheduled_job_run_startedAt_idx" ON "aura_scheduled_job_run"("startedAt");

-- CreateIndex
CREATE INDEX "aura_auto_number_sequence_tenantId_idx" ON "aura_auto_number_sequence"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_auto_number_sequence_tenantId_entityType_key" ON "aura_auto_number_sequence"("tenantId", "entityType");

-- AddForeignKey
ALTER TABLE "aura_policy_acknowledgement" ADD CONSTRAINT "aura_policy_acknowledgement_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "aura_policy_document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_form_submission" ADD CONSTRAINT "aura_form_submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "aura_admin_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_hc_locum_assignment" ADD CONSTRAINT "aura_hc_locum_assignment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "aura_hc_locum_provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
