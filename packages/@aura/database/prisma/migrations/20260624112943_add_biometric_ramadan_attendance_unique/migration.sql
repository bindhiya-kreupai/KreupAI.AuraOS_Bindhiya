-- CreateTable
CREATE TABLE "auraos"."aura_biometric_device" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'online',
    "location" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "firmwareVersion" TEXT NOT NULL,
    "enrolledEmployees" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "lastHeartbeatAt" TIMESTAMP(3),
    "pendingPunches" INTEGER NOT NULL DEFAULT 0,
    "totalCapacity" INTEGER NOT NULL DEFAULT 5000,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "avgScanTimeMs" INTEGER NOT NULL DEFAULT 0,
    "dailyScans" INTEGER NOT NULL DEFAULT 0,
    "failedScans" INTEGER NOT NULL DEFAULT 0,
    "peakHour" TEXT,
    "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_biometric_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auraos"."aura_ramadan_auto_switch_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "mapping" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_ramadan_auto_switch_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aura_biometric_device_tenantId_idx" ON "auraos"."aura_biometric_device"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "aura_ramadan_auto_switch_config_tenantId_key" ON "auraos"."aura_ramadan_auto_switch_config"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_tenant_employee_date_uniq" ON "auraos"."aura_attendance_record"("tenantId", "employeeId", "date");

-- AddForeignKey
ALTER TABLE "auraos"."aura_biometric_device" ADD CONSTRAINT "aura_biometric_device_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "auraos"."aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auraos"."aura_ramadan_auto_switch_config" ADD CONSTRAINT "aura_ramadan_auto_switch_config_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "auraos"."aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
