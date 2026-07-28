CREATE TABLE IF NOT EXISTS "aura_automotive_technician" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specializations" TEXT[],
    "skillLevel" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "employmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_technician_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_automotive_technician_shift" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shiftType" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDuration" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "serviceAdvisor" TEXT,
    "assignedJobs" TEXT[],
    "actualStartTime" TEXT,
    "actualEndTime" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "overtimeHours" DOUBLE PRECISION,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_technician_shift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_automotive_time_off_request" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "requestType" TEXT NOT NULL,
    "reason" TEXT,
    "affectedShifts" TEXT[],
    "coverageArranged" BOOLEAN NOT NULL,
    "coverageTechnicianId" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_time_off_request_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_automotive_sales_commission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "salesPersonId" TEXT NOT NULL,
    "salesPersonName" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalVehicleSales" DOUBLE PRECISION NOT NULL,
    "totalServiceSales" DOUBLE PRECISION NOT NULL,
    "totalSalesAmount" DOUBLE PRECISION NOT NULL,
    "baseCommission" DOUBLE PRECISION NOT NULL,
    "totalBonuses" DOUBLE PRECISION NOT NULL,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "netCommission" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "calculatedDate" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_sales_commission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_automotive_commission_structure" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "structureName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "applicableTo" TEXT NOT NULL,
    "commissionType" TEXT NOT NULL,
    "baseRate" DOUBLE PRECISION,
    "flatAmount" DOUBLE PRECISION,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_commission_structure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_automotive_part" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "barcode" TEXT,
    "supplierId" TEXT,
    "unitOfMeasure" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "quantityOnHand" INTEGER NOT NULL,
    "reorderPoint" INTEGER NOT NULL,
    "reorderQuantity" INTEGER NOT NULL,
    "locationBin" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastRestockDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_part_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aura_automotive_part_movement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "locationFrom" TEXT,
    "locationTo" TEXT,
    "notes" TEXT,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "performedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "aura_automotive_part_movement_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'aura_automotive_technician_shift_technicianId_fkey') THEN
        ALTER TABLE "aura_automotive_technician_shift" ADD CONSTRAINT "aura_automotive_technician_shift_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "aura_automotive_technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'aura_automotive_part_movement_partId_fkey') THEN
        ALTER TABLE "aura_automotive_part_movement" ADD CONSTRAINT "aura_automotive_part_movement_partId_fkey" FOREIGN KEY ("partId") REFERENCES "aura_automotive_part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
