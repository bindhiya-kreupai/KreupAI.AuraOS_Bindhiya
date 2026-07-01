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

import HseIncidentRegister from '../incident-register-near-miss-fatality-gosi-notify/page';
import HseMonthlyCertLtifr from '../monthly-compliance-certificate-ltifr/page';
import HsePermitToWork from '../permit-to-work-hot-work-confined-space-wah/page';
import HseRiskAssessments from '../risk-assessments-l-s-residual-band/page';
import AttnConsentRegister from '../../attendance-compliance/biometric-geolocation-consent-register/page';
import AttnCountryGradePolicy from '../../attendance-compliance/country-grade-policy-tolerances-slas-ramadan/page';
import AttnFraudRegister from '../../attendance-compliance/fraud-register-buddy-punch-geo-mismatch-time-drift/page';
import AttnMonthlyCert from '../../attendance-compliance/monthly-compliance-certificate/page';
import OtBudgetControl from '../../overtime-compliance/budget-control/page';
import OtMonthlyCert from '../../overtime-compliance/monthly-certificate/page';
import OtPolicies from '../../overtime-compliance/ot-policies-country-grade/page';
import OtRateCards from '../../overtime-compliance/rate-cards-country-ot-type/page';
import LeaveEntitlement from '../../leave-compliance/country-leave-code-entitlement-annual-sick-maternity-hajj/page';
import LeaveMedicalVault from '../../leave-compliance/medical-evidence-vault-restricted-retention/page';
import LeaveMisuseRegister from '../../leave-compliance/misuse-register-monday-friday-pattern-medical-forgery/page';
import LeaveMonthlyCert from '../../leave-compliance/monthly-compliance-certificate/page';

const cases: Array<[string, () => unknown, string]> = [
  ['AURA-439 hse incident-register', HseIncidentRegister, '/dashboard/hse-compliance/incidents'],
  [
    'AURA-440 hse monthly-certificate-ltifr',
    HseMonthlyCertLtifr,
    '/dashboard/hse-compliance/certificate',
  ],
  ['AURA-441 hse permit-to-work', HsePermitToWork, '/dashboard/hse-compliance/permits'],
  [
    'AURA-442 hse risk-assessments',
    HseRiskAssessments,
    '/dashboard/hse-compliance/risk-assessments',
  ],
  [
    'AURA-342 attn consent-register',
    AttnConsentRegister,
    '/dashboard/attendance-compliance/consents',
  ],
  [
    'AURA-343 attn country-grade-policy',
    AttnCountryGradePolicy,
    '/dashboard/attendance-compliance/policies',
  ],
  [
    'AURA-344 attn fraud-register',
    AttnFraudRegister,
    '/dashboard/attendance-compliance/fraud-flags',
  ],
  [
    'AURA-345 attn monthly-certificate',
    AttnMonthlyCert,
    '/dashboard/attendance-compliance/certificate',
  ],
  ['AURA-483 ot budget-control', OtBudgetControl, '/dashboard/overtime-compliance/budgets'],
  ['AURA-484 ot monthly-certificate', OtMonthlyCert, '/dashboard/overtime-compliance/certificate'],
  ['AURA-485 ot policies', OtPolicies, '/dashboard/overtime-compliance/policies'],
  ['AURA-486 ot rate-cards', OtRateCards, '/dashboard/overtime-compliance/rate-cards'],
  ['AURA-462 leave entitlement', LeaveEntitlement, '/dashboard/leave-compliance/entitlements'],
  [
    'AURA-463 leave medical-evidence-vault',
    LeaveMedicalVault,
    '/dashboard/leave-compliance/medical-evidence',
  ],
  [
    'AURA-464 leave misuse-register',
    LeaveMisuseRegister,
    '/dashboard/leave-compliance/misuse-flags',
  ],
  [
    'AURA-465 leave monthly-certificate',
    LeaveMonthlyCert,
    '/dashboard/leave-compliance/certificate',
  ],
];

describe('g11 hse/attendance/overtime/leave canonicalizing redirect pages', () => {
  beforeEach(() => redirectMock.mockClear());

  for (const [label, Page, target] of cases) {
    it(`${label} redirects to canonical route`, () => {
      (Page as () => unknown)();
      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).toHaveBeenCalledWith(target);
    });
  }
});
