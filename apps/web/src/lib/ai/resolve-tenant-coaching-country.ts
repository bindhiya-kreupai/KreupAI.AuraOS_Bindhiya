import { prisma } from '@aura/database';
import {
  getCoachingCountryProfile,
  type CoachingCountryProfile,
} from './hr-coaching-country-profile';

export type ResolvedCoachingJurisdiction = CoachingCountryProfile & {
  enabledCountries: string[];
  source: 'override' | 'tenant' | 'env' | 'default';
};

function envDefaultCountry(): string {
  return (process.env.HR_COACHING_DEFAULT_COUNTRY || 'AE').trim().toUpperCase();
}

/**
 * Resolve coaching jurisdiction for a tenant.
 * Uses enabled GCC tenant countries when available; falls back to HR_COACHING_DEFAULT_COUNTRY (AE).
 */
export async function resolveTenantCoachingCountry(
  tenantId?: string,
  overrideCode?: string
): Promise<ResolvedCoachingJurisdiction> {
  if (overrideCode) {
    const profile = getCoachingCountryProfile(overrideCode);
    return { ...profile, enabledCountries: [profile.countryCode], source: 'override' };
  }

  if (tenantId) {
    try {
      const rows = await prisma.gccTenantCountry.findMany({
        where: { tenantId, isEnabled: true, isDeleted: false },
        orderBy: { enabledAt: 'asc' },
        select: { countryCode: true },
      });
      const enabledCountries = rows.map((r) => r.countryCode.toUpperCase());
      if (enabledCountries.length === 1) {
        const profile = getCoachingCountryProfile(enabledCountries[0]);
        return { ...profile, enabledCountries, source: 'tenant' };
      }
      if (enabledCountries.length > 1) {
        const primary = enabledCountries[0];
        const profile = getCoachingCountryProfile(primary);
        return { ...profile, enabledCountries, source: 'tenant' };
      }
    } catch {
      /* ignore — fall through to env default */
    }
  }

  const fromEnv = envDefaultCountry();
  const profile = getCoachingCountryProfile(fromEnv);
  return {
    ...profile,
    enabledCountries: tenantId ? [] : [fromEnv],
    source: tenantId ? 'default' : 'env',
  };
}

export function jurisdictionRulesSuffix(jurisdiction: ResolvedCoachingJurisdiction): string {
  if (jurisdiction.enabledCountries.length <= 1) return '';
  return `\nTenant also operates in: ${jurisdiction.enabledCountries.join(', ')}. If the question involves labour law, leave, termination, or compliance, confirm the employee's country of employment before giving final advice.`;
}
