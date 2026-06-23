import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { WPS_SCHEME_SEEDS } from './scheme-seeds';

/**
 * EPIC-11-S01: WPS schemes + establishments.
 *
 * Validates establishment IDs against the country pattern (best-effort
 * regex per country; expand as authority guidance evolves).
 */
const EMPLOYER_ID_PATTERNS: Record<string, RegExp> = {
  AE: /^\d{3,15}$/, // MOHRE establishment ID (typically numeric)
  SA: /^\d{6,12}$/, // Qiwa / GOSI establishment ID
  QA: /^\d{6,12}$/,
  BH: /^[A-Z0-9-]{5,20}$/, // LMRA CR
  OM: /^\d{6,12}$/,
  KW: /^\d{6,12}$/,
};

export interface CreateEstablishmentInput {
  countryCode: string;
  legalEntityId?: string;
  employerId: string;
  establishmentName: string;
  agentBankCode?: string;
  agentBankName?: string;
}

export function validateEmployerId(countryCode: string, employerId: string) {
  const cc = countryCode.toUpperCase();
  const pat = EMPLOYER_ID_PATTERNS[cc];
  if (!pat) return { valid: false, reason: `no pattern for country ${cc}` };
  return pat.test(employerId)
    ? { valid: true }
    : { valid: false, reason: `does not match ${cc} pattern` };
}

export class WpsSchemeService {
  async seedSchemes() {
    const created: string[] = [];
    for (const s of WPS_SCHEME_SEEDS) {
      const existing = await (prisma as any).wpsScheme.findUnique({
        where: { countryCode: s.countryCode },
      });
      if (existing) continue;
      await (prisma as any).wpsScheme.create({ data: s });
      created.push(s.countryCode);
    }
    return { created };
  }

  async listSchemes() {
    return (prisma as any).wpsScheme.findMany({ orderBy: { countryCode: 'asc' } });
  }

  async getScheme(countryCode: string) {
    return (prisma as any).wpsScheme.findUnique({
      where: { countryCode: countryCode.toUpperCase() },
    });
  }

  async createEstablishment(input: CreateEstablishmentInput, auth: AuthContext) {
    const cc = input.countryCode.toUpperCase();
    const check = validateEmployerId(cc, input.employerId);
    if (!check.valid) throw new Error(`employerId invalid: ${check.reason}`);
    return (prisma as any).wpsEstablishment.create({
      data: {
        tenantId: auth.tenantId,
        countryCode: cc,
        legalEntityId: input.legalEntityId,
        employerId: input.employerId,
        establishmentName: input.establishmentName,
        agentBankCode: input.agentBankCode,
        agentBankName: input.agentBankName,
        isActive: true,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async listEstablishments(tenantId: string, filter: { countryCode?: string } = {}) {
    return (prisma as any).wpsEstablishment.findMany({
      where: {
        tenantId,
        ...(filter.countryCode ? { countryCode: filter.countryCode.toUpperCase() } : {}),
      },
      orderBy: { establishmentName: 'asc' },
    });
  }
}

export const wpsSchemeService = new WpsSchemeService();
