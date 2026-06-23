import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  deriveWorkforceClass,
  GCC_NATIONALITY_CODES,
  isGccCountry,
  type WorkforceClass,
} from './country-defaults';

export interface ClassifyEmployeeInput {
  employeeId: string;
  nationality: string;
  countryOfEmployment: string;
  effectiveFrom?: Date;
  reason?: string;
}

/**
 * EPIC-01-S03: National vs. expatriate workforce data model.
 * - Single source of truth for downstream nationalization, social-insurance, immigration logic.
 * - Versioned (close out the prior row, insert a new one).
 * - Raises a data-quality flag when nationality/country are missing.
 */
export class WorkforceClassificationService {
  async getCurrent(tenantId: string, employeeId: string) {
    return (prisma as any).workforceClassification.findFirst({
      where: { tenantId, employeeId, effectiveTo: null },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async listHistory(tenantId: string, employeeId: string) {
    return (prisma as any).workforceClassification.findMany({
      where: { tenantId, employeeId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async classify(input: ClassifyEmployeeInput, auth: AuthContext) {
    const issues = this.validateInputs(input);
    if (issues.length) {
      throw new Error(`data-quality: ${issues.join('; ')}`);
    }

    const nationality = input.nationality.trim().toUpperCase();
    const countryOfEmployment = input.countryOfEmployment.trim().toUpperCase();
    const workforceClass: WorkforceClass = deriveWorkforceClass(nationality, countryOfEmployment);
    const isGccNational = GCC_NATIONALITY_CODES.has(nationality);
    const isEmiratisationEligible = countryOfEmployment === 'AE' && nationality === 'AE';
    const isCrossGccUnified = isGccNational && nationality !== countryOfEmployment;
    const effectiveFrom = input.effectiveFrom ?? new Date();

    const current = await this.getCurrent(auth.tenantId, input.employeeId);
    const nextVersion = current ? current.classificationVersion + 1 : 1;

    return prisma.$transaction(async (tx) => {
      if (current) {
        await (tx as any).workforceClassification.update({
          where: { id: current.id },
          data: { effectiveTo: effectiveFrom, updatedBy: auth.userId },
        });
      }
      return (tx as any).workforceClassification.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          nationality,
          countryOfEmployment,
          isGccNational,
          workforceClass,
          isEmiratisationEligible,
          isCrossGccUnified,
          classificationVersion: nextVersion,
          effectiveFrom,
          reason: input.reason,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
    });
  }

  async findDataQualityIssues(tenantId: string) {
    const missing = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT e.id AS "employeeId", e."firstName", e."lastName", e."companyId"
         FROM aura_employee e
         WHERE e."isDeleted" = false
           AND NOT EXISTS (
             SELECT 1 FROM aura_workforce_classification c
               WHERE c."tenantId" = $1
                 AND c."employeeId" = e.id
                 AND c."effectiveTo" IS NULL
           )
         LIMIT 500`,
      tenantId
    );
    return missing;
  }

  validateInputs(input: ClassifyEmployeeInput): string[] {
    const issues: string[] = [];
    if (!input.nationality || !input.nationality.trim()) {
      issues.push('nationality missing');
    }
    if (!input.countryOfEmployment || !input.countryOfEmployment.trim()) {
      issues.push('countryOfEmployment missing');
    } else if (!isGccCountry(input.countryOfEmployment.trim().toUpperCase())) {
      issues.push(`countryOfEmployment ${input.countryOfEmployment} not a GCC country`);
    }
    return issues;
  }
}

export const workforceClassificationService = new WorkforceClassificationService();
