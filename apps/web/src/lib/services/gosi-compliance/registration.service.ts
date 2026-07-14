import { prisma } from '@aura/database';
import type { AuthContext, NationalityClass } from './types';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

const GCC_COUNTRIES = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export interface RegistrationInput {
  employeeId: string;
  establishmentId: string; // Storing gccLegalEntityId
  nationalityClass: NationalityClass;
  gosiPersonalNumber?: string;
  registrationDate?: Date;
}

/**
 * EPIC-13-S05 / S06: employee registration register + deregistration on exit.
 */
export class GosiRegistrationService {
  async register(input: RegistrationInput, auth: AuthContext) {
    // Step 1: Validate Employee exists, active, not deleted, belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: { id: input.employeeId, isDeleted: false, company: { tenantId: auth.tenantId } },
      include: {
        company: true,
        status: true,
      },
    });
    if (!employee) {
      throw new Error(`Employee with ID ${input.employeeId} not found`);
    }

    const employeeStatusName = (employee.status?.name || '').toUpperCase();
    if (employeeStatusName !== 'ACTIVE' && employeeStatusName !== 'CONFIRMED') {
      throw new Error(`Employment Validation: Employee status is inactive (${employee.status?.name ?? 'Unknown'})`);
    }

    // Step 2 & 9: Determine Country & Validate SA Country
    const legalEntity = await (prisma as any).gccLegalEntity.findFirst({
      where: {
        id: input.establishmentId,
        tenantId: auth.tenantId,
        countryCode: 'SA',
        isActive: true,
        isDeleted: false,
      },
    });
    if (!legalEntity) {
      throw new Error('Country Validation: Employee does not belong to a Saudi Arabia Legal Entity.');
    }

    // Step 3 & 4 & 10: Determine Establishment, active, and GOSI configuration
    if (!legalEntity.registrationRef) {
      throw new Error('Registration Validation: No GOSI Establishment configured (registrationRef is missing).');
    }
    const isGosiConfigured = 
      legalEntity.registrationType?.toUpperCase() === 'GOSI' || 
      !!legalEntity.gosiEstablishmentId ||
      !!legalEntity.registrationRef;
    if (!isGosiConfigured) {
      throw new Error('Registration Validation: Legal entity is not configured as a GOSI Establishment.');
    }

    // Step 5: Duplicate Validation
    const activeReg = await (prisma as any).gosiEmployeeRegistration.findFirst({
      where: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        status: 'ACTIVE',
        isDeleted: false,
      },
    });
    if (activeReg) {
      throw new Error('Duplicate Validation: Employee already registered under an ACTIVE registration');
    }

    // Step 6: Nationality Validation
    const compliance = await prisma.employeeComplianceDetails.findFirst({
      where: { employeeId: input.employeeId, tenantId: auth.tenantId, isDeleted: false },
    });
    if (!compliance) {
      throw new Error('Nationality Validation: Employee compliance details not found');
    }
    const nationality = (compliance.nationality || '').toUpperCase();
    let expectedClass: NationalityClass = 'EXPAT';
    if (nationality === 'SA') {
      expectedClass = 'SAUDI';
    } else if (GCC_COUNTRIES.includes(nationality)) {
      expectedClass = 'GCC_NATIONAL_OTHER';
    }
    if (input.nationalityClass !== expectedClass) {
      throw new Error(`Nationality Validation: Nationality mismatch. Employee profile (${nationality}) maps to ${expectedClass}, not ${input.nationalityClass}`);
    }

    // Step 7: Employment status checks (join dates, resignation etc.)
    const today = new Date();
    if (new Date(employee.joiningDate) > today) {
      throw new Error('Employment Validation: Future join date is not allowed for registration');
    }

    // Step 8: Company and Tenant status checks
    if (employee.company.status?.toUpperCase() !== 'ACTIVE') {
      throw new Error('Company Validation: Company is not active');
    }
    const tenant = await prisma.tenant.findUnique({
      where: { id: auth.tenantId },
    });
    if (!tenant || tenant.status?.toUpperCase() === 'INACTIVE') {
      throw new Error('Company Validation: Tenant is not active');
    }

    // Register flow: Create a new version/entry (never overwrite previous deregistered history)
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).gosiEmployeeRegistration.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          establishmentId: input.establishmentId, // Storing gccLegalEntityId
          nationalityClass: input.nationalityClass,
          gosiPersonalNumber: input.gosiPersonalNumber || compliance.gosiSubscriptionNumber || null,
          registrationDate: input.registrationDate ?? new Date(),
          status: 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });

      // Audit Log Event
      await (tx as any).gosiEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          eventType: 'REGISTRATION',
          payload: { 
            action: 'REGISTER',
            nationalityClass: input.nationalityClass, 
            establishmentId: input.establishmentId,
            registrationRef: legalEntity.registrationRef,
            user: auth.userId,
            newValue: 'ACTIVE'
          },
        },
      });
      return row;
    });
  }

  async deregister(employeeId: string, input: { reason: string; date?: Date }, auth: AuthContext) {
    if (!input.reason) {
      throw new Error('Deregistration Flow: Reason is mandatory for deregistration');
    }

    return prisma.$transaction(async (tx) => {
      const activeReg = await (tx as any).gosiEmployeeRegistration.findFirst({
        where: {
          tenantId: auth.tenantId,
          employeeId,
          status: 'ACTIVE',
          isDeleted: false,
        },
      });
      if (!activeReg) {
        throw new Error('Deregistration Flow: No active registration found for this employee');
      }

      const row = await (tx as any).gosiEmployeeRegistration.update({
        where: { id: activeReg.id },
        data: {
          status: 'DEREGISTERED',
          deregistrationDate: input.date ?? new Date(),
          deregistrationReason: input.reason,
          updatedBy: auth.userId,
        },
      });

      // Audit Log Event
      await (tx as any).gosiEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId,
          eventType: 'DEREGISTRATION',
          payload: { 
            action: 'DEREGISTER',
            reason: input.reason, 
            oldStatus: 'ACTIVE', 
            newStatus: 'DEREGISTERED',
            user: auth.userId
          },
        },
      });
      return row;
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; nationalityClass?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).gosiEmployeeRegistration.findMany({
        where,
        orderBy: { registrationDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).gosiEmployeeRegistration.count({ where }),
    ]);

    // Enriched with employee name and GOSI establishment registration reference details
    const enriched = await Promise.all(
      items.map(async (item: any) => {
        const employee = await prisma.employee.findFirst({
          where: { id: item.employeeId, isDeleted: false },
          select: { firstName: true, lastName: true, employeeCode: true },
        });
        const legalEntity = await (prisma as any).gccLegalEntity.findFirst({
          where: { id: item.establishmentId, tenantId },
        });
        return {
          ...item,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
          employeeCode: employee?.employeeCode ?? '—',
          establishmentName: legalEntity ? `${legalEntity.legalName} (${legalEntity.registrationRef})` : item.establishmentId,
        };
      })
    );

    return buildPaginatedResult(enriched, total, page);
  }

  async getActive(tenantId: string, employeeId: string) {
    return (prisma as any).gosiEmployeeRegistration.findFirst({
      where: {
        tenantId,
        employeeId,
        status: 'ACTIVE',
        isDeleted: false,
      },
    });
  }

  async getEmployeePreview(employeeId: string, tenantId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false, company: { tenantId } },
      include: {
        company: true,
        status: true,
      },
    });
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const legalEntity = await (prisma as any).gccLegalEntity.findFirst({
      where: {
        tenantId,
        companyId: employee.companyId,
        countryCode: 'SA',
        isActive: true,
        isDeleted: false,
      },
    });

    const compliance = await prisma.employeeComplianceDetails.findFirst({
      where: { employeeId, tenantId, isDeleted: false },
    });

    const nationality = (compliance?.nationality || '').toUpperCase();
    const isSaudi = nationality === 'SA';
    const isGcc = ['AE', 'BH', 'QA', 'OM', 'KW'].includes(nationality);
    
    let expectedClass = 'EXPAT';
    if (isSaudi) expectedClass = 'SAUDI';
    else if (isGcc) expectedClass = 'GCC_NATIONAL_OTHER';

    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      companyId: employee.companyId,
      companyName: employee.company.name,
      legalEntityId: legalEntity?.id ?? null,
      legalEntityName: legalEntity?.legalName ?? 'No Saudi Legal Entity Configured',
      establishmentNumber: legalEntity?.registrationRef ?? 'No GOSI Establishment Configured',
      nationalityClass: expectedClass,
      nationality,
      isGosiConfigured: !!legalEntity?.registrationRef && (legalEntity.registrationType?.toUpperCase() === 'GOSI' || !!legalEntity.gosiEstablishmentId),
    };
  }
}

export const gosiRegistrationService = new GosiRegistrationService();
