-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'COMPANY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'COMPANY_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'COMPANY_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'COMPANY_ACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'COMPANY_SUSPENDED';

-- AlterTable
ALTER TABLE "aura_company" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "website" TEXT;

