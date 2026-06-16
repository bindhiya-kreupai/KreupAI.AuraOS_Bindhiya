/**
 * EPIC-14 seed rates per UAE GPSSA framework.
 *
 * UAE GPSSA covers UAE nationals + GCC nationals (cross-border insured
 * scheme). Expatriates are out of GPSSA scope — they don't contribute.
 *
 * Default rate split: employer 12.5% + employee 5% + government 2.5%
 * (typical UAE GPSSA scheme; configurable via effective-dated rates).
 */
import type { NationalityClass } from './types';

export interface GpssaRateSeed {
  nationalityClass: NationalityClass;
  employerPct: number;
  employeePct: number;
  governmentPct: number;
  wageFloor?: number;
  wageCeiling?: number;
  citation?: string;
}

export const GPSSA_RATE_SEEDS: GpssaRateSeed[] = [
  {
    nationalityClass: 'UAE_NATIONAL',
    employerPct: 12.5,
    employeePct: 5,
    governmentPct: 2.5,
    wageFloor: 1000,
    wageCeiling: 50000,
    citation: 'UAE Federal Pensions Law 7/1999 (as amended)',
  },
  {
    nationalityClass: 'GCC_NATIONAL_OTHER',
    employerPct: 12.5,
    employeePct: 5,
    governmentPct: 0,
    wageFloor: 1000,
    wageCeiling: 50000,
    citation: 'GCC Unified Extension of Social Insurance Protection',
  },
];

export const APPLICABLE_CLASSES: NationalityClass[] = ['UAE_NATIONAL', 'GCC_NATIONAL_OTHER'];
