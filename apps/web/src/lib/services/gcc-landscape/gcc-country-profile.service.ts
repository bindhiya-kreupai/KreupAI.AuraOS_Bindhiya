import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  GCC_COUNTRY_CODES,
  GCC_COUNTRY_DEFAULTS,
  type GccCountryCode,
  isGccCountry,
} from './country-defaults';

/**
 * EPIC-01-S02: GCC labour-market reference dataset.
 * - Versioned country profiles (weekend pattern, authorities, programme).
 * - Seeds all six GCC profiles on first call.
 * - Editing a profile creates a new version; previous version is retained with effectiveTo set.
 */
export class GccCountryProfileService {
  async seedDefaults(auth: AuthContext) {
    const created: string[] = [];
    for (const code of GCC_COUNTRY_CODES) {
      const defaults = GCC_COUNTRY_DEFAULTS[code as GccCountryCode];
      const existing = await (prisma as any).gccCountryProfile.findFirst({
        where: { countryCode: code, status: 'ACTIVE' },
      });
      if (existing) continue;
      await (prisma as any).gccCountryProfile.create({
        data: {
          countryCode: code,
          weekendPattern: defaults.weekendPattern,
          statutoryCurrency: defaults.defaultCurrency,
          labourAuthority: defaults.labourAuthority,
          socialInsuranceAuthority: defaults.socialInsuranceAuthority,
          nationalizationProgramme: defaults.nationalizationProgramme,
          expatProfile: defaults.expatProfile,
          marketNotes: defaults.marketNotes,
          authoritiesJson: defaults.authorities,
          version: 1,
          effectiveFrom: new Date(),
          status: 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      created.push(code);
    }
    return { created };
  }

  async getActive(countryCode: string) {
    const code = countryCode.trim().toUpperCase();
    if (!isGccCountry(code)) {
      throw new Error(`countryCode ${code} is not a supported GCC country`);
    }
    return (prisma as any).gccCountryProfile.findFirst({
      where: { countryCode: code, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
    });
  }

  async list() {
    return (prisma as any).gccCountryProfile.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ countryCode: 'asc' }, { version: 'desc' }],
    });
  }

  async listVersions(countryCode: string) {
    const code = countryCode.trim().toUpperCase();
    if (!isGccCountry(code)) {
      throw new Error(`countryCode ${code} is not a supported GCC country`);
    }
    return (prisma as any).gccCountryProfile.findMany({
      where: { countryCode: code },
      orderBy: { version: 'desc' },
    });
  }

  async createVersion(
    countryCode: string,
    patch: Partial<{
      weekendPattern: string;
      statutoryCurrency: string;
      labourAuthority: string;
      socialInsuranceAuthority: string;
      nationalizationProgramme: string;
      expatProfile: string;
      marketNotes: string;
      authoritiesJson: Record<string, unknown>;
    }>,
    auth: AuthContext
  ) {
    const code = countryCode.trim().toUpperCase();
    if (!isGccCountry(code)) {
      throw new Error(`countryCode ${code} is not a supported GCC country`);
    }
    const current = await this.getActive(code);
    if (!current) {
      throw new Error(`No active profile for ${code}; seed defaults first`);
    }
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await (tx as any).gccCountryProfile.update({
        where: { id: current.id },
        data: { status: 'RETIRED', effectiveTo: now },
      });
      return (tx as any).gccCountryProfile.create({
        data: {
          countryCode: code,
          weekendPattern: patch.weekendPattern ?? current.weekendPattern,
          statutoryCurrency: patch.statutoryCurrency ?? current.statutoryCurrency,
          labourAuthority: patch.labourAuthority ?? current.labourAuthority,
          socialInsuranceAuthority:
            patch.socialInsuranceAuthority ?? current.socialInsuranceAuthority,
          nationalizationProgramme:
            patch.nationalizationProgramme ?? current.nationalizationProgramme,
          expatProfile: patch.expatProfile ?? current.expatProfile,
          marketNotes: patch.marketNotes ?? current.marketNotes,
          authoritiesJson: patch.authoritiesJson ?? current.authoritiesJson,
          version: current.version + 1,
          effectiveFrom: now,
          status: 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
    });
  }
}

export const gccCountryProfileService = new GccCountryProfileService();
