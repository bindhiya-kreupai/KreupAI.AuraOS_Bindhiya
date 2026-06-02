import { describe, it, expect } from 'vitest';
import { MarketplaceGovernanceService } from '../marketplace-governance.service';

const baseConnector: any = {
  connectorId: 'conn-1',
  currentStatus: 'ACTIVE',
  transitions: [],
  healthMetrics: { uptime30d: 99.9, errorRate30d: 0.5, avgResponseTimeMs: 1200 },
};

describe('MarketplaceGovernanceService.getGovernancePolicy', () => {
  const policy = MarketplaceGovernanceService.getGovernancePolicy();

  it('returns policy with version + sections', () => {
    expect(policy.version).toBe('1.0.0');
    expect(policy.status).toBe('PUBLISHED');
    expect(policy.sections.length).toBeGreaterThan(0);
  });

  it('every section has rules', () => {
    policy.sections.forEach((s) => {
      expect(s.rules.length).toBeGreaterThan(0);
      expect(s.titleAr).toBeTruthy();
    });
  });

  it('rules have severity + enforcement + ruleId', () => {
    const allRules = policy.sections.flatMap((s) => s.rules);
    allRules.forEach((r) => {
      expect(r.ruleId).toBeTruthy();
      expect(['MANDATORY', 'RECOMMENDED']).toContain(r.enforcement);
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(r.violationSeverity);
      expect(typeof r.automatedCheck).toBe('boolean');
    });
  });

  it('contains security, data, availability, lifecycle sections', () => {
    const ids = policy.sections.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['SEC-01', 'SEC-02', 'SEC-03', 'SEC-04']));
  });
});

describe('MarketplaceGovernanceService.generateOnboardingChecklist', () => {
  it('STANDARD: skips Premier-only items', () => {
    const r = MarketplaceGovernanceService.generateOnboardingChecklist('STANDARD' as any);
    const insurance = r.find((i) => i.id === 'OB-03');
    const pentest = r.find((i) => i.id === 'OB-11');
    const soc2 = r.find((i) => i.id === 'OB-12');
    expect(insurance!.required).toBe(false);
    expect(pentest!.required).toBe(false);
    expect(soc2!.required).toBe(false);
  });

  it('CERTIFIED: requires insurance + pentest, not SOC2', () => {
    const r = MarketplaceGovernanceService.generateOnboardingChecklist('CERTIFIED' as any);
    expect(r.find((i) => i.id === 'OB-03')!.required).toBe(true);
    expect(r.find((i) => i.id === 'OB-11')!.required).toBe(true);
    expect(r.find((i) => i.id === 'OB-12')!.required).toBe(false);
  });

  it('PREMIER: requires SOC2 + insurance + pentest + incident runbook', () => {
    const r = MarketplaceGovernanceService.generateOnboardingChecklist('PREMIER' as any);
    expect(r.find((i) => i.id === 'OB-12')!.required).toBe(true);
    expect(r.find((i) => i.id === 'OB-03')!.required).toBe(true);
    expect(r.find((i) => i.id === 'OB-20')!.required).toBe(true);
  });

  it('all items default to completed=false', () => {
    const r = MarketplaceGovernanceService.generateOnboardingChecklist('STANDARD' as any);
    r.forEach((i) => expect(i.completed).toBe(false));
  });

  it('contains all five categories', () => {
    const r = MarketplaceGovernanceService.generateOnboardingChecklist('STANDARD' as any);
    const cats = new Set(r.map((i) => i.category));
    expect(cats).toContain('LEGAL');
    expect(cats).toContain('TECHNICAL');
    expect(cats).toContain('SECURITY');
    expect(cats).toContain('BUSINESS');
    expect(cats).toContain('SUPPORT');
  });

  it('each item has Arabic translation', () => {
    const r = MarketplaceGovernanceService.generateOnboardingChecklist('STANDARD' as any);
    r.forEach((i) => expect(i.itemAr).toBeTruthy());
  });
});

describe('MarketplaceGovernanceService.getAdminControls', () => {
  it('DRAFT shows PUBLISH disabled with reason', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'DRAFT',
    });
    const publish = r.actions.find((a) => a.actionId === 'PUBLISH');
    expect(publish).toBeDefined();
    expect(publish!.available).toBe(false);
    expect(publish!.disabledReason).toMatch(/review/i);
  });

  it('REVIEW shows PUBLISH available', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'REVIEW',
    });
    const publish = r.actions.find((a) => a.actionId === 'PUBLISH');
    expect(publish!.available).toBe(true);
  });

  it('PUBLISHED shows SUSPEND', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'PUBLISHED',
    });
    expect(r.actions.find((a) => a.actionId === 'SUSPEND')).toBeDefined();
  });

  it('ACTIVE shows DEPRECATE + SUSPEND + FORCE_SYNC available', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'ACTIVE',
    });
    expect(r.actions.find((a) => a.actionId === 'DEPRECATE')).toBeDefined();
    expect(r.actions.find((a) => a.actionId === 'SUSPEND')).toBeDefined();
    const force = r.actions.find((a) => a.actionId === 'FORCE_SYNC');
    expect(force!.available).toBe(true);
  });

  it('DEPRECATED shows RETIRE action', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'DEPRECATED',
    });
    const retire = r.actions.find((a) => a.actionId === 'RETIRE');
    expect(retire).toBeDefined();
    expect(retire!.requiredRole).toBe('PLATFORM_ADMIN');
  });

  it('SUSPENDED shows REACTIVATE action', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'SUSPENDED',
    });
    expect(r.actions.find((a) => a.actionId === 'REACTIVATE')).toBeDefined();
  });

  it('always exposes VIEW_HEALTH and VIEW_LOGS', () => {
    const r = MarketplaceGovernanceService.getAdminControls(baseConnector);
    expect(r.actions.find((a) => a.actionId === 'VIEW_HEALTH')).toBeDefined();
    expect(r.actions.find((a) => a.actionId === 'VIEW_LOGS')).toBeDefined();
  });

  it('FORCE_SYNC disabled when not ACTIVE', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      currentStatus: 'PUBLISHED',
    });
    const force = r.actions.find((a) => a.actionId === 'FORCE_SYNC');
    expect(force!.available).toBe(false);
    expect(force!.disabledReason).toMatch(/active/i);
  });

  it('emits healthAlert for high error rate', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      healthMetrics: { uptime30d: 99.9, errorRate30d: 10, avgResponseTimeMs: 1000 },
    });
    expect(r.healthAlert).toMatch(/error rate/i);
  });

  it('emits healthAlert for low uptime', () => {
    const r = MarketplaceGovernanceService.getAdminControls({
      ...baseConnector,
      healthMetrics: { uptime30d: 98, errorRate30d: 0.5, avgResponseTimeMs: 1000 },
    });
    expect(r.healthAlert).toMatch(/uptime|SLA/i);
  });

  it('no healthAlert when metrics healthy', () => {
    const r = MarketplaceGovernanceService.getAdminControls(baseConnector);
    expect(r.healthAlert).toBeUndefined();
  });
});

