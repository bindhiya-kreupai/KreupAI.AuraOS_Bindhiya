import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { GCC_COUNTRY_DEFAULTS, type GccCountryCode, isGccCountry } from './country-defaults';

export interface EnableCountryInput {
  countryCode: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
}

export interface CreateLegalEntityInput {
  countryCode: string;
  legalName: string;
  registrationRef: string;
  registrationType?: string;
  companyId?: string | null;
  currency?: string;
  timezone?: string;
}

/**
 * EPIC-01-S01: GCC tenancy / multi-country / multi-entity service.
 * - Restricts country list to the six GCC states.
 * - Defaults currency + timezone per country.
 * - Blocks legal-entity creation against a country that is not enabled for the tenant.
 */
export class GccTenancyService {
  async listCountries(tenantId: string) {
    return (prisma as any).gccTenantCountry.findMany({
      where: { tenantId },
      orderBy: { countryCode: 'asc' },
    });
  }

  async enableCountry(input: EnableCountryInput, auth: AuthContext) {
    const code = input.countryCode.trim().toUpperCase();
    if (!isGccCountry(code)) {
      throw new Error(`countryCode ${code} is not a supported GCC country`);
    }
    const defaults = GCC_COUNTRY_DEFAULTS[code as GccCountryCode];
    return (prisma as any).gccTenantCountry.upsert({
      where: { tenantId_countryCode: { tenantId: auth.tenantId, countryCode: code } },
      update: {
        isEnabled: true,
        defaultCurrency: input.defaultCurrency ?? defaults.defaultCurrency,
        defaultTimezone: input.defaultTimezone ?? defaults.defaultTimezone,
        disabledAt: null,
        disabledBy: null,
      },
      create: {
        tenantId: auth.tenantId,
        countryCode: code,
        isEnabled: true,
        defaultCurrency: input.defaultCurrency ?? defaults.defaultCurrency,
        defaultTimezone: input.defaultTimezone ?? defaults.defaultTimezone,
        enabledBy: auth.userId,
      },
    });
  }

  async disableCountry(countryCode: string, auth: AuthContext) {
    const code = countryCode.trim().toUpperCase();
    return (prisma as any).gccTenantCountry.update({
      where: { tenantId_countryCode: { tenantId: auth.tenantId, countryCode: code } },
      data: {
        isEnabled: false,
        disabledAt: new Date(),
        disabledBy: auth.userId,
      },
    });
  }

  async assertCountryEnabled(tenantId: string, countryCode: string) {
    const code = countryCode.trim().toUpperCase();
    const row = await (prisma as any).gccTenantCountry.findUnique({
      where: { tenantId_countryCode: { tenantId, countryCode: code } },
    });
    if (!row || !row.isEnabled) {
      throw new Error(`Country ${code} is not enabled for this tenant`);
    }
    return row;
  }

  async listLegalEntities(tenantId: string, filter: { countryCode?: string } = {}) {
    return (prisma as any).gccLegalEntity.findMany({
      where: {
        tenantId,
        ...(filter.countryCode ? { countryCode: filter.countryCode.toUpperCase() } : {}),
      },
      orderBy: [{ countryCode: 'asc' }, { legalName: 'asc' }],
    });
  }

  async createLegalEntity(input: CreateLegalEntityInput, auth: AuthContext) {
    const code = input.countryCode.trim().toUpperCase();
    if (!isGccCountry(code)) {
      throw new Error(`countryCode ${code} is not a supported GCC country`);
    }
    const tenantCountry = await this.assertCountryEnabled(auth.tenantId, code);
    const defaults = GCC_COUNTRY_DEFAULTS[code as GccCountryCode];
    if (!input.registrationRef.trim()) {
      throw new Error('registrationRef is required');
    }
    return (prisma as any).gccLegalEntity.create({
      data: {
        tenantId: auth.tenantId,
        tenantCountryId: tenantCountry.id,
        countryCode: code,
        legalName: input.legalName,
        registrationRef: input.registrationRef.trim(),
        registrationType: input.registrationType ?? defaults.registrationType,
        currency: input.currency ?? tenantCountry.defaultCurrency,
        timezone: input.timezone ?? tenantCountry.defaultTimezone,
        companyId: input.companyId ?? null,
        isActive: true,
        activatedAt: new Date(),
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async deactivateLegalEntity(entityId: string, auth: AuthContext) {
    return (prisma as any).gccLegalEntity.update({
      where: { id: entityId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        updatedBy: auth.userId,
      },
    });
  }
}

export const gccTenancyService = new GccTenancyService();
