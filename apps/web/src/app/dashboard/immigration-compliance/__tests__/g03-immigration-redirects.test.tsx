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

import CountryAuthMatrix from '../country-authorization-matrix-mohre-icp-gdrfa-mhrsd-qiwa-lmra-pam/page';
import AuditChecklistRisk from '../immigration-audit-checklist-risk-register/page';
import MonthlyCompCert from '../monthly-compliance-certificate/page';
import RenewalLadder from '../renewal-alert-ladder-60-30-7-day-expired/page';
import TransferMobility from '../transfer-mobility-cases-requested-approved-completed/page';
import WpsMonthlyCert from '../../wps-compliance/monthly-certificate/page';
import WpsSubmissions from '../../wps-compliance/wps-submissions/page';
import GosiEmpReg from '../../gosi-compliance/employee-registrations/page';
import GosiMonthlyCert from '../../gosi-compliance/monthly-certificate/page';
import GosiWages from '../../gosi-compliance/wages-contributions/page';

const cases: Array<[string, () => unknown, string]> = [
  [
    'AURA-450 country-authorization-matrix',
    CountryAuthMatrix,
    '/dashboard/immigration-compliance/authorization-matrix',
  ],
  [
    'AURA-451 audit-checklist-risk-register',
    AuditChecklistRisk,
    '/dashboard/immigration-compliance/audit-checklist',
  ],
  [
    'AURA-452 monthly-compliance-certificate',
    MonthlyCompCert,
    '/dashboard/immigration-compliance/certificate',
  ],
  [
    'AURA-453 renewal-alert-ladder',
    RenewalLadder,
    '/dashboard/immigration-compliance/renewal-alerts',
  ],
  [
    'AURA-457 transfer-mobility-cases',
    TransferMobility,
    '/dashboard/immigration-compliance/transfer-case',
  ],
  ['AURA-544 wps monthly-certificate', WpsMonthlyCert, '/dashboard/wps-compliance/certificate'],
  ['AURA-545 wps-submissions', WpsSubmissions, '/dashboard/wps-compliance/submissions'],
  ['AURA-405 gosi employee-registrations', GosiEmpReg, '/dashboard/gosi-compliance/registrations'],
  ['AURA-406 gosi monthly-certificate', GosiMonthlyCert, '/dashboard/gosi-compliance/certificate'],
  ['AURA-407 gosi wages-contributions', GosiWages, '/dashboard/gosi-compliance/contributions'],
];

describe('g03 immigration/wps/gosi canonicalizing redirect pages', () => {
  beforeEach(() => redirectMock.mockClear());

  for (const [label, Page, target] of cases) {
    it(`${label} redirects to canonical route`, () => {
      (Page as () => unknown)();
      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).toHaveBeenCalledWith(target);
    });
  }
});