describe('MarketplaceGovernanceService.processTransition', () => {
  it('allows DRAFT → REVIEW', () => {
    const r = MarketplaceGovernanceService.processTransition(
      { ...baseConnector, currentStatus: 'DRAFT' },
      'REVIEW' as any,
      'user-1',
      'Submit for review'
    );
    expect(r.allowed).toBe(true);
    expect(r.connector!.currentStatus).toBe('REVIEW');
    expect(r.connector!.transitions.length).toBe(1);
  });

  it('rejects illegal transition (DRAFT → ACTIVE)', () => {
    const r = MarketplaceGovernanceService.processTransition(
      { ...baseConnector, currentStatus: 'DRAFT' },
      'ACTIVE' as any,
      'user-1',
      'skip'
    );
    expect(r.allowed).toBe(false);
    expect(r.error).toMatch(/Cannot transition/);
  });

  it('rejects DEPRECATED → RETIRED before 90 days', () => {
    const r = MarketplaceGovernanceService.processTransition(
      {
        ...baseConnector,
        currentStatus: 'DEPRECATED',
        deprecatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      'RETIRED' as any,
      'user-1',
      'reason'
    );
    expect(r.allowed).toBe(false);
    expect(r.error).toMatch(/90 days/);
  });

  it('allows DEPRECATED → RETIRED after 90 days', () => {
    const r = MarketplaceGovernanceService.processTransition(
      {
        ...baseConnector,
        currentStatus: 'DEPRECATED',
        deprecatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      },
      'RETIRED' as any,
      'user-1',
      'reason'
    );
    expect(r.allowed).toBe(true);
    expect(r.connector!.retiredAt).toBeInstanceOf(Date);
  });

  it('stamps deprecatedAt on transition to DEPRECATED', () => {
    const r = MarketplaceGovernanceService.processTransition(
      { ...baseConnector, currentStatus: 'ACTIVE' },
      'DEPRECATED' as any,
      'user-1',
      'sunset'
    );
    expect(r.allowed).toBe(true);
    expect(r.connector!.deprecatedAt).toBeInstanceOf(Date);
  });

  it('RETIRED is terminal (no further transitions allowed)', () => {
    const r = MarketplaceGovernanceService.processTransition(
      { ...baseConnector, currentStatus: 'RETIRED' },
      'ACTIVE' as any,
      'user-1',
      'reason'
    );
    expect(r.allowed).toBe(false);
  });

  it('preserves transition history', () => {
    const startConnector = {
      ...baseConnector,
      currentStatus: 'DRAFT',
      transitions: [
        {
          from: 'DRAFT',
          to: 'DRAFT',
          triggeredBy: 'sys',
          triggeredAt: new Date(),
          reason: 'init',
          automated: true,
        },
      ],
    };
    const r = MarketplaceGovernanceService.processTransition(
      startConnector,
      'REVIEW' as any,
      'user-1',
      'submit'
    );
    expect(r.connector!.transitions.length).toBe(2);
  });
});

describe('MarketplaceGovernanceService.checkGovernanceCompliance', () => {
  it('passes when health within thresholds', () => {
    const r = MarketplaceGovernanceService.checkGovernanceCompliance(baseConnector);
    expect(r.every((c) => c.passed)).toBe(true);
  });

  it('fails uptime check when below 99.5%', () => {
    const r = MarketplaceGovernanceService.checkGovernanceCompliance({
      ...baseConnector,
      healthMetrics: { uptime30d: 98, errorRate30d: 0.5, avgResponseTimeMs: 1000 },
    });
    const uptime = r.find((c) => c.ruleId === 'SEC-03-01');
    expect(uptime!.passed).toBe(false);
  });

  it('fails P95 check when above 5000ms', () => {
    const r = MarketplaceGovernanceService.checkGovernanceCompliance({
      ...baseConnector,
      healthMetrics: { uptime30d: 99.9, errorRate30d: 0.5, avgResponseTimeMs: 7000 },
    });
    const p95 = r.find((c) => c.ruleId === 'SEC-03-02');
    expect(p95!.passed).toBe(false);
  });

  it('returns all expected rules', () => {
    const r = MarketplaceGovernanceService.checkGovernanceCompliance(baseConnector);
    const ids = r.map((c) => c.ruleId);
    expect(ids).toEqual(
      expect.arrayContaining(['SEC-01-01', 'SEC-01-02', 'SEC-02-01', 'SEC-03-01', 'SEC-03-02'])
    );
  });
});
