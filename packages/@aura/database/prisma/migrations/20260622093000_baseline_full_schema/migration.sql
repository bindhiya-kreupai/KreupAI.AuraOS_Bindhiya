-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('HEADQUARTERS', 'BRANCH', 'REMOTE_HUB', 'WAREHOUSE', 'PLANT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED', 'EMPLOYEE_TERMINATED', 'EMPLOYEE_REHIRED', 'PAYROLL_RUN_INITIATED', 'PAYROLL_RUN_APPROVED', 'PAYROLL_RUN_REJECTED', 'PAYSLIP_GENERATED', 'PAYSLIP_VIEWED', 'SALARY_UPDATED', 'LEAVE_REQUEST_CREATED', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED', 'LEAVE_REQUEST_CANCELLED', 'LEAVE_POLICY_CREATED', 'LEAVE_POLICY_UPDATED', 'LEAVE_ENCASHMENT_REQUESTED', 'ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED', 'ATTENDANCE_REGULARIZED', 'BULK_ATTENDANCE_IMPORTED', 'USER_LOGIN', 'USER_LOGOUT', 'USER_LOGIN_FAILED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'ROLE_ASSIGNED', 'ROLE_REMOVED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'DATA_EXPORTED', 'REPORT_GENERATED', 'REPORT_DOWNLOADED', 'SETTINGS_UPDATED', 'INTEGRATION_CONFIGURED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'MFA_ENABLED', 'MFA_VERIFIED', 'MFA_DISABLED', 'COMMENT_ATTENDANCE_REGULARIZATION', 'COMMENT_COMP_OFF_REQUEST', 'COMMENT_CONFIRMATION_REQUEST', 'COMMENT_EMPLOYMENT_HISTORY', 'COMMENT_EXIT_REQUEST', 'COMMENT_EXPENSE_CLAIM', 'COMMENT_INTER_COMPANY_TRANSFER', 'COMMENT_LEAVE_REQUEST', 'COMMENT_OVERTIME_REQUEST', 'COMMENT_SHIFT_SWAP_REQUEST', 'APPROVE_ATTENDANCE_REGULARIZATION', 'APPROVE_COMP_OFF_REQUEST', 'APPROVE_CONFIRMATION_REQUEST', 'APPROVE_EMPLOYMENT_HISTORY_CHANGE', 'APPROVE_EXIT_REQUEST', 'APPROVE_EXPENSE_CLAIM', 'APPROVE_INTER_COMPANY_TRANSFER', 'APPROVE_LEAVE_REQUEST', 'APPROVE_OVERTIME_REQUEST', 'APPROVE_SHIFT_SWAP_REQUEST', 'REJECT_ATTENDANCE_REGULARIZATION', 'REJECT_COMP_OFF_REQUEST', 'REJECT_CONFIRMATION_REQUEST', 'REJECT_EMPLOYMENT_HISTORY_CHANGE', 'REJECT_EXIT_REQUEST', 'REJECT_EXPENSE_CLAIM', 'REJECT_INTER_COMPANY_TRANSFER', 'REJECT_LEAVE_REQUEST', 'REJECT_OVERTIME_REQUEST', 'REJECT_SHIFT_SWAP_REQUEST', 'CANCEL_INTERVIEW', 'REQUEST_DOCUMENT', 'REQUEST_INFO', 'MFA_SETUP_INITIATED', 'MFA_VALIDATION_FAILED', 'LOGIN_SUCCESS');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

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
CREATE TYPE "TerminationType" AS ENUM ('RESIGNATION', 'TERMINATION', 'TERMINATION_WITHOUT_CAUSE', 'END_OF_CONTRACT', 'RETIREMENT', 'DEATH', 'DISABILITY', 'MUTUAL_AGREEMENT');

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

