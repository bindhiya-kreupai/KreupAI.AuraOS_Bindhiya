import { describe, expect, it } from 'vitest';
import {
  ERROR_CATALOG,
  lookupErrorCatalog,
  maskPiiFields,
  summariseAuditEvents,
} from '../foundation-governance.service';

describe('EPIC-01 bilingual error catalog', () => {
  it('returns matched entry with en + ar copy', () => {
    const r = lookupErrorCatalog('E4030');
    expect(r.matched).toBe(true);
    expect(r.message).toBe('Forbidden');
    expect(r.messageAr).toMatch(/[؀-ۿ]/);
    expect(r.httpStatus).toBe(403);
  });

  it('falls back when code is unknown', () => {
    const r = lookupErrorCatalog('E9999', 'Custom', 'مخصص');
    expect(r.matched).toBe(false);
    expect(r.message).toBe('Custom');
    expect(r.messageAr).toBe('مخصص');
  });

  it('covers every well-known HTTP code', () => {
    const codes = ['E2001', 'E2002', 'E4010', 'E4030', 'E4040', 'E4090', 'E5001', 'E5031'];
    for (const c of codes) {
      expect(ERROR_CATALOG[c]).toBeDefined();
      expect(ERROR_CATALOG[c].ar).toMatch(/[؀-ۿ]/);
    }
  });
});

describe('EPIC-01 PII masking', () => {
  it('returns original when policy NONE', () => {
    const r = maskPiiFields(
      { name: 'Sabu', nationalId: '784197812345678' },
      { fields: { name: 'NONE', nationalId: 'NONE' } }
    );
    expect(r.name).toBe('Sabu');
    expect(r.nationalId).toBe('784197812345678');
  });

  it('partial-masks short fields keeping 2+2', () => {
    const r = maskPiiFields({ phone: '0501234567' }, { fields: { phone: 'PARTIAL' } });
    // 10 chars → first 2 + **** + last 2
    expect(r.phone).toBe('05****67');
  });

  it('partial-masks long fields keeping last 4', () => {
    const r = maskPiiFields({ iban: 'AE070331234567890123456' }, { fields: { iban: 'PARTIAL' } });
    expect(r.iban).toMatch(/^\*+\d{4}$/);
  });

  it('full-masks with fixed asterisks', () => {
    const r = maskPiiFields({ ssn: '784197812345678' }, { fields: { ssn: 'FULL' } });
    expect(r.ssn).toBe('********');
  });

  it('applies default policy when a field is not listed', () => {
    const r = maskPiiFields(
      { name: 'X', extra: 'unspecified' },
      { default: 'FULL', fields: { name: 'NONE' } }
    );
    expect(r.name).toBe('X');
    // FULL policy caps mask at 8 chars
    expect(r.extra).toBe('********');
  });

  it('handles non-string values gracefully', () => {
    const r = maskPiiFields({ age: 30, vip: true }, { default: 'FULL' });
    expect(r.age).toBe('*****');
    expect(r.vip).toBe('*****');
  });
});

describe('EPIC-01 audit summary widget', () => {
  const t = (iso: string) => new Date(iso);
  const events = [
    {
      action: 'USER_LOGIN',
      severity: 'INFO',
      resourceType: 'auth',
      timestamp: t('2026-06-01T10:00:00Z'),
      userId: 'u1',
      success: true,
    },
    {
      action: 'USER_LOGIN',
      severity: 'INFO',
      resourceType: 'auth',
      timestamp: t('2026-06-01T11:00:00Z'),
      userId: 'u2',
      success: true,
    },
    {
      action: 'USER_LOGIN_FAILED',
      severity: 'HIGH',
      resourceType: 'auth',
      timestamp: t('2026-06-01T11:30:00Z'),
      userId: 'u3',
      success: false,
    },
    {
      action: 'SETTINGS_UPDATED',
      severity: 'MEDIUM',
      resourceType: 'config',
      timestamp: t('2026-06-02T09:00:00Z'),
      userId: 'u1',
      success: true,
    },
    {
      action: 'RECORD_UPDATED',
      severity: 'LOW',
      resourceType: 'employee',
      timestamp: t('2026-06-02T15:00:00Z'),
      userId: 'u1',
      success: true,
    },
  ];

  it('reports total + success + failure + distinct users', () => {
    const s = summariseAuditEvents(events);
    expect(s.totals.events).toBe(5);
    expect(s.totals.success).toBe(4);
    expect(s.totals.failure).toBe(1);
    expect(s.totals.distinctUsers).toBe(3);
  });

  it('buckets by action in descending order', () => {
    const s = summariseAuditEvents(events);
    expect(s.byAction[0].key).toBe('USER_LOGIN');
    expect(s.byAction[0].count).toBe(2);
    expect(s.byAction[0].labelAr).toMatch(/[؀-ۿ]/);
  });

  it('buckets by severity with bilingual labels', () => {
    const s = summariseAuditEvents(events);
    expect(s.bySeverity.find((b) => b.key === 'INFO')!.count).toBe(2);
    expect(s.bySeverity.find((b) => b.key === 'HIGH')!.labelAr).toBe('مرتفع');
  });

  it('buckets by resource type', () => {
    const s = summariseAuditEvents(events);
    const auth = s.byResourceType.find((b) => b.key === 'auth')!;
    expect(auth.count).toBe(3);
  });

  it('emits daily counts sorted chronologically', () => {
    const s = summariseAuditEvents(events);
    expect(s.daily.map((d) => d.date)).toEqual(['2026-06-01', '2026-06-02']);
    expect(s.daily[0].count).toBe(3);
  });

  it('returns empty summary for empty input', () => {
    const s = summariseAuditEvents([]);
    expect(s.totals.events).toBe(0);
    expect(s.byAction).toEqual([]);
    expect(s.daily).toEqual([]);
  });
});
