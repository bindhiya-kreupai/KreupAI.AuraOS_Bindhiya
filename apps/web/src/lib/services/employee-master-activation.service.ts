import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { countryOnboardingRuleService } from './country-onboarding-rule.service';

interface AuthContext {
  tenantId: string;
  userId: string;
}

const identifierSchema = z.object({
  type: z.string().min(1),
  value: z.string().min(1),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  isPrimary: z.boolean().optional(),
});

const masterDataSchema = z.object({
  onboardingInstanceId: z.string().optional().nullable(),
  offerId: z.string().optional().nullable(),
  identity: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    nationality: z.string().min(1),
    isLocalNational: z.boolean(),
    identifiers: z.array(identifierSchema).default([]),
  }),
  job: z.object({
    companyId: z.string().min(1),
    departmentId: z.string().min(1),
    locationId: z.string().min(1),
    jobProfileId: z.string().min(1),
    gradeId: z.string().min(1),
    typeId: z.string().min(1),
    joiningDate: z.coerce.date(),
    managerId: z.string().optional().nullable(),
    positionId: z.string().optional().nullable(),
    addressId: z.string().optional().nullable(),
  }),
  contract: z
    .object({
      contractType: z.string().optional().nullable(),
      contractStartDate: z.coerce.date().optional().nullable(),
      contractEndDate: z.coerce.date().optional().nullable(),
      probationEndDate: z.coerce.date().optional().nullable(),
    })
    .optional()
    .default({}),
  compliance: z.object({
    countryCode: z.string().min(2),
    bankName: z.string().optional().nullable(),
    bankAccountNumber: z.string().optional().nullable(),
    bankIBAN: z.string().optional().nullable(),
    bankSwiftCode: z.string().optional().nullable(),
    bankBranchCode: z.string().optional().nullable(),
    bankRoutingCode: z.string().optional().nullable(),
    labourCardNumber: z.string().optional().nullable(),
    labourCardExpiry: z.coerce.date().optional().nullable(),
    emiratesId: z.string().optional().nullable(),
    emiratesIdExpiry: z.coerce.date().optional().nullable(),
    iqamaNumber: z.string().optional().nullable(),
    iqamaExpiry: z.coerce.date().optional().nullable(),
    nationalId: z.string().optional().nullable(),
    gosiSubscriptionNumber: z.string().optional().nullable(),
    wpsPersonalNumber: z.string().optional().nullable(),
    socialInsuranceEligible: z.boolean(),
    sector: z.string().optional().nullable(),
  }),
  compensation: z.object({
    basicSalary: z.coerce.number().positive(),
    houseRentAllowance: z.coerce.number().default(0),
    transportAllowance: z.coerce.number().default(0),
    otherAllowances: z.unknown().optional().nullable(),
    grossSalary: z.coerce.number().positive(),
    ctc: z.coerce.number().positive(),
    payFrequency: z.string().default('MONTHLY'),
    medicalInsurance: z.coerce.number().default(0),
    lifeInsurance: z.coerce.number().default(0),
  }),
});

type MasterData = z.infer<typeof masterDataSchema>;

const COUNTRY_REQUIRED: Record<
  string,
  { identifierTypes: string[]; complianceFields: Array<keyof MasterData['compliance']> }
> = {
  AE: {
    identifierTypes: ['EMIRATES_ID'],
    complianceFields: ['bankIBAN', 'nationality' as never, 'emiratesId'],
  },
  SA: {
    identifierTypes: ['IQAMA', 'NATIONAL_ID'],
    complianceFields: ['bankIBAN'],
  },
  BH: {
    identifierTypes: ['CPR'],
    complianceFields: ['bankIBAN'],
  },
  QA: {
    identifierTypes: ['QID'],
    complianceFields: ['bankIBAN'],
  },
  OM: {
    identifierTypes: ['RESIDENT_CARD', 'NATIONAL_ID'],
    complianceFields: ['bankIBAN'],
  },
  KW: {
    identifierTypes: ['CIVIL_ID'],
    complianceFields: ['bankIBAN'],
  },
};

