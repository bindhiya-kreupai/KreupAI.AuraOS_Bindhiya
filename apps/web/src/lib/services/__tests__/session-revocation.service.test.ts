/**
 * SessionRevocationService — pure summary + error tests. (#21, #20, #22-25)
 */

import { describe, it, expect } from 'vitest';
import {
  SessionRevocationService,
  InvalidRevocationScopeError,
  type RevocationResult,
} from '../session-revocation.service';

const svc = new SessionRevocationService();

describe('SessionRevocationService.formatAuditSummary', () => {
  const base = {
    revokedCount: 42,
    reason: 'JWT_ROTATION' as const,
    initiatedBy: 'admin@aura.io',
    occurredAt: new Date('2026-06-03T12:00:00Z'),
  };

  it('renders an ALL_TENANTS summary', () => {
    const result: RevocationResult = { ...base, scope: 'ALL_TENANTS' };
    const s = svc.formatAuditSummary(result);
    expect(s).toMatch(/Revoked 42/);
    expect(s).toMatch(/all tenants/);
    expect(s).toMatch(/JWT_ROTATION/);
    expect(s).toMatch(/admin@aura.io/);
    expect(s).toMatch(/2026-06-03T12:00:00/);
  });

  it('renders a TENANT-scoped summary', () => {
    const result: RevocationResult = {
      ...base,
      scope: 'TENANT',
      scopeId: 'tenant-abc',
    };
    expect(svc.formatAuditSummary(result)).toMatch(/tenant=tenant-abc/);
  });

  it('renders a USER-scoped summary', () => {
    const result: RevocationResult = {
      ...base,
      scope: 'USER',
      scopeId: 'user-xyz',
    };
    expect(svc.formatAuditSummary(result)).toMatch(/user=user-xyz/);
  });
});

describe('InvalidRevocationScopeError', () => {
  it('is a real Error subclass with the reason in the message', () => {
    const err = new InvalidRevocationScopeError('tenantId required');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidRevocationScopeError');
    expect(err.message).toMatch(/tenantId required/);
  });
});
