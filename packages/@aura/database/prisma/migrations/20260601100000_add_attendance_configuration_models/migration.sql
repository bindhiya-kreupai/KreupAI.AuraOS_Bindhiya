-- Phase 2 #35 — Attendance Configuration models
-- Purely additive: 10 new tables. No backfills, no destructive ops.

-- =============================================================================
-- TimeRoundingRule
-- =============================================================================
CREATE TABLE "aura_time_rounding_rule" (
  "id"           TEXT NOT NULL,
  "tenantId"     TEXT NOT NULL,
  "companyId"    TEXT,
  "name"         TEXT NOT NULL,
  "description"  TEXT,
  "applicableTo" TEXT NOT NULL,
  "config"       JSONB NOT NULL,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "version"      INTEGER NOT NULL DEFAULT 1,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  "createdBy"    TEXT NOT NULL,
  "updatedBy"    TEXT NOT NULL,
  "isDeleted"    BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"    TIMESTAMP(3),
  CONSTRAINT "aura_time_rounding_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_time_rounding_rule_tenantId_name_key"
  ON "aura_time_rounding_rule"("tenantId", "name");
CREATE INDEX "aura_time_rounding_rule_tenantId_companyId_isActive_idx"
  ON "aura_time_rounding_rule"("tenantId", "companyId", "isActive");

-- =============================================================================
-- RosterConfig
-- =============================================================================
CREATE TABLE "aura_roster_config" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_roster_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_roster_config_tenantId_name_key"
  ON "aura_roster_config"("tenantId", "name");
CREATE INDEX "aura_roster_config_tenantId_companyId_isActive_idx"
  ON "aura_roster_config"("tenantId", "companyId", "isActive");

-- =============================================================================
-- WorkFromHomePolicy
-- =============================================================================
CREATE TABLE "aura_wfh_policy" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_wfh_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_wfh_policy_tenantId_name_key"
  ON "aura_wfh_policy"("tenantId", "name");
CREATE INDEX "aura_wfh_policy_tenantId_companyId_isActive_idx"
  ON "aura_wfh_policy"("tenantId", "companyId", "isActive");

-- =============================================================================
-- ShiftSwapPolicy
-- =============================================================================
CREATE TABLE "aura_shift_swap_policy" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_shift_swap_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_shift_swap_policy_tenantId_name_key"
  ON "aura_shift_swap_policy"("tenantId", "name");
CREATE INDEX "aura_shift_swap_policy_tenantId_companyId_isActive_idx"
  ON "aura_shift_swap_policy"("tenantId", "companyId", "isActive");

-- =============================================================================
-- AttendanceRule
-- =============================================================================
CREATE TABLE "aura_attendance_rule" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "ruleType"    TEXT NOT NULL,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_attendance_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_attendance_rule_tenantId_name_key"
  ON "aura_attendance_rule"("tenantId", "name");
CREATE INDEX "aura_attendance_rule_tenantId_ruleType_isActive_idx"
  ON "aura_attendance_rule"("tenantId", "ruleType", "isActive");

-- =============================================================================
-- GeofenceConfig
-- =============================================================================
CREATE TABLE "aura_geofence_config" (
  "id"           TEXT NOT NULL,
  "tenantId"     TEXT NOT NULL,
  "companyId"    TEXT,
  "name"         TEXT NOT NULL,
  "description"  TEXT,
  "fenceType"    TEXT NOT NULL,
  "latitude"     DOUBLE PRECISION NOT NULL,
  "longitude"    DOUBLE PRECISION NOT NULL,
  "radiusMeters" INTEGER NOT NULL,
  "address"      TEXT,
  "strictMode"   BOOLEAN NOT NULL DEFAULT false,
  "config"       JSONB,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "version"      INTEGER NOT NULL DEFAULT 1,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  "createdBy"    TEXT NOT NULL,
  "updatedBy"    TEXT NOT NULL,
  "isDeleted"    BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"    TIMESTAMP(3),
  CONSTRAINT "aura_geofence_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_geofence_config_tenantId_name_key"
  ON "aura_geofence_config"("tenantId", "name");
CREATE INDEX "aura_geofence_config_tenantId_isActive_idx"
  ON "aura_geofence_config"("tenantId", "isActive");

-- =============================================================================
-- IpRestriction
-- =============================================================================
CREATE TABLE "aura_ip_restriction" (
  "id"              TEXT NOT NULL,
  "tenantId"        TEXT NOT NULL,
  "companyId"       TEXT,
  "name"            TEXT NOT NULL,
  "description"     TEXT,
  "restrictionType" TEXT NOT NULL,
  "strictMode"      BOOLEAN NOT NULL DEFAULT false,
  "config"          JSONB NOT NULL,
  "isActive"        BOOLEAN NOT NULL DEFAULT true,
  "version"         INTEGER NOT NULL DEFAULT 1,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  "createdBy"       TEXT NOT NULL,
  "updatedBy"       TEXT NOT NULL,
  "isDeleted"       BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"       TIMESTAMP(3),
  CONSTRAINT "aura_ip_restriction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ip_restriction_tenantId_name_key"
  ON "aura_ip_restriction"("tenantId", "name");
CREATE INDEX "aura_ip_restriction_tenantId_restrictionType_isActive_idx"
  ON "aura_ip_restriction"("tenantId", "restrictionType", "isActive");

-- =============================================================================
-- CompOffPolicy
-- =============================================================================
CREATE TABLE "aura_comp_off_policy" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_comp_off_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_comp_off_policy_tenantId_name_key"
  ON "aura_comp_off_policy"("tenantId", "name");
CREATE INDEX "aura_comp_off_policy_tenantId_companyId_isActive_idx"
  ON "aura_comp_off_policy"("tenantId", "companyId", "isActive");

-- =============================================================================
-- PunchRule
-- =============================================================================
CREATE TABLE "aura_punch_rule" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_punch_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_punch_rule_tenantId_name_key"
  ON "aura_punch_rule"("tenantId", "name");
CREATE INDEX "aura_punch_rule_tenantId_companyId_isActive_idx"
  ON "aura_punch_rule"("tenantId", "companyId", "isActive");

-- =============================================================================
-- FieldForceConfig
-- =============================================================================
CREATE TABLE "aura_field_force_config" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "companyId"   TEXT,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "config"      JSONB NOT NULL,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "version"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "createdBy"   TEXT NOT NULL,
  "updatedBy"   TEXT NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP(3),
  CONSTRAINT "aura_field_force_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_field_force_config_tenantId_name_key"
  ON "aura_field_force_config"("tenantId", "name");
CREATE INDEX "aura_field_force_config_tenantId_companyId_isActive_idx"
  ON "aura_field_force_config"("tenantId", "companyId", "isActive");
