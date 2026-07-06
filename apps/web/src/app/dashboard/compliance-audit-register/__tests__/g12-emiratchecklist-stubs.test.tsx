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

// --- Redirect stubs (compliance-audit-register: hub is the feature) ---
import ChecklistItems from '../checklist-items-er-disciplinary-separation-eosb-visa-exit/page';
import MandatoryEnforcement from '../mandatory-item-completion-enforcement/page';
import PerDomainSeeds from '../per-domain-default-seeds/page';
import RiskRegisterBand from '../risk-register-with-l-i-band-auto-derivation/page';

// --- Re-export stubs (menu slug -> existing feature page) ---
import AnnualTargets from '../../emiratisation-compliance/annual-targets/page';
import EmiratTargets from '../../emiratisation-compliance/targets/page';
import CheckpointSnapshots from '../../emiratisation-compliance/checkpoint-snapshots/page';
import EmiratSnapshots from '../../emiratisation-compliance/snapshots/page';
import EstablishmentScope from '../../emiratisation-compliance/establishment-scope/page';
import EmiratConfig from '../../emiratisation-compliance/config/page';
import EmiratMonthlyCert from '../../emiratisation-compliance/monthly-certificate/page';
import EmiratCertificate from '../../emiratisation-compliance/certificate/page';

import ChecklistTemplates from '../../checklist-engine/checklist-templates/page';
import CeTemplates from '../../checklist-engine/templates/page';
import ComplianceCertificates from '../../checklist-engine/compliance-certificates/page';
import CeCertificate from '../../checklist-engine/certificate/page';
import ExceptionRegister from '../../checklist-engine/exception-register/page';
import CeExceptions from '../../checklist-engine/exceptions/page';
import RunWorkspace from '../../checklist-engine/run-workspace/page';
import CeRuns from '../../checklist-engine/runs/page';

import AnnualAuditPlan from '../../compliance-calendar/annual-audit-plan/page';
import CalAudit from '../../compliance-calendar/audit/page';
import MonthlyCalendarCert from '../../compliance-calendar/monthly-calendar-certificate/page';
import CalCertificate from '../../compliance-calendar/certificate/page';
import RecurrenceRules from '../../compliance-calendar/recurrence-rules/page';
import CalRules from '../../compliance-calendar/rules/page';
import TaskRegister from '../../compliance-calendar/task-register/page';
import CalTasks from '../../compliance-calendar/tasks/page';

const redirectCases: Array<[string, () => unknown, string]> = [
  ['AURA-361 checklist-items', ChecklistItems, '/dashboard/compliance-audit-register'],
  ['AURA-362 mandatory-enforcement', MandatoryEnforcement, '/dashboard/compliance-audit-register'],
  ['AURA-363 per-domain-seeds', PerDomainSeeds, '/dashboard/compliance-audit-register'],
  ['AURA-364 risk-register-band', RiskRegisterBand, '/dashboard/compliance-audit-register'],
];

const reexportCases: Array<[string, unknown, unknown]> = [
  ['AURA-374 annual-targets', AnnualTargets, EmiratTargets],
  ['AURA-375 checkpoint-snapshots', CheckpointSnapshots, EmiratSnapshots],
  ['AURA-376 establishment-scope', EstablishmentScope, EmiratConfig],
  ['AURA-377 monthly-certificate', EmiratMonthlyCert, EmiratCertificate],
  ['AURA-357 checklist-templates', ChecklistTemplates, CeTemplates],
  ['AURA-358 compliance-certificates', ComplianceCertificates, CeCertificate],
  ['AURA-359 exception-register', ExceptionRegister, CeExceptions],
  ['AURA-360 run-workspace', RunWorkspace, CeRuns],
  ['AURA-365 annual-audit-plan', AnnualAuditPlan, CalAudit],
  ['AURA-366 monthly-calendar-certificate', MonthlyCalendarCert, CalCertificate],
  ['AURA-367 recurrence-rules', RecurrenceRules, CalRules],
  ['AURA-368 task-register', TaskRegister, CalTasks],
];

describe('g12 emirat/checklist canonicalizing redirect stubs', () => {
  beforeEach(() => redirectMock.mockClear());

  for (const [label, Page, target] of redirectCases) {
    it(`${label} redirects to canonical route`, () => {
      (Page as () => unknown)();
      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).toHaveBeenCalledWith(target);
    });
  }
});

describe('g12 emirat/checklist re-export stubs resolve to existing feature pages', () => {
  for (const [label, StubPage, TargetPage] of reexportCases) {
    it(`${label} re-exports the canonical feature page`, () => {
      expect(typeof StubPage).toBe('function');
      expect(StubPage).toBe(TargetPage);
    });
  }
});
