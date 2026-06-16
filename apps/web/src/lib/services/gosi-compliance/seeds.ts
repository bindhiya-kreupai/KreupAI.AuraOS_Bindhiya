/**
 * EPIC-13-S01 / S04 / S08 seed data: branch applicability + default rates.
 *
 * Annuities (pension) branch covers Saudi nationals (employer ~9% +
 * employee ~9.75%). Occupational Hazards branch covers all workers
 * (employer ~2%; no employee contribution).
 */

import type { GosiBranch, NationalityClass } from './types';

export const BRANCH_APPLICABILITY: Record<GosiBranch, NationalityClass[]> = {
  ANNUITIES: ['SAUDI'],
  OCCUPATIONAL_HAZARDS: ['SAUDI', 'GCC_NATIONAL_OTHER', 'EXPAT'],
};

export interface RateSeed {
  branch: GosiBranch;
  nationalityClass: NationalityClass;
  employerPct: number;
  employeePct: number;
  wageFloor?: number;
  wageCeiling?: number;
  citation?: string;
}

export const RATE_SEEDS: RateSeed[] = [
  {
    branch: 'ANNUITIES',
    nationalityClass: 'SAUDI',
    employerPct: 9,
    employeePct: 9.75,
    wageFloor: 1500,
    wageCeiling: 45000,
    citation: 'KSA Social Insurance Law Article 18 (Annuities branch)',
  },
  {
    branch: 'OCCUPATIONAL_HAZARDS',
    nationalityClass: 'SAUDI',
    employerPct: 2,
    employeePct: 0,
    wageFloor: 1500,
    wageCeiling: 45000,
    citation: 'KSA Social Insurance Law Article 18 (OH branch)',
  },
  {
    branch: 'OCCUPATIONAL_HAZARDS',
    nationalityClass: 'EXPAT',
    employerPct: 2,
    employeePct: 0,
    citation: 'KSA Social Insurance Law — OH for expatriate workers',
  },
  {
    branch: 'OCCUPATIONAL_HAZARDS',
    nationalityClass: 'GCC_NATIONAL_OTHER',
    employerPct: 2,
    employeePct: 0,
  },
];
