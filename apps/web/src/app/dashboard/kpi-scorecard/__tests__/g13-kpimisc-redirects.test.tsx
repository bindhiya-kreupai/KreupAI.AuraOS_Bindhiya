// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from 'vitest';

// next/navigation's redirect() throws internally in the Next runtime; here we mock it
// as a plain spy so each canonicalizing stub page's target can be asserted deterministically.
const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

import ExecutiveScorecard from '../executive-scorecard/page';
import KpiCatalogue from '../kpi-catalogue/page';
import MonthlyKpiCertificate from '../monthly-kpi-certificate/page';
import ThresholdLibrary from '../threshold-library/page';
import CompOffLedger from '../../holidays-compliance/comp-off-ledger-6-month-expiry/page';
import CountryHolidayPayRules from '../../holidays-compliance/country-holiday-class-pay-rules-base-ot/page';
import HolidayWorkApproval from '../../holidays-compliance/holiday-work-approval-auto-comp-off-accrual/page';
import HolidaysMonthlyCert from '../../holidays-compliance/monthly-compliance-certificate/page';
import GrievanceRegister from '../../er-compliance/grievance-register-multi-channel-sla/page';
import InvestigationRegister from '../../er-compliance/investigation-register/page';
import ErMonthlyCert from '../../er-compliance/monthly-compliance-certificate/page';
import GpssaMonthlyCert from '../../gpssa-compliance/monthly-certificate/page';
import GpssaWages from '../../gpssa-compliance/wages-contributions/page';
import SioMonthlyCert from '../../sio-compliance/monthly-certificate/page';
import SioWages from '../../sio-compliance/wages-contributions/page';

const cases: Array<[string, () => unknown, string]> = [
  ['AURA-458 executive-scorecard', ExecutiveScorecard, '/dashboard/kpi-scorecard/scorecard'],
  ['AURA-459 kpi-catalogue', KpiCatalogue, '/dashboard/kpi-scorecard/catalog'],
  [
    'AURA-460 monthly-kpi-certificate',
    MonthlyKpiCertificate,
    '/dashboard/kpi-scorecard/certificate',
  ],
  ['AURA-461 threshold-library', ThresholdLibrary, '/dashboard/kpi-scorecard/thresholds'],
  ['AURA-410 comp-off-ledger', CompOffLedger, '/dashboard/holidays-compliance/comp-off'],
  [
    'AURA-411 country-holiday-class-pay-rules',
    CountryHolidayPayRules,
    '/dashboard/holidays-compliance/pay-rules',
  ],
  [
    'AURA-412 holiday-work-approval',
    HolidayWorkApproval,
    '/dashboard/holidays-compliance/work-approvals',
  ],
  [
    'AURA-413 holidays monthly-compliance-certificate',
    HolidaysMonthlyCert,
    '/dashboard/holidays-compliance/certificate',
  ],
  ['AURA-382 grievance-register', GrievanceRegister, '/dashboard/er-compliance/grievances'],
  [
    'AURA-383 investigation-register',
    InvestigationRegister,
    '/dashboard/er-compliance/investigations',
  ],
  [
    'AURA-384 er monthly-compliance-certificate',
    ErMonthlyCert,
    '/dashboard/er-compliance/certificate',
  ],
  [
    'AURA-408 gpssa monthly-certificate',
    GpssaMonthlyCert,
    '/dashboard/gpssa-compliance/certificate',
  ],
  ['AURA-409 gpssa wages-contributions', GpssaWages, '/dashboard/gpssa-compliance/contributions'],
  ['AURA-520 sio monthly-certificate', SioMonthlyCert, '/dashboard/sio-compliance/certificate'],
  ['AURA-521 sio wages-contributions', SioWages, '/dashboard/sio-compliance/contributions'],
];

describe('g13 kpi/holidays/er/gpssa/sio canonicalizing redirect pages', () => {
  beforeEach(() => redirectMock.mockClear());

  for (const [label, Page, target] of cases) {
    it(`${label} redirects to canonical route`, () => {
      (Page as () => unknown)();
      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).toHaveBeenCalledWith(target);
    });
  }
});
