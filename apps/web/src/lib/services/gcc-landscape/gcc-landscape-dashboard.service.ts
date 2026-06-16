import { prisma } from '@aura/database';
import { complianceRiskRegisterService } from './compliance-risk-register.service';
import { gccCountryProfileService } from './gcc-country-profile.service';
import { gccRbacService } from './gcc-rbac.service';
import { workforceKpiService } from './workforce-kpi.service';

export interface DashboardScopeFilter {
  countryCode?: string;
  legalEntityId?: string;
}

/**
 * EPIC-01-S08: Executive landscape dashboard aggregator.
 *
 * Composes S02 (country context) + S07 (workforce KPI baseline) +
 * S06 (risk register) into a single view, scoped by the caller's RBAC scope.
 */
export class GccLandscapeDashboardService {
  async load(tenantId: string, userId: string, filter: DashboardScopeFilter = {}) {
    const scope = await gccRbacService.resolveUserCountryScope(userId, tenantId);
    const enabledCountries = await this.enabledCountries(tenantId);

    type CountryRow = {
      countryCode: string;
      isEnabled: boolean;
      defaultCurrency: string;
      defaultTimezone: string;
    };
    const allowed = scope.countries;
    const visibleCountries = (
      allowed === 'ALL'
        ? (enabledCountries as CountryRow[])
        : (enabledCountries as CountryRow[]).filter((c) =>
            (allowed as string[]).includes(c.countryCode)
          )
    ).filter(
      (c: CountryRow) => !filter.countryCode || c.countryCode === filter.countryCode.toUpperCase()
    );

    const kpis = await workforceKpiService.latestKpis(tenantId, filter.countryCode?.toUpperCase());
    const latestPerCountry = new Map<string, Record<string, unknown>>();
    for (const k of kpis as Array<Record<string, unknown>>) {
      const cc = String(k.countryCode ?? '');
      if (!cc) continue;
      if (!latestPerCountry.has(cc)) latestPerCountry.set(cc, k);
    }

    const profiles = await gccCountryProfileService.list();
    const profileByCountry = new Map(
      (profiles as Array<Record<string, unknown>>).map((p) => [String(p.countryCode), p])
    );

    const topRisks = await complianceRiskRegisterService.list(tenantId, {
      ...(filter.countryCode ? { countryCode: filter.countryCode } : {}),
    });
    const ranked = topRisks.filter((r: { status: string }) => r.status !== 'RESOLVED').slice(0, 5);

    return {
      scope: scope.countries,
      countries: visibleCountries.map((c: CountryRow) => {
        const kpi = latestPerCountry.get(c.countryCode);
        const profile = profileByCountry.get(c.countryCode);
        return {
          countryCode: c.countryCode,
          isEnabled: c.isEnabled,
          defaultCurrency: c.defaultCurrency,
          defaultTimezone: c.defaultTimezone,
          profile: profile
            ? {
                labourAuthority: profile.labourAuthority,
                socialInsuranceAuthority: profile.socialInsuranceAuthority,
                nationalizationProgramme: profile.nationalizationProgramme,
                weekendPattern: profile.weekendPattern,
              }
            : null,
          kpi: kpi
            ? {
                totalHeadcount: Number(kpi.totalHeadcount ?? 0),
                nationalPct: Number(kpi.nationalPct ?? 0),
                targetPct: kpi.targetPct == null ? null : Number(kpi.targetPct),
                ragStatus: kpi.ragStatus ?? null,
                snapshotDate: kpi.snapshotDate ?? null,
              }
            : null,
        };
      }),
      topRisks: ranked,
    };
  }

  private async enabledCountries(tenantId: string) {
    return (prisma as any).gccTenantCountry.findMany({
      where: { tenantId, isEnabled: true },
      orderBy: { countryCode: 'asc' },
    });
  }
}

export const gccLandscapeDashboardService = new GccLandscapeDashboardService();
