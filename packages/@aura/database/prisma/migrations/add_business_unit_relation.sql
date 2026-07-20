BEGIN;

SET search_path TO auraos, public;

-- 1. Add businessUnitId column to aura_department
ALTER TABLE "aura_department" ADD COLUMN "businessUnitId" TEXT;

-- 2. Add foreign key constraint to aura_business_unit
ALTER TABLE "aura_department" 
  ADD CONSTRAINT "Department_businessUnitId_fkey" 
  FOREIGN KEY ("businessUnitId") 
  REFERENCES "aura_business_unit"("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- 3. Update existing departments to set correct businessUnitId based on seed mapping
-- Engineering (DEPT_ENG) & Product Management (DEPT_PROD) -> SaaS Products (BU_SAAS)
UPDATE "aura_department" 
SET "businessUnitId" = (SELECT "id" FROM "aura_business_unit" WHERE "code" = 'BU_SAAS' LIMIT 1)
WHERE "code" IN ('DEPT_ENG', 'DEPT_PROD', 'DEPT_HR', 'DEPT_FIN');

-- Sales (DEPT_SALES) & Marketing (DEPT_MKT) -> Enterprise Solutions (BU_ENT)
UPDATE "aura_department" 
SET "businessUnitId" = (SELECT "id" FROM "aura_business_unit" WHERE "code" = 'BU_ENT' LIMIT 1)
WHERE "code" IN ('DEPT_SALES', 'DEPT_MKT');

-- IT Infrastructure (DEPT_IT) -> Consulting Services (BU_CONS)
UPDATE "aura_department" 
SET "businessUnitId" = (SELECT "id" FROM "aura_business_unit" WHERE "code" = 'BU_CONS' LIMIT 1)
WHERE "code" = 'DEPT_IT';

COMMIT;
