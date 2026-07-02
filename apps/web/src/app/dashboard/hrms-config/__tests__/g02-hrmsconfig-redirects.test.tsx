// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';

// next/navigation's redirect() throws internally in the Next runtime; here we
// capture the target path so each canonicalizing stub page can be asserted
// deterministically. Pages are imported via the `@/` alias so they resolve to
// the same module graph the mock is hoisted against.
const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

import ApprovalWorkflowTemplates from '@/app/dashboard/hrms-config/approval-workflow-templates/page';
import AuditTrailCapturePolicy from '@/app/dashboard/hrms-config/audit-trail-capture-policy-per-domain/page';
import ConfigObjectsRegistry from '@/app/dashboard/hrms-config/config-objects-registry-maker-checker-21-domains/page';
import DataMigrationPlans from '@/app/dashboard/hrms-config/data-migration-plans-run-validation/page';
import IntegrationConnectors from '@/app/dashboard/hrms-config/integration-connectors-health-secret-rotation/page';
import MonthlyGoLiveCertificate from '@/app/dashboard/hrms-config/monthly-go-live-certificate-with-gating/page';
import NotificationRulesMultiChannel from '@/app/dashboard/hrms-config/notification-rules-multi-channel-bilingual/page';
import VersionedCountryRuleSets from '@/app/dashboard/hrms-config/versioned-country-rule-sets/page';

const cases: Array<[string, () => unknown, string]> = [
  [
    'AURA-426 approval-workflow-templates',
    ApprovalWorkflowTemplates,
    '/dashboard/hrms-config/approval-templates',
  ],
  [
    'AURA-428 audit-trail-capture-policy-per-domain',
    AuditTrailCapturePolicy,
    '/dashboard/hrms-config/audit-settings',
  ],
  [
    'AURA-430 config-objects-registry-maker-checker-21-domains',
    ConfigObjectsRegistry,
    '/dashboard/hrms-config/config-objects',
  ],
  [
    'AURA-431 data-migration-plans-run-validation',
    DataMigrationPlans,
    '/dashboard/hrms-config/migrations',
  ],
  [
    'AURA-432 integration-connectors-health-secret-rotation',
    IntegrationConnectors,
    '/dashboard/hrms-config/connectors',
  ],
  [
    'AURA-433 monthly-go-live-certificate-with-gating',
    MonthlyGoLiveCertificate,
    '/dashboard/hrms-config/certificate',
  ],
  [
    'AURA-435 notification-rules-multi-channel-bilingual',
    NotificationRulesMultiChannel,
    '/dashboard/hrms-config/notification-rules',
  ],
  [
    'AURA-437 versioned-country-rule-sets',
    VersionedCountryRuleSets,
    '/dashboard/hrms-config/rule-sets',
  ],
];

describe('g02 hrms-config canonicalizing redirect pages', () => {
  for (const [label, Page, target] of cases) {
    it(`${label} redirects to canonical route`, () => {
      redirectMock.mockClear();
      expect(() => (Page as () => unknown)()).toThrow(`REDIRECT:${target}`);
      expect(redirectMock).toHaveBeenCalledWith(target);
    });
  }
});
