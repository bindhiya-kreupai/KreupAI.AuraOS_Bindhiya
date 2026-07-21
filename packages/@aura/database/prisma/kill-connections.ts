import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.prisma');
    console.log('Reading schema.prisma...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // First drop the two incorrect columns to let the script recreate them correctly
    console.log('Dropping incorrect text columns to prepare for recreation as arrays...');
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "auraos"."aura_course" DROP COLUMN IF EXISTS "requiredForRoles";`
    ).catch(() => {});
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "auraos"."aura_course" DROP COLUMN IF EXISTS "requiredForCountries";`
    ).catch(() => {});

    // Parse all models
    const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
    let match;

    console.log('Scanning models and syncing schema with database...');

    while ((match = modelRegex.exec(schema)) !== null) {
      const modelName = match[1];
      const modelContent = match[2];

      // Determine database table name
      let tableName = modelName;
      const mapMatch = modelContent.match(/@@map\("([^"]+)"\)/);
      if (mapMatch) {
        tableName = mapMatch[1];
      }

      // Check if table exists in database
      const tableCheck: any = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'auraos' 
          AND table_name = '${tableName}'
        );`
      );

      const tableExists = tableCheck[0]?.exists;
      if (!tableExists) {
        continue;
      }

      // Get existing columns
      const existingCols: any = await prisma.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'auraos' AND table_name = '${tableName}';`
      );
      const existingColNames = new Set(existingCols.map((c: any) => c.column_name));

      // Parse fields
      const lines = modelContent.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('@@') || line.startsWith('//')) {
          continue;
        }

        const parts = line.split(/\s+/);
        const fieldName = parts[0];
        let fieldType = parts[1];

        if (!fieldType) continue;

        const isArray = fieldType.includes('[]');
        const cleanType = fieldType.replace(/[?\[\]]/g, '');

        // Check if it's a relation or custom type
        const isRelation = /^[A-Z]/.test(cleanType) && !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Decimal', 'Json', 'LocationType', 'LocationTypeType', 'AuditAction', 'AuditSeverity', 'WPSStatus', 'WPSRecordStatus', 'GOSIStatus', 'GOSIRecordStatus', 'NitaqatBand', 'PayrollRunStatus', 'PayslipStatus', 'LeaveAccrualType', 'IndiaPFStatus', 'IndiaPFRecordStatus', 'IndiaESIStatus', 'IndiaESIRecordStatus', 'TDSDeclarationStatus', 'PTDeductionStatus', 'BenefitCategory', 'PlanTier', 'CoverageLevel', 'BenefitEnrollmentStatus', 'BenefitEnrollmentType', 'ClaimStatus', 'DependentRelationship', 'DependentStatus', 'ProviderType', 'QualifyingEventType', 'PremiumPaymentFrequency', 'BenefitPlanStatus', 'EligibilityStatus', 'TerminationType'].includes(cleanType);
        if (isRelation) {
          continue;
        }

        // Check if the field is mapped with @map
        let dbColumnName = fieldName;
        const fieldMapMatch = line.match(/@map\("([^"]+)"\)/);
        if (fieldMapMatch) {
          dbColumnName = fieldMapMatch[1];
        }

        if (!existingColNames.has(dbColumnName)) {
          console.log(`[${tableName}] Missing column: ${dbColumnName} (type: ${fieldType})`);
          
          let sqlParams = '';
          if (cleanType === 'Boolean') {
            sqlParams = isArray ? 'BOOLEAN[]' : 'BOOLEAN NOT NULL DEFAULT false';
          } else if (cleanType.startsWith('Int')) {
            sqlParams = isArray ? 'INTEGER[]' : 'INTEGER';
          } else if (cleanType.startsWith('Float')) {
            sqlParams = isArray ? 'DOUBLE PRECISION[]' : 'DOUBLE PRECISION';
          } else if (cleanType.startsWith('Decimal')) {
            sqlParams = isArray ? 'DECIMAL(18,2)[]' : 'DECIMAL(18,2)';
          } else if (cleanType.startsWith('DateTime')) {
            sqlParams = isArray ? 'TIMESTAMP(3)[]' : 'TIMESTAMP(3)';
          } else if (cleanType.startsWith('Json')) {
            sqlParams = isArray ? 'JSONB[]' : 'JSONB';
          } else {
            sqlParams = isArray ? 'TEXT[]' : 'TEXT';
          }

          try {
            await prisma.$executeRawUnsafe(
              `ALTER TABLE "auraos"."${tableName}" ADD COLUMN IF NOT EXISTS "${dbColumnName}" ${sqlParams};`
            );
            console.log(`[${tableName}] Added column ${dbColumnName} as ${sqlParams}`);
          } catch (err: any) {
            console.error(`[${tableName}] Failed to add ${dbColumnName}:`, err.message);
          }
        }
      }
    }

    console.log('Database schema synchronization completed successfully!');
  } catch (error) {
    console.error('Error in script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