function normalizeIdentifierType(type: string) {
  return type
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function normalizeCountry(countryCode: string) {
  return countryCode.trim().toUpperCase();
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function diffFields(
  beforeValue: unknown,
  afterValue: unknown,
  prefix = ''
): Array<{ field: string; before: unknown; after: unknown }> {
  if (
    beforeValue &&
    afterValue &&
    typeof beforeValue === 'object' &&
    typeof afterValue === 'object' &&
    !Array.isArray(beforeValue) &&
    !Array.isArray(afterValue)
  ) {
    const keys = new Set([
      ...Object.keys(beforeValue as Record<string, unknown>),
      ...Object.keys(afterValue as Record<string, unknown>),
    ]);
    return [...keys].flatMap((key) =>
      diffFields(
        (beforeValue as Record<string, unknown>)[key],
        (afterValue as Record<string, unknown>)[key],
        prefix ? `${prefix}.${key}` : key
      )
    );
  }
  if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) return [];
  return [{ field: prefix, before: beforeValue ?? null, after: afterValue ?? null }];
}

export class EmployeeMasterActivationService {
  async list(tenantId: string, filters: { status?: string; employeeId?: string }) {
    const rows = await (prisma as any).employeeMasterDataDraft.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
    return rows.map((row: any) => this.toDto(row));
  }

  async createDraft(input: unknown, auth: AuthContext) {
    const masterData = this.parseMasterData(input);
    await this.assertCompanyTenant(auth.tenantId, masterData.job.companyId);
    const validation = this.validateCountryRequirements(masterData);
    const duplicates = await this.findDuplicates(auth.tenantId, masterData);

    const draft = await (prisma as any).employeeMasterDataDraft.create({
      data: {
        tenantId: auth.tenantId,
        onboardingInstanceId: masterData.onboardingInstanceId ?? null,
        offerId: masterData.offerId ?? null,
        status: 'DRAFT',
        masterData: toJson(masterData),
        validationSnapshot: toJson(validation),
        duplicateSnapshot: toJson(duplicates),
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });

    await this.audit(auth, 'CREATE', draft.id, null, draft, diffFields(null, masterData));
    return this.toDto(draft);
  }

  async updateDraft(id: string, input: unknown, auth: AuthContext) {
    const existing = await this.loadDraft(auth.tenantId, id);
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new Error('Only draft or rejected master data can be updated');
    }
    const masterData = this.parseMasterData(input);
    await this.assertCompanyTenant(auth.tenantId, masterData.job.companyId);
    const validation = this.validateCountryRequirements(masterData);
    const duplicates = await this.findDuplicates(auth.tenantId, masterData);

    const updated = await (prisma as any).employeeMasterDataDraft.update({
      where: { id },
      data: {
        onboardingInstanceId: masterData.onboardingInstanceId ?? null,
        offerId: masterData.offerId ?? null,
        status: 'DRAFT',
        masterData: toJson(masterData),
        validationSnapshot: toJson(validation),
        duplicateSnapshot: toJson(duplicates),
        rejectionReason: null,
        updatedBy: auth.userId,
      },
    });

    await this.audit(
      auth,
      'UPDATE',
      id,
      existing,
      updated,
      diffFields(existing.masterData, masterData)
    );
    return this.toDto(updated);
  }

  async submit(id: string, auth: AuthContext) {
    const existing = await this.loadDraft(auth.tenantId, id);
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new Error('Only draft or rejected master data can be submitted');
    }
    const masterData = this.parseMasterData(existing.masterData);
    const validation = this.validateCountryRequirements(masterData);
    const duplicates = await this.findDuplicates(auth.tenantId, masterData);
    if (validation.missing.length) {
      throw new Error(`Mandatory master-data fields missing: ${validation.missing.join(', ')}`);
    }
    if (duplicates.blocking.length) {
      throw new Error(
        `Duplicate employee identifier found: ${duplicates.blocking[0].identifierType}`
      );
    }

    const updated = await (prisma as any).employeeMasterDataDraft.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        validationSnapshot: toJson(validation),
        duplicateSnapshot: toJson(duplicates),
        submittedBy: auth.userId,
        submittedAt: new Date(),
        updatedBy: auth.userId,
      },
    });
    await this.audit(auth, 'SUBMIT', id, existing, updated, []);
    return this.toDto(updated);
  }

  async approve(id: string, auth: AuthContext) {
    const existing = await this.loadDraft(auth.tenantId, id);
    if (existing.status !== 'SUBMITTED') {
      throw new Error('Only submitted master data can be approved');
    }
    if (existing.submittedBy === auth.userId || existing.createdBy === auth.userId) {
      throw new Error('Maker-checker violation: approver must be different from preparer');
    }

    const updated = await (prisma as any).employeeMasterDataDraft.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: auth.userId,
        approvedAt: new Date(),
        updatedBy: auth.userId,
      },
    });
    await this.audit(auth, 'APPROVE', id, existing, updated, []);
    return this.toDto(updated);
  }

  async reject(id: string, reason: string, auth: AuthContext) {
    const existing = await this.loadDraft(auth.tenantId, id);
    if (!['SUBMITTED', 'APPROVED'].includes(existing.status)) {
      throw new Error('Only submitted or approved master data can be rejected');
    }
    const updated = await (prisma as any).employeeMasterDataDraft.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        updatedBy: auth.userId,
      },
    });
    await this.audit(auth, 'REJECT', id, existing, updated, []);
    return this.toDto(updated);
  }

  async activate(id: string, auth: AuthContext) {
    const draft = await this.loadDraft(auth.tenantId, id);
    if (draft.status !== 'APPROVED') {
      throw new Error('Master data must be approved before activation');
    }
    if (
      !draft.approvedBy ||
      draft.approvedBy === draft.createdBy ||
      draft.approvedBy === draft.submittedBy
    ) {
      throw new Error('Maker-checker approval is required before activation');
    }

    const masterData = this.parseMasterData(draft.masterData);
    const validation = this.validateCountryRequirements(masterData);
    const duplicates = await this.findDuplicates(auth.tenantId, masterData);
    if (validation.missing.length) {
      throw new Error(`Mandatory master-data fields missing: ${validation.missing.join(', ')}`);
    }
    if (duplicates.blocking.length) {
      throw new Error(
        `Duplicate employee identifier found: ${duplicates.blocking[0].identifierType}`
      );
    }
    if (masterData.onboardingInstanceId) {
      const gate = await countryOnboardingRuleService.getActivationGate(
        auth.tenantId,
        masterData.onboardingInstanceId
      );
      if (gate.blocked) {
        throw new Error(`Country onboarding activation blockers: ${gate.reasons.join('; ')}`);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const employeeCode = await this.nextEmployeeCode(tx, auth, masterData.job.companyId);
      const activeStatus = await tx.employeeStatus.findFirst({ where: { code: 'ACTIVE' } });
      if (!activeStatus) {
        throw new Error('Employee status code ACTIVE is required before activation');
      }

      const employee = await tx.employee.create({
        data: {
          employeeCode,
          firstName: masterData.identity.firstName,
          lastName: masterData.identity.lastName,
          email: masterData.identity.email,
          companyId: masterData.job.companyId,
          departmentId: masterData.job.departmentId,
          locationId: masterData.job.locationId,
          jobProfileId: masterData.job.jobProfileId,
          gradeId: masterData.job.gradeId,
          statusId: activeStatus.id,
          typeId: masterData.job.typeId,
          joiningDate: masterData.job.joiningDate,
          managerId: masterData.job.managerId ?? undefined,
          positionId: masterData.job.positionId ?? undefined,
          addressId: masterData.job.addressId ?? undefined,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });

      await tx.employeeComplianceDetails.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: employee.id,
          countryCode: normalizeCountry(masterData.compliance.countryCode),
          nationality: masterData.identity.nationality,
          isLocalNational: masterData.identity.isLocalNational,
          labourCardNumber: masterData.compliance.labourCardNumber ?? null,
          labourCardExpiry: masterData.compliance.labourCardExpiry ?? null,
          emiratesId:
            masterData.compliance.emiratesId ?? this.identifierValue(masterData, 'EMIRATES_ID'),
          emiratesIdExpiry: masterData.compliance.emiratesIdExpiry ?? null,
          iqamaNumber:
            masterData.compliance.iqamaNumber ?? this.identifierValue(masterData, 'IQAMA'),
          iqamaExpiry: masterData.compliance.iqamaExpiry ?? null,
          nationalId:
            masterData.compliance.nationalId ?? this.identifierValue(masterData, 'NATIONAL_ID'),
          gosiSubscriptionNumber: masterData.compliance.gosiSubscriptionNumber ?? null,
          wpsPersonalNumber: masterData.compliance.wpsPersonalNumber ?? null,
          bankName: masterData.compliance.bankName ?? null,
          bankAccountNumber: masterData.compliance.bankAccountNumber ?? null,
          bankIBAN: masterData.compliance.bankIBAN ?? null,
          bankSwiftCode: masterData.compliance.bankSwiftCode ?? null,
          bankBranchCode: masterData.compliance.bankBranchCode ?? null,
          bankRoutingCode: masterData.compliance.bankRoutingCode ?? null,
          contractType: masterData.contract.contractType ?? null,
          contractStartDate: masterData.contract.contractStartDate ?? null,
          contractEndDate: masterData.contract.contractEndDate ?? null,
          probationEndDate: masterData.contract.probationEndDate ?? null,
          sector: masterData.compliance.sector ?? null,
        },
      });

      await tx.employeeSalaryStructure.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: employee.id,
          effectiveFrom: masterData.job.joiningDate,
          isActive: true,
          basicSalary: masterData.compensation.basicSalary,
          houseRentAllowance: masterData.compensation.houseRentAllowance,
          transportAllowance: masterData.compensation.transportAllowance,
          otherAllowances: toJson(masterData.compensation.otherAllowances ?? []),
          grossSalary: masterData.compensation.grossSalary,
          ctc: masterData.compensation.ctc,
          payFrequency: masterData.compensation.payFrequency,
          medicalInsurance: masterData.compensation.medicalInsurance,
          lifeInsurance: masterData.compensation.lifeInsurance,
          createdBy: auth.userId,
          remarks: `Created from onboarding master draft ${draft.id}`,
        },
      });

      for (const identifier of masterData.identity.identifiers) {
        await (tx as any).employeeIdentification.create({
          data: {
            tenantId: auth.tenantId,
            employeeId: employee.id,
            countryCode: normalizeCountry(masterData.compliance.countryCode),
            identifierType: normalizeIdentifierType(identifier.type),
            identifierValue: identifier.value,
            issueDate: identifier.issueDate ?? null,
            expiryDate: identifier.expiryDate ?? null,
            isPrimary: identifier.isPrimary ?? false,
            sourceDraftId: draft.id,
            createdBy: auth.userId,
            updatedBy: auth.userId,
          },
        });
      }

      const activatedDraft = await (tx as any).employeeMasterDataDraft.update({
        where: { id: draft.id },
        data: {
          status: 'ACTIVATED',
          employeeId: employee.id,
          activatedBy: auth.userId,
          activatedAt: new Date(),
          validationSnapshot: toJson(validation),
          duplicateSnapshot: toJson(duplicates),
          updatedBy: auth.userId,
        },
      });

      const eventPayload = {
        employee,
        masterData: {
          countryCode: normalizeCountry(masterData.compliance.countryCode),
          nationality: masterData.identity.nationality,
          isLocalNational: masterData.identity.isLocalNational,
          compensation: masterData.compensation,
          bank: {
            bankName: masterData.compliance.bankName,
            bankIBAN: masterData.compliance.bankIBAN,
            bankRoutingCode: masterData.compliance.bankRoutingCode,
          },
          downstreamModules: ['payroll', 'immigration', 'benefits', 'social_insurance'],
        },
      };
      const event = await (tx as any).employeeLifecycleEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: employee.id,
          eventType: 'employee.activated',
          payload: toJson(eventPayload),
          status: 'PENDING',
          createdBy: auth.userId,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'ACTIVATE' as any,
          resourceType: 'employee',
          resourceId: employee.id,
          module: 'onboarding',
          beforeValues: toJson(draft),
          afterValues: toJson({ employee, activatedDraft, event }),
          metadata: toJson({
            story: 'EPIC-06-S05',
            draftId: draft.id,
            eventType: 'employee.activated',
            fieldChanges: diffFields(null, eventPayload),
          }),
        },
      });

      return { employee, draft: activatedDraft, event };
    });

    return {
      employee: result.employee,
      draft: this.toDto(result.draft),
      event: result.event,
    };
  }

  private parseMasterData(input: unknown): MasterData {
    const parsed = masterDataSchema.parse(input);
    return {
      ...parsed,
      compliance: {
        ...parsed.compliance,
        countryCode: normalizeCountry(parsed.compliance.countryCode),
      },
      identity: {
        ...parsed.identity,
        identifiers: parsed.identity.identifiers.map((identifier) => ({
          ...identifier,
          type: normalizeIdentifierType(identifier.type),
        })),
      },
    };
  }

  private validateCountryRequirements(masterData: MasterData) {
    const countryCode = normalizeCountry(masterData.compliance.countryCode);
    const rule = COUNTRY_REQUIRED[countryCode];
    const missing: string[] = [];
    if (!rule) {
      missing.push(`country rule matrix for ${countryCode}`);
      return { countryCode, missing, valid: false };
    }
    if (!masterData.identity.nationality) missing.push('identity.nationality');
    if (typeof masterData.identity.isLocalNational !== 'boolean') {
      missing.push('identity.isLocalNational');
    }
    if (masterData.compliance.socialInsuranceEligible == null) {
      missing.push('compliance.socialInsuranceEligible');
    }
    if (!masterData.compliance.bankIBAN) missing.push('compliance.bankIBAN');
    const types = new Set(masterData.identity.identifiers.map((identifier) => identifier.type));
    const hasRequiredIdentifier = rule.identifierTypes.some((type) => types.has(type));
    if (!hasRequiredIdentifier) {
      missing.push(`identity.identifiers.${rule.identifierTypes.join('_or_')}`);
    }
    if (countryCode === 'AE' && !masterData.compliance.emiratesId && !types.has('EMIRATES_ID')) {
      missing.push('compliance.emiratesId');
    }
    return { countryCode, missing, valid: missing.length === 0 };
  }

  private async findDuplicates(tenantId: string, masterData: MasterData) {
    const identifiers = masterData.identity.identifiers.map((identifier) => ({
      identifierType: identifier.type,
      identifierValue: identifier.value,
    }));
    const blocking = [];
    for (const identifier of identifiers) {
      const existingIdentification = await (prisma as any).employeeIdentification.findFirst({
        where: {
          tenantId,
          identifierType: identifier.identifierType,
          identifierValue: identifier.identifierValue,
          isDeleted: false,
        },
      });
      if (existingIdentification) {
        blocking.push({ ...identifier, employeeId: existingIdentification.employeeId });
        continue;
      }

      if (identifier.identifierType === 'EMIRATES_ID') {
        const existing = await prisma.employeeComplianceDetails.findFirst({
          where: { tenantId, emiratesId: identifier.identifierValue },
        });
        if (existing) blocking.push({ ...identifier, employeeId: existing.employeeId });
      }
      if (identifier.identifierType === 'IQAMA') {
        const existing = await prisma.employeeComplianceDetails.findFirst({
          where: { tenantId, iqamaNumber: identifier.identifierValue },
        });
        if (existing) blocking.push({ ...identifier, employeeId: existing.employeeId });
      }
      if (identifier.identifierType === 'NATIONAL_ID') {
        const existing = await prisma.employeeComplianceDetails.findFirst({
          where: { tenantId, nationalId: identifier.identifierValue },
        });
        if (existing) blocking.push({ ...identifier, employeeId: existing.employeeId });
      }
      if (identifier.identifierType === 'PASSPORT') {
        const existing = await prisma.employeeDocument.findFirst({
          where: {
            tenantId,
            documentNumber: identifier.identifierValue,
            status: 'ACTIVE',
          },
        });
        if (existing?.employeeId) blocking.push({ ...identifier, employeeId: existing.employeeId });
      }
    }

    const existingEmail = await prisma.employee.findFirst({
      where: {
        email: masterData.identity.email,
        isDeleted: false,
        company: { tenantId },
        status: { code: 'ACTIVE' },
      },
    });
    if (existingEmail) {
      blocking.push({
        identifierType: 'EMAIL',
        identifierValue: masterData.identity.email,
        employeeId: existingEmail.id,
      });
    }

    return { blocking, checkedAt: new Date().toISOString() };
  }

  private async loadDraft(tenantId: string, id: string) {
    const draft = await (prisma as any).employeeMasterDataDraft.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!draft) throw new Error('Employee master-data draft not found');
    return draft;
  }

  private async assertCompanyTenant(tenantId: string, companyId: string) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId, isDeleted: false },
    });
    if (!company) throw new Error('Company not found for tenant');
  }

  private async nextEmployeeCode(
    tx: Prisma.TransactionClient,
    auth: AuthContext,
    companyId: string
  ) {
    const company = await tx.company.findFirst({
      where: { id: companyId, tenantId: auth.tenantId },
    });
    if (!company) throw new Error('Company not found for tenant');
    const prefix =
      company.code
        .replace(/[^A-Za-z0-9]/g, '')
        .slice(0, 6)
        .toUpperCase() || 'EMP';
    const sequence = await (tx as any).employeeNumberSequence.upsert({
      where: {
        tenantId_companyId: {
          tenantId: auth.tenantId,
          companyId,
        },
      },
      create: {
        tenantId: auth.tenantId,
        companyId,
        prefix,
        nextNumber: 1,
        padding: 5,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
      update: {},
    });
    await (tx as any).employeeNumberSequence.update({
      where: { id: sequence.id },
      data: { nextNumber: sequence.nextNumber + 1, updatedBy: auth.userId },
    });
    return `${sequence.prefix}${String(sequence.nextNumber).padStart(sequence.padding, '0')}`;
  }

  private identifierValue(masterData: MasterData, type: string) {
    return (
      masterData.identity.identifiers.find((identifier) => identifier.type === type)?.value ?? null
    );
  }

  private async audit(
    auth: AuthContext,
    action: 'CREATE' | 'UPDATE' | 'SUBMIT' | 'APPROVE' | 'REJECT',
    resourceId: string,
    beforeValues: unknown,
    afterValues: unknown,
    fieldChanges: Array<{ field: string; before: unknown; after: unknown }>
  ) {
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: action as any,
        resourceType: 'employee_master_data_draft',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: toJson({
          story: 'EPIC-06-S05',
          fieldChanges,
        }),
      },
    });
  }

  private toDto(row: any) {
    return {
      ...row,
      validationSnapshot: row.validationSnapshot ?? null,
      duplicateSnapshot: row.duplicateSnapshot ?? null,
    };
  }
}

export const employeeMasterActivationService = new EmployeeMasterActivationService();
