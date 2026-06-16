-- ============================================================================
-- EPIC-35 (Compliance Calendar & Scheduling Automation)
-- ============================================================================

CREATE TABLE "aura_calendar_category" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "defaultCadence" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_calendar_category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_calendar_category_unique" ON "aura_calendar_category"("tenantId", "code");

CREATE TABLE "aura_recurrence_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "categoryCode" TEXT NOT NULL,
  "countryCode" TEXT,
  "legalEntityId" TEXT,
  "cadence" TEXT NOT NULL,
  "dayOfMonth" INTEGER,
  "monthOfYear" INTEGER,
  "weekday" INTEGER,
  "ownerRole" TEXT NOT NULL,
  "escalationRole" TEXT,
  "leadDays" INTEGER NOT NULL DEFAULT 7,
  "tierAlerts" JSONB NOT NULL DEFAULT '[]',
  "templateJson" JSONB NOT NULL DEFAULT '{}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "shiftOnHoliday" TEXT NOT NULL DEFAULT 'PREVIOUS_BUSINESS_DAY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_recurrence_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_recurrence_rule_unique" ON "aura_recurrence_rule"("tenantId", "code");
CREATE INDEX "aura_recurrence_rule_categoryCode_idx" ON "aura_recurrence_rule"("categoryCode");
CREATE INDEX "aura_recurrence_rule_countryCode_idx" ON "aura_recurrence_rule"("countryCode");

CREATE TABLE "aura_compliance_task" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ruleCode" TEXT,
  "categoryCode" TEXT NOT NULL,
  "countryCode" TEXT,
  "legalEntityId" TEXT,
  "subject" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "originalDueDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "evidenceUrl" TEXT,
  "escalatedAt" TIMESTAMP(3),
  "escalatedToRole" TEXT,
  "deferReason" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_task_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_compliance_task_unique"
  ON "aura_compliance_task"("tenantId", "ruleCode", "scheduledFor", "legalEntityId");
CREATE INDEX "aura_compliance_task_tenantId_idx" ON "aura_compliance_task"("tenantId");
CREATE INDEX "aura_compliance_task_dueDate_idx" ON "aura_compliance_task"("dueDate");
CREATE INDEX "aura_compliance_task_status_idx" ON "aura_compliance_task"("status");
CREATE INDEX "aura_compliance_task_categoryCode_idx" ON "aura_compliance_task"("categoryCode");

CREATE TABLE "aura_holiday_calendar" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "name" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "isRamadan" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_holiday_calendar_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_holiday_calendar_unique"
  ON "aura_holiday_calendar"("tenantId", "countryCode", "date", "name");
CREATE INDEX "aura_holiday_calendar_lookup_idx" ON "aura_holiday_calendar"("countryCode", "year");

CREATE TABLE "aura_audit_plan" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "areasJson" JSONB NOT NULL DEFAULT '[]',
  "ownerRole" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  CONSTRAINT "aura_audit_plan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_audit_plan_unique" ON "aura_audit_plan"("tenantId", "year");

CREATE TABLE "aura_audit_sample" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "auditPlanId" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "populationSize" INTEGER NOT NULL,
  "sampleSize" INTEGER NOT NULL,
  "selectionsJson" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_audit_sample_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_audit_sample_planId_idx" ON "aura_audit_sample"("auditPlanId");
ALTER TABLE "aura_audit_sample"
  ADD CONSTRAINT "aura_audit_sample_planId_fkey"
  FOREIGN KEY ("auditPlanId") REFERENCES "aura_audit_plan"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "aura_audit_test_result" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "auditPlanId" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "testKey" TEXT NOT NULL,
  "sampleId" TEXT,
  "passed" BOOLEAN NOT NULL,
  "notes" TEXT,
  "evidenceUrl" TEXT,
  "performedBy" TEXT,
  "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_audit_test_result_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_audit_test_result_planId_idx" ON "aura_audit_test_result"("auditPlanId");
CREATE INDEX "aura_audit_test_result_passed_idx" ON "aura_audit_test_result"("passed");

CREATE TABLE "aura_audit_finding" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "auditPlanId" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_audit_finding_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_audit_finding_planId_idx" ON "aura_audit_finding"("auditPlanId");
CREATE INDEX "aura_audit_finding_status_idx" ON "aura_audit_finding"("status");
CREATE INDEX "aura_audit_finding_severity_idx" ON "aura_audit_finding"("severity");

CREATE TABLE "aura_corrective_action" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "findingId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "escalatedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_corrective_action_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_corrective_action_findingId_idx" ON "aura_corrective_action"("findingId");
CREATE INDEX "aura_corrective_action_status_idx" ON "aura_corrective_action"("status");
CREATE INDEX "aura_corrective_action_dueDate_idx" ON "aura_corrective_action"("dueDate");
ALTER TABLE "aura_corrective_action"
  ADD CONSTRAINT "aura_corrective_action_findingId_fkey"
  FOREIGN KEY ("findingId") REFERENCES "aura_audit_finding"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "aura_management_review" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "agendaJson" JSONB NOT NULL DEFAULT '[]',
  "openActionsAtTime" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_management_review_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_management_review_unique" ON "aura_management_review"("tenantId", "period");
CREATE INDEX "aura_management_review_status_idx" ON "aura_management_review"("status");

CREATE TABLE "aura_calendar_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "tasksDue" INTEGER NOT NULL DEFAULT 0,
  "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
  "tasksDeferred" INTEGER NOT NULL DEFAULT 0,
  "tasksOverdue" INTEGER NOT NULL DEFAULT 0,
  "criticalOverdue" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_calendar_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_calendar_certificate_unique" ON "aura_calendar_certificate"("tenantId", "period");
