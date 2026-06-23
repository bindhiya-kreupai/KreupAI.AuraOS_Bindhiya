import { describe, it, expect } from 'vitest';
import {
  checkCrossBorderTransfer,
  evaluateConsentCadence,
  evaluateDsarSla,
} from '../data-privacy.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-33-DP-01 — evaluateDsarSla', () => {
  it('FULFILLED_ON_TIME within SLA', () => {
    const r = evaluateDsarSla(
      [
        {
          requestId: 'd1',
          receivedAt: new Date('2026-06-01'),
          fulfilledAt: new Date('2026-06-10'),
          jurisdiction: 'SAU',
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('FULFILLED_ON_TIME');
  });

  it('FULFILLED_LATE past SLA', () => {
    const r = evaluateDsarSla(
      [
        {
          requestId: 'd1',
          receivedAt: new Date('2026-04-01'),
          fulfilledAt: new Date('2026-06-01'),
          jurisdiction: 'SAU',
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('FULFILLED_LATE');
    expect(r.totals.breached).toBe(1);
  });

  it('BREACHED when open past SLA', () => {
    const r = evaluateDsarSla(
      [
        {
          requestId: 'd1',
          receivedAt: new Date('2026-04-01'),
          jurisdiction: 'SAU',
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('BREACHED');
  });

  it('ACK_PENDING when within SLA and open', () => {
    const r = evaluateDsarSla(
      [
        {
          requestId: 'd1',
          receivedAt: new Date('2026-06-10'),
          jurisdiction: 'SAU',
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('ACK_PENDING');
  });

  it('respects overrideSlaDays', () => {
    const r = evaluateDsarSla(
      [
        {
          requestId: 'd1',
          receivedAt: new Date('2026-06-10'),
          jurisdiction: 'SAU',
          overrideSlaDays: 5,
        },
      ],
      NOW
    );
    expect(r.results[0].slaDays).toBe(5);
    expect(r.results[0].status).toBe('BREACHED');
  });
});

describe('EPIC-33-DP-02 — checkCrossBorderTransfer', () => {
  it('allows intra-GCC transfer with proper basis', () => {
    const r = checkCrossBorderTransfer([
      {
        transferId: 't1',
        fromCountry: 'SAU',
        toCountry: 'ARE',
        dataCategory: 'GENERIC',
        legalBasis: 'CONTRACT',
        hasDpia: false,
        hasDataSubjectConsent: false,
      },
    ]);
    expect(r.results[0].allowed).toBe(true);
  });

  it('blocks transfer to non-adequate jurisdiction without SCC', () => {
    const r = checkCrossBorderTransfer([
      {
        transferId: 't1',
        fromCountry: 'SAU',
        toCountry: 'US',
        dataCategory: 'GENERIC',
        legalBasis: 'CONTRACT',
        hasDpia: false,
        hasDataSubjectConsent: false,
      },
    ]);
    expect(r.results[0].allowed).toBe(false);
    expect(r.results[0].blockers).toContain('NO_ADEQUACY_AND_NO_FALLBACK_BASIS');
  });

  it('allows non-adequate transfer with SCC', () => {
    const r = checkCrossBorderTransfer([
      {
        transferId: 't1',
        fromCountry: 'SAU',
        toCountry: 'US',
        dataCategory: 'GENERIC',
        legalBasis: 'SCC',
        hasDpia: false,
        hasDataSubjectConsent: false,
      },
    ]);
    expect(r.results[0].allowed).toBe(true);
  });

  it('blocks SENSITIVE without DPIA', () => {
    const r = checkCrossBorderTransfer([
      {
        transferId: 't1',
        fromCountry: 'SAU',
        toCountry: 'ARE',
        dataCategory: 'SENSITIVE',
        legalBasis: 'CONTRACT',
        hasDpia: false,
        hasDataSubjectConsent: false,
      },
    ]);
    expect(r.results[0].blockers).toContain('SENSITIVE_DATA_REQUIRES_DPIA');
    expect(r.results[0].allowed).toBe(false);
  });

  it('blocks HEALTH without explicit consent', () => {
    const r = checkCrossBorderTransfer([
      {
        transferId: 't1',
        fromCountry: 'SAU',
        toCountry: 'EU',
        dataCategory: 'HEALTH',
        legalBasis: 'CONTRACT',
        hasDpia: true,
        hasDataSubjectConsent: false,
      },
    ]);
    expect(r.results[0].blockers).toContain('SPECIAL_CATEGORY_REQUIRES_EXPLICIT_CONSENT');
  });

  it('allows intra-country processing automatically', () => {
    const r = checkCrossBorderTransfer([
      {
        transferId: 't1',
        fromCountry: 'SAU',
        toCountry: 'SAU',
        dataCategory: 'HEALTH',
        legalBasis: 'NONE',
        hasDpia: false,
        hasDataSubjectConsent: false,
      },
    ]);
    expect(r.results[0].allowed).toBe(true);
  });
});

describe('EPIC-33-DP-03 — evaluateConsentCadence', () => {
  it('ACTIVE within cadence', () => {
    const r = evaluateConsentCadence(
      [
        {
          subjectId: 's1',
          purpose: 'MARKETING',
          grantedAt: new Date('2026-05-01'),
          reconfirmDays: 365,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('ACTIVE');
  });

  it('STALE past cadence', () => {
    const r = evaluateConsentCadence(
      [
        {
          subjectId: 's1',
          purpose: 'MARKETING',
          grantedAt: new Date('2025-01-01'),
          reconfirmDays: 90,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('STALE');
  });

  it('WITHDRAWN when withdrawnAt set', () => {
    const r = evaluateConsentCadence(
      [
        {
          subjectId: 's1',
          purpose: 'MARKETING',
          grantedAt: new Date('2026-05-01'),
          withdrawnAt: new Date('2026-06-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('WITHDRAWN');
    expect(r.totals.withdrawn).toBe(1);
  });

  it('summarises activePct correctly', () => {
    const r = evaluateConsentCadence(
      [
        { subjectId: 's1', purpose: 'P', grantedAt: new Date('2026-06-01') },
        { subjectId: 's2', purpose: 'P', grantedAt: new Date('2024-01-01'), reconfirmDays: 30 },
        {
          subjectId: 's3',
          purpose: 'P',
          grantedAt: new Date('2026-01-01'),
          withdrawnAt: new Date('2026-02-01'),
        },
      ],
      NOW
    );
    expect(r.totals.activePct).toBe(33);
  });
});
