-- ============================================================================
-- EPIC-19 (Attendance Compliance — overlay on existing AttendancePunch +
-- AttendanceRecord + Shift / Roster models; adds policy, fraud register,
-- consent register, and monthly certificate)
-- ============================================================================

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
  CONSTRAINT "aura_attendance_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_attendance_policy_unique"
  ON "aura_attendance_policy"("tenantId", "country", "grade", "effectiveFrom");

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
  CONSTRAINT "aura_attendance_fraud_flag_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_attendance_fraud_flag_employee"
  ON "aura_attendance_fraud_flag"("tenantId", "employeeId");
CREATE INDEX "aura_attendance_fraud_flag_open"
  ON "aura_attendance_fraud_flag"("tenantId", "status");

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
  CONSTRAINT "aura_attendance_consent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_attendance_consent_unique"
  ON "aura_attendance_consent"("tenantId", "employeeId", "consentType");

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
  CONSTRAINT "aura_attendance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_attendance_certificate_unique"
  ON "aura_attendance_certificate"("tenantId", "period");