-- CreateEnum
CREATE TYPE "EOSBCalculationType" AS ENUM ('ESTIMATE', 'FINAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "EOSBStatus" AS ENUM ('CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "aura_tenant" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_company" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_department" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "costCenterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_cost_center" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country" (
    "id" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_state" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_city" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_address" (
    "id" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "postalCode" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_location" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "addressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_function" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_family" (
    "id" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_profile" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "gradeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_grade" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "jobProfileId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "managerId" TEXT,
    "statusId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "addressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "positionId" TEXT,
    "salaryStructureId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employment_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmploymentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_number_sequence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "padding" INTEGER NOT NULL DEFAULT 5,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_employee_number_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_master_data_draft" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "onboardingInstanceId" TEXT,
    "offerId" TEXT,
    "employeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "masterData" JSONB NOT NULL,
    "validationSnapshot" JSONB NOT NULL,
    "duplicateSnapshot" JSONB,
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "activatedBy" TEXT,
    "activatedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_employee_master_data_draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_identification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sourceDraftId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_employee_identification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_lifecycle_event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_employee_lifecycle_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenantId" TEXT,
    "code" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user_role" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_permission" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_role_permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_password_reset_token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfa_secret" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MFASecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_refresh_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRTL" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_document_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_business_unit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "head" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_designation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gradeId" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_skill" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_shift_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShiftType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_holiday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_punch" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_attendance_punch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_record" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_attendance_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_shift" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_shift_assignment" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_shift_roster" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShiftRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_shift_swap_request" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShiftSwapRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_overtime_request" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_regularization" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_attendance_regularization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_comp_off_request" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompOffRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_tax_regime" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaxRegime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_pay_component" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PayComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_bank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "swiftCode" TEXT NOT NULL,
    "branchName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_system_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_education_level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EducationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_relationship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_exit_reason" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExitReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_access_control" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_access_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_password_policy" (
    "id" TEXT NOT NULL,
    "minLength" INTEGER NOT NULL DEFAULT 8,
    "requireUppercase" BOOLEAN NOT NULL DEFAULT true,
    "requireLowercase" BOOLEAN NOT NULL DEFAULT true,
    "requireNumbers" BOOLEAN NOT NULL DEFAULT true,
    "requireSpecialChars" BOOLEAN NOT NULL DEFAULT true,
    "expiryDays" INTEGER NOT NULL DEFAULT 90,
    "historyCount" INTEGER NOT NULL DEFAULT 5,
    "lockoutAttempts" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sso_config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL,
    "issuerUrl" TEXT,
    "ssoUrl" TEXT,
    "certificate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SSOConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "location" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL DEFAULT '',
    "entityType" TEXT DEFAULT '',
    "entityId" TEXT,
    "metadata" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "companyId" TEXT,
    "userEmail" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "beforeValues" JSONB,
    "afterValues" JSONB,
    "userAgent" TEXT,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_audit_log_archive" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "action" "AuditAction" NOT NULL,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'LOW',
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "beforeValues" JSONB,
    "afterValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuditLogArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user_delegation" (
    "id" TEXT NOT NULL,
    "delegatorId" TEXT NOT NULL,
    "delegateeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserDelegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_license" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user_deactivation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "deactivatedBy" TEXT NOT NULL,
    "deactivatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserDeactivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mfa_config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "enforceForAdmins" BOOLEAN NOT NULL DEFAULT true,
    "enforceForAll" BOOLEAN NOT NULL DEFAULT false,
    "methods" JSONB NOT NULL,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MFAConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_posting" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_category" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_subcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencySubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_catalog" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_proficiency_descriptor" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "description" TEXT,
    "behaviors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyProficiencyDescriptor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_relation" (
    "id" TEXT NOT NULL,
    "sourceCompetencyId" TEXT NOT NULL,
    "relatedCompetencyId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'Related',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_role_mapping" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyRoleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_assessment_criteria" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyAssessmentCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_competency_development_resource" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "provider" TEXT,
    "duration" TEXT,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompetencyDevelopmentResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_proficiency_framework" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Standard',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProficiencyFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_proficiency_level" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProficiencyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT,
    "description" TEXT,
    "level" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_competency_mapping" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobCompetencyMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_skill_assessment" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_skill_assessment_competency" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillAssessmentCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_skill_assessment_result" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillAssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gap_analysis" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GapAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gap_analysis_item" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GapAnalysisItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_development_plan" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DevelopmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_development_activity" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DevelopmentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_development_milestone" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DevelopmentMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_labour_law_config" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LabourLawConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_configuration" (
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
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WPSConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_submission" (
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
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WPSSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_record" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WPSRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_audit_log" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WPSAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_configuration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "gosiSubscriptionNumber" TEXT NOT NULL,
    "establishmentNumber" TEXT,
    "bankAccountIBAN" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GOSIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_submission" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GOSISubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_record" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GOSIRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_configuration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NitaqatConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_snapshot" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NitaqatSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_compliance_details" (
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
    "sector" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeComplianceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_social_insurance_registration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "onboardingInstanceId" TEXT,
    "countryCode" TEXT NOT NULL,
    "nationality" TEXT,
    "authority" TEXT NOT NULL,
    "scheme" TEXT NOT NULL,
    "contributionWage" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "registrationReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "registeredAt" TIMESTAMP(3),
    "ruleVersion" TEXT NOT NULL,
    "ruleSnapshot" JSONB,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_social_insurance_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_payroll_configuration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PayrollConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_payroll_run" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_payslip" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_salary_structure" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeSalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_payroll_profile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "payrollConfigId" TEXT,
    "countryCode" TEXT NOT NULL,
    "onboardingInstanceId" TEXT,
    "salaryStructureId" TEXT,
    "salaryComponents" JSONB NOT NULL,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIBAN" TEXT,
    "bankRoutingCode" TEXT,
    "wpsAgentCode" TEXT,
    "wpsEmployerCode" TEXT,
    "wpsPersonCode" TEXT,
    "labourCardNumber" TEXT,
    "costCenterCode" TEXT,
    "prorationBasis" TEXT NOT NULL DEFAULT 'CALENDAR_DAYS',
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "firstPayrollMonth" TEXT NOT NULL,
    "firstPeriodStart" TIMESTAMP(3) NOT NULL,
    "firstPeriodEnd" TIMESTAMP(3) NOT NULL,
    "firstPeriodPaidDays" DECIMAL(8,2) NOT NULL,
    "firstPeriodCalendarDays" INTEGER NOT NULL,
    "firstPeriodProrationFactor" DECIMAL(8,6) NOT NULL,
    "firstPeriodGrossProrated" DECIMAL(12,2) NOT NULL,
    "firstPayDueAt" TIMESTAMP(3) NOT NULL,
    "readinessStatus" TEXT NOT NULL DEFAULT 'BLOCKED',
    "blockReasons" JSONB NOT NULL,
    "alertReasons" JSONB,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_employee_payroll_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_benefit" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_tax_declaration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaxDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_payroll_adjustment" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PayrollAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_statutory_payment" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StatutoryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_policy" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeavePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_balance" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_request" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_encashment" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaveEncashment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_accrual" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaveAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_carry_forward" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaveCarryForward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_comp_off_earned" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompOffEarned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_translation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_localization_config" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LocalizationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_pf_configuration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaPFConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_pf_submission" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaPFSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_pf_record" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaPFRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_esi_configuration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaESIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_esi_submission" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaESISubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_esi_record" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaESIRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_tds_configuration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaTDSConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_tds_declaration" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaTDSDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_professional_tax_config" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaProfessionalTaxConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_india_professional_tax_deduction" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndiaProfessionalTaxDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_audit_log" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ComplianceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_document" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "ocrData" JSONB,
    "isAIParsed" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_asset" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_asset_assignment" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_asset_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_asset_maintenance" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_asset_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_asset_category" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "depreciationRate" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_asset_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employment_history" (
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
    "previousStatusId" TEXT,
    "newStatusId" TEXT,
    "beforeValues" JSONB,
    "afterValues" JSONB,
    "actorId" TEXT,
    "sourceType" TEXT DEFAULT 'MANUAL',
    "sourceMetadata" JSONB,
    "isBackfilled" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_position" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "utilizationRate" DECIMAL(5,2),
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "budgetCommitted" DECIMAL(18,2),
    "actualCost" DECIMAL(18,2),

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_employee_life_event" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeLifeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_life_event_type" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LifeEventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_id_card_template" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IDCardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_id_card" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IDCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_letter_template" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "letterType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_letter" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_exit_request" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExitRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_exit_clearance" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExitClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_probation_tracking" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProbationTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_probation_review" (
    "id" TEXT NOT NULL,
    "probationId" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "performanceRating" INTEGER NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProbationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_confirmation_request" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConfirmationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_report_definition" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReportDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_report_execution" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReportExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_dashboard_widget" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_predictive_model" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PredictiveModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_prediction" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ai_agent_conversation" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ai_agent_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ai_agent_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" INTEGER,
    "model" TEXT,
    "actionTaken" TEXT,
    "actionResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ai_agent_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_analytics_cache" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "recordCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_analytics_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_plan" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "BenefitPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_enrollment" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "onboardingInstanceId" TEXT,
    "vendorReference" TEXT,
    "vendorEnrollmentFile" JSONB,
    "insuranceCardStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "insuranceCardIssuedAt" TIMESTAMP(3),

    CONSTRAINT "BenefitEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_dependent" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_claim" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BenefitClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_healthcare_provider" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HealthcareProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_qualifying_event" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QualifyingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_enrollment_window" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EnrollmentWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_premium_rate" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PremiumRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_premium_deduction" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PremiumDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_tax_document" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaxDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_continuous_feedback" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContinuousFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_recognition" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Recognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_one_on_one_meeting" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OneOnOneMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_one_on_one_note" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OneOnOneNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_one_on_one_action_item" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OneOnOneActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_learning_path" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_learning_path_enrollment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningPathEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_learning_progress" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_assessment" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_assessment_submission" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_assessment_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_webhook" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_webhook_log" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_custom_report" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_workflow_definition" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_workflow_instance" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_project_time_entry" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_geofence_location" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GeofenceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_expense_claim" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DECIMAL(18,2),
    "policyId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "paidReference" TEXT,

    CONSTRAINT "ExpenseClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_api_key" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emergency_contact" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_garnishment" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Garnishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hsa_fsa_account" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HSAFSAAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hsa_fsa_transaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HSAFSATransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_candidate" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_candidate_application" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CandidateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_interview" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_interview_feedback" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_offer" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_background_check" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BackgroundCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_job_requisition" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_recruitment_vendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'under_review',
    "contactPersonName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "location" TEXT,
    "rating" DOUBLE PRECISION,
    "activePlacements" INTEGER NOT NULL DEFAULT 0,
    "totalPlacements" INTEGER NOT NULL DEFAULT 0,
    "totalHires" INTEGER NOT NULL DEFAULT 0,
    "averageTimeToFillDays" INTEGER,
    "monthlySpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "complianceStatus" TEXT NOT NULL DEFAULT 'not_reviewed',
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "specialties" TEXT[],
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RecruitmentVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_program" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country_onboarding_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "ruleSet" JSONB NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_country_onboarding_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_governance_template" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "employmentType" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stageConfig" JSONB NOT NULL,
    "checklistTemplate" JSONB,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_onboarding_governance_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_case" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "offerId" TEXT,
    "onboardingInstanceId" TEXT,
    "employeeId" TEXT,
    "candidateName" TEXT,
    "candidateEmail" TEXT,
    "countryCode" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "targetJoinDate" TIMESTAMP(3) NOT NULL,
    "currentStage" TEXT NOT NULL DEFAULT 'PRE_JOINING',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "stageOwnerRole" TEXT NOT NULL,
    "escalationRole" TEXT,
    "governanceTemplateId" TEXT,
    "governanceVersion" TEXT,
    "governanceSnapshot" JSONB NOT NULL,
    "checklistSnapshot" JSONB,
    "blockingItems" JSONB NOT NULL DEFAULT '[]',
    "slaDueAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "escalatedToRole" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_onboarding_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_stage_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT,
    "blockingItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_onboarding_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_guidance_content" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contentKey" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "objectives" JSONB NOT NULL,
    "keyTakeaways" JSONB NOT NULL,
    "obligations" JSONB,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_onboarding_guidance_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_guidance_view_log" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentKey" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "onboardingCaseId" TEXT,
    "userId" TEXT,
    "stage" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_onboarding_guidance_view_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_instance" (
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
    "countryCode" TEXT,
    "countryRuleId" TEXT,
    "countryRuleVersion" TEXT,
    "countryRuleSnapshot" JSONB,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_onboarding_task" (
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
    "ruleTaskCode" TEXT,
    "documentRequirements" JSONB,
    "downstreamTrigger" TEXT,
    "blockingStage" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_performance_review" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_review_cycle" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReviewCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_performance_goal" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PerformanceGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_calibration_session" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CalibrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_salary_component" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compensation_band" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CompensationBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_increment_cycle" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IncrementCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_notification" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_notification_recipient" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'push',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_notification_template" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_course" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "durationHours" DOUBLE PRECISION,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "complianceCategory" TEXT,
    "certificationValidMonths" INTEGER,
    "requiredForRoles" TEXT[],
    "requiredForCountries" TEXT[],

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_course_enrollment" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_training_session" (
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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_session_attendee" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SessionAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_certification" (
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_mentoring_program" (
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MentoringProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_time_rounding_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "applicableTo" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_time_rounding_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_roster_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_roster_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wfh_policy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_wfh_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_shift_swap_policy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_shift_swap_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_attendance_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_geofence_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fenceType" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL,
    "address" TEXT,
    "strictMode" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_geofence_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ip_restriction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "restrictionType" TEXT NOT NULL,
    "strictMode" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_ip_restriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_comp_off_policy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_comp_off_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_punch_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_punch_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_field_force_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_field_force_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_industry_aviation_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT,
    "airlineCode" TEXT NOT NULL,
    "iataCode" TEXT,
    "icaoCode" TEXT,
    "dutyTimeRegulation" TEXT,
    "fleetConfig" JSONB,
    "pilotLicenseRenewalNoticeDays" INTEGER NOT NULL DEFAULT 30,
    "medicalCertRenewalNoticeDays" INTEGER NOT NULL DEFAULT 45,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "aura_industry_aviation_settings_pkey" PRIMARY KEY ("id")
);

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
    "createdBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_auto_number_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gcc_tenant_country" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultCurrency" TEXT NOT NULL,
    "defaultTimezone" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabledBy" TEXT,
    "disabledAt" TIMESTAMP(3),
    "disabledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gcc_tenant_country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gcc_legal_entity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantCountryId" TEXT NOT NULL,
    "companyId" TEXT,
    "countryCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "registrationRef" TEXT NOT NULL,
    "registrationType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gcc_legal_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gcc_country_profile" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "weekendPattern" TEXT NOT NULL,
    "statutoryCurrency" TEXT NOT NULL,
    "labourAuthority" TEXT NOT NULL,
    "socialInsuranceAuthority" TEXT NOT NULL,
    "nationalizationProgramme" TEXT NOT NULL,
    "expatProfile" TEXT NOT NULL,
    "marketNotes" TEXT NOT NULL,
    "authoritiesJson" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gcc_country_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_workforce_classification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "countryOfEmployment" TEXT NOT NULL,
    "isGccNational" BOOLEAN NOT NULL DEFAULT false,
    "workforceClass" TEXT NOT NULL,
    "isEmiratisationEligible" BOOLEAN NOT NULL DEFAULT false,
    "isCrossGccUnified" BOOLEAN NOT NULL DEFAULT false,
    "classificationVersion" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_workforce_classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_platform_alert_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "countryScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entityScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thresholds" JSONB NOT NULL,
    "recipientRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_platform_alert_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_platform_alert_instance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertRuleId" TEXT NOT NULL,
    "thresholdDays" INTEGER NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "triggeredFor" TIMESTAMP(3) NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL,
    "recipientRole" TEXT,
    "recipientUserId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'FIRED',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_platform_alert_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gcc_role_scope" (
    "id" TEXT NOT NULL,
    "userRoleId" TEXT NOT NULL,
    "countryCode" TEXT,
    "legalEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gcc_role_scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_risk_register" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "riskCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "countryScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entityScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mitigation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reviewDueAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_risk_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_localization_target" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "targetPct" DECIMAL(5,2) NOT NULL,
    "amberThreshold" DECIMAL(5,2) NOT NULL,
    "redThreshold" DECIMAL(5,2) NOT NULL,
    "programme" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_localization_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_workforce_kpi_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT,
    "legalEntityId" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalHeadcount" INTEGER NOT NULL,
    "nationalCount" INTEGER NOT NULL,
    "gccOtherCount" INTEGER NOT NULL,
    "expatCount" INTEGER NOT NULL,
    "nationalPct" DECIMAL(5,2) NOT NULL,
    "targetPct" DECIMAL(5,2),
    "ragStatus" TEXT,
    "metricsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_workforce_kpi_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_digital_maturity_domain" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ordering" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_digital_maturity_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_digital_maturity_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "targetLevel" INTEGER NOT NULL,
    "gap" INTEGER NOT NULL,
    "notes" TEXT,
    "isImprovementPriority" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_digital_maturity_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_theme" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country_rule_pack" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_country_rule_pack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country_rule" (
    "id" TEXT NOT NULL,
    "rulePackId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "formula" TEXT,
    "authority" TEXT,
    "citation" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_country_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country_risk_matrix" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "riskCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "controlRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "remediationDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_country_risk_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country_audit_checklist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "checklistCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "redFlagDefinitions" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_country_audit_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_country_compliance_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "domainStatus" JSONB NOT NULL,
    "criticalOpenRisks" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_country_compliance_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_kpi_definition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "lineage" JSONB NOT NULL DEFAULT '{}',
    "unit" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "reviewDueAt" TIMESTAMP(3),
    "supersededBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_kpi_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_kpi_threshold" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kpiCode" TEXT NOT NULL,
    "countryCode" TEXT,
    "greenMin" DECIMAL(10,4),
    "greenMax" DECIMAL(10,4),
    "amberMin" DECIMAL(10,4),
    "amberMax" DECIMAL(10,4),
    "redMin" DECIMAL(10,4),
    "redMax" DECIMAL(10,4),
    "statutoryRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_kpi_threshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_kpi_value" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kpiCode" TEXT NOT NULL,
    "countryCode" TEXT,
    "legalEntityId" TEXT,
    "period" TEXT NOT NULL,
    "value" DECIMAL(14,4) NOT NULL,
    "ragStatus" TEXT,
    "statutoryBreach" BOOLEAN NOT NULL DEFAULT false,
    "dataQualityPass" BOOLEAN NOT NULL DEFAULT false,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_kpi_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_kpi_data_quality_check" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kpiCode" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_kpi_data_quality_check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_kpi_scorecard_weight" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_kpi_scorecard_weight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_kpi_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "kpisComputed" INTEGER NOT NULL DEFAULT 0,
    "dqFailures" INTEGER NOT NULL DEFAULT 0,
    "redKpis" INTEGER NOT NULL DEFAULT 0,
    "actionedRedKpis" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_kpi_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_calendar_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_recurrence_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_holiday_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_audit_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_audit_sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_audit_test_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_audit_finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_corrective_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_management_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_calendar_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_checklist_template" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "appendixRef" TEXT,
    "description" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewCadence" TEXT NOT NULL DEFAULT 'ANNUAL',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "supersededBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_checklist_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_checklist_item" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "controlObjective" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT true,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "weighting" INTEGER NOT NULL DEFAULT 1,
    "redFlagRuleCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_checklist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_red_flag_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "thresholdJson" JSONB NOT NULL DEFAULT '{}',
    "countryCode" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_red_flag_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_checklist_run" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "countryCode" TEXT,
    "legalEntityId" TEXT,
    "employeeId" TEXT,
    "ownerRole" TEXT NOT NULL,
    "preparerId" TEXT,
    "approverId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "compliantItems" INTEGER NOT NULL DEFAULT 0,
    "nonCompliantItems" INTEGER NOT NULL DEFAULT 0,
    "naItems" INTEGER NOT NULL DEFAULT 0,
    "weightedScore" DECIMAL(6,2),
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_checklist_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_checklist_run_item" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "controlObjective" TEXT NOT NULL,
    "weighting" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "evidenceUrl" TEXT,
    "reason" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "autoEvaluated" BOOLEAN NOT NULL DEFAULT false,
    "redFlagId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_checklist_run_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_red_flag_instance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "checklistRunId" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_red_flag_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_exception" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "registerCode" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "redFlagId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_checklist_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "runsExecuted" INTEGER NOT NULL DEFAULT 0,
    "criticalRedFlags" INTEGER NOT NULL DEFAULT 0,
    "openCriticalExceptions" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_checklist_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_scheme" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "statutoryWindowDays" INTEGER NOT NULL,
    "mandatoryScope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_establishment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "employerId" TEXT NOT NULL,
    "establishmentName" TEXT NOT NULL,
    "agentBankCode" TEXT,
    "agentBankName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_period_submission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "fileFormat" TEXT NOT NULL,
    "fileContent" TEXT,
    "fileHash" TEXT,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "controlTotals" JSONB NOT NULL DEFAULT '{}',
    "dueDate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "ackReference" TEXT,
    "reconciledAt" TIMESTAMP(3),
    "reconciliationStatus" TEXT,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_period_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_employee_row" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "nationalId" TEXT,
    "labourCardNumber" TEXT,
    "iban" TEXT NOT NULL,
    "bankSwift" TEXT,
    "currency" TEXT NOT NULL,
    "fixedPay" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variablePay" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(14,2) NOT NULL,
    "daysWorked" INTEGER,
    "rowStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionCode" TEXT,
    "rejectionReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_employee_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_exception" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionId" TEXT,
    "employeeId" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_salary_delay_flag" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionId" TEXT,
    "employeeId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "creditedAt" TIMESTAMP(3),
    "daysLate" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_salary_delay_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_penalty" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(14,2),
    "currency" TEXT,
    "description" TEXT NOT NULL,
    "businessImpact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_wps_monthly_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submissionsCount" INTEGER NOT NULL DEFAULT 0,
    "delayFlagsCount" INTEGER NOT NULL DEFAULT 0,
    "openExceptionsCount" INTEGER NOT NULL DEFAULT 0,
    "openPenaltiesCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_wps_monthly_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_establishment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "gosiNumber" TEXT NOT NULL,
    "establishmentName" TEXT NOT NULL,
    "isInScope" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_branch_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "appliesTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_branch_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_contribution_rate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "employerPct" DECIMAL(7,4) NOT NULL,
    "employeePct" DECIMAL(7,4) NOT NULL,
    "wageFloor" DECIMAL(14,2),
    "wageCeiling" DECIMAL(14,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "citation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_contribution_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_employee_registration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "gosiPersonalNumber" TEXT,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deregistrationDate" TIMESTAMP(3),
    "deregistrationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_employee_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_contribution_wage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "basicWage" DECIMAL(14,2) NOT NULL,
    "housingAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherAllowances" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "contributionWage" DECIMAL(14,2) NOT NULL,
    "salaryStructureRef" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "salaryChangeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_contribution_wage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_contribution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "contributionWage" DECIMAL(14,2) NOT NULL,
    "annuitiesEmployer" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "annuitiesEmployee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ohEmployer" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalEmployer" DECIMAL(14,2) NOT NULL,
    "totalEmployee" DECIMAL(14,2) NOT NULL,
    "rateRefs" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_period_submission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalEmployerAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalEmployeeAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "filePath" TEXT,
    "fileHash" TEXT,
    "dueDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "ackReference" TEXT,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_period_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_variance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expected" DECIMAL(14,2),
    "actual" DECIMAL(14,2),
    "difference" DECIMAL(14,2),
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerRole" TEXT NOT NULL DEFAULT 'PAYROLL_OFFICER',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_variance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submissionsCount" INTEGER NOT NULL DEFAULT 0,
    "openVariancesCount" INTEGER NOT NULL DEFAULT 0,
    "criticalVariancesCount" INTEGER NOT NULL DEFAULT 0,
    "lateSubmissionsCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gosi_event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "period" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gosi_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_establishment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "gpssaNumber" TEXT NOT NULL,
    "mohreNumber" TEXT,
    "establishmentName" TEXT NOT NULL,
    "isInScope" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_contribution_rate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "employerPct" DECIMAL(7,4) NOT NULL,
    "employeePct" DECIMAL(7,4) NOT NULL,
    "governmentPct" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "wageFloor" DECIMAL(14,2),
    "wageCeiling" DECIMAL(14,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "citation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_contribution_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_employee_registration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "gpssaPersonalNumber" TEXT,
    "emiratesId" TEXT,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deregistrationDate" TIMESTAMP(3),
    "deregistrationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_employee_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_contribution_wage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "basicWage" DECIMAL(14,2) NOT NULL,
    "housingAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherAllowances" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "contributionWage" DECIMAL(14,2) NOT NULL,
    "salaryStructureRef" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "salaryChangeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_contribution_wage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_contribution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "contributionWage" DECIMAL(14,2) NOT NULL,
    "employerAmount" DECIMAL(14,2) NOT NULL,
    "employeeAmount" DECIMAL(14,2) NOT NULL,
    "governmentAmount" DECIMAL(14,2) NOT NULL,
    "rateRef" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_period_submission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalEmployer" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalEmployee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalGovernment" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "filePath" TEXT,
    "fileHash" TEXT,
    "dueDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "ackReference" TEXT,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_period_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_variance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expected" DECIMAL(14,2),
    "actual" DECIMAL(14,2),
    "difference" DECIMAL(14,2),
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerRole" TEXT NOT NULL DEFAULT 'PAYROLL_OFFICER',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_variance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submissionsCount" INTEGER NOT NULL DEFAULT 0,
    "openVariancesCount" INTEGER NOT NULL DEFAULT 0,
    "criticalVariancesCount" INTEGER NOT NULL DEFAULT 0,
    "lateSubmissionsCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_transfer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fromEstablishmentId" TEXT,
    "toEstablishmentId" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "serviceMonthsPreserved" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_gpssa_event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "period" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_gpssa_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_establishment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "sioNumber" TEXT NOT NULL,
    "crNumber" TEXT,
    "establishmentName" TEXT NOT NULL,
    "isInScope" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_branch_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "appliesTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_branch_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_contribution_rate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "employerPct" DECIMAL(7,4) NOT NULL,
    "employeePct" DECIMAL(7,4) NOT NULL,
    "wageFloor" DECIMAL(14,2),
    "wageCeiling" DECIMAL(14,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "citation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_contribution_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_employee_registration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "sioPersonalNumber" TEXT,
    "cpr" TEXT,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deregistrationDate" TIMESTAMP(3),
    "deregistrationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_employee_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_contribution_wage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "basicWage" DECIMAL(14,2) NOT NULL,
    "housingAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "otherAllowances" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "contributionWage" DECIMAL(14,2) NOT NULL,
    "salaryStructureRef" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "salaryChangeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_contribution_wage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_contribution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "nationalityClass" TEXT NOT NULL,
    "contributionWage" DECIMAL(14,2) NOT NULL,
    "insuranceEmployer" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "insuranceEmployee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "unemploymentEmployer" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "unemploymentEmployee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalEmployer" DECIMAL(14,2) NOT NULL,
    "totalEmployee" DECIMAL(14,2) NOT NULL,
    "rateRefs" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_period_submission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalEmployer" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalEmployee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "filePath" TEXT,
    "fileHash" TEXT,
    "dueDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "ackReference" TEXT,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_period_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_variance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "establishmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expected" DECIMAL(14,2),
    "actual" DECIMAL(14,2),
    "difference" DECIMAL(14,2),
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerRole" TEXT NOT NULL DEFAULT 'PAYROLL_OFFICER',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_variance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submissionsCount" INTEGER NOT NULL DEFAULT 0,
    "openVariancesCount" INTEGER NOT NULL DEFAULT 0,
    "criticalVariancesCount" INTEGER NOT NULL DEFAULT 0,
    "lateSubmissionsCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_sio_event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "period" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_sio_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emiratisation_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "establishmentName" TEXT NOT NULL,
    "isInScope" BOOLEAN NOT NULL DEFAULT true,
    "skilledWorkforceCount" INTEGER NOT NULL DEFAULT 0,
    "sector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_emiratisation_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emiratisation_target" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "year" INTEGER NOT NULL,
    "halfYearTargetPct" DECIMAL(5,2) NOT NULL,
    "yearEndTargetPct" DECIMAL(5,2) NOT NULL,
    "finePerMissedHire" DECIMAL(14,2) NOT NULL DEFAULT 7000,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_emiratisation_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emiratisation_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "checkpointDate" TIMESTAMP(3) NOT NULL,
    "checkpoint" TEXT NOT NULL,
    "skilledHeadcount" INTEGER NOT NULL,
    "uaeNationalCount" INTEGER NOT NULL,
    "actualPct" DECIMAL(5,2) NOT NULL,
    "targetPct" DECIMAL(5,2) NOT NULL,
    "gapPct" DECIMAL(5,2) NOT NULL,
    "missedHires" INTEGER NOT NULL DEFAULT 0,
    "projectedFine" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ragStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_emiratisation_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emiratisation_hire" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "employeeId" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "jobLevel" TEXT,
    "isSkilled" BOOLEAN NOT NULL DEFAULT true,
    "nafisReference" TEXT,
    "gpssaRegistered" BOOLEAN NOT NULL DEFAULT false,
    "wpsCovered" BOOLEAN NOT NULL DEFAULT false,
    "fakeRiskScore" INTEGER NOT NULL DEFAULT 0,
    "fakeRiskFlags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_emiratisation_hire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emiratisation_fine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "year" INTEGER NOT NULL,
    "checkpoint" TEXT NOT NULL,
    "missedHires" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" TEXT NOT NULL DEFAULT 'PROJECTED',
    "incurredAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_emiratisation_fine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_emiratisation_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "entitiesInScope" INTEGER NOT NULL DEFAULT 0,
    "entitiesAtTarget" INTEGER NOT NULL DEFAULT 0,
    "totalMissedHires" INTEGER NOT NULL DEFAULT 0,
    "totalProjectedFines" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fakeRiskCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_emiratisation_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "establishmentName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sizeBracket" TEXT NOT NULL,
    "saudiHeadcount" INTEGER NOT NULL DEFAULT 0,
    "totalHeadcount" INTEGER NOT NULL DEFAULT 0,
    "qiwaNumber" TEXT,
    "isInScope" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_nitaqat_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_band_threshold" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sizeBracket" TEXT NOT NULL,
    "redMaxPct" DECIMAL(5,2) NOT NULL,
    "yellowMaxPct" DECIMAL(5,2) NOT NULL,
    "greenMaxPct" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_nitaqat_band_threshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_band_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "saudiHeadcount" INTEGER NOT NULL,
    "totalHeadcount" INTEGER NOT NULL,
    "saudizationPct" DECIMAL(5,2) NOT NULL,
    "band" TEXT NOT NULL,
    "redMaxPct" DECIMAL(5,2) NOT NULL,
    "yellowMaxPct" DECIMAL(5,2) NOT NULL,
    "greenMaxPct" DECIMAL(5,2) NOT NULL,
    "platinumThresholdPct" DECIMAL(5,2),
    "ptToNextBandHires" INTEGER NOT NULL DEFAULT 0,
    "privilegesJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_nitaqat_band_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_hire" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "employeeId" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "qiwaContractRef" TEXT,
    "gosiRegistered" BOOLEAN NOT NULL DEFAULT false,
    "mudadCovered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_nitaqat_hire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_nitaqat_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "entitiesInScope" INTEGER NOT NULL DEFAULT 0,
    "platinumCount" INTEGER NOT NULL DEFAULT 0,
    "greenCount" INTEGER NOT NULL DEFAULT 0,
    "yellowCount" INTEGER NOT NULL DEFAULT 0,
    "redCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_nitaqat_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_bahrainization_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "establishmentName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sizeBracket" TEXT NOT NULL,
    "bahrainiHeadcount" INTEGER NOT NULL DEFAULT 0,
    "totalHeadcount" INTEGER NOT NULL DEFAULT 0,
    "lmraEstablishmentId" TEXT,
    "isInScope" BOOLEAN NOT NULL DEFAULT true,
    "isGovernmentTenderEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_bahrainization_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_bahrainization_target" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sizeBracket" TEXT NOT NULL,
    "targetRatioPct" DECIMAL(5,2) NOT NULL,
    "tenderEligibilityMinPct" DECIMAL(5,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "basis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_bahrainization_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_bahrainization_hire" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "employeeId" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "jobLevel" TEXT,
    "isBahraini" BOOLEAN NOT NULL DEFAULT true,
    "cprNumber" TEXT,
    "sioRegistered" BOOLEAN NOT NULL DEFAULT false,
    "wageEvidenceLinked" BOOLEAN NOT NULL DEFAULT false,
    "tamkeenSupported" BOOLEAN NOT NULL DEFAULT false,
    "artificialRiskScore" INTEGER NOT NULL DEFAULT 0,
    "artificialRiskFlags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_bahrainization_hire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_bahrainization_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "bahrainiHeadcount" INTEGER NOT NULL,
    "totalHeadcount" INTEGER NOT NULL,
    "ratioPct" DECIMAL(5,2) NOT NULL,
    "targetRatioPct" DECIMAL(5,2) NOT NULL,
    "gapPct" DECIMAL(6,2) NOT NULL,
    "ragStatus" TEXT NOT NULL,
    "missedHires" INTEGER NOT NULL DEFAULT 0,
    "lmraGated" BOOLEAN NOT NULL DEFAULT false,
    "tenderEligible" BOOLEAN NOT NULL DEFAULT false,
    "evidenceJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_bahrainization_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_bahrainization_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "entitiesInScope" INTEGER NOT NULL DEFAULT 0,
    "entitiesAtTarget" INTEGER NOT NULL DEFAULT 0,
    "entitiesLmraGated" INTEGER NOT NULL DEFAULT 0,
    "entitiesTenderEligible" INTEGER NOT NULL DEFAULT 0,
    "totalMissedHires" INTEGER NOT NULL DEFAULT 0,
    "artificialRiskCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_bahrainization_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ot_policy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "grade" TEXT,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "standardDailyHours" DECIMAL(5,2) NOT NULL DEFAULT 8,
    "standardWeeklyHours" DECIMAL(5,2) NOT NULL DEFAULT 48,
    "maxDailyOtHours" DECIMAL(5,2) NOT NULL DEFAULT 2,
    "maxMonthlyOtHours" DECIMAL(6,2) NOT NULL DEFAULT 40,
    "requiresPreApproval" BOOLEAN NOT NULL DEFAULT true,
    "allowsCompOff" BOOLEAN NOT NULL DEFAULT true,
    "ramadanDailyHours" DECIMAL(5,2) NOT NULL DEFAULT 6,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ot_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ot_rate_card" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "otType" TEXT NOT NULL,
    "multiplier" DECIMAL(5,2) NOT NULL,
    "basis" TEXT NOT NULL DEFAULT 'BASIC',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ot_rate_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ot_request" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "plannedHours" DECIMAL(5,2) NOT NULL,
    "otType" TEXT NOT NULL,
    "reason" TEXT,
    "costCenterId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ot_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ot_actual" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "otDate" TIMESTAMP(3) NOT NULL,
    "otType" TEXT NOT NULL,
    "actualHours" DECIMAL(5,2) NOT NULL,
    "multiplier" DECIMAL(5,2),
    "hourlyRate" DECIMAL(12,4),
    "computedAmount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "requestId" TEXT,
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "fraudFlags" JSONB NOT NULL DEFAULT '[]',
    "compOffHoursGranted" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "payrollPosted" BOOLEAN NOT NULL DEFAULT false,
    "payrollPostedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ot_actual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ot_budget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "costCenterId" TEXT,
    "country" TEXT,
    "budgetHours" DECIMAL(8,2) NOT NULL,
    "budgetAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "actualHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "actualAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ot_budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_ot_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "exceedsCount" INTEGER NOT NULL DEFAULT 0,
    "fraudCount" INTEGER NOT NULL DEFAULT 0,
    "budgetBreachCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_ot_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_eosb_calculation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDate" TIMESTAMP(3) NOT NULL,
    "terminationType" TEXT NOT NULL,
    "basicSalary" DECIMAL(14,2) NOT NULL,
    "totalServiceYears" DECIMAL(8,4) NOT NULL,
    "totalServiceMonths" INTEGER NOT NULL,
    "unpaidLeaveDays" INTEGER NOT NULL DEFAULT 0,
    "dailyRate" DECIMAL(14,4) NOT NULL,
    "gratuityAmount" DECIMAL(14,2) NOT NULL,
    "socialInsuranceOffset" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netPayable" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "law" TEXT,
    "formula" TEXT,
    "notesJson" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "settledAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_eosb_calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_eosb_accrual" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "basicSalary" DECIMAL(14,2) NOT NULL,
    "serviceMonths" INTEGER NOT NULL,
    "accruedGratuity" DECIMAL(14,2) NOT NULL,
    "monthDelta" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "glPosted" BOOLEAN NOT NULL DEFAULT false,
    "glJournalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_eosb_accrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_eosb_dispute" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "calculationId" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisedBy" TEXT,
    "subject" TEXT NOT NULL,
    "claimedAmount" DECIMAL(14,2),
    "calculatedAmount" DECIMAL(14,2),
    "currency" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_eosb_dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_eosb_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "calcsCount" INTEGER NOT NULL DEFAULT 0,
    "calcsTotalAmount" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "accrualsCount" INTEGER NOT NULL DEFAULT 0,
    "accrualsTotalAmount" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "openDisputesCount" INTEGER NOT NULL DEFAULT 0,
    "unsettledCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_eosb_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_visa_exit_case" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "visaNumber" TEXT,
    "workPermitNumber" TEXT,
    "passportNumber" TEXT,
    "lastWorkingDate" TIMESTAMP(3),
    "cancellationDate" TIMESTAMP(3),
    "graceExpiresAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "proAssigneeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "subStatus" TEXT,
    "dependentsCount" INTEGER NOT NULL DEFAULT 0,
    "ticketRequired" BOOLEAN NOT NULL DEFAULT false,
    "ticketIssued" BOOLEAN NOT NULL DEFAULT false,
    "finalSettlementId" TEXT,
    "siClosureRef" TEXT,
    "absconding" BOOLEAN NOT NULL DEFAULT false,
    "abscondingReportedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_visa_exit_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_visa_exit_pro_action" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "authority" TEXT,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_visa_exit_pro_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_visa_exit_grace" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "daysGranted" INTEGER NOT NULL,
    "graceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "extensionCount" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_visa_exit_grace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_visa_exit_evidence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "evidenceType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedBy" TEXT,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_visa_exit_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_visa_exit_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "casesOpened" INTEGER NOT NULL DEFAULT 0,
    "casesClosed" INTEGER NOT NULL DEFAULT 0,
    "casesAbsconding" INTEGER NOT NULL DEFAULT 0,
    "graceExpiringCount" INTEGER NOT NULL DEFAULT 0,
    "overduePoActions" INTEGER NOT NULL DEFAULT 0,
    "missingEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_visa_exit_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_doc_retention_schedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "countryCode" TEXT,
    "recordType" TEXT NOT NULL,
    "retentionYears" INTEGER NOT NULL,
    "basis" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'INTERNAL',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_doc_retention_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "recordType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'INTERNAL',
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3),
    "litigationHoldId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "disposedAt" TIMESTAMP(3),
    "disposedBy" TEXT,
    "disposalReason" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_doc_litigation_hold" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "scopeFilter" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "startedBy" TEXT,
    "endedAt" TIMESTAMP(3),
    "endedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "heldDocCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_doc_litigation_hold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_doc_disposal_request" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentIds" JSONB NOT NULL DEFAULT '[]',
    "reason" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedBy" TEXT,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "executedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "blockedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_doc_disposal_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_audit_cycle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scopeJson" JSONB NOT NULL DEFAULT '{}',
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "findingsCount" INTEGER NOT NULL DEFAULT 0,
    "findingsClosedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_audit_cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_audit_finding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "auditCycleId" TEXT NOT NULL,
    "documentId" TEXT,
    "employeeId" TEXT,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "remediation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_audit_finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_doc_compliance_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "activeDocs" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonCount" INTEGER NOT NULL DEFAULT 0,
    "expiredCount" INTEGER NOT NULL DEFAULT 0,
    "litigationHoldCount" INTEGER NOT NULL DEFAULT 0,
    "pendingDisposalCount" INTEGER NOT NULL DEFAULT 0,
    "openFindingsCount" INTEGER NOT NULL DEFAULT 0,
    "criticalFindingsCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_doc_compliance_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_catalogue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "benefitCode" TEXT NOT NULL,
    "benefitType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "countryCode" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "minGrade" TEXT,
    "valuationBasis" TEXT NOT NULL DEFAULT 'FIXED',
    "annualValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "frequencyMonths" INTEGER NOT NULL DEFAULT 12,
    "dependantsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "vendorRequired" BOOLEAN NOT NULL DEFAULT false,
    "policyJson" JSONB NOT NULL DEFAULT '{}',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_benefit_catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_vendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorType" TEXT NOT NULL,
    "country" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contractRef" TEXT,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "dpaSigned" BOOLEAN NOT NULL DEFAULT false,
    "dpaSignedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_benefit_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_coverage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "benefitCatalogueId" TEXT NOT NULL,
    "vendorId" TEXT,
    "policyNumber" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastRenewedAt" TIMESTAMP(3),
    "actualAnnualValue" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "dependantsCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastAccruedAt" TIMESTAMP(3),
    "accruedBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_benefit_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_exception" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "benefitCode" TEXT NOT NULL,
    "exceptionType" TEXT NOT NULL,
    "reason" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisedBy" TEXT,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_benefit_exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_benefit_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "activeEnrollments" INTEGER NOT NULL DEFAULT 0,
    "mandatoryCoverGapCount" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonCount" INTEGER NOT NULL DEFAULT 0,
    "expiredCount" INTEGER NOT NULL DEFAULT 0,
    "openExceptionsCount" INTEGER NOT NULL DEFAULT 0,
    "vendorsWithoutDpa" INTEGER NOT NULL DEFAULT 0,
    "totalAccruedLiability" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_benefit_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_policy_exception" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "employeeId" TEXT,
    "scopeLabel" TEXT,
    "reason" TEXT NOT NULL,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisedBy" TEXT,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_policy_exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_policy_review" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "intervalMonths" INTEGER NOT NULL DEFAULT 12,
    "lastReviewedAt" TIMESTAMP(3),
    "lastReviewedBy" TEXT,
    "reviewerNotes" TEXT,
    "outcome" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_policy_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_policy_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedCount" INTEGER NOT NULL DEFAULT 0,
    "draftCount" INTEGER NOT NULL DEFAULT 0,
    "overdueReviewsCount" INTEGER NOT NULL DEFAULT 0,
    "pendingExceptionsCount" INTEGER NOT NULL DEFAULT 0,
    "ackCoveragePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "ackBelowThresholdCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_policy_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_form_template" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "formGroup" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "schemaJson" JSONB NOT NULL DEFAULT '{}',
    "writebackTarget" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "countryCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "supersededById" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_form_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_form_routing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "stageLabel" TEXT NOT NULL,
    "approverRole" TEXT,
    "approverId" TEXT,
    "slaHours" INTEGER NOT NULL DEFAULT 48,
    "isParallel" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_form_routing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_form_submission_state" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "submissionRef" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "currentStage" INTEGER NOT NULL DEFAULT 0,
    "totalStages" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "writebackStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "writebackRef" TEXT,
    "writebackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_form_submission_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_form_signature" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionStateId" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "signerRole" TEXT,
    "signerId" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "signatureHash" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_form_signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hr_form_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "templatesPublished" INTEGER NOT NULL DEFAULT 0,
    "submissionsTotal" INTEGER NOT NULL DEFAULT 0,
    "submissionsApproved" INTEGER NOT NULL DEFAULT 0,
    "submissionsRejected" INTEGER NOT NULL DEFAULT 0,
    "submissionsPending" INTEGER NOT NULL DEFAULT 0,
    "writebackFailures" INTEGER NOT NULL DEFAULT 0,
    "slaBreachCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hr_form_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_policy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "grade" TEXT,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "lateToleranceMin" INTEGER NOT NULL DEFAULT 10,
    "earlyDepartureToleranceMin" INTEGER NOT NULL DEFAULT 10,
    "missingPunchSlaHours" INTEGER NOT NULL DEFAULT 24,
    "regularizationSlaDays" INTEGER NOT NULL DEFAULT 3,
    "absconding3DayThreshold" BOOLEAN NOT NULL DEFAULT true,
    "ramadanReducedHours" DECIMAL(5,2) NOT NULL DEFAULT 6,
    "remoteWorkAllowed" BOOLEAN NOT NULL DEFAULT true,
    "fraudGeofenceRadiusM" INTEGER NOT NULL DEFAULT 200,
    "biometricRequired" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_attendance_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_fraud_flag" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "punchDate" TIMESTAMP(3) NOT NULL,
    "flagType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "score" INTEGER NOT NULL DEFAULT 0,
    "evidenceJson" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_attendance_fraud_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_consent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_attendance_consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_attendance_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "punchesTotal" INTEGER NOT NULL DEFAULT 0,
    "missingPunchCount" INTEGER NOT NULL DEFAULT 0,
    "lateCount" INTEGER NOT NULL DEFAULT 0,
    "regularizationsPending" INTEGER NOT NULL DEFAULT 0,
    "fraudFlagsOpen" INTEGER NOT NULL DEFAULT 0,
    "absconding3DayCount" INTEGER NOT NULL DEFAULT 0,
    "consentMissingCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_attendance_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_entitlement_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "leaveCode" TEXT NOT NULL,
    "annualDays" DECIMAL(6,2) NOT NULL,
    "accrualBasis" TEXT NOT NULL DEFAULT 'MONTHLY',
    "maxCarryForwardDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "encashableDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "isMedicalEvidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "minServiceMonths" INTEGER NOT NULL DEFAULT 0,
    "maxConsecutiveDays" DECIMAL(6,2) NOT NULL DEFAULT 365,
    "noticePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_leave_entitlement_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_misuse_flag" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveRequestId" TEXT,
    "flagType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "score" INTEGER NOT NULL DEFAULT 0,
    "evidenceJson" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_leave_misuse_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_medical_evidence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "classification" TEXT NOT NULL DEFAULT 'RESTRICTED',
    "retentionUntil" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "fraudFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_leave_medical_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_leave_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "requestsTotal" INTEGER NOT NULL DEFAULT 0,
    "requestsApproved" INTEGER NOT NULL DEFAULT 0,
    "requestsPending" INTEGER NOT NULL DEFAULT 0,
    "encashmentsCount" INTEGER NOT NULL DEFAULT 0,
    "carryForwardsCount" INTEGER NOT NULL DEFAULT 0,
    "openMisuseFlags" INTEGER NOT NULL DEFAULT 0,
    "missingMedicalEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "unpaidLeaveDays" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_leave_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_holiday_pay_rule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "holidayClass" TEXT NOT NULL,
    "baseMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "otMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 2,
    "compOffDaysAccrued" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "ramadanReducedHours" DECIMAL(5,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_holiday_pay_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_holiday_work_approval" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "holidayDate" TIMESTAMP(3) NOT NULL,
    "holidayLabel" TEXT,
    "holidayClass" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "plannedHours" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedBy" TEXT,
    "approverId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_holiday_work_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_holiday_comp_off" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workApprovalId" TEXT,
    "earnedDate" TIMESTAMP(3) NOT NULL,
    "daysAccrued" DECIMAL(5,2) NOT NULL,
    "daysConsumed" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_holiday_comp_off_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_holiday_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedHolidaysCount" INTEGER NOT NULL DEFAULT 0,
    "provisionalCount" INTEGER NOT NULL DEFAULT 0,
    "workApprovalsTotal" INTEGER NOT NULL DEFAULT 0,
    "workApprovalsPending" INTEGER NOT NULL DEFAULT 0,
    "compOffAvailableDays" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "compOffExpiringSoon" INTEGER NOT NULL DEFAULT 0,
    "unapprovedHolidayWorkCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_holiday_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_accommodation_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_accommodation_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_accommodation_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_accommodation_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_accommodation_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hse_risk_assessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT NOT NULL,
    "hazardDescription" TEXT,
    "likelihood" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "inherentRisk" INTEGER NOT NULL,
    "residualRisk" INTEGER NOT NULL,
    "controlsJson" JSONB NOT NULL DEFAULT '[]',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "nextReviewAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hse_risk_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hse_incident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "incidentNumber" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "location" TEXT,
    "employeeId" TEXT,
    "contractorId" TEXT,
    "description" TEXT,
    "rootCause" TEXT,
    "correctiveActions" JSONB NOT NULL DEFAULT '[]',
    "lostTimeDays" INTEGER NOT NULL DEFAULT 0,
    "gosiNotified" BOOLEAN NOT NULL DEFAULT false,
    "authorityNotified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hse_incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hse_permit_to_work" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "issuerId" TEXT,
    "supervisorId" TEXT,
    "ppeChecklistJson" JSONB NOT NULL DEFAULT '[]',
    "isolationsJson" JSONB NOT NULL DEFAULT '[]',
    "ramsAttached" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hse_permit_to_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hse_training_record" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingCode" TEXT NOT NULL,
    "trainingType" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "trainerName" TEXT,
    "certificateUrl" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hse_training_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_hse_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "openRiskAssessments" INTEGER NOT NULL DEFAULT 0,
    "highRiskCount" INTEGER NOT NULL DEFAULT 0,
    "incidentsOpen" INTEGER NOT NULL DEFAULT 0,
    "lostTimeIncidents" INTEGER NOT NULL DEFAULT 0,
    "fatalitiesCount" INTEGER NOT NULL DEFAULT 0,
    "permitsActive" INTEGER NOT NULL DEFAULT 0,
    "permitsOverdue" INTEGER NOT NULL DEFAULT 0,
    "trainingExpiringSoon" INTEGER NOT NULL DEFAULT 0,
    "trainingExpired" INTEGER NOT NULL DEFAULT 0,
    "ltifr" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_hse_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_er_grievance_case" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "grievanceType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "complainantId" TEXT,
    "respondentId" TEXT,
    "isWhistleblower" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "assigneeId" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slaDays" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "outcome" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "labourAuthorityRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_er_grievance_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_er_disciplinary_action" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actionNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "linkedGrievanceId" TEXT,
    "misconductType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "actionType" TEXT NOT NULL,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "suspensionDays" INTEGER NOT NULL DEFAULT 0,
    "salaryDeductionDays" INTEGER NOT NULL DEFAULT 0,
    "salaryDeductionPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "hearingHeld" BOOLEAN NOT NULL DEFAULT false,
    "hearingDate" TIMESTAMP(3),
    "responseRecorded" BOOLEAN NOT NULL DEFAULT false,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT,
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_er_disciplinary_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_er_investigation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "investigationNumber" TEXT NOT NULL,
    "grievanceCaseId" TEXT,
    "disciplinaryActionId" TEXT,
    "investigatorId" TEXT,
    "scope" TEXT,
    "interviewCount" INTEGER NOT NULL DEFAULT 0,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "findings" TEXT,
    "recommendation" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_er_investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_er_appeal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appealNumber" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "appellantId" TEXT NOT NULL,
    "reason" TEXT,
    "filedAt" TIMESTAMP(3) NOT NULL,
    "decisionDueAt" TIMESTAMP(3),
    "outcome" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decidedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_er_appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_er_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "grievancesOpened" INTEGER NOT NULL DEFAULT 0,
    "grievancesClosed" INTEGER NOT NULL DEFAULT 0,
    "grievancesSlaBreached" INTEGER NOT NULL DEFAULT 0,
    "highSeverityOpen" INTEGER NOT NULL DEFAULT 0,
    "disciplinaryActionsIssued" INTEGER NOT NULL DEFAULT 0,
    "actionsWithoutHearing" INTEGER NOT NULL DEFAULT 0,
    "appealsOpen" INTEGER NOT NULL DEFAULT 0,
    "labourAuthorityReferrals" INTEGER NOT NULL DEFAULT 0,
    "retaliationFlags" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_er_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_separation_case" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "separationType" TEXT NOT NULL,
    "reason" TEXT,
    "noticeRequiredDays" INTEGER NOT NULL DEFAULT 30,
    "noticeServedDays" INTEGER NOT NULL DEFAULT 0,
    "noticeBuyout" BOOLEAN NOT NULL DEFAULT false,
    "noticeBuyoutAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gardenLeave" BOOLEAN NOT NULL DEFAULT false,
    "abandonmentDays" INTEGER NOT NULL DEFAULT 0,
    "lastWorkingDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approverId" TEXT,
    "settlementAgreementSigned" BOOLEAN NOT NULL DEFAULT false,
    "settlementAmount" DECIMAL(14,2),
    "eosbCalculationId" TEXT,
    "visaExitCaseId" TEXT,
    "siClosureRef" TEXT,
    "itAccessRevoked" BOOLEAN NOT NULL DEFAULT false,
    "itAccessRevokedAt" TIMESTAMP(3),
    "deathInService" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_separation_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_separation_clearance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "checklistJson" JSONB NOT NULL DEFAULT '[]',
    "completedItems" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    "clearedAt" TIMESTAMP(3),
    "clearedBy" TEXT,
    "blockerNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_separation_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_separation_handover" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "successorId" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "evidenceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_separation_handover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_separation_exit_interview" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "conductedAt" TIMESTAMP(3),
    "conductedBy" TEXT,
    "satisfactionScore" INTEGER,
    "reasonCode" TEXT,
    "reasonDetail" TEXT,
    "willingToRehire" BOOLEAN,
    "feedbackJson" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_separation_exit_interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_separation_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "casesOpened" INTEGER NOT NULL DEFAULT 0,
    "casesClosed" INTEGER NOT NULL DEFAULT 0,
    "casesByType" JSONB NOT NULL DEFAULT '{}',
    "averageNoticeServed" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "abandonmentCases" INTEGER NOT NULL DEFAULT 0,
    "clearancesPending" INTEGER NOT NULL DEFAULT 0,
    "handoverPending" INTEGER NOT NULL DEFAULT 0,
    "exitInterviewMissing" INTEGER NOT NULL DEFAULT 0,
    "itAccessOpenAfterClose" INTEGER NOT NULL DEFAULT 0,
    "deathInServiceCount" INTEGER NOT NULL DEFAULT 0,
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_separation_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_kpi_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "ragStatus" TEXT NOT NULL DEFAULT 'GREEN',
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "blockingIssues" INTEGER NOT NULL DEFAULT 0,
    "certificateStatus" TEXT,
    "certificateGatingReason" TEXT,
    "metricsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_kpi_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_risk_entry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "country" TEXT,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "ownerId" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "mitigationNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_risk_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_corrective_action" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actionNumber" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "sourceRef" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rootCause" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerId" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisedBy" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "verificationNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_corrective_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_compliance_review_calendar_item" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "category" TEXT,
    "ownerId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "lastCompletedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_compliance_review_calendar_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_executive_compliance_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "domainCount" INTEGER NOT NULL DEFAULT 0,
    "greenDomains" INTEGER NOT NULL DEFAULT 0,
    "amberDomains" INTEGER NOT NULL DEFAULT 0,
    "redDomains" INTEGER NOT NULL DEFAULT 0,
    "blockingIssuesTotal" INTEGER NOT NULL DEFAULT 0,
    "criticalRisksOpen" INTEGER NOT NULL DEFAULT 0,
    "correctiveActionsOpen" INTEGER NOT NULL DEFAULT 0,
    "correctiveActionsOverdue" INTEGER NOT NULL DEFAULT 0,
    "reviewItemsOverdue" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "domainBreakdownJson" JSONB NOT NULL DEFAULT '[]',
    "gatingReason" TEXT,
    "attestationsJson" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aura_executive_compliance_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingRecord" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "packingMaterialId" TEXT NOT NULL,
    "quantityUsed" INTEGER NOT NULL,
    "packagedBy" TEXT NOT NULL,
    "packagedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packageCount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PackagingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingMaterial" (
    "id" TEXT NOT NULL,
    "materialCode" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "quantityAvailable" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PackingMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "completionFlag" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCApproval" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QCApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCDecision" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reworkRequired" BOOLEAN NOT NULL DEFAULT false,
    "reworkIteration" INTEGER NOT NULL DEFAULT 0,
    "reworkNotes" TEXT,
    "decidedBy" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QCDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCDefect" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "defectType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "imageUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QCDefect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCInspection" (
    "id" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QCInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingManifest" (
    "id" TEXT NOT NULL,
    "manifestNumber" TEXT NOT NULL,
    "packagingId" TEXT NOT NULL,
    "carrierName" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "estimatedDelivery" TIMESTAMP(3),
    "actualWeight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ready',
    "generatedBy" TEXT NOT NULL,
    "generatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shippedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShippingManifest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMFA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totpSecret" TEXT,
    "backupCodes" JSONB,
    "phoneNumber" TEXT,
    "method" TEXT NOT NULL DEFAULT 'totp',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserMFA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "aura_tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_code_key" ON "aura_company"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_companyId_code_key" ON "aura_department"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_code_key" ON "aura_cost_center"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "aura_country"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "aura_employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "aura_employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "aura_employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeStatus_code_key" ON "aura_employee_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentType_code_key" ON "aura_employment_type"("code");

-- CreateIndex
CREATE INDEX "aura_employee_number_sequence_tenantId_idx" ON "aura_employee_number_sequence"("tenantId");

-- CreateIndex
CREATE INDEX "aura_employee_number_sequence_companyId_idx" ON "aura_employee_number_sequence"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_employee_number_sequence_tenantId_companyId_key" ON "aura_employee_number_sequence"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "aura_employee_master_data_draft_tenantId_idx" ON "aura_employee_master_data_draft"("tenantId");

-- CreateIndex
CREATE INDEX "aura_employee_master_data_draft_onboardingInstanceId_idx" ON "aura_employee_master_data_draft"("onboardingInstanceId");

-- CreateIndex
CREATE INDEX "aura_employee_master_data_draft_offerId_idx" ON "aura_employee_master_data_draft"("offerId");

-- CreateIndex
CREATE INDEX "aura_employee_master_data_draft_employeeId_idx" ON "aura_employee_master_data_draft"("employeeId");

-- CreateIndex
CREATE INDEX "aura_employee_master_data_draft_status_idx" ON "aura_employee_master_data_draft"("status");

-- CreateIndex
CREATE INDEX "aura_employee_identification_tenantId_idx" ON "aura_employee_identification"("tenantId");

-- CreateIndex
CREATE INDEX "aura_employee_identification_employeeId_idx" ON "aura_employee_identification"("employeeId");

-- CreateIndex
CREATE INDEX "aura_employee_identification_countryCode_idx" ON "aura_employee_identification"("countryCode");

-- CreateIndex
CREATE INDEX "aura_employee_identification_identifierType_idx" ON "aura_employee_identification"("identifierType");

-- CreateIndex
CREATE UNIQUE INDEX "aura_employee_identification_tenantId_identifierType_identifier" ON "aura_employee_identification"("tenantId", "identifierType", "identifierValue");

-- CreateIndex
CREATE INDEX "aura_employee_lifecycle_event_tenantId_idx" ON "aura_employee_lifecycle_event"("tenantId");

-- CreateIndex
CREATE INDEX "aura_employee_lifecycle_event_employeeId_idx" ON "aura_employee_lifecycle_event"("employeeId");

-- CreateIndex
CREATE INDEX "aura_employee_lifecycle_event_eventType_idx" ON "aura_employee_lifecycle_event"("eventType");

-- CreateIndex
CREATE INDEX "aura_employee_lifecycle_event_status_idx" ON "aura_employee_lifecycle_event"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "aura_user"("email");

-- CreateIndex
CREATE INDEX "Role_code_idx" ON "aura_role"("code");

-- CreateIndex
CREATE INDEX "Role_isActive_idx" ON "aura_role"("isActive");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "aura_role"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_code_key" ON "aura_role"("tenantId", "code");

-- CreateIndex
CREATE INDEX "UserRole_expiresAt_idx" ON "aura_user_role"("expiresAt");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "aura_user_role"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_tenantId_idx" ON "aura_user_role"("tenantId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "aura_user_role"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "aura_user_role"("userId", "roleId");

-- CreateIndex
CREATE INDEX "Permission_resource_idx" ON "aura_permission"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_key" ON "aura_permission"("resource", "action");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "aura_role_permission"("permissionId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "aura_role_permission"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "aura_role_permission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "aura_password_reset_token"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "aura_password_reset_token"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "aura_password_reset_token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MFASecret_userId_key" ON "aura_mfa_secret"("userId");

-- CreateIndex
CREATE INDEX "MFASecret_userId_idx" ON "aura_mfa_secret"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "aura_refresh_token"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "aura_refresh_token"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "aura_refresh_token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "aura_currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "aura_language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "aura_document_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_code_key" ON "aura_business_unit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_code_key" ON "aura_designation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_code_key" ON "aura_skill"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_code_key" ON "aura_competency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_code_key" ON "aura_leave_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftType_code_key" ON "aura_shift_type"("code");

-- CreateIndex
CREATE INDEX "AttendancePunch_employeeId_idx" ON "aura_attendance_punch"("employeeId");

-- CreateIndex
CREATE INDEX "AttendancePunch_punchDate_idx" ON "aura_attendance_punch"("punchDate");

-- CreateIndex
CREATE INDEX "AttendancePunch_punchType_idx" ON "aura_attendance_punch"("punchType");

-- CreateIndex
CREATE INDEX "AttendancePunch_tenantId_idx" ON "aura_attendance_punch"("tenantId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_date_idx" ON "aura_attendance_record"("date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_employeeId_idx" ON "aura_attendance_record"("employeeId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_status_idx" ON "aura_attendance_record"("status");

-- CreateIndex
CREATE INDEX "AttendanceRecord_tenantId_idx" ON "aura_attendance_record"("tenantId");

-- CreateIndex
CREATE INDEX "Shift_isActive_idx" ON "aura_shift"("isActive");

-- CreateIndex
CREATE INDEX "Shift_tenantId_idx" ON "aura_shift"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_tenantId_code_key" ON "aura_shift"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ShiftAssignment_employeeId_idx" ON "aura_shift_assignment"("employeeId");

-- CreateIndex
CREATE INDEX "ShiftAssignment_shiftId_idx" ON "aura_shift_assignment"("shiftId");

-- CreateIndex
CREATE INDEX "ShiftAssignment_tenantId_idx" ON "aura_shift_assignment"("tenantId");

-- CreateIndex
CREATE INDEX "ShiftRoster_employeeId_idx" ON "aura_shift_roster"("employeeId");

-- CreateIndex
CREATE INDEX "ShiftRoster_rosterDate_idx" ON "aura_shift_roster"("rosterDate");

-- CreateIndex
CREATE INDEX "ShiftRoster_tenantId_idx" ON "aura_shift_roster"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftRoster_tenantId_employeeId_rosterDate_key" ON "aura_shift_roster"("tenantId", "employeeId", "rosterDate");

-- CreateIndex
CREATE INDEX "ShiftSwapRequest_requestorId_idx" ON "aura_shift_swap_request"("requestorId");

-- CreateIndex
CREATE INDEX "ShiftSwapRequest_status_idx" ON "aura_shift_swap_request"("status");

-- CreateIndex
CREATE INDEX "ShiftSwapRequest_tenantId_idx" ON "aura_shift_swap_request"("tenantId");

-- CreateIndex
CREATE INDEX "OvertimeRequest_employeeId_idx" ON "aura_overtime_request"("employeeId");

-- CreateIndex
CREATE INDEX "OvertimeRequest_overtimeDate_idx" ON "aura_overtime_request"("overtimeDate");

-- CreateIndex
CREATE INDEX "OvertimeRequest_status_idx" ON "aura_overtime_request"("status");

-- CreateIndex
CREATE INDEX "OvertimeRequest_tenantId_idx" ON "aura_overtime_request"("tenantId");

-- CreateIndex
CREATE INDEX "AttendanceRegularization_employeeId_idx" ON "aura_attendance_regularization"("employeeId");

-- CreateIndex
CREATE INDEX "AttendanceRegularization_status_idx" ON "aura_attendance_regularization"("status");

-- CreateIndex
CREATE INDEX "AttendanceRegularization_tenantId_idx" ON "aura_attendance_regularization"("tenantId");

-- CreateIndex
CREATE INDEX "CompOffRequest_employeeId_idx" ON "aura_comp_off_request"("employeeId");

-- CreateIndex
CREATE INDEX "CompOffRequest_status_idx" ON "aura_comp_off_request"("status");

-- CreateIndex
CREATE INDEX "CompOffRequest_tenantId_idx" ON "aura_comp_off_request"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRegime_code_key" ON "aura_tax_regime"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PayComponent_code_key" ON "aura_pay_component"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "aura_system_setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLevel_name_key" ON "aura_education_level"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_name_key" ON "aura_relationship"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExitReason_reason_key" ON "aura_exit_reason"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "License_name_key" ON "aura_license"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyCategory_code_key" ON "aura_competency_category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyCatalog_code_key" ON "aura_competency_catalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyProficiencyDescriptor_competencyId_levelId_key" ON "aura_competency_proficiency_descriptor"("competencyId", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyRelation_sourceCompetencyId_relatedCompetencyId_key" ON "aura_competency_relation"("sourceCompetencyId", "relatedCompetencyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProficiencyFramework_code_key" ON "aura_proficiency_framework"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProficiencyLevel_frameworkId_code_key" ON "aura_proficiency_level"("frameworkId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProficiencyLevel_frameworkId_levelNumber_key" ON "aura_proficiency_level"("frameworkId", "levelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_code_key" ON "aura_job_role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "JobCompetencyMapping_jobRoleId_competencyId_key" ON "aura_job_competency_mapping"("jobRoleId", "competencyId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAssessment_code_key" ON "aura_skill_assessment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GapAnalysis_code_key" ON "aura_gap_analysis"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentPlan_code_key" ON "aura_development_plan"("code");

-- CreateIndex
CREATE INDEX "LabourLawConfig_countryCode_idx" ON "aura_labour_law_config"("countryCode");

-- CreateIndex
CREATE INDEX "LabourLawConfig_status_idx" ON "aura_labour_law_config"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LabourLawConfig_countryCode_effectiveFrom_key" ON "aura_labour_law_config"("countryCode", "effectiveFrom");

-- CreateIndex
CREATE INDEX "WPSConfiguration_companyId_idx" ON "aura_wps_configuration"("companyId");

-- CreateIndex
CREATE INDEX "WPSConfiguration_isActive_idx" ON "aura_wps_configuration"("isActive");

-- CreateIndex
CREATE INDEX "WPSConfiguration_tenantId_idx" ON "aura_wps_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WPSConfiguration_tenantId_companyId_key" ON "aura_wps_configuration"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "WPSSubmission_createdAt_idx" ON "aura_wps_submission"("createdAt");

-- CreateIndex
CREATE INDEX "WPSSubmission_payrollMonth_idx" ON "aura_wps_submission"("payrollMonth");

-- CreateIndex
CREATE INDEX "WPSSubmission_payrollRunId_idx" ON "aura_wps_submission"("payrollRunId");

-- CreateIndex
CREATE INDEX "WPSSubmission_status_idx" ON "aura_wps_submission"("status");

-- CreateIndex
CREATE INDEX "WPSSubmission_submissionDate_idx" ON "aura_wps_submission"("submissionDate");

-- CreateIndex
CREATE INDEX "WPSSubmission_tenantId_idx" ON "aura_wps_submission"("tenantId");

-- CreateIndex
CREATE INDEX "WPSSubmission_wpsConfigId_idx" ON "aura_wps_submission"("wpsConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "WPSSubmission_tenantId_payrollRunId_key" ON "aura_wps_submission"("tenantId", "payrollRunId");

-- CreateIndex
CREATE INDEX "WPSRecord_employeeId_idx" ON "aura_wps_record"("employeeId");

-- CreateIndex
CREATE INDEX "WPSRecord_labourCardNumber_idx" ON "aura_wps_record"("labourCardNumber");

-- CreateIndex
CREATE INDEX "WPSRecord_lineNumber_idx" ON "aura_wps_record"("lineNumber");

-- CreateIndex
CREATE INDEX "WPSRecord_status_idx" ON "aura_wps_record"("status");

-- CreateIndex
CREATE INDEX "WPSRecord_submissionId_idx" ON "aura_wps_record"("submissionId");

-- CreateIndex
CREATE INDEX "WPSRecord_tenantId_idx" ON "aura_wps_record"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WPSRecord_submissionId_employeeId_key" ON "aura_wps_record"("submissionId", "employeeId");

-- CreateIndex
CREATE INDEX "WPSAuditLog_action_idx" ON "aura_wps_audit_log"("action");

-- CreateIndex
CREATE INDEX "WPSAuditLog_recordId_idx" ON "aura_wps_audit_log"("recordId");

-- CreateIndex
CREATE INDEX "WPSAuditLog_submissionId_idx" ON "aura_wps_audit_log"("submissionId");

-- CreateIndex
CREATE INDEX "WPSAuditLog_tenantId_idx" ON "aura_wps_audit_log"("tenantId");

-- CreateIndex
CREATE INDEX "WPSAuditLog_timestamp_idx" ON "aura_wps_audit_log"("timestamp");

-- CreateIndex
CREATE INDEX "WPSAuditLog_userId_idx" ON "aura_wps_audit_log"("userId");

-- CreateIndex
CREATE INDEX "GOSIConfiguration_tenantId_idx" ON "aura_gosi_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "GOSIConfiguration_tenantId_companyId_key" ON "aura_gosi_configuration"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "GOSISubmission_contributionMonth_idx" ON "aura_gosi_submission"("contributionMonth");

-- CreateIndex
CREATE INDEX "GOSISubmission_status_idx" ON "aura_gosi_submission"("status");

-- CreateIndex
CREATE INDEX "GOSISubmission_tenantId_idx" ON "aura_gosi_submission"("tenantId");

-- CreateIndex
CREATE INDEX "GOSIRecord_employeeId_idx" ON "aura_gosi_record"("employeeId");

-- CreateIndex
CREATE INDEX "GOSIRecord_status_idx" ON "aura_gosi_record"("status");

-- CreateIndex
CREATE INDEX "GOSIRecord_submissionId_idx" ON "aura_gosi_record"("submissionId");

-- CreateIndex
CREATE INDEX "NitaqatConfiguration_tenantId_idx" ON "aura_nitaqat_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NitaqatConfiguration_tenantId_companyId_key" ON "aura_nitaqat_configuration"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "NitaqatSnapshot_configId_idx" ON "aura_nitaqat_snapshot"("configId");

-- CreateIndex
CREATE INDEX "NitaqatSnapshot_snapshotDate_idx" ON "aura_nitaqat_snapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeComplianceDetails_employeeId_key" ON "aura_employee_compliance_details"("employeeId");

-- CreateIndex
CREATE INDEX "aura_employee_compliance_details_countryCode_sector_idx" ON "aura_employee_compliance_details"("countryCode", "sector");

-- CreateIndex
CREATE INDEX "EmployeeComplianceDetails_countryCode_idx" ON "aura_employee_compliance_details"("countryCode");

-- CreateIndex
CREATE INDEX "EmployeeComplianceDetails_employeeId_idx" ON "aura_employee_compliance_details"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeComplianceDetails_tenantId_idx" ON "aura_employee_compliance_details"("tenantId");

-- CreateIndex
CREATE INDEX "aura_social_insurance_registration_tenantId_employeeId_idx" ON "aura_social_insurance_registration"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_social_insurance_registration_tenantId_status_idx" ON "aura_social_insurance_registration"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_social_insurance_registration_tenantId_deadlineAt_idx" ON "aura_social_insurance_registration"("tenantId", "deadlineAt");

-- CreateIndex
CREATE INDEX "aura_social_insurance_registration_countryCode_authority_idx" ON "aura_social_insurance_registration"("countryCode", "authority");

-- CreateIndex
CREATE UNIQUE INDEX "aura_social_insurance_registration_tenantId_employeeId_authorit" ON "aura_social_insurance_registration"("tenantId", "employeeId", "authority", "scheme");

-- CreateIndex
CREATE INDEX "PayrollConfiguration_tenantId_idx" ON "aura_payroll_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollConfiguration_tenantId_companyId_key" ON "aura_payroll_configuration"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "PayrollRun_payrollMonth_idx" ON "aura_payroll_run"("payrollMonth");

-- CreateIndex
CREATE INDEX "PayrollRun_status_idx" ON "aura_payroll_run"("status");

-- CreateIndex
CREATE INDEX "PayrollRun_tenantId_idx" ON "aura_payroll_run"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_tenantId_configId_payrollMonth_key" ON "aura_payroll_run"("tenantId", "configId", "payrollMonth");

-- CreateIndex
CREATE INDEX "Payslip_employeeId_idx" ON "aura_payslip"("employeeId");

-- CreateIndex
CREATE INDEX "Payslip_payrollRunId_idx" ON "aura_payslip"("payrollRunId");

-- CreateIndex
CREATE INDEX "Payslip_status_idx" ON "aura_payslip"("status");

-- CreateIndex
CREATE INDEX "EmployeeSalaryStructure_effectiveFrom_idx" ON "aura_employee_salary_structure"("effectiveFrom");

-- CreateIndex
CREATE INDEX "EmployeeSalaryStructure_employeeId_idx" ON "aura_employee_salary_structure"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeSalaryStructure_isActive_idx" ON "aura_employee_salary_structure"("isActive");

-- CreateIndex
CREATE INDEX "EmployeeSalaryStructure_tenantId_idx" ON "aura_employee_salary_structure"("tenantId");

-- CreateIndex
CREATE INDEX "aura_employee_payroll_profile_tenantId_idx" ON "aura_employee_payroll_profile"("tenantId");

-- CreateIndex
CREATE INDEX "aura_employee_payroll_profile_employeeId_idx" ON "aura_employee_payroll_profile"("employeeId");

-- CreateIndex
CREATE INDEX "aura_employee_payroll_profile_companyId_idx" ON "aura_employee_payroll_profile"("companyId");

-- CreateIndex
CREATE INDEX "aura_employee_payroll_profile_countryCode_idx" ON "aura_employee_payroll_profile"("countryCode");

-- CreateIndex
CREATE INDEX "aura_employee_payroll_profile_readinessStatus_idx" ON "aura_employee_payroll_profile"("readinessStatus");

-- CreateIndex
CREATE INDEX "aura_employee_payroll_profile_firstPayrollMonth_idx" ON "aura_employee_payroll_profile"("firstPayrollMonth");

-- CreateIndex
CREATE UNIQUE INDEX "aura_employee_payroll_profile_tenantId_employeeId_key" ON "aura_employee_payroll_profile"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "EmployeeBenefit_benefitType_idx" ON "aura_employee_benefit"("benefitType");

-- CreateIndex
CREATE INDEX "EmployeeBenefit_employeeId_idx" ON "aura_employee_benefit"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeBenefit_status_idx" ON "aura_employee_benefit"("status");

-- CreateIndex
CREATE INDEX "EmployeeBenefit_tenantId_idx" ON "aura_employee_benefit"("tenantId");

-- CreateIndex
CREATE INDEX "TaxDeclaration_employeeId_idx" ON "aura_tax_declaration"("employeeId");

-- CreateIndex
CREATE INDEX "TaxDeclaration_financialYear_idx" ON "aura_tax_declaration"("financialYear");

-- CreateIndex
CREATE INDEX "TaxDeclaration_status_idx" ON "aura_tax_declaration"("status");

-- CreateIndex
CREATE INDEX "TaxDeclaration_tenantId_idx" ON "aura_tax_declaration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxDeclaration_tenantId_employeeId_financialYear_key" ON "aura_tax_declaration"("tenantId", "employeeId", "financialYear");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_approvalStatus_idx" ON "aura_payroll_adjustment"("approvalStatus");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_employeeId_idx" ON "aura_payroll_adjustment"("employeeId");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_isProcessed_idx" ON "aura_payroll_adjustment"("isProcessed");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_payrollMonth_idx" ON "aura_payroll_adjustment"("payrollMonth");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_tenantId_idx" ON "aura_payroll_adjustment"("tenantId");

-- CreateIndex
CREATE INDEX "StatutoryPayment_paymentMonth_idx" ON "aura_statutory_payment"("paymentMonth");

-- CreateIndex
CREATE INDEX "StatutoryPayment_payrollRunId_idx" ON "aura_statutory_payment"("payrollRunId");

-- CreateIndex
CREATE INDEX "StatutoryPayment_status_idx" ON "aura_statutory_payment"("status");

-- CreateIndex
CREATE INDEX "StatutoryPayment_statutoryType_idx" ON "aura_statutory_payment"("statutoryType");

-- CreateIndex
CREATE INDEX "StatutoryPayment_tenantId_idx" ON "aura_statutory_payment"("tenantId");

-- CreateIndex
CREATE INDEX "LeavePolicy_countryCode_idx" ON "aura_leave_policy"("countryCode");

-- CreateIndex
CREATE INDEX "LeavePolicy_tenantId_idx" ON "aura_leave_policy"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePolicy_tenantId_code_key" ON "aura_leave_policy"("tenantId", "code");

-- CreateIndex
CREATE INDEX "LeaveBalance_employeeId_idx" ON "aura_leave_balance"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveBalance_leaveYear_idx" ON "aura_leave_balance"("leaveYear");

-- CreateIndex
CREATE INDEX "LeaveBalance_tenantId_idx" ON "aura_leave_balance"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_policyId_leaveYear_key" ON "aura_leave_balance"("employeeId", "policyId", "leaveYear");

-- CreateIndex
CREATE INDEX "LeaveRequest_appliedAt_idx" ON "aura_leave_request"("appliedAt");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_idx" ON "aura_leave_request"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_endDate_idx" ON "aura_leave_request"("endDate");

-- CreateIndex
CREATE INDEX "LeaveRequest_startDate_idx" ON "aura_leave_request"("startDate");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "aura_leave_request"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_tenantId_idx" ON "aura_leave_request"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveEncashment_employeeId_idx" ON "aura_leave_encashment"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveEncashment_payrollMonth_idx" ON "aura_leave_encashment"("payrollMonth");

-- CreateIndex
CREATE INDEX "LeaveEncashment_status_idx" ON "aura_leave_encashment"("status");

-- CreateIndex
CREATE INDEX "LeaveEncashment_tenantId_idx" ON "aura_leave_encashment"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveAccrual_accrualDate_idx" ON "aura_leave_accrual"("accrualDate");

-- CreateIndex
CREATE INDEX "LeaveAccrual_employeeId_idx" ON "aura_leave_accrual"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveAccrual_leaveYear_idx" ON "aura_leave_accrual"("leaveYear");

-- CreateIndex
CREATE INDEX "LeaveAccrual_policyId_idx" ON "aura_leave_accrual"("policyId");

-- CreateIndex
CREATE INDEX "LeaveAccrual_tenantId_idx" ON "aura_leave_accrual"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveCarryForward_employeeId_idx" ON "aura_leave_carry_forward"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveCarryForward_tenantId_idx" ON "aura_leave_carry_forward"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveCarryForward_toYear_idx" ON "aura_leave_carry_forward"("toYear");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveCarryForward_employeeId_policyId_fromYear_toYear_key" ON "aura_leave_carry_forward"("employeeId", "policyId", "fromYear", "toYear");

-- CreateIndex
CREATE INDEX "CompOffEarned_employeeId_idx" ON "aura_comp_off_earned"("employeeId");

-- CreateIndex
CREATE INDEX "CompOffEarned_expiryDate_idx" ON "aura_comp_off_earned"("expiryDate");

-- CreateIndex
CREATE INDEX "CompOffEarned_status_idx" ON "aura_comp_off_earned"("status");

-- CreateIndex
CREATE INDEX "CompOffEarned_tenantId_idx" ON "aura_comp_off_earned"("tenantId");

-- CreateIndex
CREATE INDEX "CompOffEarned_workedDate_idx" ON "aura_comp_off_earned"("workedDate");

-- CreateIndex
CREATE INDEX "Translation_locale_idx" ON "aura_translation"("locale");

-- CreateIndex
CREATE INDEX "Translation_namespace_idx" ON "aura_translation"("namespace");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_tenantId_locale_namespace_key_key" ON "aura_translation"("tenantId", "locale", "namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "LocalizationConfig_tenantId_key" ON "aura_localization_config"("tenantId");

-- CreateIndex
CREATE INDEX "LocalizationConfig_tenantId_idx" ON "aura_localization_config"("tenantId");

-- CreateIndex
CREATE INDEX "IndiaPFConfiguration_tenantId_idx" ON "aura_india_pf_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaPFConfiguration_tenantId_companyId_key" ON "aura_india_pf_configuration"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "IndiaPFSubmission_contributionMonth_idx" ON "aura_india_pf_submission"("contributionMonth");

-- CreateIndex
CREATE INDEX "IndiaPFSubmission_status_idx" ON "aura_india_pf_submission"("status");

-- CreateIndex
CREATE INDEX "IndiaPFSubmission_tenantId_idx" ON "aura_india_pf_submission"("tenantId");

-- CreateIndex
CREATE INDEX "IndiaPFRecord_employeeId_idx" ON "aura_india_pf_record"("employeeId");

-- CreateIndex
CREATE INDEX "IndiaPFRecord_submissionId_idx" ON "aura_india_pf_record"("submissionId");

-- CreateIndex
CREATE INDEX "IndiaPFRecord_uanNumber_idx" ON "aura_india_pf_record"("uanNumber");

-- CreateIndex
CREATE INDEX "IndiaESIConfiguration_tenantId_idx" ON "aura_india_esi_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaESIConfiguration_tenantId_companyId_key" ON "aura_india_esi_configuration"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "IndiaESISubmission_contributionMonth_idx" ON "aura_india_esi_submission"("contributionMonth");

-- CreateIndex
CREATE INDEX "IndiaESISubmission_status_idx" ON "aura_india_esi_submission"("status");

-- CreateIndex
CREATE INDEX "IndiaESISubmission_tenantId_idx" ON "aura_india_esi_submission"("tenantId");

-- CreateIndex
CREATE INDEX "IndiaESIRecord_employeeId_idx" ON "aura_india_esi_record"("employeeId");

-- CreateIndex
CREATE INDEX "IndiaESIRecord_esiNumber_idx" ON "aura_india_esi_record"("esiNumber");

-- CreateIndex
CREATE INDEX "IndiaESIRecord_submissionId_idx" ON "aura_india_esi_record"("submissionId");

-- CreateIndex
CREATE INDEX "IndiaTDSConfiguration_tenantId_idx" ON "aura_india_tds_configuration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaTDSConfiguration_tenantId_companyId_assessmentYear_key" ON "aura_india_tds_configuration"("tenantId", "companyId", "assessmentYear");

-- CreateIndex
CREATE INDEX "IndiaTDSDeclaration_employeeId_idx" ON "aura_india_tds_declaration"("employeeId");

-- CreateIndex
CREATE INDEX "IndiaTDSDeclaration_financialYear_idx" ON "aura_india_tds_declaration"("financialYear");

-- CreateIndex
CREATE INDEX "IndiaTDSDeclaration_tenantId_idx" ON "aura_india_tds_declaration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaTDSDeclaration_employeeId_financialYear_key" ON "aura_india_tds_declaration"("employeeId", "financialYear");

-- CreateIndex
CREATE INDEX "IndiaProfessionalTaxConfig_stateCode_idx" ON "aura_india_professional_tax_config"("stateCode");

-- CreateIndex
CREATE INDEX "IndiaProfessionalTaxConfig_tenantId_idx" ON "aura_india_professional_tax_config"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaProfessionalTaxConfig_tenantId_companyId_stateCode_key" ON "aura_india_professional_tax_config"("tenantId", "companyId", "stateCode");

-- CreateIndex
CREATE INDEX "IndiaProfessionalTaxDeduction_deductionMonth_idx" ON "aura_india_professional_tax_deduction"("deductionMonth");

-- CreateIndex
CREATE INDEX "IndiaProfessionalTaxDeduction_tenantId_idx" ON "aura_india_professional_tax_deduction"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaProfessionalTaxDeduction_employeeId_deductionMonth_key" ON "aura_india_professional_tax_deduction"("employeeId", "deductionMonth");

-- CreateIndex
CREATE INDEX "ComplianceAuditLog_createdAt_idx" ON "aura_compliance_audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "ComplianceAuditLog_entityType_entityId_idx" ON "aura_compliance_audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ComplianceAuditLog_module_idx" ON "aura_compliance_audit_log"("module");

-- CreateIndex
CREATE INDEX "ComplianceAuditLog_tenantId_idx" ON "aura_compliance_audit_log"("tenantId");

-- CreateIndex
CREATE INDEX "EmployeeDocument_category_idx" ON "aura_employee_document"("category");

-- CreateIndex
CREATE INDEX "EmployeeDocument_documentTypeId_idx" ON "aura_employee_document"("documentTypeId");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employeeId_idx" ON "aura_employee_document"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeDocument_expiryDate_idx" ON "aura_employee_document"("expiryDate");

-- CreateIndex
CREATE INDEX "EmployeeDocument_status_idx" ON "aura_employee_document"("status");

-- CreateIndex
CREATE INDEX "EmployeeDocument_tenantId_idx" ON "aura_employee_document"("tenantId");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "aura_asset"("category");

-- CreateIndex
CREATE INDEX "Asset_currentEmployeeId_idx" ON "aura_asset"("currentEmployeeId");

-- CreateIndex
CREATE INDEX "Asset_locationId_idx" ON "aura_asset"("locationId");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "aura_asset"("status");

-- CreateIndex
CREATE INDEX "Asset_tenantId_idx" ON "aura_asset"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_tenantId_assetCode_key" ON "aura_asset"("tenantId", "assetCode");

-- CreateIndex
CREATE INDEX "AssetAssignment_assetId_idx" ON "aura_asset_assignment"("assetId");

-- CreateIndex
CREATE INDEX "AssetAssignment_employeeId_idx" ON "aura_asset_assignment"("employeeId");

-- CreateIndex
CREATE INDEX "AssetAssignment_status_idx" ON "aura_asset_assignment"("status");

-- CreateIndex
CREATE INDEX "AssetAssignment_tenantId_idx" ON "aura_asset_assignment"("tenantId");

-- CreateIndex
CREATE INDEX "AssetMaintenance_assetId_idx" ON "aura_asset_maintenance"("assetId");

-- CreateIndex
CREATE INDEX "AssetMaintenance_scheduledDate_idx" ON "aura_asset_maintenance"("scheduledDate");

-- CreateIndex
CREATE INDEX "AssetMaintenance_status_idx" ON "aura_asset_maintenance"("status");

-- CreateIndex
CREATE INDEX "AssetMaintenance_tenantId_idx" ON "aura_asset_maintenance"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_code_key" ON "aura_asset_category"("code");

-- CreateIndex
CREATE INDEX "EmploymentHistory_changeType_idx" ON "aura_employment_history"("changeType");

-- CreateIndex
CREATE INDEX "EmploymentHistory_effectiveDate_idx" ON "aura_employment_history"("effectiveDate");

-- CreateIndex
CREATE INDEX "EmploymentHistory_status_idx" ON "aura_employment_history"("status");

-- CreateIndex
CREATE INDEX "EmploymentHistory_tenantId_idx" ON "aura_employment_history"("tenantId");

-- CreateIndex
CREATE INDEX "Position_departmentId_idx" ON "aura_position"("departmentId");

-- CreateIndex
CREATE INDEX "Position_reportsToPositionId_idx" ON "aura_position"("reportsToPositionId");

-- CreateIndex
CREATE INDEX "Position_status_idx" ON "aura_position"("status");

-- CreateIndex
CREATE INDEX "Position_tenantId_idx" ON "aura_position"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_tenantId_positionCode_key" ON "aura_position"("tenantId", "positionCode");

-- CreateIndex
CREATE INDEX "EmployeeLifeEvent_employeeId_idx" ON "aura_employee_life_event"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeLifeEvent_eventDate_idx" ON "aura_employee_life_event"("eventDate");

-- CreateIndex
CREATE INDEX "EmployeeLifeEvent_eventType_idx" ON "aura_employee_life_event"("eventType");

-- CreateIndex
CREATE INDEX "EmployeeLifeEvent_status_idx" ON "aura_employee_life_event"("status");

-- CreateIndex
CREATE INDEX "EmployeeLifeEvent_tenantId_idx" ON "aura_employee_life_event"("tenantId");

-- CreateIndex
CREATE INDEX "LifeEventType_category_idx" ON "aura_life_event_type"("category");

-- CreateIndex
CREATE INDEX "LifeEventType_tenantId_idx" ON "aura_life_event_type"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LifeEventType_tenantId_code_key" ON "aura_life_event_type"("tenantId", "code");

-- CreateIndex
CREATE INDEX "IDCardTemplate_cardType_idx" ON "aura_id_card_template"("cardType");

-- CreateIndex
CREATE INDEX "IDCardTemplate_tenantId_idx" ON "aura_id_card_template"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IDCardTemplate_tenantId_name_key" ON "aura_id_card_template"("tenantId", "name");

-- CreateIndex
CREATE INDEX "IDCard_employeeId_idx" ON "aura_id_card"("employeeId");

-- CreateIndex
CREATE INDEX "IDCard_expiryDate_idx" ON "aura_id_card"("expiryDate");

-- CreateIndex
CREATE INDEX "IDCard_status_idx" ON "aura_id_card"("status");

-- CreateIndex
CREATE INDEX "IDCard_tenantId_idx" ON "aura_id_card"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IDCard_tenantId_cardNumber_key" ON "aura_id_card"("tenantId", "cardNumber");

-- CreateIndex
CREATE INDEX "LetterTemplate_tenantId_idx" ON "aura_letter_template"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LetterTemplate_tenantId_name_key" ON "aura_letter_template"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Letter_employeeId_idx" ON "aura_letter"("employeeId");

-- CreateIndex
CREATE INDEX "Letter_tenantId_idx" ON "aura_letter"("tenantId");

-- CreateIndex
CREATE INDEX "ExitRequest_employeeId_idx" ON "aura_exit_request"("employeeId");

-- CreateIndex
CREATE INDEX "ExitRequest_tenantId_idx" ON "aura_exit_request"("tenantId");

-- CreateIndex
CREATE INDEX "ExitClearance_exitRequestId_idx" ON "aura_exit_clearance"("exitRequestId");

-- CreateIndex
CREATE INDEX "ProbationTracking_employeeId_idx" ON "aura_probation_tracking"("employeeId");

-- CreateIndex
CREATE INDEX "ProbationTracking_tenantId_idx" ON "aura_probation_tracking"("tenantId");

-- CreateIndex
CREATE INDEX "ProbationReview_probationId_idx" ON "aura_probation_review"("probationId");

-- CreateIndex
CREATE INDEX "ConfirmationRequest_employeeId_idx" ON "aura_confirmation_request"("employeeId");

-- CreateIndex
CREATE INDEX "ConfirmationRequest_tenantId_idx" ON "aura_confirmation_request"("tenantId");

-- CreateIndex
CREATE INDEX "ReportDefinition_category_idx" ON "aura_report_definition"("category");

-- CreateIndex
CREATE INDEX "ReportDefinition_createdBy_idx" ON "aura_report_definition"("createdBy");

-- CreateIndex
CREATE INDEX "ReportDefinition_tenantId_idx" ON "aura_report_definition"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportDefinition_tenantId_code_key" ON "aura_report_definition"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ReportExecution_executedAt_idx" ON "aura_report_execution"("executedAt");

-- CreateIndex
CREATE INDEX "ReportExecution_executedBy_idx" ON "aura_report_execution"("executedBy");

-- CreateIndex
CREATE INDEX "ReportExecution_reportId_idx" ON "aura_report_execution"("reportId");

-- CreateIndex
CREATE INDEX "ReportExecution_tenantId_idx" ON "aura_report_execution"("tenantId");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "aura_dashboard_widget"("dashboardId");

-- CreateIndex
CREATE INDEX "DashboardWidget_tenantId_idx" ON "aura_dashboard_widget"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardWidget_tenantId_code_key" ON "aura_dashboard_widget"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PredictiveModel_modelType_idx" ON "aura_predictive_model"("modelType");

-- CreateIndex
CREATE INDEX "PredictiveModel_status_idx" ON "aura_predictive_model"("status");

-- CreateIndex
CREATE INDEX "PredictiveModel_tenantId_idx" ON "aura_predictive_model"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictiveModel_tenantId_code_key" ON "aura_predictive_model"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Prediction_entityType_entityId_idx" ON "aura_prediction"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Prediction_modelId_idx" ON "aura_prediction"("modelId");

-- CreateIndex
CREATE INDEX "Prediction_predictedDate_idx" ON "aura_prediction"("predictedDate");

-- CreateIndex
CREATE INDEX "Prediction_tenantId_idx" ON "aura_prediction"("tenantId");

-- CreateIndex
CREATE INDEX "AIAgentConversation_sessionId_idx" ON "aura_ai_agent_conversation"("sessionId");

-- CreateIndex
CREATE INDEX "AIAgentConversation_tenantId_idx" ON "aura_ai_agent_conversation"("tenantId");

-- CreateIndex
CREATE INDEX "AIAgentConversation_userId_idx" ON "aura_ai_agent_conversation"("userId");

-- CreateIndex
CREATE INDEX "AIAgentMessage_conversationId_idx" ON "aura_ai_agent_message"("conversationId");

-- CreateIndex
CREATE INDEX "AIAgentMessage_createdAt_idx" ON "aura_ai_agent_message"("createdAt");

-- CreateIndex
CREATE INDEX "AIAgentMessage_role_idx" ON "aura_ai_agent_message"("role");

-- CreateIndex
CREATE INDEX "AnalyticsCache_expiresAt_idx" ON "aura_analytics_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "AnalyticsCache_tenantId_idx" ON "aura_analytics_cache"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCache_tenantId_cacheKey_key" ON "aura_analytics_cache"("tenantId", "cacheKey");

-- CreateIndex
CREATE INDEX "BenefitPlan_category_idx" ON "aura_benefit_plan"("category");

-- CreateIndex
CREATE INDEX "BenefitPlan_effectiveFrom_idx" ON "aura_benefit_plan"("effectiveFrom");

-- CreateIndex
CREATE INDEX "BenefitPlan_status_idx" ON "aura_benefit_plan"("status");

-- CreateIndex
CREATE INDEX "BenefitPlan_tenantId_idx" ON "aura_benefit_plan"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BenefitPlan_tenantId_planCode_key" ON "aura_benefit_plan"("tenantId", "planCode");

-- CreateIndex
CREATE INDEX "aura_benefit_enrollment_insuranceCardStatus_idx" ON "aura_benefit_enrollment"("insuranceCardStatus");

-- CreateIndex
CREATE INDEX "aura_benefit_enrollment_onboardingInstanceId_idx" ON "aura_benefit_enrollment"("onboardingInstanceId");

-- CreateIndex
CREATE INDEX "BenefitEnrollment_effectiveFrom_idx" ON "aura_benefit_enrollment"("effectiveFrom");

-- CreateIndex
CREATE INDEX "BenefitEnrollment_employeeId_idx" ON "aura_benefit_enrollment"("employeeId");

-- CreateIndex
CREATE INDEX "BenefitEnrollment_planId_idx" ON "aura_benefit_enrollment"("planId");

-- CreateIndex
CREATE INDEX "BenefitEnrollment_status_idx" ON "aura_benefit_enrollment"("status");

-- CreateIndex
CREATE INDEX "BenefitEnrollment_tenantId_idx" ON "aura_benefit_enrollment"("tenantId");

-- CreateIndex
CREATE INDEX "Dependent_employeeId_idx" ON "aura_dependent"("employeeId");

-- CreateIndex
CREATE INDEX "Dependent_status_idx" ON "aura_dependent"("status");

-- CreateIndex
CREATE INDEX "Dependent_tenantId_idx" ON "aura_dependent"("tenantId");

-- CreateIndex
CREATE INDEX "BenefitClaim_claimDate_idx" ON "aura_benefit_claim"("claimDate");

-- CreateIndex
CREATE INDEX "BenefitClaim_employeeId_idx" ON "aura_benefit_claim"("employeeId");

-- CreateIndex
CREATE INDEX "BenefitClaim_enrollmentId_idx" ON "aura_benefit_claim"("enrollmentId");

-- CreateIndex
CREATE INDEX "BenefitClaim_status_idx" ON "aura_benefit_claim"("status");

-- CreateIndex
CREATE INDEX "BenefitClaim_tenantId_idx" ON "aura_benefit_claim"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BenefitClaim_tenantId_claimNumber_key" ON "aura_benefit_claim"("tenantId", "claimNumber");

-- CreateIndex
CREATE INDEX "HealthcareProvider_isActive_idx" ON "aura_healthcare_provider"("isActive");

-- CreateIndex
CREATE INDEX "HealthcareProvider_providerType_idx" ON "aura_healthcare_provider"("providerType");

-- CreateIndex
CREATE INDEX "HealthcareProvider_specialty_idx" ON "aura_healthcare_provider"("specialty");

-- CreateIndex
CREATE INDEX "HealthcareProvider_tenantId_idx" ON "aura_healthcare_provider"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthcareProvider_tenantId_providerCode_key" ON "aura_healthcare_provider"("tenantId", "providerCode");

-- CreateIndex
CREATE INDEX "QualifyingEvent_employeeId_idx" ON "aura_qualifying_event"("employeeId");

-- CreateIndex
CREATE INDEX "QualifyingEvent_eventDate_idx" ON "aura_qualifying_event"("eventDate");

-- CreateIndex
CREATE INDEX "QualifyingEvent_eventType_idx" ON "aura_qualifying_event"("eventType");

-- CreateIndex
CREATE INDEX "QualifyingEvent_tenantId_idx" ON "aura_qualifying_event"("tenantId");

-- CreateIndex
CREATE INDEX "EnrollmentWindow_isActive_idx" ON "aura_enrollment_window"("isActive");

-- CreateIndex
CREATE INDEX "EnrollmentWindow_planYear_idx" ON "aura_enrollment_window"("planYear");

-- CreateIndex
CREATE INDEX "EnrollmentWindow_startDate_idx" ON "aura_enrollment_window"("startDate");

-- CreateIndex
CREATE INDEX "EnrollmentWindow_tenantId_idx" ON "aura_enrollment_window"("tenantId");

-- CreateIndex
CREATE INDEX "PremiumRate_effectiveFrom_idx" ON "aura_premium_rate"("effectiveFrom");

-- CreateIndex
CREATE INDEX "PremiumRate_planId_idx" ON "aura_premium_rate"("planId");

-- CreateIndex
CREATE INDEX "PremiumRate_tenantId_idx" ON "aura_premium_rate"("tenantId");

-- CreateIndex
CREATE INDEX "PremiumDeduction_employeeId_idx" ON "aura_premium_deduction"("employeeId");

-- CreateIndex
CREATE INDEX "PremiumDeduction_enrollmentId_idx" ON "aura_premium_deduction"("enrollmentId");

-- CreateIndex
CREATE INDEX "PremiumDeduction_payrollDate_idx" ON "aura_premium_deduction"("payrollDate");

-- CreateIndex
CREATE INDEX "PremiumDeduction_tenantId_idx" ON "aura_premium_deduction"("tenantId");

-- CreateIndex
CREATE INDEX "TaxDocument_employeeId_idx" ON "aura_tax_document"("employeeId");

-- CreateIndex
CREATE INDEX "TaxDocument_taxYear_idx" ON "aura_tax_document"("taxYear");

-- CreateIndex
CREATE INDEX "TaxDocument_tenantId_idx" ON "aura_tax_document"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxDocument_tenantId_employeeId_type_taxYear_key" ON "aura_tax_document"("tenantId", "employeeId", "type", "taxYear");

-- CreateIndex
CREATE INDEX "ContinuousFeedback_fromUserId_idx" ON "aura_continuous_feedback"("fromUserId");

-- CreateIndex
CREATE INDEX "ContinuousFeedback_tenantId_idx" ON "aura_continuous_feedback"("tenantId");

-- CreateIndex
CREATE INDEX "ContinuousFeedback_toEmployeeId_idx" ON "aura_continuous_feedback"("toEmployeeId");

-- CreateIndex
CREATE INDEX "ContinuousFeedback_type_idx" ON "aura_continuous_feedback"("type");

-- CreateIndex
CREATE INDEX "Recognition_createdAt_idx" ON "aura_recognition"("createdAt");

-- CreateIndex
CREATE INDEX "Recognition_giverId_idx" ON "aura_recognition"("giverId");

-- CreateIndex
CREATE INDEX "Recognition_receiverId_idx" ON "aura_recognition"("receiverId");

-- CreateIndex
CREATE INDEX "Recognition_tenantId_idx" ON "aura_recognition"("tenantId");

-- CreateIndex
CREATE INDEX "OneOnOneMeeting_employeeId_idx" ON "aura_one_on_one_meeting"("employeeId");

-- CreateIndex
CREATE INDEX "OneOnOneMeeting_managerId_idx" ON "aura_one_on_one_meeting"("managerId");

-- CreateIndex
CREATE INDEX "OneOnOneMeeting_scheduledAt_idx" ON "aura_one_on_one_meeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "OneOnOneMeeting_tenantId_idx" ON "aura_one_on_one_meeting"("tenantId");

-- CreateIndex
CREATE INDEX "OneOnOneNote_meetingId_idx" ON "aura_one_on_one_note"("meetingId");

-- CreateIndex
CREATE INDEX "OneOnOneActionItem_assigneeId_idx" ON "aura_one_on_one_action_item"("assigneeId");

-- CreateIndex
CREATE INDEX "OneOnOneActionItem_meetingId_idx" ON "aura_one_on_one_action_item"("meetingId");

-- CreateIndex
CREATE INDEX "OneOnOneActionItem_status_idx" ON "aura_one_on_one_action_item"("status");

-- CreateIndex
CREATE INDEX "LearningPath_isPublished_idx" ON "aura_learning_path"("isPublished");

-- CreateIndex
CREATE INDEX "LearningPath_tenantId_idx" ON "aura_learning_path"("tenantId");

-- CreateIndex
CREATE INDEX "LearningPathEnrollment_employeeId_idx" ON "aura_learning_path_enrollment"("employeeId");

-- CreateIndex
CREATE INDEX "LearningPathEnrollment_pathId_idx" ON "aura_learning_path_enrollment"("pathId");

-- CreateIndex
CREATE INDEX "LearningPathEnrollment_tenantId_idx" ON "aura_learning_path_enrollment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathEnrollment_pathId_employeeId_key" ON "aura_learning_path_enrollment"("pathId", "employeeId");

-- CreateIndex
CREATE INDEX "LearningProgress_contentId_idx" ON "aura_learning_progress"("contentId");

-- CreateIndex
CREATE INDEX "LearningProgress_employeeId_idx" ON "aura_learning_progress"("employeeId");

-- CreateIndex
CREATE INDEX "LearningProgress_tenantId_idx" ON "aura_learning_progress"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_employeeId_contentId_key" ON "aura_learning_progress"("employeeId", "contentId");

-- CreateIndex
CREATE INDEX "Assessment_pathId_idx" ON "aura_assessment"("pathId");

-- CreateIndex
CREATE INDEX "Assessment_tenantId_idx" ON "aura_assessment"("tenantId");

-- CreateIndex
CREATE INDEX "AssessmentSubmission_assessmentId_idx" ON "aura_assessment_submission"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentSubmission_employeeId_idx" ON "aura_assessment_submission"("employeeId");

-- CreateIndex
CREATE INDEX "Webhook_isActive_idx" ON "aura_webhook"("isActive");

-- CreateIndex
CREATE INDEX "Webhook_tenantId_idx" ON "aura_webhook"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookLog_createdAt_idx" ON "aura_webhook_log"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_success_idx" ON "aura_webhook_log"("success");

-- CreateIndex
CREATE INDEX "WebhookLog_webhookId_idx" ON "aura_webhook_log"("webhookId");

-- CreateIndex
CREATE INDEX "CustomReport_createdBy_idx" ON "aura_custom_report"("createdBy");

-- CreateIndex
CREATE INDEX "CustomReport_tenantId_idx" ON "aura_custom_report"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_isActive_idx" ON "aura_workflow_definition"("isActive");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_tenantId_idx" ON "aura_workflow_definition"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_trigger_idx" ON "aura_workflow_definition"("trigger");

-- CreateIndex
CREATE INDEX "WorkflowInstance_definitionId_idx" ON "aura_workflow_instance"("definitionId");

-- CreateIndex
CREATE INDEX "WorkflowInstance_status_idx" ON "aura_workflow_instance"("status");

-- CreateIndex
CREATE INDEX "WorkflowInstance_tenantId_idx" ON "aura_workflow_instance"("tenantId");

-- CreateIndex
CREATE INDEX "ProjectTimeEntry_date_idx" ON "aura_project_time_entry"("date");

-- CreateIndex
CREATE INDEX "ProjectTimeEntry_employeeId_idx" ON "aura_project_time_entry"("employeeId");

-- CreateIndex
CREATE INDEX "ProjectTimeEntry_projectId_idx" ON "aura_project_time_entry"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTimeEntry_tenantId_idx" ON "aura_project_time_entry"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTimeEntry_employeeId_projectId_date_key" ON "aura_project_time_entry"("employeeId", "projectId", "date");

-- CreateIndex
CREATE INDEX "GeofenceLocation_isActive_idx" ON "aura_geofence_location"("isActive");

-- CreateIndex
CREATE INDEX "GeofenceLocation_tenantId_idx" ON "aura_geofence_location"("tenantId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_date_idx" ON "aura_expense_claim"("date");

-- CreateIndex
CREATE INDEX "ExpenseClaim_employeeId_idx" ON "aura_expense_claim"("employeeId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_status_idx" ON "aura_expense_claim"("status");

-- CreateIndex
CREATE INDEX "ExpenseClaim_tenantId_idx" ON "aura_expense_claim"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_keyHash_key" ON "aura_api_key"("keyHash");

-- CreateIndex
CREATE INDEX "APIKey_isActive_idx" ON "aura_api_key"("isActive");

-- CreateIndex
CREATE INDEX "APIKey_keyHash_idx" ON "aura_api_key"("keyHash");

-- CreateIndex
CREATE INDEX "APIKey_tenantId_idx" ON "aura_api_key"("tenantId");

-- CreateIndex
CREATE INDEX "EmergencyContact_employeeId_idx" ON "aura_emergency_contact"("employeeId");

-- CreateIndex
CREATE INDEX "EmergencyContact_tenantId_idx" ON "aura_emergency_contact"("tenantId");

-- CreateIndex
CREATE INDEX "Garnishment_employeeId_idx" ON "aura_garnishment"("employeeId");

-- CreateIndex
CREATE INDEX "Garnishment_status_idx" ON "aura_garnishment"("status");

-- CreateIndex
CREATE INDEX "Garnishment_tenantId_idx" ON "aura_garnishment"("tenantId");

-- CreateIndex
CREATE INDEX "HSAFSAAccount_employeeId_idx" ON "aura_hsa_fsa_account"("employeeId");

-- CreateIndex
CREATE INDEX "HSAFSAAccount_tenantId_idx" ON "aura_hsa_fsa_account"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "HSAFSAAccount_employeeId_accountType_planYear_key" ON "aura_hsa_fsa_account"("employeeId", "accountType", "planYear");

-- CreateIndex
CREATE INDEX "HSAFSATransaction_accountId_idx" ON "aura_hsa_fsa_transaction"("accountId");

-- CreateIndex
CREATE INDEX "HSAFSATransaction_date_idx" ON "aura_hsa_fsa_transaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "aura_candidate"("email");

-- CreateIndex
CREATE INDEX "CandidateApplication_candidateId_idx" ON "aura_candidate_application"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateApplication_jobPostingId_idx" ON "aura_candidate_application"("jobPostingId");

-- CreateIndex
CREATE INDEX "CandidateApplication_status_idx" ON "aura_candidate_application"("status");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "aura_interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_scheduledDate_idx" ON "aura_interview"("scheduledDate");

-- CreateIndex
CREATE INDEX "InterviewFeedback_interviewId_idx" ON "aura_interview_feedback"("interviewId");

-- CreateIndex
CREATE INDEX "JobOffer_applicationId_idx" ON "aura_job_offer"("applicationId");

-- CreateIndex
CREATE INDEX "JobOffer_status_idx" ON "aura_job_offer"("status");

-- CreateIndex
CREATE INDEX "BackgroundCheck_applicationId_idx" ON "aura_background_check"("applicationId");

-- CreateIndex
CREATE INDEX "BackgroundCheck_status_idx" ON "aura_background_check"("status");

-- CreateIndex
CREATE INDEX "BackgroundCheck_tenantId_idx" ON "aura_background_check"("tenantId");

-- CreateIndex
CREATE INDEX "JobRequisition_department_idx" ON "aura_job_requisition"("department");

-- CreateIndex
CREATE INDEX "JobRequisition_status_idx" ON "aura_job_requisition"("status");

-- CreateIndex
CREATE INDEX "JobRequisition_tenantId_idx" ON "aura_job_requisition"("tenantId");

-- CreateIndex
CREATE INDEX "RecruitmentVendor_category_idx" ON "aura_recruitment_vendor"("category");

-- CreateIndex
CREATE INDEX "RecruitmentVendor_status_idx" ON "aura_recruitment_vendor"("status");

-- CreateIndex
CREATE INDEX "RecruitmentVendor_tenantId_idx" ON "aura_recruitment_vendor"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentVendor_tenantId_vendorCode_key" ON "aura_recruitment_vendor"("tenantId", "vendorCode");

-- CreateIndex
CREATE INDEX "OnboardingProgram_tenantId_idx" ON "aura_onboarding_program"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgram_tenantId_programCode_key" ON "aura_onboarding_program"("tenantId", "programCode");

-- CreateIndex
CREATE INDEX "aura_country_onboarding_rule_tenantId_idx" ON "aura_country_onboarding_rule"("tenantId");

-- CreateIndex
CREATE INDEX "aura_country_onboarding_rule_countryCode_idx" ON "aura_country_onboarding_rule"("countryCode");

-- CreateIndex
CREATE INDEX "aura_country_onboarding_rule_status_idx" ON "aura_country_onboarding_rule"("status");

-- CreateIndex
CREATE INDEX "aura_country_onboarding_rule_effectiveFrom_idx" ON "aura_country_onboarding_rule"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "aura_country_onboarding_rule_tenantId_countryCode_version_key" ON "aura_country_onboarding_rule"("tenantId", "countryCode", "version");

-- CreateIndex
CREATE INDEX "aura_onboarding_governance_template_tenantId_idx" ON "aura_onboarding_governance_template"("tenantId");

-- CreateIndex
CREATE INDEX "aura_onboarding_governance_template_countryCode_idx" ON "aura_onboarding_governance_template"("countryCode");

-- CreateIndex
CREATE INDEX "aura_onboarding_governance_template_legalEntityId_idx" ON "aura_onboarding_governance_template"("legalEntityId");

-- CreateIndex
CREATE INDEX "aura_onboarding_governance_template_employmentType_idx" ON "aura_onboarding_governance_template"("employmentType");

-- CreateIndex
CREATE INDEX "aura_onboarding_governance_template_status_idx" ON "aura_onboarding_governance_template"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_onboarding_governance_template_tenantId_countryCode_legalE" ON "aura_onboarding_governance_template"("tenantId", "countryCode", "legalEntityId", "employmentType", "version");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_tenantId_idx" ON "aura_onboarding_case"("tenantId");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_offerId_idx" ON "aura_onboarding_case"("offerId");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_employeeId_idx" ON "aura_onboarding_case"("employeeId");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_countryCode_idx" ON "aura_onboarding_case"("countryCode");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_legalEntityId_idx" ON "aura_onboarding_case"("legalEntityId");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_currentStage_idx" ON "aura_onboarding_case"("currentStage");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_status_idx" ON "aura_onboarding_case"("status");

-- CreateIndex
CREATE INDEX "aura_onboarding_case_slaDueAt_idx" ON "aura_onboarding_case"("slaDueAt");

-- CreateIndex
CREATE UNIQUE INDEX "aura_onboarding_case_tenantId_offerId_key" ON "aura_onboarding_case"("tenantId", "offerId");

-- CreateIndex
CREATE INDEX "aura_onboarding_stage_history_tenantId_idx" ON "aura_onboarding_stage_history"("tenantId");

-- CreateIndex
CREATE INDEX "aura_onboarding_stage_history_caseId_idx" ON "aura_onboarding_stage_history"("caseId");

-- CreateIndex
CREATE INDEX "aura_onboarding_stage_history_toStage_idx" ON "aura_onboarding_stage_history"("toStage");

-- CreateIndex
CREATE INDEX "aura_onboarding_stage_history_createdAt_idx" ON "aura_onboarding_stage_history"("createdAt");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_content_tenantId_idx" ON "aura_onboarding_guidance_content"("tenantId");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_content_contentKey_idx" ON "aura_onboarding_guidance_content"("contentKey");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_content_countryCode_idx" ON "aura_onboarding_guidance_content"("countryCode");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_content_status_idx" ON "aura_onboarding_guidance_content"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_onboarding_guidance_content_tenantId_contentKey_countryCod" ON "aura_onboarding_guidance_content"("tenantId", "contentKey", "countryCode", "version");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_view_log_tenantId_idx" ON "aura_onboarding_guidance_view_log"("tenantId");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_view_log_contentId_idx" ON "aura_onboarding_guidance_view_log"("contentId");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_view_log_contentKey_idx" ON "aura_onboarding_guidance_view_log"("contentKey");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_view_log_countryCode_idx" ON "aura_onboarding_guidance_view_log"("countryCode");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_view_log_onboardingCaseId_idx" ON "aura_onboarding_guidance_view_log"("onboardingCaseId");

-- CreateIndex
CREATE INDEX "aura_onboarding_guidance_view_log_userId_idx" ON "aura_onboarding_guidance_view_log"("userId");

-- CreateIndex
CREATE INDEX "aura_onboarding_instance_countryCode_idx" ON "aura_onboarding_instance"("countryCode");

-- CreateIndex
CREATE INDEX "aura_onboarding_instance_countryRuleId_idx" ON "aura_onboarding_instance"("countryRuleId");

-- CreateIndex
CREATE INDEX "OnboardingInstance_employeeId_idx" ON "aura_onboarding_instance"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingInstance_status_idx" ON "aura_onboarding_instance"("status");

-- CreateIndex
CREATE INDEX "OnboardingInstance_tenantId_idx" ON "aura_onboarding_instance"("tenantId");

-- CreateIndex
CREATE INDEX "aura_onboarding_task_ruleTaskCode_idx" ON "aura_onboarding_task"("ruleTaskCode");

-- CreateIndex
CREATE INDEX "OnboardingTask_instanceId_idx" ON "aura_onboarding_task"("instanceId");

-- CreateIndex
CREATE INDEX "OnboardingTask_status_idx" ON "aura_onboarding_task"("status");

-- CreateIndex
CREATE INDEX "PerformanceReview_employeeId_idx" ON "aura_performance_review"("employeeId");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewCycleId_idx" ON "aura_performance_review"("reviewCycleId");

-- CreateIndex
CREATE INDEX "PerformanceReview_status_idx" ON "aura_performance_review"("status");

-- CreateIndex
CREATE INDEX "PerformanceReview_tenantId_idx" ON "aura_performance_review"("tenantId");

-- CreateIndex
CREATE INDEX "ReviewCycle_status_idx" ON "aura_review_cycle"("status");

-- CreateIndex
CREATE INDEX "ReviewCycle_tenantId_idx" ON "aura_review_cycle"("tenantId");

-- CreateIndex
CREATE INDEX "PerformanceGoal_employeeId_idx" ON "aura_performance_goal"("employeeId");

-- CreateIndex
CREATE INDEX "PerformanceGoal_status_idx" ON "aura_performance_goal"("status");

-- CreateIndex
CREATE INDEX "PerformanceGoal_tenantId_idx" ON "aura_performance_goal"("tenantId");

-- CreateIndex
CREATE INDEX "CalibrationSession_status_idx" ON "aura_calibration_session"("status");

-- CreateIndex
CREATE INDEX "CalibrationSession_tenantId_idx" ON "aura_calibration_session"("tenantId");

-- CreateIndex
CREATE INDEX "SalaryComponent_tenantId_idx" ON "aura_salary_component"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryComponent_tenantId_componentCode_key" ON "aura_salary_component"("tenantId", "componentCode");

-- CreateIndex
CREATE INDEX "CompensationBand_tenantId_idx" ON "aura_compensation_band"("tenantId");

-- CreateIndex
CREATE INDEX "IncrementCycle_status_idx" ON "aura_increment_cycle"("status");

-- CreateIndex
CREATE INDEX "IncrementCycle_tenantId_idx" ON "aura_increment_cycle"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "aura_notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "aura_notification"("status");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "aura_notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "aura_notification"("type");

-- CreateIndex
CREATE INDEX "NotificationRecipient_notificationId_idx" ON "aura_notification_recipient"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_status_idx" ON "aura_notification_recipient"("status");

-- CreateIndex
CREATE INDEX "NotificationRecipient_userId_idx" ON "aura_notification_recipient"("userId");

-- CreateIndex
CREATE INDEX "NotificationTemplate_isActive_idx" ON "aura_notification_template"("isActive");

-- CreateIndex
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "aura_notification_template"("tenantId");

-- CreateIndex
CREATE INDEX "NotificationTemplate_type_idx" ON "aura_notification_template"("type");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "aura_course"("category");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "aura_course"("status");

-- CreateIndex
CREATE INDEX "Course_tenantId_idx" ON "aura_course"("tenantId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "aura_course_enrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_employeeId_idx" ON "aura_course_enrollment"("employeeId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_tenantId_idx" ON "aura_course_enrollment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseId_employeeId_key" ON "aura_course_enrollment"("courseId", "employeeId");

-- CreateIndex
CREATE INDEX "TrainingSession_startDate_idx" ON "aura_training_session"("startDate");

-- CreateIndex
CREATE INDEX "TrainingSession_status_idx" ON "aura_training_session"("status");

-- CreateIndex
CREATE INDEX "TrainingSession_tenantId_idx" ON "aura_training_session"("tenantId");

-- CreateIndex
CREATE INDEX "SessionAttendee_employeeId_idx" ON "aura_session_attendee"("employeeId");

-- CreateIndex
CREATE INDEX "SessionAttendee_sessionId_idx" ON "aura_session_attendee"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAttendee_sessionId_employeeId_key" ON "aura_session_attendee"("sessionId", "employeeId");

-- CreateIndex
CREATE INDEX "Certification_employeeId_idx" ON "aura_certification"("employeeId");

-- CreateIndex
CREATE INDEX "Certification_expiryDate_idx" ON "aura_certification"("expiryDate");

-- CreateIndex
CREATE INDEX "Certification_status_idx" ON "aura_certification"("status");

-- CreateIndex
CREATE INDEX "Certification_tenantId_idx" ON "aura_certification"("tenantId");

-- CreateIndex
CREATE INDEX "MentoringProgram_menteeId_idx" ON "aura_mentoring_program"("menteeId");

-- CreateIndex
CREATE INDEX "MentoringProgram_mentorId_idx" ON "aura_mentoring_program"("mentorId");

-- CreateIndex
CREATE INDEX "MentoringProgram_status_idx" ON "aura_mentoring_program"("status");

-- CreateIndex
CREATE INDEX "MentoringProgram_tenantId_idx" ON "aura_mentoring_program"("tenantId");

-- CreateIndex
CREATE INDEX "aura_time_rounding_rule_tenantId_companyId_isActive_idx" ON "aura_time_rounding_rule"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_time_rounding_rule_tenantId_name_key" ON "aura_time_rounding_rule"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_roster_config_tenantId_companyId_isActive_idx" ON "aura_roster_config"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_roster_config_tenantId_name_key" ON "aura_roster_config"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_wfh_policy_tenantId_companyId_isActive_idx" ON "aura_wfh_policy"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_wfh_policy_tenantId_name_key" ON "aura_wfh_policy"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_shift_swap_policy_tenantId_companyId_isActive_idx" ON "aura_shift_swap_policy"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_shift_swap_policy_tenantId_name_key" ON "aura_shift_swap_policy"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_attendance_rule_tenantId_ruleType_isActive_idx" ON "aura_attendance_rule"("tenantId", "ruleType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_attendance_rule_tenantId_name_key" ON "aura_attendance_rule"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_geofence_config_tenantId_isActive_idx" ON "aura_geofence_config"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_geofence_config_tenantId_name_key" ON "aura_geofence_config"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_ip_restriction_tenantId_restrictionType_isActive_idx" ON "aura_ip_restriction"("tenantId", "restrictionType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ip_restriction_tenantId_name_key" ON "aura_ip_restriction"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_comp_off_policy_tenantId_companyId_isActive_idx" ON "aura_comp_off_policy"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_comp_off_policy_tenantId_name_key" ON "aura_comp_off_policy"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_punch_rule_tenantId_companyId_isActive_idx" ON "aura_punch_rule"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_punch_rule_tenantId_name_key" ON "aura_punch_rule"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_field_force_config_tenantId_companyId_isActive_idx" ON "aura_field_force_config"("tenantId", "companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_field_force_config_tenantId_name_key" ON "aura_field_force_config"("tenantId", "name");

-- CreateIndex
CREATE INDEX "aura_industry_aviation_settings_tenantId_idx" ON "aura_industry_aviation_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_industry_aviation_settings_tenantId_companyId_key" ON "aura_industry_aviation_settings"("tenantId", "companyId");

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

-- CreateIndex
CREATE INDEX "aura_gcc_tenant_country_tenantId_idx" ON "aura_gcc_tenant_country"("tenantId");

-- CreateIndex
CREATE INDEX "aura_gcc_tenant_country_countryCode_idx" ON "aura_gcc_tenant_country"("countryCode");

-- CreateIndex
CREATE INDEX "aura_gcc_tenant_country_isEnabled_idx" ON "aura_gcc_tenant_country"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gcc_tenant_country_tenantId_countryCode_key" ON "aura_gcc_tenant_country"("tenantId", "countryCode");

-- CreateIndex
CREATE INDEX "aura_gcc_legal_entity_tenantId_idx" ON "aura_gcc_legal_entity"("tenantId");

-- CreateIndex
CREATE INDEX "aura_gcc_legal_entity_tenantCountryId_idx" ON "aura_gcc_legal_entity"("tenantCountryId");

-- CreateIndex
CREATE INDEX "aura_gcc_legal_entity_companyId_idx" ON "aura_gcc_legal_entity"("companyId");

-- CreateIndex
CREATE INDEX "aura_gcc_legal_entity_countryCode_idx" ON "aura_gcc_legal_entity"("countryCode");

-- CreateIndex
CREATE INDEX "aura_gcc_legal_entity_isActive_idx" ON "aura_gcc_legal_entity"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gcc_legal_entity_tenantId_countryCode_registrationRef_key" ON "aura_gcc_legal_entity"("tenantId", "countryCode", "registrationRef");

-- CreateIndex
CREATE INDEX "aura_gcc_country_profile_countryCode_idx" ON "aura_gcc_country_profile"("countryCode");

-- CreateIndex
CREATE INDEX "aura_gcc_country_profile_effectiveFrom_idx" ON "aura_gcc_country_profile"("effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_gcc_country_profile_status_idx" ON "aura_gcc_country_profile"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gcc_country_profile_countryCode_version_key" ON "aura_gcc_country_profile"("countryCode", "version");

-- CreateIndex
CREATE INDEX "aura_workforce_classification_tenantId_idx" ON "aura_workforce_classification"("tenantId");

-- CreateIndex
CREATE INDEX "aura_workforce_classification_employeeId_idx" ON "aura_workforce_classification"("employeeId");

-- CreateIndex
CREATE INDEX "aura_workforce_classification_countryOfEmployment_idx" ON "aura_workforce_classification"("countryOfEmployment");

-- CreateIndex
CREATE INDEX "aura_workforce_classification_workforceClass_idx" ON "aura_workforce_classification"("workforceClass");

-- CreateIndex
CREATE INDEX "aura_workforce_classification_effectiveFrom_idx" ON "aura_workforce_classification"("effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_platform_alert_rule_tenantId_idx" ON "aura_platform_alert_rule"("tenantId");

-- CreateIndex
CREATE INDEX "aura_platform_alert_rule_eventType_idx" ON "aura_platform_alert_rule"("eventType");

-- CreateIndex
CREATE INDEX "aura_platform_alert_rule_isActive_idx" ON "aura_platform_alert_rule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "aura_platform_alert_rule_tenantId_code_key" ON "aura_platform_alert_rule"("tenantId", "code");

-- CreateIndex
CREATE INDEX "aura_platform_alert_instance_tenantId_idx" ON "aura_platform_alert_instance"("tenantId");

-- CreateIndex
CREATE INDEX "aura_platform_alert_instance_alertRuleId_idx" ON "aura_platform_alert_instance"("alertRuleId");

-- CreateIndex
CREATE INDEX "aura_platform_alert_instance_firedAt_idx" ON "aura_platform_alert_instance"("firedAt");

-- CreateIndex
CREATE INDEX "aura_platform_alert_instance_status_idx" ON "aura_platform_alert_instance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_platform_alert_instance_rule_threshold_resource_key" ON "aura_platform_alert_instance"("alertRuleId", "thresholdDays", "resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "aura_gcc_role_scope_userRoleId_idx" ON "aura_gcc_role_scope"("userRoleId");

-- CreateIndex
CREATE INDEX "aura_gcc_role_scope_countryCode_idx" ON "aura_gcc_role_scope"("countryCode");

-- CreateIndex
CREATE INDEX "aura_gcc_role_scope_legalEntityId_idx" ON "aura_gcc_role_scope"("legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gcc_role_scope_userRoleId_countryCode_legalEntityId_key" ON "aura_gcc_role_scope"("userRoleId", "countryCode", "legalEntityId");

-- CreateIndex
CREATE INDEX "aura_compliance_risk_register_tenantId_idx" ON "aura_compliance_risk_register"("tenantId");

-- CreateIndex
CREATE INDEX "aura_compliance_risk_register_rating_idx" ON "aura_compliance_risk_register"("rating");

-- CreateIndex
CREATE INDEX "aura_compliance_risk_register_status_idx" ON "aura_compliance_risk_register"("status");

-- CreateIndex
CREATE INDEX "aura_compliance_risk_register_category_idx" ON "aura_compliance_risk_register"("category");

-- CreateIndex
CREATE UNIQUE INDEX "aura_compliance_risk_register_tenantId_riskCode_key" ON "aura_compliance_risk_register"("tenantId", "riskCode");

-- CreateIndex
CREATE INDEX "aura_localization_target_tenantId_idx" ON "aura_localization_target"("tenantId");

-- CreateIndex
CREATE INDEX "aura_localization_target_countryCode_idx" ON "aura_localization_target"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_localization_target_unique_key" ON "aura_localization_target"("tenantId", "countryCode", "legalEntityId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_workforce_kpi_snapshot_tenantId_idx" ON "aura_workforce_kpi_snapshot"("tenantId");

-- CreateIndex
CREATE INDEX "aura_workforce_kpi_snapshot_snapshotDate_idx" ON "aura_workforce_kpi_snapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "aura_workforce_kpi_snapshot_countryCode_idx" ON "aura_workforce_kpi_snapshot"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_workforce_kpi_snapshot_unique_key" ON "aura_workforce_kpi_snapshot"("tenantId", "countryCode", "legalEntityId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "aura_digital_maturity_domain_code_key" ON "aura_digital_maturity_domain"("code");

-- CreateIndex
CREATE INDEX "aura_digital_maturity_snapshot_tenantId_idx" ON "aura_digital_maturity_snapshot"("tenantId");

-- CreateIndex
CREATE INDEX "aura_digital_maturity_snapshot_period_idx" ON "aura_digital_maturity_snapshot"("period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_digital_maturity_snapshot_unique_key" ON "aura_digital_maturity_snapshot"("tenantId", "domainId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_compliance_theme_code_key" ON "aura_compliance_theme"("code");

-- CreateIndex
CREATE INDEX "aura_country_rule_pack_status_idx" ON "aura_country_rule_pack"("status");

-- CreateIndex
CREATE INDEX "aura_country_rule_pack_effectiveFrom_idx" ON "aura_country_rule_pack"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "aura_country_rule_pack_country_version_key" ON "aura_country_rule_pack"("countryCode", "version");

-- CreateIndex
CREATE INDEX "aura_country_rule_countryCode_idx" ON "aura_country_rule"("countryCode");

-- CreateIndex
CREATE INDEX "aura_country_rule_domain_idx" ON "aura_country_rule"("domain");

-- CreateIndex
CREATE INDEX "aura_country_rule_ruleKey_idx" ON "aura_country_rule"("ruleKey");

-- CreateIndex
CREATE UNIQUE INDEX "aura_country_rule_pack_domain_key_unique" ON "aura_country_rule"("rulePackId", "domain", "ruleKey");

-- CreateIndex
CREATE INDEX "aura_country_risk_matrix_tenantId_idx" ON "aura_country_risk_matrix"("tenantId");

-- CreateIndex
CREATE INDEX "aura_country_risk_matrix_countryCode_idx" ON "aura_country_risk_matrix"("countryCode");

-- CreateIndex
CREATE INDEX "aura_country_risk_matrix_rating_idx" ON "aura_country_risk_matrix"("rating");

-- CreateIndex
CREATE INDEX "aura_country_risk_matrix_status_idx" ON "aura_country_risk_matrix"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_country_risk_matrix_unique" ON "aura_country_risk_matrix"("tenantId", "countryCode", "riskCode");

-- CreateIndex
CREATE INDEX "aura_country_audit_checklist_countryCode_idx" ON "aura_country_audit_checklist"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_country_audit_checklist_unique" ON "aura_country_audit_checklist"("tenantId", "countryCode", "checklistCode");

-- CreateIndex
CREATE INDEX "aura_country_compliance_certificate_period_idx" ON "aura_country_compliance_certificate"("period");

-- CreateIndex
CREATE INDEX "aura_country_compliance_certificate_status_idx" ON "aura_country_compliance_certificate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_country_compliance_certificate_unique" ON "aura_country_compliance_certificate"("tenantId", "countryCode", "period");

-- CreateIndex
CREATE INDEX "aura_kpi_definition_tenantId_idx" ON "aura_kpi_definition"("tenantId");

-- CreateIndex
CREATE INDEX "aura_kpi_definition_domain_idx" ON "aura_kpi_definition"("domain");

-- CreateIndex
CREATE INDEX "aura_kpi_definition_status_idx" ON "aura_kpi_definition"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_kpi_definition_unique" ON "aura_kpi_definition"("tenantId", "code", "version");

-- CreateIndex
CREATE INDEX "aura_kpi_threshold_kpiCode_idx" ON "aura_kpi_threshold"("kpiCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_kpi_threshold_unique" ON "aura_kpi_threshold"("tenantId", "kpiCode", "countryCode");

-- CreateIndex
CREATE INDEX "aura_kpi_value_tenantId_idx" ON "aura_kpi_value"("tenantId");

-- CreateIndex
CREATE INDEX "aura_kpi_value_period_idx" ON "aura_kpi_value"("period");

-- CreateIndex
CREATE INDEX "aura_kpi_value_ragStatus_idx" ON "aura_kpi_value"("ragStatus");

-- CreateIndex
CREATE UNIQUE INDEX "aura_kpi_value_unique" ON "aura_kpi_value"("tenantId", "kpiCode", "countryCode", "legalEntityId", "period");

-- CreateIndex
CREATE INDEX "aura_kpi_dq_lookup_idx" ON "aura_kpi_data_quality_check"("tenantId", "kpiCode", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_kpi_scorecard_weight_unique" ON "aura_kpi_scorecard_weight"("tenantId", "domain");

-- CreateIndex
CREATE INDEX "aura_kpi_certificate_status_idx" ON "aura_kpi_certificate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_kpi_certificate_unique" ON "aura_kpi_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_calendar_category_unique" ON "aura_calendar_category"("tenantId", "code");

-- CreateIndex
CREATE INDEX "aura_recurrence_rule_categoryCode_idx" ON "aura_recurrence_rule"("categoryCode");

-- CreateIndex
CREATE INDEX "aura_recurrence_rule_countryCode_idx" ON "aura_recurrence_rule"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_recurrence_rule_unique" ON "aura_recurrence_rule"("tenantId", "code");

-- CreateIndex
CREATE INDEX "aura_compliance_task_tenantId_idx" ON "aura_compliance_task"("tenantId");

-- CreateIndex
CREATE INDEX "aura_compliance_task_dueDate_idx" ON "aura_compliance_task"("dueDate");

-- CreateIndex
CREATE INDEX "aura_compliance_task_status_idx" ON "aura_compliance_task"("status");

-- CreateIndex
CREATE INDEX "aura_compliance_task_categoryCode_idx" ON "aura_compliance_task"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_compliance_task_unique" ON "aura_compliance_task"("tenantId", "ruleCode", "scheduledFor", "legalEntityId");

-- CreateIndex
CREATE INDEX "aura_holiday_calendar_lookup_idx" ON "aura_holiday_calendar"("countryCode", "year");

-- CreateIndex
CREATE UNIQUE INDEX "aura_holiday_calendar_unique" ON "aura_holiday_calendar"("tenantId", "countryCode", "date", "name");

-- CreateIndex
CREATE UNIQUE INDEX "aura_audit_plan_unique" ON "aura_audit_plan"("tenantId", "year");

-- CreateIndex
CREATE INDEX "aura_audit_sample_planId_idx" ON "aura_audit_sample"("auditPlanId");

-- CreateIndex
CREATE INDEX "aura_audit_test_result_planId_idx" ON "aura_audit_test_result"("auditPlanId");

-- CreateIndex
CREATE INDEX "aura_audit_test_result_passed_idx" ON "aura_audit_test_result"("passed");

-- CreateIndex
CREATE INDEX "aura_audit_finding_planId_idx" ON "aura_audit_finding"("auditPlanId");

-- CreateIndex
CREATE INDEX "aura_audit_finding_status_idx" ON "aura_audit_finding"("status");

-- CreateIndex
CREATE INDEX "aura_audit_finding_severity_idx" ON "aura_audit_finding"("severity");

-- CreateIndex
CREATE INDEX "aura_corrective_action_findingId_idx" ON "aura_corrective_action"("findingId");

-- CreateIndex
CREATE INDEX "aura_corrective_action_status_idx" ON "aura_corrective_action"("status");

-- CreateIndex
CREATE INDEX "aura_corrective_action_dueDate_idx" ON "aura_corrective_action"("dueDate");

-- CreateIndex
CREATE INDEX "aura_management_review_status_idx" ON "aura_management_review"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_management_review_unique" ON "aura_management_review"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_calendar_certificate_unique" ON "aura_calendar_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_checklist_template_domain_idx" ON "aura_checklist_template"("domain");

-- CreateIndex
CREATE INDEX "aura_checklist_template_status_idx" ON "aura_checklist_template"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_checklist_template_unique" ON "aura_checklist_template"("tenantId", "code", "version");

-- CreateIndex
CREATE INDEX "aura_checklist_item_templateId_idx" ON "aura_checklist_item"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_checklist_item_unique" ON "aura_checklist_item"("templateId", "code");

-- CreateIndex
CREATE INDEX "aura_red_flag_rule_domain_idx" ON "aura_red_flag_rule"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "aura_red_flag_rule_unique" ON "aura_red_flag_rule"("tenantId", "code");

-- CreateIndex
CREATE INDEX "aura_checklist_run_period_idx" ON "aura_checklist_run"("period");

-- CreateIndex
CREATE INDEX "aura_checklist_run_status_idx" ON "aura_checklist_run"("status");

-- CreateIndex
CREATE INDEX "aura_checklist_run_template_idx" ON "aura_checklist_run"("templateId");

-- CreateIndex
CREATE INDEX "aura_checklist_run_tenant_idx" ON "aura_checklist_run"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_checklist_run_unique" ON "aura_checklist_run"("tenantId", "templateCode", "period", "legalEntityId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_checklist_run_item_runId_idx" ON "aura_checklist_run_item"("runId");

-- CreateIndex
CREATE INDEX "aura_checklist_run_item_status_idx" ON "aura_checklist_run_item"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_checklist_run_item_unique" ON "aura_checklist_run_item"("runId", "itemCode");

-- CreateIndex
CREATE INDEX "aura_red_flag_instance_tenantId_idx" ON "aura_red_flag_instance"("tenantId");

-- CreateIndex
CREATE INDEX "aura_red_flag_instance_severity_idx" ON "aura_red_flag_instance"("severity");

-- CreateIndex
CREATE INDEX "aura_red_flag_instance_status_idx" ON "aura_red_flag_instance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_red_flag_instance_unique" ON "aura_red_flag_instance"("tenantId", "ruleCode", "sourceType", "sourceId", "raisedAt");

-- CreateIndex
CREATE INDEX "aura_compliance_exception_tenantId_idx" ON "aura_compliance_exception"("tenantId");

-- CreateIndex
CREATE INDEX "aura_compliance_exception_domain_idx" ON "aura_compliance_exception"("domain");

-- CreateIndex
CREATE INDEX "aura_compliance_exception_status_idx" ON "aura_compliance_exception"("status");

-- CreateIndex
CREATE INDEX "aura_compliance_exception_registerCode_idx" ON "aura_compliance_exception"("registerCode");

-- CreateIndex
CREATE INDEX "aura_checklist_certificate_status_idx" ON "aura_checklist_certificate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_checklist_certificate_unique" ON "aura_checklist_certificate"("tenantId", "scope", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_wps_scheme_countryCode_key" ON "aura_wps_scheme"("countryCode");

-- CreateIndex
CREATE INDEX "aura_wps_establishment_tenantId_idx" ON "aura_wps_establishment"("tenantId");

-- CreateIndex
CREATE INDEX "aura_wps_establishment_countryCode_idx" ON "aura_wps_establishment"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "aura_wps_establishment_unique" ON "aura_wps_establishment"("tenantId", "countryCode", "employerId");

-- CreateIndex
CREATE INDEX "aura_wps_period_submission_tenantId_idx" ON "aura_wps_period_submission"("tenantId");

-- CreateIndex
CREATE INDEX "aura_wps_period_submission_status_idx" ON "aura_wps_period_submission"("status");

-- CreateIndex
CREATE INDEX "aura_wps_period_submission_period_idx" ON "aura_wps_period_submission"("period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_wps_period_submission_unique" ON "aura_wps_period_submission"("tenantId", "establishmentId", "period");

-- CreateIndex
CREATE INDEX "aura_wps_employee_row_submissionId_idx" ON "aura_wps_employee_row"("submissionId");

-- CreateIndex
CREATE INDEX "aura_wps_employee_row_employeeId_idx" ON "aura_wps_employee_row"("employeeId");

-- CreateIndex
CREATE INDEX "aura_wps_employee_row_rowStatus_idx" ON "aura_wps_employee_row"("rowStatus");

-- CreateIndex
CREATE INDEX "aura_wps_exception_tenantId_idx" ON "aura_wps_exception"("tenantId");

-- CreateIndex
CREATE INDEX "aura_wps_exception_status_idx" ON "aura_wps_exception"("status");

-- CreateIndex
CREATE INDEX "aura_salary_delay_flag_tenantId_idx" ON "aura_salary_delay_flag"("tenantId");

-- CreateIndex
CREATE INDEX "aura_salary_delay_flag_severity_idx" ON "aura_salary_delay_flag"("severity");

-- CreateIndex
CREATE INDEX "aura_salary_delay_flag_status_idx" ON "aura_salary_delay_flag"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_salary_delay_flag_unique" ON "aura_salary_delay_flag"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE INDEX "aura_wps_penalty_tenantId_idx" ON "aura_wps_penalty"("tenantId");

-- CreateIndex
CREATE INDEX "aura_wps_penalty_status_idx" ON "aura_wps_penalty"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_wps_document_unique" ON "aura_wps_document"("tenantId", "code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "aura_wps_monthly_certificate_unique" ON "aura_wps_monthly_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_establishment_unique" ON "aura_gosi_establishment"("tenantId", "gosiNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_branch_config_unique" ON "aura_gosi_branch_config"("tenantId", "branch");

-- CreateIndex
CREATE INDEX "aura_gosi_contribution_rate_lookup_idx" ON "aura_gosi_contribution_rate"("tenantId", "branch", "nationalityClass", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_gosi_contribution_rate_status_idx" ON "aura_gosi_contribution_rate"("status");

-- CreateIndex
CREATE INDEX "aura_gosi_employee_registration_status_idx" ON "aura_gosi_employee_registration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_employee_registration_unique" ON "aura_gosi_employee_registration"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_gosi_contribution_wage_period_idx" ON "aura_gosi_contribution_wage"("period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_contribution_wage_unique" ON "aura_gosi_contribution_wage"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE INDEX "aura_gosi_contribution_period_idx" ON "aura_gosi_contribution"("period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_contribution_unique" ON "aura_gosi_contribution"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_period_submission_unique" ON "aura_gosi_period_submission"("tenantId", "establishmentId", "period");

-- CreateIndex
CREATE INDEX "aura_gosi_variance_tenantId_idx" ON "aura_gosi_variance"("tenantId");

-- CreateIndex
CREATE INDEX "aura_gosi_variance_period_idx" ON "aura_gosi_variance"("period");

-- CreateIndex
CREATE INDEX "aura_gosi_variance_status_idx" ON "aura_gosi_variance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gosi_certificate_unique" ON "aura_gosi_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_gosi_event_tenantId_idx" ON "aura_gosi_event"("tenantId");

-- CreateIndex
CREATE INDEX "aura_gosi_event_employeeId_idx" ON "aura_gosi_event"("employeeId");

-- CreateIndex
CREATE INDEX "aura_gosi_event_eventType_idx" ON "aura_gosi_event"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gpssa_establishment_unique" ON "aura_gpssa_establishment"("tenantId", "gpssaNumber");

-- CreateIndex
CREATE INDEX "aura_gpssa_contribution_rate_lookup_idx" ON "aura_gpssa_contribution_rate"("tenantId", "nationalityClass", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_gpssa_employee_registration_status_idx" ON "aura_gpssa_employee_registration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gpssa_employee_registration_unique" ON "aura_gpssa_employee_registration"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gpssa_contribution_wage_unique" ON "aura_gpssa_contribution_wage"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gpssa_contribution_unique" ON "aura_gpssa_contribution"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gpssa_period_submission_unique" ON "aura_gpssa_period_submission"("tenantId", "establishmentId", "period");

-- CreateIndex
CREATE INDEX "aura_gpssa_variance_tenantId_idx" ON "aura_gpssa_variance"("tenantId");

-- CreateIndex
CREATE INDEX "aura_gpssa_variance_period_idx" ON "aura_gpssa_variance"("period");

-- CreateIndex
CREATE INDEX "aura_gpssa_variance_status_idx" ON "aura_gpssa_variance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_gpssa_certificate_unique" ON "aura_gpssa_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_gpssa_transfer_employeeId_idx" ON "aura_gpssa_transfer"("employeeId");

-- CreateIndex
CREATE INDEX "aura_gpssa_event_tenantId_idx" ON "aura_gpssa_event"("tenantId");

-- CreateIndex
CREATE INDEX "aura_gpssa_event_employeeId_idx" ON "aura_gpssa_event"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_establishment_unique" ON "aura_sio_establishment"("tenantId", "sioNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_branch_config_unique" ON "aura_sio_branch_config"("tenantId", "branch");

-- CreateIndex
CREATE INDEX "aura_sio_contribution_rate_lookup_idx" ON "aura_sio_contribution_rate"("tenantId", "branch", "nationalityClass", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_sio_employee_registration_status_idx" ON "aura_sio_employee_registration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_employee_registration_unique" ON "aura_sio_employee_registration"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_contribution_wage_unique" ON "aura_sio_contribution_wage"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_contribution_unique" ON "aura_sio_contribution"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_period_submission_unique" ON "aura_sio_period_submission"("tenantId", "establishmentId", "period");

-- CreateIndex
CREATE INDEX "aura_sio_variance_tenantId_idx" ON "aura_sio_variance"("tenantId");

-- CreateIndex
CREATE INDEX "aura_sio_variance_period_idx" ON "aura_sio_variance"("period");

-- CreateIndex
CREATE INDEX "aura_sio_variance_status_idx" ON "aura_sio_variance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_sio_certificate_unique" ON "aura_sio_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_sio_event_tenantId_idx" ON "aura_sio_event"("tenantId");

-- CreateIndex
CREATE INDEX "aura_sio_event_employeeId_idx" ON "aura_sio_event"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_emiratisation_config_unique" ON "aura_emiratisation_config"("tenantId", "legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_emiratisation_target_unique" ON "aura_emiratisation_target"("tenantId", "legalEntityId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "aura_emiratisation_snapshot_unique" ON "aura_emiratisation_snapshot"("tenantId", "legalEntityId", "checkpointDate");

-- CreateIndex
CREATE INDEX "aura_emiratisation_hire_legal_entity_idx" ON "aura_emiratisation_hire"("legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_emiratisation_hire_unique" ON "aura_emiratisation_hire"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_emiratisation_fine_tenantId_idx" ON "aura_emiratisation_fine"("tenantId");

-- CreateIndex
CREATE INDEX "aura_emiratisation_fine_status_idx" ON "aura_emiratisation_fine"("status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_emiratisation_certificate_unique" ON "aura_emiratisation_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_nitaqat_config_unique" ON "aura_nitaqat_config"("tenantId", "legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_nitaqat_band_threshold_unique" ON "aura_nitaqat_band_threshold"("tenantId", "sector", "sizeBracket", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "aura_nitaqat_band_snapshot_unique" ON "aura_nitaqat_band_snapshot"("tenantId", "legalEntityId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "aura_nitaqat_hire_unique" ON "aura_nitaqat_hire"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_nitaqat_certificate_unique" ON "aura_nitaqat_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_bahrainization_config_unique" ON "aura_bahrainization_config"("tenantId", "legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_bahrainization_target_unique" ON "aura_bahrainization_target"("tenantId", "sector", "sizeBracket", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "aura_bahrainization_hire_unique" ON "aura_bahrainization_hire"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_bahrainization_snapshot_unique" ON "aura_bahrainization_snapshot"("tenantId", "legalEntityId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "aura_bahrainization_certificate_unique" ON "aura_bahrainization_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ot_policy_unique" ON "aura_ot_policy"("tenantId", "country", "grade", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ot_rate_card_unique" ON "aura_ot_rate_card"("tenantId", "country", "otType", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_ot_request_employee_date" ON "aura_ot_request"("tenantId", "employeeId", "requestDate");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ot_actual_unique" ON "aura_ot_actual"("tenantId", "employeeId", "otDate", "otType");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ot_budget_unique" ON "aura_ot_budget"("tenantId", "period", "costCenterId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ot_certificate_unique" ON "aura_ot_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_eosb_calculation_unique" ON "aura_eosb_calculation"("tenantId", "employeeId", "lastWorkingDate");

-- CreateIndex
CREATE UNIQUE INDEX "aura_eosb_accrual_unique" ON "aura_eosb_accrual"("tenantId", "employeeId", "period");

-- CreateIndex
CREATE INDEX "aura_eosb_dispute_employee" ON "aura_eosb_dispute"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_eosb_certificate_unique" ON "aura_eosb_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_visa_exit_case_employee" ON "aura_visa_exit_case"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_visa_exit_case_status" ON "aura_visa_exit_case"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_visa_exit_pro_action_case" ON "aura_visa_exit_pro_action"("tenantId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_visa_exit_grace_unique" ON "aura_visa_exit_grace"("tenantId", "caseId");

-- CreateIndex
CREATE INDEX "aura_visa_exit_evidence_case" ON "aura_visa_exit_evidence"("tenantId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_visa_exit_certificate_unique" ON "aura_visa_exit_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_doc_retention_schedule_unique" ON "aura_doc_retention_schedule"("tenantId", "countryCode", "recordType", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_hr_document_employee" ON "aura_hr_document"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_hr_document_type" ON "aura_hr_document"("tenantId", "recordType");

-- CreateIndex
CREATE INDEX "aura_hr_document_expiry" ON "aura_hr_document"("tenantId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "aura_doc_litigation_hold_unique" ON "aura_doc_litigation_hold"("tenantId", "caseNumber");

-- CreateIndex
CREATE INDEX "aura_hr_audit_finding_cycle" ON "aura_hr_audit_finding"("tenantId", "auditCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_doc_compliance_certificate_unique" ON "aura_doc_compliance_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_benefit_catalogue_unique" ON "aura_benefit_catalogue"("tenantId", "benefitCode", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_benefit_vendor_tenant" ON "aura_benefit_vendor"("tenantId");

-- CreateIndex
CREATE INDEX "aura_benefit_coverage_expiry" ON "aura_benefit_coverage"("tenantId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "aura_benefit_coverage_unique" ON "aura_benefit_coverage"("tenantId", "employeeId", "benefitCatalogueId", "startedAt");

-- CreateIndex
CREATE INDEX "aura_benefit_exception_employee" ON "aura_benefit_exception"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_benefit_certificate_unique" ON "aura_benefit_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_hr_policy_exception_policy" ON "aura_hr_policy_exception"("tenantId", "policyId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hr_policy_review_unique" ON "aura_hr_policy_review"("tenantId", "policyId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hr_policy_certificate_unique" ON "aura_hr_policy_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hr_form_template_unique" ON "aura_hr_form_template"("tenantId", "templateCode", "version");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hr_form_routing_unique" ON "aura_hr_form_routing"("tenantId", "templateId", "stageOrder");

-- CreateIndex
CREATE INDEX "aura_hr_form_submission_state_template" ON "aura_hr_form_submission_state"("tenantId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hr_form_submission_state_unique" ON "aura_hr_form_submission_state"("tenantId", "submissionRef");

-- CreateIndex
CREATE INDEX "aura_hr_form_signature_state" ON "aura_hr_form_signature"("tenantId", "submissionStateId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hr_form_certificate_unique" ON "aura_hr_form_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_attendance_policy_unique" ON "aura_attendance_policy"("tenantId", "country", "grade", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_attendance_fraud_flag_employee" ON "aura_attendance_fraud_flag"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_attendance_fraud_flag_open" ON "aura_attendance_fraud_flag"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_attendance_consent_unique" ON "aura_attendance_consent"("tenantId", "employeeId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "aura_attendance_certificate_unique" ON "aura_attendance_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_leave_entitlement_rule_unique" ON "aura_leave_entitlement_rule"("tenantId", "country", "leaveCode", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_leave_misuse_flag_employee" ON "aura_leave_misuse_flag"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_leave_misuse_flag_open" ON "aura_leave_misuse_flag"("tenantId", "status");

-- CreateIndex
CREATE INDEX "aura_leave_medical_evidence_request" ON "aura_leave_medical_evidence"("tenantId", "leaveRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_leave_certificate_unique" ON "aura_leave_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_holiday_pay_rule_unique" ON "aura_holiday_pay_rule"("tenantId", "country", "holidayClass", "effectiveFrom");

-- CreateIndex
CREATE INDEX "aura_holiday_work_approval_employee" ON "aura_holiday_work_approval"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_holiday_comp_off_employee" ON "aura_holiday_comp_off"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_holiday_certificate_unique" ON "aura_holiday_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_accommodation_site_tenant" ON "aura_accommodation_site"("tenantId");

-- CreateIndex
CREATE INDEX "aura_accommodation_assignment_site" ON "aura_accommodation_assignment"("tenantId", "siteId");

-- CreateIndex
CREATE INDEX "aura_accommodation_assignment_employee" ON "aura_accommodation_assignment"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_accommodation_inspection_site" ON "aura_accommodation_inspection"("tenantId", "siteId");

-- CreateIndex
CREATE INDEX "aura_accommodation_complaint_site" ON "aura_accommodation_complaint"("tenantId", "siteId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_accommodation_certificate_unique" ON "aura_accommodation_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_hse_risk_assessment_tenant" ON "aura_hse_risk_assessment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hse_incident_unique" ON "aura_hse_incident"("tenantId", "incidentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hse_permit_to_work_unique" ON "aura_hse_permit_to_work"("tenantId", "permitNumber");

-- CreateIndex
CREATE INDEX "aura_hse_training_record_employee" ON "aura_hse_training_record"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "aura_hse_training_record_expiry" ON "aura_hse_training_record"("tenantId", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "aura_hse_certificate_unique" ON "aura_hse_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_er_grievance_case_status" ON "aura_er_grievance_case"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "aura_er_grievance_case_unique" ON "aura_er_grievance_case"("tenantId", "caseNumber");

-- CreateIndex
CREATE INDEX "aura_er_disciplinary_action_employee" ON "aura_er_disciplinary_action"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_er_disciplinary_action_unique" ON "aura_er_disciplinary_action"("tenantId", "actionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_er_investigation_unique" ON "aura_er_investigation"("tenantId", "investigationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_er_appeal_unique" ON "aura_er_appeal"("tenantId", "appealNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_er_certificate_unique" ON "aura_er_certificate"("tenantId", "period");

-- CreateIndex
CREATE INDEX "aura_separation_case_employee" ON "aura_separation_case"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_separation_case_unique" ON "aura_separation_case"("tenantId", "caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "aura_separation_clearance_unique" ON "aura_separation_clearance"("tenantId", "caseId", "department");

-- CreateIndex
CREATE INDEX "aura_separation_handover_case" ON "aura_separation_handover"("tenantId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_separation_exit_interview_unique" ON "aura_separation_exit_interview"("tenantId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_separation_certificate_unique" ON "aura_separation_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "aura_compliance_kpi_snapshot_unique" ON "aura_compliance_kpi_snapshot"("tenantId", "period", "domain");

-- CreateIndex
CREATE INDEX "aura_compliance_risk_entry_tenant" ON "aura_compliance_risk_entry"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_compliance_corrective_action_unique" ON "aura_compliance_corrective_action"("tenantId", "actionNumber");

-- CreateIndex
CREATE INDEX "aura_compliance_review_calendar_item_tenant" ON "aura_compliance_review_calendar_item"("tenantId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "aura_executive_compliance_certificate_unique" ON "aura_executive_compliance_certificate"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingRecord_inspectionId_key" ON "PackagingRecord"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "PackingMaterial_materialCode_key" ON "PackingMaterial"("materialCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_batchNumber_key" ON "ProductionBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QCApproval_inspectionId_key" ON "QCApproval"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "QCDecision_inspectionId_key" ON "QCDecision"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "QCInspection_inspectionNumber_key" ON "QCInspection"("inspectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingManifest_manifestNumber_key" ON "ShippingManifest"("manifestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingManifest_packagingId_key" ON "ShippingManifest"("packagingId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMFA_userId_key" ON "UserMFA"("userId");

-- CreateIndex
CREATE INDEX "UserMFA_userId_idx" ON "UserMFA"("userId");

-- AddForeignKey
ALTER TABLE "aura_company" ADD CONSTRAINT "Company_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "aura_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_department" ADD CONSTRAINT "Department_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "aura_cost_center"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "aura_department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_state" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "aura_country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_city" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "aura_state"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_address" ADD CONSTRAINT "Address_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "aura_city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "aura_country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_address" ADD CONSTRAINT "Address_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "aura_state"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_location" ADD CONSTRAINT "Location_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "aura_address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "aura_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_job_family" ADD CONSTRAINT "JobFamily_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "aura_job_function"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_job_profile" ADD CONSTRAINT "JobProfile_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "aura_job_family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "aura_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "aura_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "aura_department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "aura_grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "aura_job_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "aura_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "aura_employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "aura_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "aura_employee_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "aura_employment_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_role" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "aura_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_role" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_role" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_role_permission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "aura_permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_role_permission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "aura_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_password_reset_token" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_mfa_secret" ADD CONSTRAINT "MFASecret_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_refresh_token" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_session" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_audit_log" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_delegation" ADD CONSTRAINT "UserDelegation_delegateeId_fkey" FOREIGN KEY ("delegateeId") REFERENCES "aura_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_delegation" ADD CONSTRAINT "UserDelegation_delegatorId_fkey" FOREIGN KEY ("delegatorId") REFERENCES "aura_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_deactivation" ADD CONSTRAINT "UserDeactivation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "aura_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_subcategory" ADD CONSTRAINT "CompetencySubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "aura_competency_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_catalog" ADD CONSTRAINT "CompetencyCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "aura_competency_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_catalog" ADD CONSTRAINT "CompetencyCatalog_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "aura_competency_subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_proficiency_descriptor" ADD CONSTRAINT "CompetencyProficiencyDescriptor_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_proficiency_descriptor" ADD CONSTRAINT "CompetencyProficiencyDescriptor_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "aura_proficiency_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_relation" ADD CONSTRAINT "CompetencyRelation_relatedCompetencyId_fkey" FOREIGN KEY ("relatedCompetencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_relation" ADD CONSTRAINT "CompetencyRelation_sourceCompetencyId_fkey" FOREIGN KEY ("sourceCompetencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_role_mapping" ADD CONSTRAINT "CompetencyRoleMapping_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_assessment_criteria" ADD CONSTRAINT "CompetencyAssessmentCriteria_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_competency_development_resource" ADD CONSTRAINT "CompetencyDevelopmentResource_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_proficiency_level" ADD CONSTRAINT "ProficiencyLevel_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "aura_proficiency_framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_job_competency_mapping" ADD CONSTRAINT "JobCompetencyMapping_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_job_competency_mapping" ADD CONSTRAINT "JobCompetencyMapping_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "aura_job_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_job_competency_mapping" ADD CONSTRAINT "JobCompetencyMapping_requiredLevelId_fkey" FOREIGN KEY ("requiredLevelId") REFERENCES "aura_proficiency_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_skill_assessment_competency" ADD CONSTRAINT "SkillAssessmentCompetency_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "aura_skill_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_skill_assessment_competency" ADD CONSTRAINT "SkillAssessmentCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_skill_assessment_result" ADD CONSTRAINT "SkillAssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "aura_skill_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_skill_assessment_result" ADD CONSTRAINT "SkillAssessmentResult_ratingLevelId_fkey" FOREIGN KEY ("ratingLevelId") REFERENCES "aura_proficiency_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gap_analysis_item" ADD CONSTRAINT "GapAnalysisItem_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "aura_competency_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gap_analysis_item" ADD CONSTRAINT "GapAnalysisItem_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "aura_proficiency_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gap_analysis_item" ADD CONSTRAINT "GapAnalysisItem_gapAnalysisId_fkey" FOREIGN KEY ("gapAnalysisId") REFERENCES "aura_gap_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gap_analysis_item" ADD CONSTRAINT "GapAnalysisItem_targetLevelId_fkey" FOREIGN KEY ("targetLevelId") REFERENCES "aura_proficiency_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_development_activity" ADD CONSTRAINT "DevelopmentActivity_developmentPlanId_fkey" FOREIGN KEY ("developmentPlanId") REFERENCES "aura_development_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_development_milestone" ADD CONSTRAINT "DevelopmentMilestone_developmentPlanId_fkey" FOREIGN KEY ("developmentPlanId") REFERENCES "aura_development_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_configuration" ADD CONSTRAINT "WPSConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_submission" ADD CONSTRAINT "WPSSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_submission" ADD CONSTRAINT "WPSSubmission_wpsConfigId_fkey" FOREIGN KEY ("wpsConfigId") REFERENCES "aura_wps_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_record" ADD CONSTRAINT "WPSRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_record" ADD CONSTRAINT "WPSRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "aura_wps_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_record" ADD CONSTRAINT "WPSRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_audit_log" ADD CONSTRAINT "WPSAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gosi_submission" ADD CONSTRAINT "GOSISubmission_gosiConfigId_fkey" FOREIGN KEY ("gosiConfigId") REFERENCES "aura_gosi_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gosi_record" ADD CONSTRAINT "GOSIRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "aura_gosi_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_nitaqat_snapshot" ADD CONSTRAINT "NitaqatSnapshot_configId_fkey" FOREIGN KEY ("configId") REFERENCES "aura_nitaqat_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_payroll_run" ADD CONSTRAINT "PayrollRun_configId_fkey" FOREIGN KEY ("configId") REFERENCES "aura_payroll_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_payslip" ADD CONSTRAINT "Payslip_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "aura_payroll_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_leave_balance" ADD CONSTRAINT "LeaveBalance_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "aura_leave_policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_india_pf_submission" ADD CONSTRAINT "IndiaPFSubmission_configId_fkey" FOREIGN KEY ("configId") REFERENCES "aura_india_pf_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_india_pf_record" ADD CONSTRAINT "IndiaPFRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "aura_india_pf_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_india_esi_submission" ADD CONSTRAINT "IndiaESISubmission_configId_fkey" FOREIGN KEY ("configId") REFERENCES "aura_india_esi_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_india_esi_record" ADD CONSTRAINT "IndiaESIRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "aura_india_esi_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_india_tds_declaration" ADD CONSTRAINT "IndiaTDSDeclaration_configId_fkey" FOREIGN KEY ("configId") REFERENCES "aura_india_tds_configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_india_professional_tax_deduction" ADD CONSTRAINT "IndiaProfessionalTaxDeduction_configId_fkey" FOREIGN KEY ("configId") REFERENCES "aura_india_professional_tax_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee_document" ADD CONSTRAINT "EmployeeDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "aura_document_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employee_document" ADD CONSTRAINT "EmployeeDocument_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "aura_employee_document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "aura_asset" ADD CONSTRAINT "Asset_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "aura_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_asset_assignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "aura_asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_asset_maintenance" ADD CONSTRAINT "AssetMaintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "aura_asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_newDepartmentId_fkey" FOREIGN KEY ("newDepartmentId") REFERENCES "aura_department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_newGradeId_fkey" FOREIGN KEY ("newGradeId") REFERENCES "aura_grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_newJobProfileId_fkey" FOREIGN KEY ("newJobProfileId") REFERENCES "aura_job_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_newLocationId_fkey" FOREIGN KEY ("newLocationId") REFERENCES "aura_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_previousDepartmentId_fkey" FOREIGN KEY ("previousDepartmentId") REFERENCES "aura_department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_previousGradeId_fkey" FOREIGN KEY ("previousGradeId") REFERENCES "aura_grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_previousJobProfileId_fkey" FOREIGN KEY ("previousJobProfileId") REFERENCES "aura_job_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_employment_history" ADD CONSTRAINT "EmploymentHistory_previousLocationId_fkey" FOREIGN KEY ("previousLocationId") REFERENCES "aura_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "aura_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "aura_department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_employeeStatusId_fkey" FOREIGN KEY ("employeeStatusId") REFERENCES "aura_employee_status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_employmentTypeId_fkey" FOREIGN KEY ("employmentTypeId") REFERENCES "aura_employment_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "aura_grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "aura_job_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "aura_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_position" ADD CONSTRAINT "Position_reportsToPositionId_fkey" FOREIGN KEY ("reportsToPositionId") REFERENCES "aura_position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "aura_employee_life_event" ADD CONSTRAINT "EmployeeLifeEvent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_id_card" ADD CONSTRAINT "IDCard_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_id_card" ADD CONSTRAINT "IDCard_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "aura_id_card_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_letter" ADD CONSTRAINT "Letter_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_letter" ADD CONSTRAINT "Letter_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "aura_letter_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_exit_request" ADD CONSTRAINT "ExitRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_exit_clearance" ADD CONSTRAINT "ExitClearance_exitRequestId_fkey" FOREIGN KEY ("exitRequestId") REFERENCES "aura_exit_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_probation_tracking" ADD CONSTRAINT "ProbationTracking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_probation_review" ADD CONSTRAINT "ProbationReview_probationId_fkey" FOREIGN KEY ("probationId") REFERENCES "aura_probation_tracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_confirmation_request" ADD CONSTRAINT "ConfirmationRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_report_execution" ADD CONSTRAINT "ReportExecution_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "aura_report_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_prediction" ADD CONSTRAINT "Prediction_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "aura_predictive_model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_ai_agent_message" ADD CONSTRAINT "AIAgentMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "aura_ai_agent_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_benefit_enrollment" ADD CONSTRAINT "BenefitEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "aura_benefit_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_benefit_claim" ADD CONSTRAINT "BenefitClaim_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "aura_benefit_enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_premium_rate" ADD CONSTRAINT "PremiumRate_planId_fkey" FOREIGN KEY ("planId") REFERENCES "aura_benefit_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_premium_deduction" ADD CONSTRAINT "PremiumDeduction_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "aura_benefit_enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_tax_document" ADD CONSTRAINT "TaxDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_one_on_one_note" ADD CONSTRAINT "OneOnOneNote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "aura_one_on_one_meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_one_on_one_action_item" ADD CONSTRAINT "OneOnOneActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "aura_one_on_one_meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_learning_path_enrollment" ADD CONSTRAINT "LearningPathEnrollment_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "aura_learning_path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_assessment_submission" ADD CONSTRAINT "AssessmentSubmission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "aura_assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_webhook_log" ADD CONSTRAINT "WebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "aura_webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_workflow_instance" ADD CONSTRAINT "WorkflowInstance_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "aura_workflow_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_emergency_contact" ADD CONSTRAINT "EmergencyContact_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_garnishment" ADD CONSTRAINT "Garnishment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_hsa_fsa_account" ADD CONSTRAINT "HSAFSAAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "aura_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_hsa_fsa_transaction" ADD CONSTRAINT "HSAFSATransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "aura_hsa_fsa_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_candidate_application" ADD CONSTRAINT "CandidateApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "aura_candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_candidate_application" ADD CONSTRAINT "CandidateApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "aura_job_posting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "aura_candidate_application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_interview_feedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "aura_interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_job_offer" ADD CONSTRAINT "JobOffer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "aura_candidate_application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_onboarding_stage_history" ADD CONSTRAINT "aura_onboarding_stage_history_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "aura_onboarding_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_onboarding_instance" ADD CONSTRAINT "OnboardingInstance_programId_fkey" FOREIGN KEY ("programId") REFERENCES "aura_onboarding_program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_onboarding_task" ADD CONSTRAINT "OnboardingTask_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "aura_onboarding_instance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_performance_review" ADD CONSTRAINT "PerformanceReview_reviewCycleId_fkey" FOREIGN KEY ("reviewCycleId") REFERENCES "aura_review_cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_notification_recipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "aura_notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_course_enrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "aura_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_session_attendee" ADD CONSTRAINT "SessionAttendee_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "aura_training_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_policy_acknowledgement" ADD CONSTRAINT "aura_policy_acknowledgement_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "aura_policy_document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_form_submission" ADD CONSTRAINT "aura_form_submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "aura_admin_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_hc_locum_assignment" ADD CONSTRAINT "aura_hc_locum_assignment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "aura_hc_locum_provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_gcc_legal_entity" ADD CONSTRAINT "aura_gcc_legal_entity_tenantCountryId_fkey" FOREIGN KEY ("tenantCountryId") REFERENCES "aura_gcc_tenant_country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_platform_alert_instance" ADD CONSTRAINT "aura_platform_alert_instance_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "aura_platform_alert_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_digital_maturity_snapshot" ADD CONSTRAINT "aura_digital_maturity_snapshot_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "aura_digital_maturity_domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_country_rule" ADD CONSTRAINT "aura_country_rule_rulePackId_fkey" FOREIGN KEY ("rulePackId") REFERENCES "aura_country_rule_pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_audit_sample" ADD CONSTRAINT "aura_audit_sample_planId_fkey" FOREIGN KEY ("auditPlanId") REFERENCES "aura_audit_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_corrective_action" ADD CONSTRAINT "aura_corrective_action_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "aura_audit_finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_checklist_item" ADD CONSTRAINT "aura_checklist_item_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "aura_checklist_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_checklist_run" ADD CONSTRAINT "aura_checklist_run_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "aura_checklist_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_checklist_run_item" ADD CONSTRAINT "aura_checklist_run_item_runId_fkey" FOREIGN KEY ("runId") REFERENCES "aura_checklist_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_wps_employee_row" ADD CONSTRAINT "aura_wps_employee_row_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "aura_wps_period_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

