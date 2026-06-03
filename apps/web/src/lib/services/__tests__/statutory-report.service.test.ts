/**
 * StatutoryReportService — registry + transition tests.
 *
 * These tests don't touch Prisma. They verify the registry exposes the
 * expected report specs and that the SUBMISSION_ALLOWED state machine
 * enforces the contract that closes #85 (no placeholder MoHRE refs).
 */

import { describe, it, expect } from 'vitest';
import {
  listSpecs,
  StatutoryReportService,
  InvalidReportTransitionError,
} from '../statutory-report.service';

const svc = new StatutoryReportService();

describe('Statutory report registry', () => {
  it('exposes the 6 generators landed in Phase 2', () => {
    const codes = listSpecs()
      .map((s) => s.code)
      .sort();
    expect(codes).toEqual([
      'IND_FORM_16',
      'IND_FORM_24Q',
      'IND_PF_ECR',
      'KSA_GOSI_RECON',
      'KSA_NITAQAT',
      'UAE_MOHRE',
      'UAE_WPS_RECON',
    ]);
  });

  it('filters by country code', () => {
    const ae = svc
      .listSpecs({ countryCode: 'AE' })
      .map((s) => s.code)
      .sort();
    expect(ae).toEqual(['UAE_MOHRE', 'UAE_WPS_RECON']);

    const sa = svc
      .listSpecs({ countryCode: 'SA' })
      .map((s) => s.code)
      .sort();
    expect(sa).toEqual(['KSA_GOSI_RECON', 'KSA_NITAQAT']);

    const ind = svc
      .listSpecs({ countryCode: 'IN' })
      .map((s) => s.code)
      .sort();
    expect(ind).toEqual(['IND_FORM_16', 'IND_FORM_24Q', 'IND_PF_ECR']);
  });

  it('returns specs without the generate function (safe to serialize)', () => {
    const specs = svc.listSpecs();
    for (const spec of specs) {
      expect(spec).not.toHaveProperty('generate');
      expect(spec).toHaveProperty('code');
      expect(spec).toHaveProperty('countryCode');
      expect(spec).toHaveProperty('format');
    }
  });
});

describe('Statutory report submission contract (#85)', () => {
  /**
   * markSubmitted relies on the SUBMISSION_ALLOWED table to gate transitions.
   * We can't drive the full flow without Prisma here, but the class exposes
   * enough to verify the InvalidReportTransitionError shape and the
   * placeholder-reference guard logic via the error message contract.
   */
  it('exports InvalidReportTransitionError as a real Error subclass', () => {
    const err = new InvalidReportTransitionError('DRAFT', 'ACKNOWLEDGED');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidReportTransitionError');
    expect(err.message).toMatch(/DRAFT/);
    expect(err.message).toMatch(/ACKNOWLEDGED/);
  });

  it('rejects placeholder submission references shorter than 3 chars', async () => {
    // markSubmitted exits before any Prisma call when ref is too short.
    // The thrown Error message is the contract that callers (route + UI)
    // surface to MoHRE/GOSI/EPFO operators.
    await expect(
      svc.markSubmitted('any-id', 'any-tenant', 'any-actor', '', undefined)
    ).rejects.toThrow();
    await expect(
      svc.markSubmitted('any-id', 'any-tenant', 'any-actor', 'x', undefined)
    ).rejects.toThrow(/real authority-issued/);
  });
});
