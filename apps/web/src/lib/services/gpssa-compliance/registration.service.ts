import { prisma } from '@aura/database';
import type { AuthContext, NationalityClass } from './types';
import { APPLICABLE_CLASSES } from './seeds';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface RegistrationInput {
  employeeId: string;
  establishmentId: string;
  nationalityClass: NationalityClass;
  gpssaPersonalNumber?: string;
  emiratesId?: string;
  registrationDate?: Date;
}

/**
 * EPIC-14-S04 / S09 / S10 / S11: registration, transfers, deregistration,
 * Emiratisation evidence linkage.
 */
export class GpssaRegistrationService {
  async register(input: RegistrationInput, auth: AuthContext) {
    if (!APPLICABLE_CLASSES.includes(input.nationalityClass)) {
      throw new Error(
        `nationalityClass ${input.nationalityClass} not eligible for GPSSA (UAE/GCC nationals only)`
      );
    }
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).gpssaEmployeeRegistration.upsert({
        where: {
          aura_gpssa_employee_registration_unique: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
          },
        },
        update: {
          establishmentId: input.establishmentId,
          nationalityClass: input.nationalityClass,
          gpssaPersonalNumber: input.gpssaPersonalNumber,
          emiratesId: input.emiratesId,
          status: 'ACTIVE',
          deregistrationDate: null,
          deregistrationReason: null,
          updatedBy: auth.userId,
        },
        create: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          establishmentId: input.establishmentId,
          nationalityClass: input.nationalityClass,
          gpssaPersonalNumber: input.gpssaPersonalNumber,
          emiratesId: input.emiratesId,
          registrationDate: input.registrationDate ?? new Date(),
          status: 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      await (tx as any).gpssaEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          eventType: 'REGISTRATION',
          payload: { nationalityClass: input.nationalityClass },
        },
      });
      return row;
    });
  }

  async deregister(employeeId: string, input: { reason: string; date?: Date }, auth: AuthContext) {
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).gpssaEmployeeRegistration.update({
        where: {
          aura_gpssa_employee_registration_unique: {
            tenantId: auth.tenantId,
            employeeId,
          },
        },
        data: {
          status: 'DEREGISTERED',
          deregistrationDate: input.date ?? new Date(),
          deregistrationReason: input.reason,
          updatedBy: auth.userId,
        },
      });
      await (tx as any).gpssaEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId,
          eventType: 'DEREGISTRATION',
          payload: { reason: input.reason },
        },
      });
      return row;
    });
  }

  async transfer(
    input: {
      employeeId: string;
      fromEstablishmentId?: string;
      toEstablishmentId: string;
      transferDate: Date;
      serviceMonthsPreserved: number;
    },
    auth: AuthContext
  ) {
    return prisma.$transaction(async (tx) => {
      const transfer = await (tx as any).gpssaTransfer.create({
        data: { tenantId: auth.tenantId, status: 'PROCESSED', ...input },
      });
      await (tx as any).gpssaEmployeeRegistration.update({
        where: {
          aura_gpssa_employee_registration_unique: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
          },
        },
        data: { establishmentId: input.toEstablishmentId, updatedBy: auth.userId },
      });
      await (tx as any).gpssaEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          eventType: 'TRANSFER',
          payload: {
            from: input.fromEstablishmentId,
            to: input.toEstablishmentId,
            serviceMonths: input.serviceMonthsPreserved,
          },
        },
      });
      return transfer;
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).gpssaEmployeeRegistration.findMany({
        where,
        orderBy: { registrationDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).gpssaEmployeeRegistration.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async getActive(tenantId: string, employeeId: string) {
    return (prisma as any).gpssaEmployeeRegistration.findUnique({
      where: { aura_gpssa_employee_registration_unique: { tenantId, employeeId } },
    });
  }

  /**
   * EPIC-14-S11: Emiratisation evidence — count active UAE_NATIONAL GPSSA
   * registrations as proof for nationalization KPI.
   */
  async emiratisationEvidenceCount(tenantId: string) {
    return (prisma as any).gpssaEmployeeRegistration.count({
      where: { tenantId, status: 'ACTIVE', nationalityClass: 'UAE_NATIONAL' },
    });
  }
}

export const gpssaRegistrationService = new GpssaRegistrationService();
