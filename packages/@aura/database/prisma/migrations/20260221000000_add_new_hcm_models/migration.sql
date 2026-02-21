-- Migration: Add New HCM Models
-- Generated: 2026-02-21
-- This migration adds all models introduced after the last migration (20251221153000_add_user_mfa)
-- covering Attendance, Workforce Management, Competency, Compliance, Payroll, Leave, Benefits,
-- Recruitment, Onboarding, Performance, Learning, Analytics, and more.

-- ============================================================================
-- PART 1: NEW ENUM TYPES
-- ============================================================================

-- CreateEnum
CREATE TYPE "WPSStatus" AS ENUM ('PENDING', 'VALIDATING', 'VALIDATION_FAILED', 'VALIDATED', 'READY', 'SUBMITTED', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'PARTIALLY_ACCEPTED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WPSRecordStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'CORRECTED');

-- CreateEnum
CREATE TYPE "GOSIStatus" AS ENUM ('PENDING', 'VALIDATING', 'VALIDATED', 'SUBMITTED', 'PROCESSING', 'ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "GOSIRecordStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NitaqatBand" AS ENUM ('PLATINUM', 'GREEN_HIGH', 'GREEN_MEDIUM', 'GREEN_LOW', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "EOSBCalculationType" AS ENUM ('ESTIMATE', 'FINAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TerminationType" AS ENUM ('RESIGNATION', 'TERMINATION', 'TERMINATION_WITHOUT_CAUSE', 'END_OF_CONTRACT', 'RETIREMENT', 'DEATH', 'DISABILITY', 'MUTUAL_AGREEMENT');

-- CreateEnum
CREATE TYPE "EOSBStatus" AS ENUM ('CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'PROCESSING', 'CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveAccrualType" AS ENUM ('ANNUAL', 'MONTHLY', 'QUARTERLY', 'TENURE');

-- CreateEnum
CREATE TYPE "IndiaPFStatus" AS ENUM ('DRAFT', 'VALIDATING', 'VALIDATED', 'SUBMITTED', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "IndiaPFRecordStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IndiaESIStatus" AS ENUM ('DRAFT', 'VALIDATING', 'VALIDATED', 'SUBMITTED', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "IndiaESIRecordStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TDSDeclarationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PTDeductionStatus" AS ENUM ('DEDUCTED', 'REMITTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BenefitCategory" AS ENUM ('HEALTH_INSURANCE', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'DISABILITY', 'RETIREMENT', 'FSA_HSA', 'WELLNESS', 'EDUCATION', 'TRANSPORTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "CoverageLevel" AS ENUM ('EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY');

-- CreateEnum
CREATE TYPE "BenefitEnrollmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING_APPROVAL', 'APPROVED', 'CANCELLED', 'TERMINATED', 'WAIVED');

-- CreateEnum
CREATE TYPE "BenefitEnrollmentType" AS ENUM ('NEW_HIRE', 'OPEN_ENROLLMENT', 'QUALIFYING_EVENT', 'ANNUAL_RENEWAL', 'SPECIAL_ENROLLMENT');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID', 'PENDING_INFO');

-- CreateEnum
CREATE TYPE "DependentRelationship" AS ENUM ('SPOUSE', 'DOMESTIC_PARTNER', 'CHILD', 'STEPCHILD', 'ADOPTED_CHILD', 'FOSTER_CHILD', 'PARENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DependentStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'INACTIVE', 'AGED_OUT');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('HOSPITAL', 'CLINIC', 'PHYSICIAN', 'SPECIALIST', 'PHARMACY', 'LABORATORY', 'MENTAL_HEALTH', 'DENTAL', 'VISION', 'OTHER');

-- CreateEnum
CREATE TYPE "QualifyingEventType" AS ENUM ('MARRIAGE', 'DIVORCE', 'BIRTH', 'ADOPTION', 'DEATH', 'EMPLOYMENT_CHANGE', 'LOSS_OF_COVERAGE', 'RELOCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PremiumPaymentFrequency" AS ENUM ('MONTHLY', 'BI_WEEKLY', 'WEEKLY', 'SEMI_MONTHLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "BenefitPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'PENDING', 'WAIVED');

-- ============================================================================
-- PART 2: ALTER EXISTING TABLES (add new columns)
-- ============================================================================

-- Add new columns to Employee
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "positionId" TEXT;

-- Add new columns to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Add new columns to Bank
ALTER TABLE "Bank" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;

-- Add new columns to JobProfile
ALTER TABLE "JobProfile" ADD COLUMN IF NOT EXISTS "gradeId" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE "JobProfile" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "JobProfile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add new columns to AuditLog
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- ============================================================================
-- PART 3: NEW TABLES - Auth & Security
-- ============================================================================

-- CreateTable
CREATE TABLE "MFASecret" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT,
    "backupCodes" JSONB,
    "phoneNumber" TEXT,
    "method" TEXT NOT NULL DEFAULT 'totp',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MFASecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 4: NEW TABLES - Attendance & Workforce Management (Section 9.5)
-- ============================================================================

-- CreateTable
CREATE TABLE "AttendancePunch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "punchDate" TIMESTAMP(3) NOT NULL,
    "punchTime" TIMESTAMP(3) NOT NULL,
    "punchType" TEXT NOT NULL,
    "location" TEXT,
    "device" TEXT,
    "ipAddress" TEXT,
    "photo" TEXT,
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isRegularized" BOOLEAN NOT NULL DEFAULT false,
    "regularizedBy" TEXT,
    "regularizationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendancePunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shiftId" TEXT,
    "shiftStartTime" TIMESTAMP(3),
    "shiftEndTime" TIMESTAMP(3),
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "workHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breakHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "isEarlyOut" BOOLEAN NOT NULL DEFAULT false,
    "isRegularized" BOOLEAN NOT NULL DEFAULT false,
    "regularizationId" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "graceInMinutes" INTEGER NOT NULL DEFAULT 0,
    "graceOutMinutes" INTEGER NOT NULL DEFAULT 0,
    "breakDuration" INTEGER NOT NULL DEFAULT 0,
    "isPaidBreak" BOOLEAN NOT NULL DEFAULT true,
    "workHours" DOUBLE PRECISION NOT NULL,
    "weekendDays" TEXT[],
    "overtimeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "maxOvertimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFlexible" BOOLEAN NOT NULL DEFAULT false,
    "flexWindow" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftRoster" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "rosterDate" TIMESTAMP(3) NOT NULL,
    "customStartTime" TEXT,
    "customEndTime" TEXT,
    "isWeekOff" BOOLEAN NOT NULL DEFAULT false,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftSwapRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestorId" TEXT NOT NULL,
    "swapWithId" TEXT NOT NULL,
    "requestorDate" TIMESTAMP(3) NOT NULL,
    "requestorShiftId" TEXT NOT NULL,
    "swapWithDate" TIMESTAMP(3) NOT NULL,
    "swapWithShiftId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "swapWithApproval" TEXT NOT NULL DEFAULT 'PENDING',
    "managerApproval" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftSwapRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "overtimeDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "overtimeType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "workDescription" TEXT,
    "project" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "compensationType" TEXT,
    "isCompensated" BOOLEAN NOT NULL DEFAULT false,
    "compensatedAt" TIMESTAMP(3),
    "actualHours" DOUBLE PRECISION,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRegularization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "regularizationType" TEXT NOT NULL,
    "requestedClockIn" TIMESTAMP(3),
    "requestedClockOut" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRegularization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompOffRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "earnedDate" TIMESTAMP(3) NOT NULL,
    "earnedHours" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EARNED',
    "appliedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompOffRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 5: NEW TABLES - Recruitment (Section 14)
-- ============================================================================

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "description" TEXT,
    "postedDate" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "applies" INTEGER NOT NULL DEFAULT 0,
    "channels" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 6: NEW TABLES - Competency Library (Sections 15-19)
-- ============================================================================

-- CreateTable
CREATE TABLE "CompetencyCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencySubcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencySubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyCatalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "owner" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyProficiencyDescriptor" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "description" TEXT,
    "behaviors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyProficiencyDescriptor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyRelation" (
    "id" TEXT NOT NULL,
    "sourceCompetencyId" TEXT NOT NULL,
    "relatedCompetencyId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'Related',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyRoleMapping" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyRoleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyAssessmentCriteria" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyAssessmentCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyDevelopmentResource" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "provider" TEXT,
    "duration" TEXT,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyDevelopmentResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProficiencyFramework" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Standard',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProficiencyFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProficiencyLevel" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProficiencyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT,
    "description" TEXT,
    "level" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCompetencyMapping" (
    "id" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "requiredLevelId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCompetencyMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAssessment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "employeeId" TEXT,
    "jobRoleId" TEXT,
    "cycleId" TEXT,
    "assessorIds" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAssessmentCompetency" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillAssessmentCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAssessmentResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "assessorId" TEXT,
    "assessorType" TEXT,
    "ratingLevelId" TEXT NOT NULL,
    "comments" TEXT,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillAssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GapAnalysis" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GapAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GapAnalysisItem" (
    "id" TEXT NOT NULL,
    "gapAnalysisId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "currentLevelId" TEXT NOT NULL,
    "targetLevelId" TEXT NOT NULL,
    "gapScore" DOUBLE PRECISION NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GapAnalysisItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "gapAnalysisId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentActivity" (
    "id" TEXT NOT NULL,
    "developmentPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT,
    "description" TEXT,
    "duration" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "competencyIds" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentMilestone" (
    "id" TEXT NOT NULL,
    "developmentPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentMilestone_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 7: NEW TABLES - MENA Compliance (Sections 20-25)
-- ============================================================================

-- CreateTable
CREATE TABLE "LabourLawConfig" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "countryNameAr" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "standardHoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "standardHoursPerWeek" INTEGER NOT NULL DEFAULT 48,
    "ramadanHoursPerDay" INTEGER,
    "ramadanHoursPerWeek" INTEGER,
    "maxOvertimeHoursPerDay" INTEGER,
    "maxOvertimeHoursPerYear" INTEGER,
    "overtimeRateNormal" DECIMAL(65,30) NOT NULL DEFAULT 125,
    "overtimeRateNight" DECIMAL(65,30) NOT NULL DEFAULT 150,
    "overtimeRateHoliday" DECIMAL(65,30) NOT NULL DEFAULT 150,
    "overtimeRateFriday" DECIMAL(65,30),
    "nightShiftStart" TEXT,
    "nightShiftEnd" TEXT,
    "maxProbationDays" INTEGER NOT NULL DEFAULT 90,
    "probationExtensionDays" INTEGER,
    "probationNoticeDays" INTEGER NOT NULL DEFAULT 14,
    "annualLeaveFirstYear" INTEGER NOT NULL DEFAULT 21,
    "annualLeaveAfterYears" INTEGER NOT NULL DEFAULT 30,
    "annualLeaveThresholdYears" INTEGER NOT NULL DEFAULT 5,
    "sickLeaveFullPay" INTEGER NOT NULL DEFAULT 15,
    "sickLeaveHalfPay" INTEGER NOT NULL DEFAULT 30,
    "sickLeaveUnpaid" INTEGER NOT NULL DEFAULT 45,
    "maternityLeaveDays" INTEGER NOT NULL DEFAULT 60,
    "maternityLeaveFullPay" INTEGER NOT NULL DEFAULT 45,
    "maternityLeaveHalfPay" INTEGER NOT NULL DEFAULT 15,
    "paternityLeaveDays" INTEGER NOT NULL DEFAULT 5,
    "bereavementLeaveSpouse" INTEGER NOT NULL DEFAULT 5,
    "bereavementLeaveFamily" INTEGER NOT NULL DEFAULT 3,
    "hajjLeaveDays" INTEGER,
    "hajjLeaveMinServiceYears" INTEGER,
    "studyLeaveDays" INTEGER,
    "marriageLeaveDays" INTEGER,
    "iddahLeaveDays" INTEGER,
    "eosbFirstPeriodYears" INTEGER NOT NULL DEFAULT 5,
    "eosbFirstPeriodDays" INTEGER NOT NULL DEFAULT 21,
    "eosbAfterPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "eosbMaxMonths" INTEGER,
    "eosbResignationFactor1" DECIMAL(65,30),
    "eosbResignationFactor2" DECIMAL(65,30),
    "eosbMinServiceMonths" INTEGER NOT NULL DEFAULT 12,
    "socialInsuranceEmployeeRate" DECIMAL(65,30),
    "socialInsuranceEmployerRate" DECIMAL(65,30),
    "socialInsuranceMaxWage" DECIMAL(65,30),
    "pensionEmployeeRate" DECIMAL(65,30),
    "pensionEmployerRate" DECIMAL(65,30),
    "unemploymentEmployeeRate" DECIMAL(65,30),
    "unemploymentEmployerRate" DECIMAL(65,30),
    "occupationalHazardsRate" DECIMAL(65,30),
    "weekendDays" JSONB,
    "workWeekStartDay" TEXT NOT NULL DEFAULT 'Sunday',
    "currencyCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabourLawConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WPSConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyName" VARCHAR(200) NOT NULL,
    "wpsAgentCode" VARCHAR(50) NOT NULL,
    "employerCode" VARCHAR(50) NOT NULL,
    "bankCode" VARCHAR(10) NOT NULL,
    "bankName" VARCHAR(100) NOT NULL,
    "bankBranchCode" VARCHAR(20),
    "molEstablishmentId" VARCHAR(50),
    "wpsFilePrefix" VARCHAR(10) NOT NULL DEFAULT 'WPS',
    "contactPerson" VARCHAR(100) NOT NULL,
    "contactEmail" VARCHAR(150) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoSubmit" BOOLEAN NOT NULL DEFAULT false,
    "submissionDay" INTEGER NOT NULL DEFAULT 1,
    "reminderDays" INTEGER NOT NULL DEFAULT 3,
    "maxSalaryAmount" DECIMAL(15,2) NOT NULL DEFAULT 999999999.99,
    "minSalaryAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.01,
    "requireLabourCard" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WPSConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WPSSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "wpsConfigId" TEXT NOT NULL,
    "payrollRunId" TEXT,
    "payrollMonth" VARCHAR(7) NOT NULL,
    "payrollYear" INTEGER NOT NULL,
    "salaryMonth" VARCHAR(20) NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "status" "WPSStatus" NOT NULL DEFAULT 'PENDING',
    "sifFileName" VARCHAR(255),
    "sifFileUrl" TEXT,
    "sifFileSize" INTEGER,
    "sifFileChecksum" VARCHAR(64),
    "responseFileName" VARCHAR(255),
    "responseFileUrl" TEXT,
    "molReferenceNumber" VARCHAR(100),
    "molResponseDate" TIMESTAMP(3),
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "validationErrors" JSONB,
    "processingErrors" JSONB,
    "rejectionReasons" JSONB,
    "errorSummary" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" TIMESTAMP(3),
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WPSSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WPSRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "agentId" VARCHAR(50) NOT NULL,
    "labourCardNumber" VARCHAR(50) NOT NULL,
    "personCode" VARCHAR(50) NOT NULL,
    "employeeName" VARCHAR(200) NOT NULL,
    "passportNumber" VARCHAR(50),
    "nationality" VARCHAR(50) NOT NULL,
    "bankRoutingCode" VARCHAR(20) NOT NULL,
    "accountNumber" VARCHAR(50) NOT NULL,
    "ibanNumber" VARCHAR(34),
    "basicSalary" DECIMAL(15,2) NOT NULL,
    "allowances" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(15,2) NOT NULL,
    "leaveSalary" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salaryMonth" VARCHAR(20) NOT NULL,
    "workingDays" INTEGER NOT NULL DEFAULT 30,
    "actualDays" INTEGER NOT NULL DEFAULT 30,
    "status" "WPSRecordStatus" NOT NULL DEFAULT 'PENDING',
    "validationStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "validationErrors" JSONB,
    "molStatus" VARCHAR(50),
    "errorCode" VARCHAR(20),
    "errorMessage" TEXT,
    "processedDate" TIMESTAMP(3),
    "lineNumber" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WPSRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WPSAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionId" TEXT,
    "recordId" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "actionType" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" VARCHAR(200) NOT NULL,
    "userRole" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedFields" JSONB,
    "oldStatus" VARCHAR(50),
    "newStatus" VARCHAR(50),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WPSAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GOSIConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "gosiSubscriptionNumber" TEXT NOT NULL,
    "establishmentNumber" TEXT,
    "bankAccountIBAN" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GOSIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GOSISubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "gosiConfigId" TEXT NOT NULL,
    "contributionMonth" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3),
    "status" "GOSIStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT,
    "fileUrl" TEXT,
    "responseFileName" TEXT,
    "responseFileUrl" TEXT,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalSaudis" INTEGER NOT NULL DEFAULT 0,
    "totalNonSaudis" INTEGER NOT NULL DEFAULT 0,
    "totalEmployeeContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployerContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPensionContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalSanedContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalOccupationalHazards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "validationErrors" JSONB,
    "rejectionReasons" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GOSISubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GOSIRecord" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "iqamaNumber" TEXT,
    "nationalId" TEXT,
    "nationality" TEXT NOT NULL,
    "isSaudi" BOOLEAN NOT NULL DEFAULT false,
    "contributableSalary" DECIMAL(65,30) NOT NULL,
    "basicSalary" DECIMAL(65,30) NOT NULL,
    "housingAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employeePension" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerPension" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sanedEmployee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sanedEmployer" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "occupationalHazards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployer" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "GOSIRecordStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GOSIRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NitaqatConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "industryCode" TEXT NOT NULL,
    "industryName" TEXT NOT NULL,
    "companySizeBand" TEXT NOT NULL,
    "requiredSaudiRatio" DECIMAL(65,30) NOT NULL,
    "targetRatio" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NitaqatConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NitaqatSnapshot" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEmployees" INTEGER NOT NULL,
    "saudiEmployees" INTEGER NOT NULL,
    "nonSaudiEmployees" INTEGER NOT NULL,
    "currentRatio" DECIMAL(65,30) NOT NULL,
    "nitaqatBand" "NitaqatBand" NOT NULL,
    "previousBand" "NitaqatBand",
    "deficit" INTEGER NOT NULL DEFAULT 0,
    "surplus" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NitaqatSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EOSBCalculation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "calculationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculationType" "EOSBCalculationType" NOT NULL,
    "countryCode" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDate" TIMESTAMP(3),
    "yearsOfService" DECIMAL(65,30) NOT NULL,
    "monthsOfService" INTEGER NOT NULL,
    "daysOfService" INTEGER NOT NULL,
    "basicSalary" DECIMAL(65,30) NOT NULL,
    "totalSalary" DECIMAL(65,30) NOT NULL,
    "dailyRate" DECIMAL(65,30) NOT NULL,
    "firstPeriodYears" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "firstPeriodAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "secondPeriodYears" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "secondPeriodAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossAmount" DECIMAL(65,30) NOT NULL,
    "terminationType" "TerminationType" NOT NULL,
    "resignationFactor" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "deductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" "EOSBStatus" NOT NULL DEFAULT 'CALCULATED',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "calculationDetails" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EOSBCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeComplianceDetails" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "labourCardNumber" TEXT,
    "labourCardExpiry" TIMESTAMP(3),
    "emiratesId" TEXT,
    "emiratesIdExpiry" TIMESTAMP(3),
    "visaNumber" TEXT,
    "visaType" TEXT,
    "visaExpiry" TIMESTAMP(3),
    "wpsPersonalNumber" TEXT,
    "iqamaNumber" TEXT,
    "iqamaExpiry" TIMESTAMP(3),
    "nationalId" TEXT,
    "borderNumber" TEXT,
    "gosiSubscriptionNumber" TEXT,
    "panNumber" TEXT,
    "aadhaarNumber" TEXT,
    "uanNumber" TEXT,
    "esiNumber" TEXT,
    "pfAccountNumber" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIBAN" TEXT,
    "bankSwiftCode" TEXT,
    "bankBranchCode" TEXT,
    "bankRoutingCode" TEXT,
    "contractType" TEXT,
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "probationEndDate" TIMESTAMP(3),
    "nationality" TEXT,
    "religion" TEXT,
    "isLocalNational" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeComplianceDetails_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 8: NEW TABLES - Payroll Configuration & Processing (Section 26)
-- ============================================================================

-- CreateTable
CREATE TABLE "PayrollConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "payCycleType" TEXT NOT NULL DEFAULT 'Monthly',
    "payDay" INTEGER NOT NULL DEFAULT 28,
    "cutoffDay" INTEGER NOT NULL DEFAULT 25,
    "componentsConfig" JSONB,
    "enableWPS" BOOLEAN NOT NULL DEFAULT false,
    "enableGOSI" BOOLEAN NOT NULL DEFAULT false,
    "enablePF" BOOLEAN NOT NULL DEFAULT false,
    "enableESI" BOOLEAN NOT NULL DEFAULT false,
    "enableTDS" BOOLEAN NOT NULL DEFAULT false,
    "overtimeCalculationBase" TEXT NOT NULL DEFAULT 'Basic',
    "leaveEncashmentBase" TEXT NOT NULL DEFAULT 'Basic',
    "gratuityCalculationBase" TEXT NOT NULL DEFAULT 'Basic',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "payrollMonth" TEXT NOT NULL,
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "processedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvalLevel" INTEGER NOT NULL DEFAULT 0,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalGrossSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalNetSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployerCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "basicSalary" DECIMAL(65,30) NOT NULL,
    "earnings" JSONB NOT NULL,
    "totalEarnings" DECIMAL(65,30) NOT NULL,
    "deductions" JSONB NOT NULL,
    "totalDeductions" DECIMAL(65,30) NOT NULL,
    "employeePF" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employeeESI" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employeePension" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employeeTDS" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employeeSaned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalStatutoryEmployee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerPF" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerESI" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerPension" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerGOSI" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalStatutoryEmployer" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossSalary" DECIMAL(65,30) NOT NULL,
    "netSalary" DECIMAL(65,30) NOT NULL,
    "workingDays" INTEGER NOT NULL DEFAULT 0,
    "paidDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lopDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "overtimeAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PayslipStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalaryStructure" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "basicSalary" DECIMAL(65,30) NOT NULL,
    "houseRentAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "transportAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "otherAllowances" JSONB,
    "grossSalary" DECIMAL(65,30) NOT NULL,
    "ctc" DECIMAL(65,30) NOT NULL,
    "payFrequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "medicalInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifeInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeBenefit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "benefitType" TEXT NOT NULL,
    "benefitName" TEXT NOT NULL,
    "provider" TEXT,
    "policyNumber" TEXT,
    "coverageAmount" DECIMAL(65,30),
    "employeeContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPremium" DECIMAL(65,30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "coversDependents" BOOLEAN NOT NULL DEFAULT false,
    "dependentsCount" INTEGER NOT NULL DEFAULT 0,
    "dependentsDetails" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxDeclaration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "taxRegime" TEXT NOT NULL DEFAULT 'OLD',
    "ppf" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "elss" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifeInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "nsc" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "homeLoanPrincipal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tuitionFees" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80C" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "medicalSelf" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "medicalParents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "preventiveCheckup" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80D" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80E" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "homeLoanInterest" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rentPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "landlordPAN" TEXT,
    "section80G" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80TTA" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "otherDeductions" JSONB,
    "totalDeductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "proofsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "proofDocuments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdjustment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollMonth" TEXT NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "category" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedInRun" TEXT,
    "processedAt" TIMESTAMP(3),
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutoryPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "paymentMonth" TEXT NOT NULL,
    "statutoryType" TEXT NOT NULL,
    "employeeContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "employerContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "challanNumber" TEXT,
    "paymentDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatutoryPayment_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 9: NEW TABLES - Leave Policy & Accrual Engine (Section 27)
-- ============================================================================

-- CreateTable
CREATE TABLE "LeavePolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "countryCode" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "leaveTypeId" TEXT NOT NULL,
    "employmentTypes" JSONB,
    "minServiceMonths" INTEGER NOT NULL DEFAULT 0,
    "annualEntitlement" DECIMAL(65,30) NOT NULL,
    "accrualType" "LeaveAccrualType" NOT NULL DEFAULT 'MONTHLY',
    "accrualRate" DECIMAL(65,30),
    "allowCarryForward" BOOLEAN NOT NULL DEFAULT true,
    "maxCarryForwardDays" DECIMAL(65,30),
    "carryForwardExpiryMonths" INTEGER,
    "allowEncashment" BOOLEAN NOT NULL DEFAULT false,
    "maxEncashmentDays" DECIMAL(65,30),
    "encashmentRate" DECIMAL(65,30) NOT NULL DEFAULT 100,
    "allowNegativeBalance" BOOLEAN NOT NULL DEFAULT false,
    "maxNegativeDays" DECIMAL(65,30),
    "minConsecutiveDays" INTEGER,
    "maxConsecutiveDays" INTEGER,
    "advanceNoticeDays" INTEGER NOT NULL DEFAULT 0,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "proRataOnJoining" BOOLEAN NOT NULL DEFAULT true,
    "proRataOnExit" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeavePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "leaveYear" INTEGER NOT NULL,
    "openingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "accrued" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taken" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "adjusted" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "encashed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "carriedForward" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lapsed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastAccrualDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "policyId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" DECIMAL(65,30) NOT NULL,
    "halfDayStart" BOOLEAN NOT NULL DEFAULT false,
    "halfDayEnd" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "contactNumber" TEXT,
    "addressDuringLeave" TEXT,
    "delegateToEmployeeId" TEXT,
    "documents" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvers" JSONB,
    "currentApproverLevel" INTEGER NOT NULL DEFAULT 1,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "balanceDeducted" BOOLEAN NOT NULL DEFAULT false,
    "balanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveEncashment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "requestedDays" DECIMAL(65,30) NOT NULL,
    "eligibleDays" DECIMAL(65,30) NOT NULL,
    "approvedDays" DECIMAL(65,30),
    "calculationBasis" TEXT NOT NULL,
    "dailyRate" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "encashmentRate" DECIMAL(65,30) NOT NULL DEFAULT 100,
    "trigger" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "payrollMonth" TEXT,
    "paymentReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveEncashment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveAccrual" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "leaveYear" INTEGER NOT NULL,
    "accrualMonth" INTEGER,
    "accrualDate" TIMESTAMP(3) NOT NULL,
    "accruedDays" DECIMAL(65,30) NOT NULL,
    "runId" TEXT,
    "daysWorked" INTEGER,
    "proRataFactor" DECIMAL(65,30) DEFAULT 1.0,
    "calculationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveCarryForward" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "fromYear" INTEGER NOT NULL,
    "toYear" INTEGER NOT NULL,
    "previousYearBalance" DECIMAL(65,30) NOT NULL,
    "carryForwardEligible" DECIMAL(65,30) NOT NULL,
    "carryForwardApplied" DECIMAL(65,30) NOT NULL,
    "lapsed" DECIMAL(65,30) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "expiredDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveCarryForward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompOffEarned" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workedDate" TIMESTAMP(3) NOT NULL,
    "workedHours" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "projectCode" TEXT,
    "overtimeRequestId" TEXT,
    "creditedDays" DECIMAL(65,30) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedDate" TIMESTAMP(3),
    "usedLeaveRequestId" TEXT,
    "remainingDays" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompOffEarned_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 10: NEW TABLES - Localization (Section 28)
-- ============================================================================

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalizationConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "defaultLocale" TEXT NOT NULL DEFAULT 'en-US',
    "supportedLocales" JSONB NOT NULL DEFAULT '["en-US", "ar-SA"]',
    "fallbackLocale" TEXT NOT NULL DEFAULT 'en-US',
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Asia/Dubai',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'AED',
    "defaultCalendar" TEXT NOT NULL DEFAULT 'gregorian',
    "showHijriDates" BOOLEAN NOT NULL DEFAULT false,
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "firstDayOfWeek" TEXT NOT NULL DEFAULT 'Sunday',
    "decimalSeparator" TEXT NOT NULL DEFAULT '.',
    "thousandsSeparator" TEXT NOT NULL DEFAULT ',',
    "currencyPosition" TEXT NOT NULL DEFAULT 'before',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalizationConfig_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 11: NEW TABLES - India Statutory Compliance (Sections 29-32)
-- ============================================================================

-- CreateTable
CREATE TABLE "IndiaPFConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "epfoEstablishmentId" TEXT NOT NULL,
    "epfoRegistrationNumber" TEXT NOT NULL,
    "employeeContributionRate" DECIMAL(65,30) NOT NULL DEFAULT 12,
    "employerContributionRate" DECIMAL(65,30) NOT NULL DEFAULT 12,
    "adminChargesRate" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
    "edliChargesRate" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
    "wageCeiling" DECIMAL(65,30) NOT NULL DEFAULT 15000,
    "pensionWageCeiling" DECIMAL(65,30) NOT NULL DEFAULT 15000,
    "isVoluntaryHigherAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaPFConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaPFSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "contributionMonth" TEXT NOT NULL,
    "status" "IndiaPFStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionDate" TIMESTAMP(3),
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalWages" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployeeContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployerPF" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployerEPS" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAdminCharges" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEDLI" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ecrFileName" TEXT,
    "ecrFileUrl" TEXT,
    "challanNumber" TEXT,
    "trrn" TEXT,
    "validationErrors" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaPFSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaPFRecord" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "uanNumber" TEXT NOT NULL,
    "pfAccountNumber" TEXT,
    "employeeName" TEXT NOT NULL,
    "fatherHusbandName" TEXT,
    "dateOfJoining" TIMESTAMP(3),
    "dateOfExit" TIMESTAMP(3),
    "gender" TEXT,
    "basicWages" DECIMAL(65,30) NOT NULL,
    "dearnessAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "contributableWages" DECIMAL(65,30) NOT NULL,
    "employeeContribution" DECIMAL(65,30) NOT NULL,
    "employerPFContribution" DECIMAL(65,30) NOT NULL,
    "employerEPSContribution" DECIMAL(65,30) NOT NULL,
    "isVoluntaryHigher" BOOLEAN NOT NULL DEFAULT false,
    "ncpDays" INTEGER NOT NULL DEFAULT 0,
    "status" "IndiaPFRecordStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaPFRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaESIConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "esicCode" TEXT NOT NULL,
    "esicSubCode" TEXT,
    "regionCode" TEXT,
    "employeeContributionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.75,
    "employerContributionRate" DECIMAL(65,30) NOT NULL DEFAULT 3.25,
    "wageCeiling" DECIMAL(65,30) NOT NULL DEFAULT 21000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaESIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaESISubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "contributionMonth" TEXT NOT NULL,
    "status" "IndiaESIStatus" NOT NULL DEFAULT 'DRAFT',
    "submissionDate" TIMESTAMP(3),
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalWages" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployeeContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalEmployerContribution" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "challanNumber" TEXT,
    "validationErrors" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaESISubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaESIRecord" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "esiNumber" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "dateOfJoining" TIMESTAMP(3),
    "grossWages" DECIMAL(65,30) NOT NULL,
    "workingDays" INTEGER NOT NULL DEFAULT 0,
    "employeeContribution" DECIMAL(65,30) NOT NULL,
    "employerContribution" DECIMAL(65,30) NOT NULL,
    "totalContribution" DECIMAL(65,30) NOT NULL,
    "status" "IndiaESIRecordStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaESIRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaTDSConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tanNumber" TEXT NOT NULL,
    "panNumber" TEXT,
    "assessmentYear" TEXT NOT NULL,
    "defaultRegime" TEXT NOT NULL DEFAULT 'NEW',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaTDSConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaTDSDeclaration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "taxRegime" TEXT NOT NULL DEFAULT 'NEW',
    "annualGrossSalary" DECIMAL(65,30) NOT NULL,
    "annualTaxableIncome" DECIMAL(65,30) NOT NULL,
    "hraExemption" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ltaExemption" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "otherExemptions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80C" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80CCD1B" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80D" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section80E" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "section24B" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "standardDeduction" DECIMAL(65,30) NOT NULL DEFAULT 75000,
    "otherDeductions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxableIncomeAfterDeductions" DECIMAL(65,30) NOT NULL,
    "taxBeforeRebate" DECIMAL(65,30) NOT NULL,
    "rebateUnder87A" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAfterRebate" DECIMAL(65,30) NOT NULL,
    "cess" DECIMAL(65,30) NOT NULL,
    "totalTaxLiability" DECIMAL(65,30) NOT NULL,
    "monthlyTDS" DECIMAL(65,30) NOT NULL,
    "status" "TDSDeclarationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaTDSDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaProfessionalTaxConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "ptRegistrationNumber" TEXT NOT NULL,
    "ptCircle" TEXT,
    "slabs" JSONB NOT NULL,
    "maxAnnualTax" DECIMAL(65,30) NOT NULL DEFAULT 2500,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaProfessionalTaxConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaProfessionalTaxDeduction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deductionMonth" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "grossSalary" DECIMAL(65,30) NOT NULL,
    "taxAmount" DECIMAL(65,30) NOT NULL,
    "isFebruaryAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "status" "PTDeductionStatus" NOT NULL DEFAULT 'DEDUCTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndiaProfessionalTaxDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedByName" TEXT,
    "previousState" JSONB,
    "newState" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "message" TEXT NOT NULL,
    "messageAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceAuditLog_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 12: NEW TABLES - Employee Document, Asset, Employment History, Position
-- ============================================================================

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "documentTypeId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentNumber" TEXT,
    "category" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "expiryAlertDays" INTEGER NOT NULL DEFAULT 30,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "description" TEXT,
    "tags" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "modelNumber" TEXT,
    "manufacturer" TEXT,
    "brand" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(15,2),
    "currentValue" DECIMAL(15,2),
    "depreciationRate" DOUBLE PRECISION,
    "salvageValue" DECIMAL(15,2),
    "locationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "condition" TEXT,
    "warrantyStartDate" TIMESTAMP(3),
    "warrantyEndDate" TIMESTAMP(3),
    "warrantyProvider" TEXT,
    "currentEmployeeId" TEXT,
    "currentAssignedAt" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "maintenanceInterval" INTEGER,
    "tags" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedDate" TIMESTAMP(3),
    "expectedReturnDate" TIMESTAMP(3),
    "conditionAtAssignment" TEXT,
    "conditionAtReturn" TEXT,
    "assignedBy" TEXT NOT NULL,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "returnedBy" TEXT,
    "assignmentNotes" TEXT,
    "returnNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "serviceProvider" TEXT,
    "cost" DECIMAL(15,2),
    "invoiceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "depreciationRate" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "previousDepartmentId" TEXT,
    "previousPositionId" TEXT,
    "previousJobProfileId" TEXT,
    "previousGradeId" TEXT,
    "previousLocationId" TEXT,
    "previousManagerId" TEXT,
    "previousSalary" DECIMAL(15,2),
    "previousEmploymentType" TEXT,
    "newDepartmentId" TEXT,
    "newPositionId" TEXT,
    "newJobProfileId" TEXT,
    "newGradeId" TEXT,
    "newLocationId" TEXT,
    "newManagerId" TEXT,
    "newSalary" DECIMAL(15,2),
    "newEmploymentType" TEXT,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "positionCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "locationId" TEXT,
    "reportsToPositionId" TEXT,
    "jobProfileId" TEXT,
    "gradeId" TEXT,
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "fte" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "filledCount" INTEGER NOT NULL DEFAULT 0,
    "vacantCount" INTEGER NOT NULL DEFAULT 0,
    "salaryMin" DECIMAL(15,2),
    "salaryMax" DECIMAL(15,2),
    "salaryCurrency" TEXT DEFAULT 'USD',
    "annualBudget" DECIMAL(15,2),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3),
    "closedDate" TIMESTAMP(3),
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "addressId" TEXT,
    "employeeStatusId" TEXT,
    "employmentTypeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 13: NEW TABLES - Life Events, ID Cards, Letters, Exit, Probation, Confirmation
-- ============================================================================

-- CreateTable
CREATE TABLE "EmployeeLifeEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "relatedPersonName" TEXT,
    "relatedPersonRelation" TEXT,
    "documentUrl" TEXT,
    "documentType" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "impactsPayroll" BOOLEAN NOT NULL DEFAULT false,
    "impactsBenefits" BOOLEAN NOT NULL DEFAULT false,
    "impactsTax" BOOLEAN NOT NULL DEFAULT false,
    "impactsEmergencyContact" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "notifyHR" BOOLEAN NOT NULL DEFAULT true,
    "notifyManager" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "EmployeeLifeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeEventType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "impactsPayroll" BOOLEAN NOT NULL DEFAULT false,
    "impactsBenefits" BOOLEAN NOT NULL DEFAULT false,
    "impactsTax" BOOLEAN NOT NULL DEFAULT false,
    "notifyHR" BOOLEAN NOT NULL DEFAULT true,
    "notifyManager" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeEventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IDCardTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cardType" TEXT NOT NULL,
    "designData" JSONB NOT NULL,
    "logoUrl" TEXT,
    "backgroundUrl" TEXT,
    "includePhoto" BOOLEAN NOT NULL DEFAULT true,
    "includeQRCode" BOOLEAN NOT NULL DEFAULT true,
    "includeBarcode" BOOLEAN NOT NULL DEFAULT false,
    "customFields" JSONB,
    "validityDays" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "IDCardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IDCard" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "photoUrl" TEXT,
    "qrCodeData" TEXT,
    "barcodeData" TEXT,
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "printedCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "IDCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "letterType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "letterType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "generatedPdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "exitType" TEXT NOT NULL,
    "resignationDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDate" TIMESTAMP(3) NOT NULL,
    "noticePeriodDays" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clearanceStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "settlementAmount" DECIMAL(15,2),
    "rehireEligible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitClearance" (
    "id" TEXT NOT NULL,
    "exitRequestId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clearedBy" TEXT,
    "clearedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationTracking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "extendedEndDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "performanceRating" TEXT,
    "managerRecommendation" TEXT,
    "hrRecommendation" TEXT,
    "finalDecision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationReview" (
    "id" TEXT NOT NULL,
    "probationId" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "performanceRating" INTEGER NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmationRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eligibleDate" TIMESTAMP(3) NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "managerApproval" TEXT,
    "hrApproval" TEXT,
    "confirmationDate" TIMESTAMP(3),
    "confirmationLetterUrl" TEXT,
    "newSalary" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfirmationRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 14: NEW TABLES - Analytics & Intelligence
-- ============================================================================

-- CreateTable
CREATE TABLE "ReportDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "filters" JSONB,
    "groupBy" JSONB,
    "sortBy" JSONB,
    "chartType" TEXT,
    "chartConfig" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "sharedWith" JSONB,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExecution" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "executedBy" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parameters" JSONB,
    "status" TEXT NOT NULL,
    "recordCount" INTEGER,
    "executionTime" INTEGER,
    "errorMessage" TEXT,
    "resultData" JSONB,
    "exportUrl" TEXT,
    "exportFormat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dashboardId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "refreshInterval" INTEGER,
    "config" JSONB NOT NULL,
    "position" JSONB NOT NULL,
    "roles" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictiveModel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelType" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "trainingDataset" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "targetVariable" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "trainedAt" TIMESTAMP(3),
    "trainingRecords" INTEGER,
    "modelArtifactUrl" TEXT,
    "parameters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "deployedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictiveModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "predictedValue" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION,
    "predictedDate" TIMESTAMP(3) NOT NULL,
    "inputFeatures" JSONB NOT NULL,
    "actualValue" DOUBLE PRECISION,
    "actualDate" TIMESTAMP(3),
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAgentConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "agentType" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAgentConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAgentMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" INTEGER,
    "model" TEXT,
    "actionTaken" TEXT,
    "actionResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAgentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsCache" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "recordCount" INTEGER,

    CONSTRAINT "AnalyticsCache_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 15: NEW TABLES - Benefits Management
-- ============================================================================

-- CreateTable
CREATE TABLE "BenefitPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "category" "BenefitCategory" NOT NULL,
    "planTier" "PlanTier",
    "carrierName" TEXT NOT NULL,
    "carrierPolicyNumber" TEXT,
    "description" TEXT,
    "coverage" JSONB,
    "exclusions" JSONB,
    "eligibilityCriteria" JSONB,
    "employeePremium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employerPremium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spousePremium" DOUBLE PRECISION,
    "childPremium" DOUBLE PRECISION,
    "familyPremium" DOUBLE PRECISION,
    "deductible" DOUBLE PRECISION,
    "outOfPocketMax" DOUBLE PRECISION,
    "copay" DOUBLE PRECISION,
    "coinsurance" DOUBLE PRECISION,
    "networkInfo" JSONB,
    "documentUrls" JSONB,
    "status" "BenefitPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "waitingPeriodDays" INTEGER NOT NULL DEFAULT 0,
    "isEmployeeContribution" BOOLEAN NOT NULL DEFAULT true,
    "maxAge" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenefitPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitEnrollment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "departmentId" TEXT,
    "departmentName" TEXT,
    "planId" TEXT NOT NULL,
    "coverageLevel" "CoverageLevel" NOT NULL,
    "enrollmentType" "BenefitEnrollmentType" NOT NULL,
    "status" "BenefitEnrollmentStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "employeePremium" DOUBLE PRECISION NOT NULL,
    "employerPremium" DOUBLE PRECISION NOT NULL,
    "totalPremium" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" "PremiumPaymentFrequency" NOT NULL DEFAULT 'MONTHLY',
    "enrolledDependents" JSONB,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "qualifyingEventId" TEXT,
    "qualifyingEventType" "QualifyingEventType",
    "previousPlanId" TEXT,
    "cancellationReason" TEXT,
    "cancellationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenefitEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "relationship" "DependentRelationship" NOT NULL,
    "gender" TEXT,
    "ssn" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "isStudent" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "DependentStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verificationDocuments" JSONB,
    "verifiedBy" TEXT,
    "verifiedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitClaim" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "planId" TEXT,
    "planName" TEXT,
    "claimType" "BenefitCategory" NOT NULL,
    "claimDate" TIMESTAMP(3) NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "providerId" TEXT,
    "providerName" TEXT,
    "claimAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "paidAmount" DOUBLE PRECISION,
    "employeeResponsibility" DOUBLE PRECISION,
    "deductibleApplied" DOUBLE PRECISION,
    "coinsuranceApplied" DOUBLE PRECISION,
    "copayApplied" DOUBLE PRECISION,
    "status" "ClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "checkNumber" TEXT,
    "rejectionReason" TEXT,
    "documents" JSONB,
    "diagnosisCodes" JSONB,
    "procedureCodes" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenefitClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthcareProvider" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "specialty" TEXT,
    "npiNumber" TEXT,
    "taxId" TEXT,
    "address" JSONB NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "networkStatus" TEXT,
    "acceptingNewPatients" BOOLEAN NOT NULL DEFAULT true,
    "languages" JSONB,
    "officeHours" JSONB,
    "rating" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthcareProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualifyingEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "eventType" "QualifyingEventType" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "supportingDocuments" JSONB,
    "allowsEnrollment" BOOLEAN NOT NULL DEFAULT true,
    "enrollmentDeadline" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verifiedDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualifyingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentWindow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "windowName" TEXT NOT NULL,
    "windowType" TEXT NOT NULL,
    "planYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "eligibleCategories" JSONB,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "coverageLevel" "CoverageLevel" NOT NULL,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "employeePremium" DOUBLE PRECISION NOT NULL,
    "employerPremium" DOUBLE PRECISION NOT NULL,
    "totalPremium" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumDeduction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollPeriodId" TEXT,
    "payrollDate" TIMESTAMP(3) NOT NULL,
    "deductionAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumDeduction_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 16: NEW TABLES - Gap Closure Models
-- ============================================================================

-- CreateTable
CREATE TABLE "TaxDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "amendments" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContinuousFeedback" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toEmployeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "relatedGoalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContinuousFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recognition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "coreValue" TEXT,
    "badgeType" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneOnOneMeeting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "recurring" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneOnOneMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneOnOneNote" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneOnOneNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneOnOneActionItem" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneOnOneActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "duration" INTEGER,
    "modules" JSONB NOT NULL,
    "skills" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathEnrollment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "LearningPathEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPosition" DOUBLE PRECISION,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pathId" TEXT,
    "questions" JSONB NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSubmission" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "headers" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 3,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "responseTime" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataSource" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "filters" JSONB,
    "chartType" TEXT,
    "schedule" JSONB,
    "createdBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "triggerEvent" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "currentNode" TEXT,
    "context" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "triggeredBy" TEXT NOT NULL,

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTimeEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "date" DATE NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeofenceLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeofenceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseClaim" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "receiptUrl" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garnishment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "caseNumber" TEXT,
    "courtOrder" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "amountType" TEXT NOT NULL,
    "maxAmount" DECIMAL(65,30),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "totalDeducted" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "payeeInfo" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garnishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSAFSAAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "yearToDateContributions" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "annualLimit" DECIMAL(65,30) NOT NULL,
    "investmentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cashBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "planYear" INTEGER NOT NULL,
    "contributionAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "contributionFrequency" TEXT NOT NULL DEFAULT 'PER_PAYCHECK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HSAFSAAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSAFSATransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HSAFSATransaction_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 17: NEW TABLES - Recruitment & Onboarding
-- ============================================================================

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "linkedinUrl" TEXT,
    "resumeUrl" TEXT,
    "source" TEXT,
    "skills" TEXT[],
    "experience" JSONB,
    "education" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateApplication" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "currentStage" TEXT NOT NULL DEFAULT 'applied',
    "source" TEXT,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallRating" DOUBLE PRECISION,
    "notes" TEXT,
    "resumeUrl" TEXT,
    "coverLetter" TEXT,
    "rejectionReason" TEXT,
    "rejectionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "meetingLink" TEXT,
    "interviewerIds" TEXT[],
    "interviewerNames" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "feedbackSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "overallRating" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewFeedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendation" TEXT,
    "comments" TEXT,
    "criteria" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "salary" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "bonus" DECIMAL(65,30),
    "equity" TEXT,
    "benefits" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "sentDate" TIMESTAMP(3),
    "sentBy" TEXT,
    "acceptedDate" TIMESTAMP(3),
    "declinedDate" TIMESTAMP(3),
    "declineReason" TEXT,
    "expiryDate" TIMESTAMP(3),
    "offerLetterUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundCheck" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "applicationId" TEXT,
    "candidateId" TEXT,
    "employeeId" TEXT,
    "checkType" TEXT NOT NULL,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3),
    "result" TEXT,
    "findings" JSONB,
    "documentUrl" TEXT,
    "notes" TEXT,
    "initiatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequisition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numberOfPositions" INTEGER NOT NULL DEFAULT 1,
    "employmentType" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "location" TEXT,
    "salaryRange" JSONB,
    "requiredSkills" TEXT[],
    "description" TEXT,
    "justification" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'Pending',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "closedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgram" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "programCode" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "position" TEXT,
    "grade" TEXT,
    "employeeType" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT true,
    "durationDays" INTEGER NOT NULL DEFAULT 90,
    "phases" JSONB,
    "checklistTemplate" JSONB,
    "documentsRequired" JSONB,
    "equipmentRequired" JSONB,
    "accessRequired" JSONB,
    "trainingModules" JSONB,
    "buddyRequired" BOOLEAN NOT NULL DEFAULT false,
    "surveySchedule" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingInstance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "programId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3),
    "managerId" TEXT,
    "buddyId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "overdueTasks" INTEGER NOT NULL DEFAULT 0,
    "currentPhase" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "phase" TEXT,
    "responsibleParty" TEXT,
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "completedBy" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 18: NEW TABLES - Performance Management
-- ============================================================================

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewCycleId" TEXT,
    "reviewerId" TEXT,
    "reviewType" TEXT NOT NULL DEFAULT 'annual',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "selfRating" DOUBLE PRECISION,
    "managerRating" DOUBLE PRECISION,
    "finalRating" DOUBLE PRECISION,
    "selfComments" TEXT,
    "managerComments" TEXT,
    "strengths" JSONB,
    "improvements" JSONB,
    "goals" JSONB,
    "competencies" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewCycle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL DEFAULT 'annual',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "selfReviewStart" TIMESTAMP(3),
    "selfReviewEnd" TIMESTAMP(3),
    "managerReviewStart" TIMESTAMP(3),
    "managerReviewEnd" TIMESTAMP(3),
    "calibrationStart" TIMESTAMP(3),
    "calibrationEnd" TIMESTAMP(3),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceGoal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewCycleId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "type" TEXT NOT NULL DEFAULT 'individual',
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "targetValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "unit" TEXT,
    "weight" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "parentGoalId" TEXT,
    "alignedTo" TEXT,
    "metrics" JSONB,
    "milestones" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL,
    "reviewCycleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "facilitatorId" TEXT,
    "department" TEXT,
    "participants" TEXT[],
    "adjustments" JSONB,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryComponent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "componentCode" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "componentType" TEXT NOT NULL DEFAULT 'earning',
    "calculationType" TEXT NOT NULL DEFAULT 'fixed',
    "percentage" DOUBLE PRECISION,
    "amount" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "isStatutory" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationBand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bandName" TEXT NOT NULL,
    "gradeId" TEXT,
    "minSalary" DECIMAL(65,30) NOT NULL,
    "midSalary" DECIMAL(65,30),
    "maxSalary" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompensationBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncrementCycle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "budgetAmount" DECIMAL(65,30),
    "budgetPercentage" DOUBLE PRECISION,
    "eligibilityCriteria" JSONB,
    "approvalWorkflow" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncrementCycle_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 19: NEW TABLES - Notifications
-- ============================================================================

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "targetType" TEXT NOT NULL DEFAULT 'all',
    "targetValue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'push',

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 20: NEW TABLES - Learning & Development
-- ============================================================================

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "type" TEXT NOT NULL DEFAULT 'online',
    "duration" INTEGER,
    "instructor" TEXT,
    "thumbnailUrl" TEXT,
    "contentUrl" TEXT,
    "modules" JSONB,
    "skills" TEXT[],
    "prerequisites" TEXT[],
    "maxEnrollment" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "rating" DOUBLE PRECISION,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "certificateId" TEXT,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'classroom',
    "courseId" TEXT,
    "instructor" TEXT,
    "location" TEXT,
    "meetingUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "materials" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAttendee" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "feedback" TEXT,
    "rating" INTEGER,

    CONSTRAINT "SessionAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingBody" TEXT,
    "certificationId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "credentialUrl" TEXT,
    "documentUrl" TEXT,
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentoringProgram" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "goals" JSONB,
    "notes" TEXT,
    "meetingFrequency" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentoringProgram_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- PART 21: UNIQUE CONSTRAINTS
-- ============================================================================

-- CreateIndex (Unique)
CREATE UNIQUE INDEX "MFASecret_userId_key" ON "MFASecret"("userId");
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE UNIQUE INDEX "Shift_tenantId_code_key" ON "Shift"("tenantId", "code");
CREATE UNIQUE INDEX "ShiftRoster_tenantId_employeeId_rosterDate_key" ON "ShiftRoster"("tenantId", "employeeId", "rosterDate");
CREATE UNIQUE INDEX "CompetencyCategory_code_key" ON "CompetencyCategory"("code");
CREATE UNIQUE INDEX "CompetencySubcategory_code_key" ON "CompetencySubcategory"("code");
CREATE UNIQUE INDEX "CompetencyCatalog_code_key" ON "CompetencyCatalog"("code");
CREATE UNIQUE INDEX "CompetencyProficiencyDescriptor_competencyId_levelId_key" ON "CompetencyProficiencyDescriptor"("competencyId", "levelId");
CREATE UNIQUE INDEX "CompetencyRelation_sourceCompetencyId_relatedCompetencyId_key" ON "CompetencyRelation"("sourceCompetencyId", "relatedCompetencyId");
CREATE UNIQUE INDEX "ProficiencyFramework_code_key" ON "ProficiencyFramework"("code");
CREATE UNIQUE INDEX "ProficiencyLevel_frameworkId_code_key" ON "ProficiencyLevel"("frameworkId", "code");
CREATE UNIQUE INDEX "ProficiencyLevel_frameworkId_levelNumber_key" ON "ProficiencyLevel"("frameworkId", "levelNumber");
CREATE UNIQUE INDEX "JobRole_code_key" ON "JobRole"("code");
CREATE UNIQUE INDEX "JobCompetencyMapping_jobRoleId_competencyId_key" ON "JobCompetencyMapping"("jobRoleId", "competencyId");
CREATE UNIQUE INDEX "SkillAssessment_code_key" ON "SkillAssessment"("code");
CREATE UNIQUE INDEX "GapAnalysis_code_key" ON "GapAnalysis"("code");
CREATE UNIQUE INDEX "DevelopmentPlan_code_key" ON "DevelopmentPlan"("code");
CREATE UNIQUE INDEX "LabourLawConfig_countryCode_effectiveFrom_key" ON "LabourLawConfig"("countryCode", "effectiveFrom");
CREATE UNIQUE INDEX "WPSConfiguration_tenantId_companyId_key" ON "WPSConfiguration"("tenantId", "companyId");
CREATE UNIQUE INDEX "WPSSubmission_tenantId_payrollRunId_key" ON "WPSSubmission"("tenantId", "payrollRunId");
CREATE UNIQUE INDEX "WPSRecord_submissionId_employeeId_key" ON "WPSRecord"("submissionId", "employeeId");
CREATE UNIQUE INDEX "GOSIConfiguration_tenantId_companyId_key" ON "GOSIConfiguration"("tenantId", "companyId");
CREATE UNIQUE INDEX "NitaqatConfiguration_tenantId_companyId_key" ON "NitaqatConfiguration"("tenantId", "companyId");
CREATE UNIQUE INDEX "EmployeeComplianceDetails_employeeId_key" ON "EmployeeComplianceDetails"("employeeId");
CREATE UNIQUE INDEX "PayrollConfiguration_tenantId_companyId_key" ON "PayrollConfiguration"("tenantId", "companyId");
CREATE UNIQUE INDEX "PayrollRun_tenantId_configId_payrollMonth_key" ON "PayrollRun"("tenantId", "configId", "payrollMonth");
CREATE UNIQUE INDEX "TaxDeclaration_tenantId_employeeId_financialYear_key" ON "TaxDeclaration"("tenantId", "employeeId", "financialYear");
CREATE UNIQUE INDEX "LeavePolicy_tenantId_code_key" ON "LeavePolicy"("tenantId", "code");
CREATE UNIQUE INDEX "LeaveBalance_employeeId_policyId_leaveYear_key" ON "LeaveBalance"("employeeId", "policyId", "leaveYear");
CREATE UNIQUE INDEX "LeaveCarryForward_employeeId_policyId_fromYear_toYear_key" ON "LeaveCarryForward"("employeeId", "policyId", "fromYear", "toYear");
CREATE UNIQUE INDEX "Translation_tenantId_locale_namespace_key_key" ON "Translation"("tenantId", "locale", "namespace", "key");
CREATE UNIQUE INDEX "LocalizationConfig_tenantId_key" ON "LocalizationConfig"("tenantId");
CREATE UNIQUE INDEX "IndiaPFConfiguration_tenantId_companyId_key" ON "IndiaPFConfiguration"("tenantId", "companyId");
CREATE UNIQUE INDEX "IndiaESIConfiguration_tenantId_companyId_key" ON "IndiaESIConfiguration"("tenantId", "companyId");
CREATE UNIQUE INDEX "IndiaTDSConfiguration_tenantId_companyId_assessmentYear_key" ON "IndiaTDSConfiguration"("tenantId", "companyId", "assessmentYear");
CREATE UNIQUE INDEX "IndiaTDSDeclaration_employeeId_financialYear_key" ON "IndiaTDSDeclaration"("employeeId", "financialYear");
CREATE UNIQUE INDEX "IndiaProfessionalTaxConfig_tenantId_companyId_stateCode_key" ON "IndiaProfessionalTaxConfig"("tenantId", "companyId", "stateCode");
CREATE UNIQUE INDEX "IndiaProfessionalTaxDeduction_employeeId_deductionMonth_key" ON "IndiaProfessionalTaxDeduction"("employeeId", "deductionMonth");
CREATE UNIQUE INDEX "AssetCategory_code_key" ON "AssetCategory"("code");
CREATE UNIQUE INDEX "Asset_tenantId_assetCode_key" ON "Asset"("tenantId", "assetCode");
CREATE UNIQUE INDEX "Position_tenantId_positionCode_key" ON "Position"("tenantId", "positionCode");
CREATE UNIQUE INDEX "LifeEventType_tenantId_code_key" ON "LifeEventType"("tenantId", "code");
CREATE UNIQUE INDEX "IDCardTemplate_tenantId_name_key" ON "IDCardTemplate"("tenantId", "name");
CREATE UNIQUE INDEX "IDCard_tenantId_cardNumber_key" ON "IDCard"("tenantId", "cardNumber");
CREATE UNIQUE INDEX "LetterTemplate_tenantId_name_key" ON "LetterTemplate"("tenantId", "name");
CREATE UNIQUE INDEX "ReportDefinition_tenantId_code_key" ON "ReportDefinition"("tenantId", "code");
CREATE UNIQUE INDEX "DashboardWidget_tenantId_code_key" ON "DashboardWidget"("tenantId", "code");
CREATE UNIQUE INDEX "PredictiveModel_tenantId_code_key" ON "PredictiveModel"("tenantId", "code");
CREATE UNIQUE INDEX "AnalyticsCache_tenantId_cacheKey_key" ON "AnalyticsCache"("tenantId", "cacheKey");
CREATE UNIQUE INDEX "BenefitPlan_tenantId_planCode_key" ON "BenefitPlan"("tenantId", "planCode");
CREATE UNIQUE INDEX "BenefitClaim_tenantId_claimNumber_key" ON "BenefitClaim"("tenantId", "claimNumber");
CREATE UNIQUE INDEX "HealthcareProvider_tenantId_providerCode_key" ON "HealthcareProvider"("tenantId", "providerCode");
CREATE UNIQUE INDEX "TaxDocument_tenantId_employeeId_type_taxYear_key" ON "TaxDocument"("tenantId", "employeeId", "type", "taxYear");
CREATE UNIQUE INDEX "LearningPathEnrollment_pathId_employeeId_key" ON "LearningPathEnrollment"("pathId", "employeeId");
CREATE UNIQUE INDEX "LearningProgress_employeeId_contentId_key" ON "LearningProgress"("employeeId", "contentId");
CREATE UNIQUE INDEX "APIKey_keyHash_key" ON "APIKey"("keyHash");
CREATE UNIQUE INDEX "HSAFSAAccount_employeeId_accountType_planYear_key" ON "HSAFSAAccount"("employeeId", "accountType", "planYear");
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");
CREATE UNIQUE INDEX "ProjectTimeEntry_employeeId_projectId_date_key" ON "ProjectTimeEntry"("employeeId", "projectId", "date");
CREATE UNIQUE INDEX "OnboardingProgram_tenantId_programCode_key" ON "OnboardingProgram"("tenantId", "programCode");
CREATE UNIQUE INDEX "SalaryComponent_tenantId_componentCode_key" ON "SalaryComponent"("tenantId", "componentCode");
CREATE UNIQUE INDEX "CourseEnrollment_courseId_employeeId_key" ON "CourseEnrollment"("courseId", "employeeId");
CREATE UNIQUE INDEX "SessionAttendee_sessionId_employeeId_key" ON "SessionAttendee"("sessionId", "employeeId");

-- ============================================================================
-- PART 22: INDEXES
-- ============================================================================

-- MFASecret
CREATE INDEX "MFASecret_userId_idx" ON "MFASecret"("userId");

-- RefreshToken
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- AttendancePunch
CREATE INDEX "AttendancePunch_tenantId_idx" ON "AttendancePunch"("tenantId");
CREATE INDEX "AttendancePunch_employeeId_idx" ON "AttendancePunch"("employeeId");
CREATE INDEX "AttendancePunch_punchDate_idx" ON "AttendancePunch"("punchDate");
CREATE INDEX "AttendancePunch_punchType_idx" ON "AttendancePunch"("punchType");

-- AttendanceRecord
CREATE INDEX "AttendanceRecord_tenantId_idx" ON "AttendanceRecord"("tenantId");
CREATE INDEX "AttendanceRecord_employeeId_idx" ON "AttendanceRecord"("employeeId");
CREATE INDEX "AttendanceRecord_date_idx" ON "AttendanceRecord"("date");
CREATE INDEX "AttendanceRecord_status_idx" ON "AttendanceRecord"("status");
CREATE INDEX "AttendanceRecord_approvalStatus_idx" ON "AttendanceRecord"("approvalStatus");

-- Shift
CREATE INDEX "Shift_tenantId_idx" ON "Shift"("tenantId");
CREATE INDEX "Shift_isActive_idx" ON "Shift"("isActive");

-- ShiftAssignment
CREATE INDEX "ShiftAssignment_tenantId_idx" ON "ShiftAssignment"("tenantId");
CREATE INDEX "ShiftAssignment_employeeId_idx" ON "ShiftAssignment"("employeeId");
CREATE INDEX "ShiftAssignment_shiftId_idx" ON "ShiftAssignment"("shiftId");
CREATE INDEX "ShiftAssignment_isActive_idx" ON "ShiftAssignment"("isActive");

-- ShiftRoster
CREATE INDEX "ShiftRoster_tenantId_idx" ON "ShiftRoster"("tenantId");
CREATE INDEX "ShiftRoster_employeeId_idx" ON "ShiftRoster"("employeeId");
CREATE INDEX "ShiftRoster_rosterDate_idx" ON "ShiftRoster"("rosterDate");

-- ShiftSwapRequest
CREATE INDEX "ShiftSwapRequest_tenantId_idx" ON "ShiftSwapRequest"("tenantId");
CREATE INDEX "ShiftSwapRequest_requestorId_idx" ON "ShiftSwapRequest"("requestorId");
CREATE INDEX "ShiftSwapRequest_status_idx" ON "ShiftSwapRequest"("status");

-- OvertimeRequest
CREATE INDEX "OvertimeRequest_tenantId_idx" ON "OvertimeRequest"("tenantId");
CREATE INDEX "OvertimeRequest_employeeId_idx" ON "OvertimeRequest"("employeeId");
CREATE INDEX "OvertimeRequest_status_idx" ON "OvertimeRequest"("status");
CREATE INDEX "OvertimeRequest_overtimeDate_idx" ON "OvertimeRequest"("overtimeDate");

-- AttendanceRegularization
CREATE INDEX "AttendanceRegularization_tenantId_idx" ON "AttendanceRegularization"("tenantId");
CREATE INDEX "AttendanceRegularization_employeeId_idx" ON "AttendanceRegularization"("employeeId");
CREATE INDEX "AttendanceRegularization_status_idx" ON "AttendanceRegularization"("status");

-- CompOffRequest
CREATE INDEX "CompOffRequest_tenantId_idx" ON "CompOffRequest"("tenantId");
CREATE INDEX "CompOffRequest_employeeId_idx" ON "CompOffRequest"("employeeId");
CREATE INDEX "CompOffRequest_status_idx" ON "CompOffRequest"("status");

-- CompetencyCategory
CREATE INDEX "CompetencyCategory_status_idx" ON "CompetencyCategory"("status");

-- CompetencySubcategory
CREATE INDEX "CompetencySubcategory_categoryId_idx" ON "CompetencySubcategory"("categoryId");

-- CompetencyCatalog
CREATE INDEX "CompetencyCatalog_categoryId_idx" ON "CompetencyCatalog"("categoryId");
CREATE INDEX "CompetencyCatalog_subcategoryId_idx" ON "CompetencyCatalog"("subcategoryId");
CREATE INDEX "CompetencyCatalog_status_idx" ON "CompetencyCatalog"("status");

-- CompetencyProficiencyDescriptor
CREATE INDEX "CompetencyProficiencyDescriptor_competencyId_idx" ON "CompetencyProficiencyDescriptor"("competencyId");

-- CompetencyRelation
CREATE INDEX "CompetencyRelation_sourceCompetencyId_idx" ON "CompetencyRelation"("sourceCompetencyId");

-- CompetencyRoleMapping
CREATE INDEX "CompetencyRoleMapping_competencyId_idx" ON "CompetencyRoleMapping"("competencyId");

-- CompetencyAssessmentCriteria
CREATE INDEX "CompetencyAssessmentCriteria_competencyId_idx" ON "CompetencyAssessmentCriteria"("competencyId");

-- CompetencyDevelopmentResource
CREATE INDEX "CompetencyDevelopmentResource_competencyId_idx" ON "CompetencyDevelopmentResource"("competencyId");

-- ProficiencyFramework
CREATE INDEX "ProficiencyFramework_status_idx" ON "ProficiencyFramework"("status");

-- ProficiencyLevel
CREATE INDEX "ProficiencyLevel_frameworkId_idx" ON "ProficiencyLevel"("frameworkId");

-- JobRole
CREATE INDEX "JobRole_departmentId_idx" ON "JobRole"("departmentId");
CREATE INDEX "JobRole_status_idx" ON "JobRole"("status");

-- JobCompetencyMapping
CREATE INDEX "JobCompetencyMapping_jobRoleId_idx" ON "JobCompetencyMapping"("jobRoleId");
CREATE INDEX "JobCompetencyMapping_competencyId_idx" ON "JobCompetencyMapping"("competencyId");

-- SkillAssessment
CREATE INDEX "SkillAssessment_status_idx" ON "SkillAssessment"("status");
CREATE INDEX "SkillAssessment_employeeId_idx" ON "SkillAssessment"("employeeId");
CREATE INDEX "SkillAssessment_jobRoleId_idx" ON "SkillAssessment"("jobRoleId");

-- SkillAssessmentCompetency
CREATE INDEX "SkillAssessmentCompetency_assessmentId_idx" ON "SkillAssessmentCompetency"("assessmentId");

-- SkillAssessmentResult
CREATE INDEX "SkillAssessmentResult_assessmentId_idx" ON "SkillAssessmentResult"("assessmentId");
CREATE INDEX "SkillAssessmentResult_competencyId_idx" ON "SkillAssessmentResult"("competencyId");

-- GapAnalysis
CREATE INDEX "GapAnalysis_status_idx" ON "GapAnalysis"("status");

-- GapAnalysisItem
CREATE INDEX "GapAnalysisItem_gapAnalysisId_idx" ON "GapAnalysisItem"("gapAnalysisId");

-- DevelopmentPlan
CREATE INDEX "DevelopmentPlan_status_idx" ON "DevelopmentPlan"("status");

-- DevelopmentActivity
CREATE INDEX "DevelopmentActivity_developmentPlanId_idx" ON "DevelopmentActivity"("developmentPlanId");

-- DevelopmentMilestone
CREATE INDEX "DevelopmentMilestone_developmentPlanId_idx" ON "DevelopmentMilestone"("developmentPlanId");

-- LabourLawConfig
CREATE INDEX "LabourLawConfig_countryCode_idx" ON "LabourLawConfig"("countryCode");
CREATE INDEX "LabourLawConfig_status_idx" ON "LabourLawConfig"("status");

-- WPSConfiguration
CREATE INDEX "WPSConfiguration_tenantId_idx" ON "WPSConfiguration"("tenantId");
CREATE INDEX "WPSConfiguration_companyId_idx" ON "WPSConfiguration"("companyId");
CREATE INDEX "WPSConfiguration_isActive_idx" ON "WPSConfiguration"("isActive");

-- WPSSubmission
CREATE INDEX "WPSSubmission_tenantId_idx" ON "WPSSubmission"("tenantId");
CREATE INDEX "WPSSubmission_wpsConfigId_idx" ON "WPSSubmission"("wpsConfigId");
CREATE INDEX "WPSSubmission_payrollRunId_idx" ON "WPSSubmission"("payrollRunId");
CREATE INDEX "WPSSubmission_payrollMonth_idx" ON "WPSSubmission"("payrollMonth");
CREATE INDEX "WPSSubmission_status_idx" ON "WPSSubmission"("status");
CREATE INDEX "WPSSubmission_submissionDate_idx" ON "WPSSubmission"("submissionDate");
CREATE INDEX "WPSSubmission_createdAt_idx" ON "WPSSubmission"("createdAt");

-- WPSRecord
CREATE INDEX "WPSRecord_tenantId_idx" ON "WPSRecord"("tenantId");
CREATE INDEX "WPSRecord_submissionId_idx" ON "WPSRecord"("submissionId");
CREATE INDEX "WPSRecord_employeeId_idx" ON "WPSRecord"("employeeId");
CREATE INDEX "WPSRecord_status_idx" ON "WPSRecord"("status");
CREATE INDEX "WPSRecord_labourCardNumber_idx" ON "WPSRecord"("labourCardNumber");
CREATE INDEX "WPSRecord_lineNumber_idx" ON "WPSRecord"("lineNumber");

-- WPSAuditLog
CREATE INDEX "WPSAuditLog_tenantId_idx" ON "WPSAuditLog"("tenantId");
CREATE INDEX "WPSAuditLog_submissionId_idx" ON "WPSAuditLog"("submissionId");
CREATE INDEX "WPSAuditLog_recordId_idx" ON "WPSAuditLog"("recordId");
CREATE INDEX "WPSAuditLog_action_idx" ON "WPSAuditLog"("action");
CREATE INDEX "WPSAuditLog_userId_idx" ON "WPSAuditLog"("userId");
CREATE INDEX "WPSAuditLog_timestamp_idx" ON "WPSAuditLog"("timestamp");

-- GOSIConfiguration
CREATE INDEX "GOSIConfiguration_tenantId_idx" ON "GOSIConfiguration"("tenantId");

-- GOSISubmission
CREATE INDEX "GOSISubmission_tenantId_idx" ON "GOSISubmission"("tenantId");
CREATE INDEX "GOSISubmission_contributionMonth_idx" ON "GOSISubmission"("contributionMonth");
CREATE INDEX "GOSISubmission_status_idx" ON "GOSISubmission"("status");

-- GOSIRecord
CREATE INDEX "GOSIRecord_submissionId_idx" ON "GOSIRecord"("submissionId");
CREATE INDEX "GOSIRecord_employeeId_idx" ON "GOSIRecord"("employeeId");
CREATE INDEX "GOSIRecord_status_idx" ON "GOSIRecord"("status");

-- NitaqatConfiguration
CREATE INDEX "NitaqatConfiguration_tenantId_idx" ON "NitaqatConfiguration"("tenantId");

-- NitaqatSnapshot
CREATE INDEX "NitaqatSnapshot_configId_idx" ON "NitaqatSnapshot"("configId");
CREATE INDEX "NitaqatSnapshot_snapshotDate_idx" ON "NitaqatSnapshot"("snapshotDate");

-- EOSBCalculation
CREATE INDEX "EOSBCalculation_tenantId_idx" ON "EOSBCalculation"("tenantId");
CREATE INDEX "EOSBCalculation_employeeId_idx" ON "EOSBCalculation"("employeeId");
CREATE INDEX "EOSBCalculation_status_idx" ON "EOSBCalculation"("status");

-- EmployeeComplianceDetails
CREATE INDEX "EmployeeComplianceDetails_tenantId_idx" ON "EmployeeComplianceDetails"("tenantId");
CREATE INDEX "EmployeeComplianceDetails_employeeId_idx" ON "EmployeeComplianceDetails"("employeeId");
CREATE INDEX "EmployeeComplianceDetails_countryCode_idx" ON "EmployeeComplianceDetails"("countryCode");

-- PayrollConfiguration
CREATE INDEX "PayrollConfiguration_tenantId_idx" ON "PayrollConfiguration"("tenantId");

-- PayrollRun
CREATE INDEX "PayrollRun_tenantId_idx" ON "PayrollRun"("tenantId");
CREATE INDEX "PayrollRun_payrollMonth_idx" ON "PayrollRun"("payrollMonth");
CREATE INDEX "PayrollRun_status_idx" ON "PayrollRun"("status");

-- Payslip
CREATE INDEX "Payslip_payrollRunId_idx" ON "Payslip"("payrollRunId");
CREATE INDEX "Payslip_employeeId_idx" ON "Payslip"("employeeId");
CREATE INDEX "Payslip_status_idx" ON "Payslip"("status");

-- EmployeeSalaryStructure
CREATE INDEX "EmployeeSalaryStructure_tenantId_idx" ON "EmployeeSalaryStructure"("tenantId");
CREATE INDEX "EmployeeSalaryStructure_employeeId_idx" ON "EmployeeSalaryStructure"("employeeId");
CREATE INDEX "EmployeeSalaryStructure_effectiveFrom_idx" ON "EmployeeSalaryStructure"("effectiveFrom");
CREATE INDEX "EmployeeSalaryStructure_isActive_idx" ON "EmployeeSalaryStructure"("isActive");

-- EmployeeBenefit
CREATE INDEX "EmployeeBenefit_tenantId_idx" ON "EmployeeBenefit"("tenantId");
CREATE INDEX "EmployeeBenefit_employeeId_idx" ON "EmployeeBenefit"("employeeId");
CREATE INDEX "EmployeeBenefit_benefitType_idx" ON "EmployeeBenefit"("benefitType");
CREATE INDEX "EmployeeBenefit_status_idx" ON "EmployeeBenefit"("status");

-- TaxDeclaration
CREATE INDEX "TaxDeclaration_tenantId_idx" ON "TaxDeclaration"("tenantId");
CREATE INDEX "TaxDeclaration_employeeId_idx" ON "TaxDeclaration"("employeeId");
CREATE INDEX "TaxDeclaration_financialYear_idx" ON "TaxDeclaration"("financialYear");
CREATE INDEX "TaxDeclaration_status_idx" ON "TaxDeclaration"("status");

-- PayrollAdjustment
CREATE INDEX "PayrollAdjustment_tenantId_idx" ON "PayrollAdjustment"("tenantId");
CREATE INDEX "PayrollAdjustment_employeeId_idx" ON "PayrollAdjustment"("employeeId");
CREATE INDEX "PayrollAdjustment_payrollMonth_idx" ON "PayrollAdjustment"("payrollMonth");
CREATE INDEX "PayrollAdjustment_isProcessed_idx" ON "PayrollAdjustment"("isProcessed");
CREATE INDEX "PayrollAdjustment_approvalStatus_idx" ON "PayrollAdjustment"("approvalStatus");

-- StatutoryPayment
CREATE INDEX "StatutoryPayment_tenantId_idx" ON "StatutoryPayment"("tenantId");
CREATE INDEX "StatutoryPayment_payrollRunId_idx" ON "StatutoryPayment"("payrollRunId");
CREATE INDEX "StatutoryPayment_paymentMonth_idx" ON "StatutoryPayment"("paymentMonth");
CREATE INDEX "StatutoryPayment_statutoryType_idx" ON "StatutoryPayment"("statutoryType");
CREATE INDEX "StatutoryPayment_status_idx" ON "StatutoryPayment"("status");

-- LeavePolicy
CREATE INDEX "LeavePolicy_tenantId_idx" ON "LeavePolicy"("tenantId");
CREATE INDEX "LeavePolicy_countryCode_idx" ON "LeavePolicy"("countryCode");

-- LeaveBalance
CREATE INDEX "LeaveBalance_tenantId_idx" ON "LeaveBalance"("tenantId");
CREATE INDEX "LeaveBalance_employeeId_idx" ON "LeaveBalance"("employeeId");
CREATE INDEX "LeaveBalance_leaveYear_idx" ON "LeaveBalance"("leaveYear");

-- LeaveRequest
CREATE INDEX "LeaveRequest_tenantId_idx" ON "LeaveRequest"("tenantId");
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");
CREATE INDEX "LeaveRequest_startDate_idx" ON "LeaveRequest"("startDate");
CREATE INDEX "LeaveRequest_endDate_idx" ON "LeaveRequest"("endDate");
CREATE INDEX "LeaveRequest_appliedAt_idx" ON "LeaveRequest"("appliedAt");

-- LeaveEncashment
CREATE INDEX "LeaveEncashment_tenantId_idx" ON "LeaveEncashment"("tenantId");
CREATE INDEX "LeaveEncashment_employeeId_idx" ON "LeaveEncashment"("employeeId");
CREATE INDEX "LeaveEncashment_status_idx" ON "LeaveEncashment"("status");
CREATE INDEX "LeaveEncashment_payrollMonth_idx" ON "LeaveEncashment"("payrollMonth");

-- LeaveAccrual
CREATE INDEX "LeaveAccrual_tenantId_idx" ON "LeaveAccrual"("tenantId");
CREATE INDEX "LeaveAccrual_employeeId_idx" ON "LeaveAccrual"("employeeId");
CREATE INDEX "LeaveAccrual_policyId_idx" ON "LeaveAccrual"("policyId");
CREATE INDEX "LeaveAccrual_leaveYear_idx" ON "LeaveAccrual"("leaveYear");
CREATE INDEX "LeaveAccrual_accrualDate_idx" ON "LeaveAccrual"("accrualDate");

-- LeaveCarryForward
CREATE INDEX "LeaveCarryForward_tenantId_idx" ON "LeaveCarryForward"("tenantId");
CREATE INDEX "LeaveCarryForward_employeeId_idx" ON "LeaveCarryForward"("employeeId");
CREATE INDEX "LeaveCarryForward_toYear_idx" ON "LeaveCarryForward"("toYear");

-- CompOffEarned
CREATE INDEX "CompOffEarned_tenantId_idx" ON "CompOffEarned"("tenantId");
CREATE INDEX "CompOffEarned_employeeId_idx" ON "CompOffEarned"("employeeId");
CREATE INDEX "CompOffEarned_status_idx" ON "CompOffEarned"("status");
CREATE INDEX "CompOffEarned_workedDate_idx" ON "CompOffEarned"("workedDate");
CREATE INDEX "CompOffEarned_expiryDate_idx" ON "CompOffEarned"("expiryDate");

-- Translation
CREATE INDEX "Translation_locale_idx" ON "Translation"("locale");
CREATE INDEX "Translation_namespace_idx" ON "Translation"("namespace");

-- LocalizationConfig
CREATE INDEX "LocalizationConfig_tenantId_idx" ON "LocalizationConfig"("tenantId");

-- IndiaPFConfiguration
CREATE INDEX "IndiaPFConfiguration_tenantId_idx" ON "IndiaPFConfiguration"("tenantId");

-- IndiaPFSubmission
CREATE INDEX "IndiaPFSubmission_tenantId_idx" ON "IndiaPFSubmission"("tenantId");
CREATE INDEX "IndiaPFSubmission_contributionMonth_idx" ON "IndiaPFSubmission"("contributionMonth");
CREATE INDEX "IndiaPFSubmission_status_idx" ON "IndiaPFSubmission"("status");

-- IndiaPFRecord
CREATE INDEX "IndiaPFRecord_submissionId_idx" ON "IndiaPFRecord"("submissionId");
CREATE INDEX "IndiaPFRecord_employeeId_idx" ON "IndiaPFRecord"("employeeId");
CREATE INDEX "IndiaPFRecord_uanNumber_idx" ON "IndiaPFRecord"("uanNumber");

-- IndiaESIConfiguration
CREATE INDEX "IndiaESIConfiguration_tenantId_idx" ON "IndiaESIConfiguration"("tenantId");

-- IndiaESISubmission
CREATE INDEX "IndiaESISubmission_tenantId_idx" ON "IndiaESISubmission"("tenantId");
CREATE INDEX "IndiaESISubmission_contributionMonth_idx" ON "IndiaESISubmission"("contributionMonth");
CREATE INDEX "IndiaESISubmission_status_idx" ON "IndiaESISubmission"("status");

-- IndiaESIRecord
CREATE INDEX "IndiaESIRecord_submissionId_idx" ON "IndiaESIRecord"("submissionId");
CREATE INDEX "IndiaESIRecord_employeeId_idx" ON "IndiaESIRecord"("employeeId");
CREATE INDEX "IndiaESIRecord_esiNumber_idx" ON "IndiaESIRecord"("esiNumber");

-- IndiaTDSConfiguration
CREATE INDEX "IndiaTDSConfiguration_tenantId_idx" ON "IndiaTDSConfiguration"("tenantId");

-- IndiaTDSDeclaration
CREATE INDEX "IndiaTDSDeclaration_tenantId_idx" ON "IndiaTDSDeclaration"("tenantId");
CREATE INDEX "IndiaTDSDeclaration_employeeId_idx" ON "IndiaTDSDeclaration"("employeeId");
CREATE INDEX "IndiaTDSDeclaration_financialYear_idx" ON "IndiaTDSDeclaration"("financialYear");

-- IndiaProfessionalTaxConfig
CREATE INDEX "IndiaProfessionalTaxConfig_tenantId_idx" ON "IndiaProfessionalTaxConfig"("tenantId");
CREATE INDEX "IndiaProfessionalTaxConfig_stateCode_idx" ON "IndiaProfessionalTaxConfig"("stateCode");

-- IndiaProfessionalTaxDeduction
CREATE INDEX "IndiaProfessionalTaxDeduction_tenantId_idx" ON "IndiaProfessionalTaxDeduction"("tenantId");
CREATE INDEX "IndiaProfessionalTaxDeduction_deductionMonth_idx" ON "IndiaProfessionalTaxDeduction"("deductionMonth");

-- ComplianceAuditLog
CREATE INDEX "ComplianceAuditLog_tenantId_idx" ON "ComplianceAuditLog"("tenantId");
CREATE INDEX "ComplianceAuditLog_module_idx" ON "ComplianceAuditLog"("module");
CREATE INDEX "ComplianceAuditLog_entityType_entityId_idx" ON "ComplianceAuditLog"("entityType", "entityId");
CREATE INDEX "ComplianceAuditLog_createdAt_idx" ON "ComplianceAuditLog"("createdAt");

-- EmployeeDocument
CREATE INDEX "EmployeeDocument_tenantId_idx" ON "EmployeeDocument"("tenantId");
CREATE INDEX "EmployeeDocument_employeeId_idx" ON "EmployeeDocument"("employeeId");
CREATE INDEX "EmployeeDocument_documentTypeId_idx" ON "EmployeeDocument"("documentTypeId");
CREATE INDEX "EmployeeDocument_category_idx" ON "EmployeeDocument"("category");
CREATE INDEX "EmployeeDocument_expiryDate_idx" ON "EmployeeDocument"("expiryDate");
CREATE INDEX "EmployeeDocument_status_idx" ON "EmployeeDocument"("status");

-- Asset
CREATE INDEX "Asset_tenantId_idx" ON "Asset"("tenantId");
CREATE INDEX "Asset_category_idx" ON "Asset"("category");
CREATE INDEX "Asset_status_idx" ON "Asset"("status");
CREATE INDEX "Asset_currentEmployeeId_idx" ON "Asset"("currentEmployeeId");
CREATE INDEX "Asset_locationId_idx" ON "Asset"("locationId");

-- AssetAssignment
CREATE INDEX "AssetAssignment_tenantId_idx" ON "AssetAssignment"("tenantId");
CREATE INDEX "AssetAssignment_assetId_idx" ON "AssetAssignment"("assetId");
CREATE INDEX "AssetAssignment_employeeId_idx" ON "AssetAssignment"("employeeId");
CREATE INDEX "AssetAssignment_status_idx" ON "AssetAssignment"("status");

-- AssetMaintenance
CREATE INDEX "AssetMaintenance_tenantId_idx" ON "AssetMaintenance"("tenantId");
CREATE INDEX "AssetMaintenance_assetId_idx" ON "AssetMaintenance"("assetId");
CREATE INDEX "AssetMaintenance_scheduledDate_idx" ON "AssetMaintenance"("scheduledDate");
CREATE INDEX "AssetMaintenance_status_idx" ON "AssetMaintenance"("status");

-- EmploymentHistory
CREATE INDEX "EmploymentHistory_tenantId_idx" ON "EmploymentHistory"("tenantId");
CREATE INDEX "EmploymentHistory_employeeId_idx" ON "EmploymentHistory"("employeeId");
CREATE INDEX "EmploymentHistory_changeType_idx" ON "EmploymentHistory"("changeType");
CREATE INDEX "EmploymentHistory_effectiveDate_idx" ON "EmploymentHistory"("effectiveDate");
CREATE INDEX "EmploymentHistory_status_idx" ON "EmploymentHistory"("status");

-- Position
CREATE INDEX "Position_tenantId_idx" ON "Position"("tenantId");
CREATE INDEX "Position_departmentId_idx" ON "Position"("departmentId");
CREATE INDEX "Position_status_idx" ON "Position"("status");
CREATE INDEX "Position_reportsToPositionId_idx" ON "Position"("reportsToPositionId");

-- EmployeeLifeEvent
CREATE INDEX "EmployeeLifeEvent_tenantId_idx" ON "EmployeeLifeEvent"("tenantId");
CREATE INDEX "EmployeeLifeEvent_employeeId_idx" ON "EmployeeLifeEvent"("employeeId");
CREATE INDEX "EmployeeLifeEvent_eventType_idx" ON "EmployeeLifeEvent"("eventType");
CREATE INDEX "EmployeeLifeEvent_eventDate_idx" ON "EmployeeLifeEvent"("eventDate");
CREATE INDEX "EmployeeLifeEvent_status_idx" ON "EmployeeLifeEvent"("status");

-- LifeEventType
CREATE INDEX "LifeEventType_tenantId_idx" ON "LifeEventType"("tenantId");
CREATE INDEX "LifeEventType_category_idx" ON "LifeEventType"("category");

-- IDCardTemplate
CREATE INDEX "IDCardTemplate_tenantId_idx" ON "IDCardTemplate"("tenantId");
CREATE INDEX "IDCardTemplate_cardType_idx" ON "IDCardTemplate"("cardType");

-- IDCard
CREATE INDEX "IDCard_tenantId_idx" ON "IDCard"("tenantId");
CREATE INDEX "IDCard_employeeId_idx" ON "IDCard"("employeeId");
CREATE INDEX "IDCard_status_idx" ON "IDCard"("status");
CREATE INDEX "IDCard_expiryDate_idx" ON "IDCard"("expiryDate");

-- LetterTemplate
CREATE INDEX "LetterTemplate_tenantId_idx" ON "LetterTemplate"("tenantId");

-- Letter
CREATE INDEX "Letter_tenantId_idx" ON "Letter"("tenantId");
CREATE INDEX "Letter_employeeId_idx" ON "Letter"("employeeId");

-- ExitRequest
CREATE INDEX "ExitRequest_tenantId_idx" ON "ExitRequest"("tenantId");
CREATE INDEX "ExitRequest_employeeId_idx" ON "ExitRequest"("employeeId");

-- ExitClearance
CREATE INDEX "ExitClearance_exitRequestId_idx" ON "ExitClearance"("exitRequestId");

-- ProbationTracking
CREATE INDEX "ProbationTracking_tenantId_idx" ON "ProbationTracking"("tenantId");
CREATE INDEX "ProbationTracking_employeeId_idx" ON "ProbationTracking"("employeeId");

-- ProbationReview
CREATE INDEX "ProbationReview_probationId_idx" ON "ProbationReview"("probationId");

-- ConfirmationRequest
CREATE INDEX "ConfirmationRequest_tenantId_idx" ON "ConfirmationRequest"("tenantId");
CREATE INDEX "ConfirmationRequest_employeeId_idx" ON "ConfirmationRequest"("employeeId");

-- ReportDefinition
CREATE INDEX "ReportDefinition_tenantId_idx" ON "ReportDefinition"("tenantId");
CREATE INDEX "ReportDefinition_category_idx" ON "ReportDefinition"("category");
CREATE INDEX "ReportDefinition_createdBy_idx" ON "ReportDefinition"("createdBy");

-- ReportExecution
CREATE INDEX "ReportExecution_reportId_idx" ON "ReportExecution"("reportId");
CREATE INDEX "ReportExecution_tenantId_idx" ON "ReportExecution"("tenantId");
CREATE INDEX "ReportExecution_executedBy_idx" ON "ReportExecution"("executedBy");
CREATE INDEX "ReportExecution_executedAt_idx" ON "ReportExecution"("executedAt");

-- DashboardWidget
CREATE INDEX "DashboardWidget_tenantId_idx" ON "DashboardWidget"("tenantId");
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- PredictiveModel
CREATE INDEX "PredictiveModel_tenantId_idx" ON "PredictiveModel"("tenantId");
CREATE INDEX "PredictiveModel_modelType_idx" ON "PredictiveModel"("modelType");
CREATE INDEX "PredictiveModel_status_idx" ON "PredictiveModel"("status");

-- Prediction
CREATE INDEX "Prediction_modelId_idx" ON "Prediction"("modelId");
CREATE INDEX "Prediction_tenantId_idx" ON "Prediction"("tenantId");
CREATE INDEX "Prediction_entityType_entityId_idx" ON "Prediction"("entityType", "entityId");
CREATE INDEX "Prediction_predictedDate_idx" ON "Prediction"("predictedDate");

-- AIAgentConversation
CREATE INDEX "AIAgentConversation_tenantId_idx" ON "AIAgentConversation"("tenantId");
CREATE INDEX "AIAgentConversation_userId_idx" ON "AIAgentConversation"("userId");
CREATE INDEX "AIAgentConversation_sessionId_idx" ON "AIAgentConversation"("sessionId");

-- AIAgentMessage
CREATE INDEX "AIAgentMessage_conversationId_idx" ON "AIAgentMessage"("conversationId");
CREATE INDEX "AIAgentMessage_role_idx" ON "AIAgentMessage"("role");
CREATE INDEX "AIAgentMessage_createdAt_idx" ON "AIAgentMessage"("createdAt");

-- AnalyticsCache
CREATE INDEX "AnalyticsCache_tenantId_idx" ON "AnalyticsCache"("tenantId");
CREATE INDEX "AnalyticsCache_expiresAt_idx" ON "AnalyticsCache"("expiresAt");

-- BenefitPlan
CREATE INDEX "BenefitPlan_tenantId_idx" ON "BenefitPlan"("tenantId");
CREATE INDEX "BenefitPlan_category_idx" ON "BenefitPlan"("category");
CREATE INDEX "BenefitPlan_status_idx" ON "BenefitPlan"("status");
CREATE INDEX "BenefitPlan_effectiveFrom_idx" ON "BenefitPlan"("effectiveFrom");

-- BenefitEnrollment
CREATE INDEX "BenefitEnrollment_tenantId_idx" ON "BenefitEnrollment"("tenantId");
CREATE INDEX "BenefitEnrollment_employeeId_idx" ON "BenefitEnrollment"("employeeId");
CREATE INDEX "BenefitEnrollment_planId_idx" ON "BenefitEnrollment"("planId");
CREATE INDEX "BenefitEnrollment_status_idx" ON "BenefitEnrollment"("status");
CREATE INDEX "BenefitEnrollment_effectiveFrom_idx" ON "BenefitEnrollment"("effectiveFrom");

-- Dependent
CREATE INDEX "Dependent_tenantId_idx" ON "Dependent"("tenantId");
CREATE INDEX "Dependent_employeeId_idx" ON "Dependent"("employeeId");
CREATE INDEX "Dependent_status_idx" ON "Dependent"("status");

-- BenefitClaim
CREATE INDEX "BenefitClaim_tenantId_idx" ON "BenefitClaim"("tenantId");
CREATE INDEX "BenefitClaim_employeeId_idx" ON "BenefitClaim"("employeeId");
CREATE INDEX "BenefitClaim_enrollmentId_idx" ON "BenefitClaim"("enrollmentId");
CREATE INDEX "BenefitClaim_status_idx" ON "BenefitClaim"("status");
CREATE INDEX "BenefitClaim_claimDate_idx" ON "BenefitClaim"("claimDate");

-- HealthcareProvider
CREATE INDEX "HealthcareProvider_tenantId_idx" ON "HealthcareProvider"("tenantId");
CREATE INDEX "HealthcareProvider_providerType_idx" ON "HealthcareProvider"("providerType");
CREATE INDEX "HealthcareProvider_specialty_idx" ON "HealthcareProvider"("specialty");
CREATE INDEX "HealthcareProvider_isActive_idx" ON "HealthcareProvider"("isActive");

-- QualifyingEvent
CREATE INDEX "QualifyingEvent_tenantId_idx" ON "QualifyingEvent"("tenantId");
CREATE INDEX "QualifyingEvent_employeeId_idx" ON "QualifyingEvent"("employeeId");
CREATE INDEX "QualifyingEvent_eventType_idx" ON "QualifyingEvent"("eventType");
CREATE INDEX "QualifyingEvent_eventDate_idx" ON "QualifyingEvent"("eventDate");

-- EnrollmentWindow
CREATE INDEX "EnrollmentWindow_tenantId_idx" ON "EnrollmentWindow"("tenantId");
CREATE INDEX "EnrollmentWindow_planYear_idx" ON "EnrollmentWindow"("planYear");
CREATE INDEX "EnrollmentWindow_startDate_idx" ON "EnrollmentWindow"("startDate");
CREATE INDEX "EnrollmentWindow_isActive_idx" ON "EnrollmentWindow"("isActive");

-- PremiumRate
CREATE INDEX "PremiumRate_tenantId_idx" ON "PremiumRate"("tenantId");
CREATE INDEX "PremiumRate_planId_idx" ON "PremiumRate"("planId");
CREATE INDEX "PremiumRate_effectiveFrom_idx" ON "PremiumRate"("effectiveFrom");

-- PremiumDeduction
CREATE INDEX "PremiumDeduction_tenantId_idx" ON "PremiumDeduction"("tenantId");
CREATE INDEX "PremiumDeduction_enrollmentId_idx" ON "PremiumDeduction"("enrollmentId");
CREATE INDEX "PremiumDeduction_employeeId_idx" ON "PremiumDeduction"("employeeId");
CREATE INDEX "PremiumDeduction_payrollDate_idx" ON "PremiumDeduction"("payrollDate");

-- TaxDocument
CREATE INDEX "TaxDocument_tenantId_idx" ON "TaxDocument"("tenantId");
CREATE INDEX "TaxDocument_employeeId_idx" ON "TaxDocument"("employeeId");
CREATE INDEX "TaxDocument_taxYear_idx" ON "TaxDocument"("taxYear");

-- ContinuousFeedback
CREATE INDEX "ContinuousFeedback_tenantId_idx" ON "ContinuousFeedback"("tenantId");
CREATE INDEX "ContinuousFeedback_fromUserId_idx" ON "ContinuousFeedback"("fromUserId");
CREATE INDEX "ContinuousFeedback_toEmployeeId_idx" ON "ContinuousFeedback"("toEmployeeId");
CREATE INDEX "ContinuousFeedback_type_idx" ON "ContinuousFeedback"("type");

-- Recognition
CREATE INDEX "Recognition_tenantId_idx" ON "Recognition"("tenantId");
CREATE INDEX "Recognition_giverId_idx" ON "Recognition"("giverId");
CREATE INDEX "Recognition_receiverId_idx" ON "Recognition"("receiverId");
CREATE INDEX "Recognition_createdAt_idx" ON "Recognition"("createdAt");

-- OneOnOneMeeting
CREATE INDEX "OneOnOneMeeting_tenantId_idx" ON "OneOnOneMeeting"("tenantId");
CREATE INDEX "OneOnOneMeeting_managerId_idx" ON "OneOnOneMeeting"("managerId");
CREATE INDEX "OneOnOneMeeting_employeeId_idx" ON "OneOnOneMeeting"("employeeId");
CREATE INDEX "OneOnOneMeeting_scheduledAt_idx" ON "OneOnOneMeeting"("scheduledAt");

-- OneOnOneNote
CREATE INDEX "OneOnOneNote_meetingId_idx" ON "OneOnOneNote"("meetingId");

-- OneOnOneActionItem
CREATE INDEX "OneOnOneActionItem_meetingId_idx" ON "OneOnOneActionItem"("meetingId");
CREATE INDEX "OneOnOneActionItem_assigneeId_idx" ON "OneOnOneActionItem"("assigneeId");
CREATE INDEX "OneOnOneActionItem_status_idx" ON "OneOnOneActionItem"("status");

-- LearningPath
CREATE INDEX "LearningPath_tenantId_idx" ON "LearningPath"("tenantId");
CREATE INDEX "LearningPath_isPublished_idx" ON "LearningPath"("isPublished");

-- LearningPathEnrollment
CREATE INDEX "LearningPathEnrollment_tenantId_idx" ON "LearningPathEnrollment"("tenantId");
CREATE INDEX "LearningPathEnrollment_pathId_idx" ON "LearningPathEnrollment"("pathId");
CREATE INDEX "LearningPathEnrollment_employeeId_idx" ON "LearningPathEnrollment"("employeeId");

-- LearningProgress
CREATE INDEX "LearningProgress_tenantId_idx" ON "LearningProgress"("tenantId");
CREATE INDEX "LearningProgress_employeeId_idx" ON "LearningProgress"("employeeId");
CREATE INDEX "LearningProgress_contentId_idx" ON "LearningProgress"("contentId");

-- Assessment
CREATE INDEX "Assessment_tenantId_idx" ON "Assessment"("tenantId");
CREATE INDEX "Assessment_pathId_idx" ON "Assessment"("pathId");

-- AssessmentSubmission
CREATE INDEX "AssessmentSubmission_assessmentId_idx" ON "AssessmentSubmission"("assessmentId");
CREATE INDEX "AssessmentSubmission_employeeId_idx" ON "AssessmentSubmission"("employeeId");

-- Webhook
CREATE INDEX "Webhook_tenantId_idx" ON "Webhook"("tenantId");
CREATE INDEX "Webhook_isActive_idx" ON "Webhook"("isActive");

-- WebhookLog
CREATE INDEX "WebhookLog_webhookId_idx" ON "WebhookLog"("webhookId");
CREATE INDEX "WebhookLog_createdAt_idx" ON "WebhookLog"("createdAt");
CREATE INDEX "WebhookLog_success_idx" ON "WebhookLog"("success");

-- CustomReport
CREATE INDEX "CustomReport_tenantId_idx" ON "CustomReport"("tenantId");
CREATE INDEX "CustomReport_createdBy_idx" ON "CustomReport"("createdBy");

-- WorkflowDefinition
CREATE INDEX "WorkflowDefinition_tenantId_idx" ON "WorkflowDefinition"("tenantId");
CREATE INDEX "WorkflowDefinition_isActive_idx" ON "WorkflowDefinition"("isActive");
CREATE INDEX "WorkflowDefinition_trigger_idx" ON "WorkflowDefinition"("trigger");

-- WorkflowInstance
CREATE INDEX "WorkflowInstance_definitionId_idx" ON "WorkflowInstance"("definitionId");
CREATE INDEX "WorkflowInstance_tenantId_idx" ON "WorkflowInstance"("tenantId");
CREATE INDEX "WorkflowInstance_status_idx" ON "WorkflowInstance"("status");

-- ProjectTimeEntry
CREATE INDEX "ProjectTimeEntry_tenantId_idx" ON "ProjectTimeEntry"("tenantId");
CREATE INDEX "ProjectTimeEntry_employeeId_idx" ON "ProjectTimeEntry"("employeeId");
CREATE INDEX "ProjectTimeEntry_projectId_idx" ON "ProjectTimeEntry"("projectId");
CREATE INDEX "ProjectTimeEntry_date_idx" ON "ProjectTimeEntry"("date");

-- GeofenceLocation
CREATE INDEX "GeofenceLocation_tenantId_idx" ON "GeofenceLocation"("tenantId");
CREATE INDEX "GeofenceLocation_isActive_idx" ON "GeofenceLocation"("isActive");

-- ExpenseClaim
CREATE INDEX "ExpenseClaim_tenantId_idx" ON "ExpenseClaim"("tenantId");
CREATE INDEX "ExpenseClaim_employeeId_idx" ON "ExpenseClaim"("employeeId");
CREATE INDEX "ExpenseClaim_status_idx" ON "ExpenseClaim"("status");
CREATE INDEX "ExpenseClaim_date_idx" ON "ExpenseClaim"("date");

-- APIKey
CREATE INDEX "APIKey_tenantId_idx" ON "APIKey"("tenantId");
CREATE INDEX "APIKey_keyHash_idx" ON "APIKey"("keyHash");
CREATE INDEX "APIKey_isActive_idx" ON "APIKey"("isActive");

-- EmergencyContact
CREATE INDEX "EmergencyContact_tenantId_idx" ON "EmergencyContact"("tenantId");
CREATE INDEX "EmergencyContact_employeeId_idx" ON "EmergencyContact"("employeeId");

-- Garnishment
CREATE INDEX "Garnishment_tenantId_idx" ON "Garnishment"("tenantId");
CREATE INDEX "Garnishment_employeeId_idx" ON "Garnishment"("employeeId");
CREATE INDEX "Garnishment_status_idx" ON "Garnishment"("status");

-- HSAFSAAccount
CREATE INDEX "HSAFSAAccount_tenantId_idx" ON "HSAFSAAccount"("tenantId");
CREATE INDEX "HSAFSAAccount_employeeId_idx" ON "HSAFSAAccount"("employeeId");

-- HSAFSATransaction
CREATE INDEX "HSAFSATransaction_accountId_idx" ON "HSAFSATransaction"("accountId");
CREATE INDEX "HSAFSATransaction_date_idx" ON "HSAFSATransaction"("date");

-- CandidateApplication
CREATE INDEX "CandidateApplication_candidateId_idx" ON "CandidateApplication"("candidateId");
CREATE INDEX "CandidateApplication_jobPostingId_idx" ON "CandidateApplication"("jobPostingId");
CREATE INDEX "CandidateApplication_status_idx" ON "CandidateApplication"("status");

-- Interview
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");
CREATE INDEX "Interview_scheduledDate_idx" ON "Interview"("scheduledDate");

-- InterviewFeedback
CREATE INDEX "InterviewFeedback_interviewId_idx" ON "InterviewFeedback"("interviewId");

-- JobOffer
CREATE INDEX "JobOffer_applicationId_idx" ON "JobOffer"("applicationId");
CREATE INDEX "JobOffer_status_idx" ON "JobOffer"("status");

-- BackgroundCheck
CREATE INDEX "BackgroundCheck_tenantId_idx" ON "BackgroundCheck"("tenantId");
CREATE INDEX "BackgroundCheck_applicationId_idx" ON "BackgroundCheck"("applicationId");
CREATE INDEX "BackgroundCheck_status_idx" ON "BackgroundCheck"("status");

-- JobRequisition
CREATE INDEX "JobRequisition_tenantId_idx" ON "JobRequisition"("tenantId");
CREATE INDEX "JobRequisition_status_idx" ON "JobRequisition"("status");
CREATE INDEX "JobRequisition_department_idx" ON "JobRequisition"("department");

-- OnboardingProgram
CREATE INDEX "OnboardingProgram_tenantId_idx" ON "OnboardingProgram"("tenantId");

-- OnboardingInstance
CREATE INDEX "OnboardingInstance_tenantId_idx" ON "OnboardingInstance"("tenantId");
CREATE INDEX "OnboardingInstance_employeeId_idx" ON "OnboardingInstance"("employeeId");
CREATE INDEX "OnboardingInstance_status_idx" ON "OnboardingInstance"("status");

-- OnboardingTask
CREATE INDEX "OnboardingTask_instanceId_idx" ON "OnboardingTask"("instanceId");
CREATE INDEX "OnboardingTask_status_idx" ON "OnboardingTask"("status");

-- PerformanceReview
CREATE INDEX "PerformanceReview_tenantId_idx" ON "PerformanceReview"("tenantId");
CREATE INDEX "PerformanceReview_employeeId_idx" ON "PerformanceReview"("employeeId");
CREATE INDEX "PerformanceReview_reviewCycleId_idx" ON "PerformanceReview"("reviewCycleId");
CREATE INDEX "PerformanceReview_status_idx" ON "PerformanceReview"("status");

-- ReviewCycle
CREATE INDEX "ReviewCycle_tenantId_idx" ON "ReviewCycle"("tenantId");
CREATE INDEX "ReviewCycle_status_idx" ON "ReviewCycle"("status");

-- PerformanceGoal
CREATE INDEX "PerformanceGoal_tenantId_idx" ON "PerformanceGoal"("tenantId");
CREATE INDEX "PerformanceGoal_employeeId_idx" ON "PerformanceGoal"("employeeId");
CREATE INDEX "PerformanceGoal_status_idx" ON "PerformanceGoal"("status");

-- CalibrationSession
CREATE INDEX "CalibrationSession_tenantId_idx" ON "CalibrationSession"("tenantId");
CREATE INDEX "CalibrationSession_status_idx" ON "CalibrationSession"("status");

-- SalaryComponent
CREATE INDEX "SalaryComponent_tenantId_idx" ON "SalaryComponent"("tenantId");

-- CompensationBand
CREATE INDEX "CompensationBand_tenantId_idx" ON "CompensationBand"("tenantId");

-- IncrementCycle
CREATE INDEX "IncrementCycle_tenantId_idx" ON "IncrementCycle"("tenantId");
CREATE INDEX "IncrementCycle_status_idx" ON "IncrementCycle"("status");

-- Notification
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");
CREATE INDEX "Notification_status_idx" ON "Notification"("status");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- NotificationRecipient
CREATE INDEX "NotificationRecipient_notificationId_idx" ON "NotificationRecipient"("notificationId");
CREATE INDEX "NotificationRecipient_userId_idx" ON "NotificationRecipient"("userId");
CREATE INDEX "NotificationRecipient_status_idx" ON "NotificationRecipient"("status");

-- NotificationTemplate
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "NotificationTemplate"("tenantId");
CREATE INDEX "NotificationTemplate_type_idx" ON "NotificationTemplate"("type");
CREATE INDEX "NotificationTemplate_isActive_idx" ON "NotificationTemplate"("isActive");

-- Course
CREATE INDEX "Course_tenantId_idx" ON "Course"("tenantId");
CREATE INDEX "Course_status_idx" ON "Course"("status");
CREATE INDEX "Course_category_idx" ON "Course"("category");

-- CourseEnrollment
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");
CREATE INDEX "CourseEnrollment_employeeId_idx" ON "CourseEnrollment"("employeeId");
CREATE INDEX "CourseEnrollment_tenantId_idx" ON "CourseEnrollment"("tenantId");

-- TrainingSession
CREATE INDEX "TrainingSession_tenantId_idx" ON "TrainingSession"("tenantId");
CREATE INDEX "TrainingSession_startDate_idx" ON "TrainingSession"("startDate");
CREATE INDEX "TrainingSession_status_idx" ON "TrainingSession"("status");

-- SessionAttendee
CREATE INDEX "SessionAttendee_sessionId_idx" ON "SessionAttendee"("sessionId");
CREATE INDEX "SessionAttendee_employeeId_idx" ON "SessionAttendee"("employeeId");

-- Certification
CREATE INDEX "Certification_tenantId_idx" ON "Certification"("tenantId");
CREATE INDEX "Certification_employeeId_idx" ON "Certification"("employeeId");
CREATE INDEX "Certification_status_idx" ON "Certification"("status");
CREATE INDEX "Certification_expiryDate_idx" ON "Certification"("expiryDate");

-- MentoringProgram
CREATE INDEX "MentoringProgram_tenantId_idx" ON "MentoringProgram"("tenantId");
CREATE INDEX "MentoringProgram_mentorId_idx" ON "MentoringProgram"("mentorId");
CREATE INDEX "MentoringProgram_menteeId_idx" ON "MentoringProgram"("menteeId");
CREATE INDEX "MentoringProgram_status_idx" ON "MentoringProgram"("status");

-- ============================================================================
-- PART 23: FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Auth
ALTER TABLE "MFASecret" ADD CONSTRAINT "MFASecret_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Employee position FK
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Competency
ALTER TABLE "CompetencySubcategory" ADD CONSTRAINT "CompetencySubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CompetencyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompetencyCatalog" ADD CONSTRAINT "CompetencyCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CompetencyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompetencyCatalog" ADD CONSTRAINT "CompetencyCatalog_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "CompetencySubcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompetencyProficiencyDescriptor" ADD CONSTRAINT "CompetencyProficiencyDescriptor_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetencyProficiencyDescriptor" ADD CONSTRAINT "CompetencyProficiencyDescriptor_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "ProficiencyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompetencyRelation" ADD CONSTRAINT "CompetencyRelation_sourceCompetencyId_fkey" FOREIGN KEY ("sourceCompetencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetencyRelation" ADD CONSTRAINT "CompetencyRelation_relatedCompetencyId_fkey" FOREIGN KEY ("relatedCompetencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetencyRoleMapping" ADD CONSTRAINT "CompetencyRoleMapping_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetencyAssessmentCriteria" ADD CONSTRAINT "CompetencyAssessmentCriteria_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetencyDevelopmentResource" ADD CONSTRAINT "CompetencyDevelopmentResource_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProficiencyLevel" ADD CONSTRAINT "ProficiencyLevel_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ProficiencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobCompetencyMapping" ADD CONSTRAINT "JobCompetencyMapping_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobCompetencyMapping" ADD CONSTRAINT "JobCompetencyMapping_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobCompetencyMapping" ADD CONSTRAINT "JobCompetencyMapping_requiredLevelId_fkey" FOREIGN KEY ("requiredLevelId") REFERENCES "ProficiencyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillAssessmentCompetency" ADD CONSTRAINT "SkillAssessmentCompetency_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "SkillAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillAssessmentCompetency" ADD CONSTRAINT "SkillAssessmentCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillAssessmentResult" ADD CONSTRAINT "SkillAssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "SkillAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillAssessmentResult" ADD CONSTRAINT "SkillAssessmentResult_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SkillAssessmentResult" ADD CONSTRAINT "SkillAssessmentResult_ratingLevelId_fkey" FOREIGN KEY ("ratingLevelId") REFERENCES "ProficiencyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GapAnalysisItem" ADD CONSTRAINT "GapAnalysisItem_gapAnalysisId_fkey" FOREIGN KEY ("gapAnalysisId") REFERENCES "GapAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GapAnalysisItem" ADD CONSTRAINT "GapAnalysisItem_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CompetencyCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GapAnalysisItem" ADD CONSTRAINT "GapAnalysisItem_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "ProficiencyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GapAnalysisItem" ADD CONSTRAINT "GapAnalysisItem_targetLevelId_fkey" FOREIGN KEY ("targetLevelId") REFERENCES "ProficiencyLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DevelopmentActivity" ADD CONSTRAINT "DevelopmentActivity_developmentPlanId_fkey" FOREIGN KEY ("developmentPlanId") REFERENCES "DevelopmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentMilestone" ADD CONSTRAINT "DevelopmentMilestone_developmentPlanId_fkey" FOREIGN KEY ("developmentPlanId") REFERENCES "DevelopmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- WPS
ALTER TABLE "WPSConfiguration" ADD CONSTRAINT "WPSConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WPSSubmission" ADD CONSTRAINT "WPSSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WPSSubmission" ADD CONSTRAINT "WPSSubmission_wpsConfigId_fkey" FOREIGN KEY ("wpsConfigId") REFERENCES "WPSConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WPSRecord" ADD CONSTRAINT "WPSRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WPSRecord" ADD CONSTRAINT "WPSRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WPSSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WPSRecord" ADD CONSTRAINT "WPSRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WPSAuditLog" ADD CONSTRAINT "WPSAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- GOSI
ALTER TABLE "GOSISubmission" ADD CONSTRAINT "GOSISubmission_gosiConfigId_fkey" FOREIGN KEY ("gosiConfigId") REFERENCES "GOSIConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GOSIRecord" ADD CONSTRAINT "GOSIRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "GOSISubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Nitaqat
ALTER TABLE "NitaqatSnapshot" ADD CONSTRAINT "NitaqatSnapshot_configId_fkey" FOREIGN KEY ("configId") REFERENCES "NitaqatConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Payroll
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_configId_fkey" FOREIGN KEY ("configId") REFERENCES "PayrollConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Leave
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- India PF
ALTER TABLE "IndiaPFSubmission" ADD CONSTRAINT "IndiaPFSubmission_configId_fkey" FOREIGN KEY ("configId") REFERENCES "IndiaPFConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndiaPFRecord" ADD CONSTRAINT "IndiaPFRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "IndiaPFSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- India ESI
ALTER TABLE "IndiaESISubmission" ADD CONSTRAINT "IndiaESISubmission_configId_fkey" FOREIGN KEY ("configId") REFERENCES "IndiaESIConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndiaESIRecord" ADD CONSTRAINT "IndiaESIRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "IndiaESISubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- India TDS
ALTER TABLE "IndiaTDSDeclaration" ADD CONSTRAINT "IndiaTDSDeclaration_configId_fkey" FOREIGN KEY ("configId") REFERENCES "IndiaTDSConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- India PT
ALTER TABLE "IndiaProfessionalTaxDeduction" ADD CONSTRAINT "IndiaProfessionalTaxDeduction_configId_fkey" FOREIGN KEY ("configId") REFERENCES "IndiaProfessionalTaxConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Employee Document
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EmployeeDocument"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Asset
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- EmploymentHistory
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_previousDepartmentId_fkey" FOREIGN KEY ("previousDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_previousJobProfileId_fkey" FOREIGN KEY ("previousJobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_previousGradeId_fkey" FOREIGN KEY ("previousGradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_previousLocationId_fkey" FOREIGN KEY ("previousLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_newDepartmentId_fkey" FOREIGN KEY ("newDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_newJobProfileId_fkey" FOREIGN KEY ("newJobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_newGradeId_fkey" FOREIGN KEY ("newGradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_newLocationId_fkey" FOREIGN KEY ("newLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Position
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_reportsToPositionId_fkey" FOREIGN KEY ("reportsToPositionId") REFERENCES "Position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "Position" ADD CONSTRAINT "Position_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_employeeStatusId_fkey" FOREIGN KEY ("employeeStatusId") REFERENCES "EmployeeStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_employmentTypeId_fkey" FOREIGN KEY ("employmentTypeId") REFERENCES "EmploymentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Life Events
ALTER TABLE "EmployeeLifeEvent" ADD CONSTRAINT "EmployeeLifeEvent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ID Cards
ALTER TABLE "IDCard" ADD CONSTRAINT "IDCard_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IDCard" ADD CONSTRAINT "IDCard_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IDCardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Letters
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LetterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Exit
ALTER TABLE "ExitRequest" ADD CONSTRAINT "ExitRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExitClearance" ADD CONSTRAINT "ExitClearance_exitRequestId_fkey" FOREIGN KEY ("exitRequestId") REFERENCES "ExitRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Probation
ALTER TABLE "ProbationTracking" ADD CONSTRAINT "ProbationTracking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProbationReview" ADD CONSTRAINT "ProbationReview_probationId_fkey" FOREIGN KEY ("probationId") REFERENCES "ProbationTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Confirmation
ALTER TABLE "ConfirmationRequest" ADD CONSTRAINT "ConfirmationRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Analytics
ALTER TABLE "ReportExecution" ADD CONSTRAINT "ReportExecution_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ReportDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "PredictiveModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIAgentMessage" ADD CONSTRAINT "AIAgentMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIAgentConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Benefits
ALTER TABLE "BenefitEnrollment" ADD CONSTRAINT "BenefitEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BenefitPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BenefitClaim" ADD CONSTRAINT "BenefitClaim_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "BenefitEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PremiumRate" ADD CONSTRAINT "PremiumRate_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BenefitPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PremiumDeduction" ADD CONSTRAINT "PremiumDeduction_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "BenefitEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Gap Closure - Tax Documents
ALTER TABLE "TaxDocument" ADD CONSTRAINT "TaxDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- HSA/FSA
ALTER TABLE "HSAFSAAccount" ADD CONSTRAINT "HSAFSAAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HSAFSATransaction" ADD CONSTRAINT "HSAFSATransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "HSAFSAAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Emergency Contact
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Garnishment
ALTER TABLE "Garnishment" ADD CONSTRAINT "Garnishment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Recruitment
ALTER TABLE "CandidateApplication" ADD CONSTRAINT "CandidateApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CandidateApplication" ADD CONSTRAINT "CandidateApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CandidateApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CandidateApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Onboarding
ALTER TABLE "OnboardingInstance" ADD CONSTRAINT "OnboardingInstance_programId_fkey" FOREIGN KEY ("programId") REFERENCES "OnboardingProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "OnboardingInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Performance
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_reviewCycleId_fkey" FOREIGN KEY ("reviewCycleId") REFERENCES "ReviewCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One-on-One
ALTER TABLE "OneOnOneNote" ADD CONSTRAINT "OneOnOneNote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "OneOnOneMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OneOnOneActionItem" ADD CONSTRAINT "OneOnOneActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "OneOnOneMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Learning
ALTER TABLE "LearningPathEnrollment" ADD CONSTRAINT "LearningPathEnrollment_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SessionAttendee" ADD CONSTRAINT "SessionAttendee_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Webhooks
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Workflows
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Notifications
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
