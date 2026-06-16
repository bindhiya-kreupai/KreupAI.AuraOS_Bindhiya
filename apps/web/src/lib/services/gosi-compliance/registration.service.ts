import { prisma } from '@aura/database';
import type { AuthContext, NationalityClass } from './types';

export interface RegistrationInput {
  employeeId: string;
  establishmentId: string;
  nationalityClass: NationalityClass;
  gosiPersonalNumber?: string;
  registrationDate?: Date;
}

/**
 * EPIC-13-S05 / S06: employee registration register + deregistration on exit.
 */
export class GosiRegistrationService {
  async register(input: RegistrationInput, auth: AuthContext) {
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).gosiEmployeeRegistration.upsert({
        where: {
          aura_gosi_employee_registration_unique: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
          },
        },
        update: {
          establishmentId: input.establishmentId,
          nationalityClass: input.nationalityClass,
          gosiPersonalNumber: input.gosiPersonalNumber,
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
          gosiPersonalNumber: input.gosiPersonalNumber,
          registrationDate: input.registrationDate ?? new Date(),
          status: 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      await (tx as any).gosiEvent.create({
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
      const row = await (tx as any).gosiEmployeeRegistration.update({
        where: {
          aura_gosi_employee_registration_unique: {
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
      await (tx as any).gosiEvent.create({
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

  async list(tenantId: string, filter: { status?: string; nationalityClass?: string } = {}) {
    return (prisma as any).gosiEmployeeRegistration.findMany({
      where: { tenantId, ...filter },
      orderBy: { registrationDate: 'desc' },
      take: 500,
    });
  }

  async getActive(tenantId: string, employeeId: string) {
    return (prisma as any).gosiEmployeeRegistration.findUnique({
      where: {
        aura_gosi_employee_registration_unique: { tenantId, employeeId },
      },
    });
  }
}

export const gosiRegistrationService = new GosiRegistrationService();
