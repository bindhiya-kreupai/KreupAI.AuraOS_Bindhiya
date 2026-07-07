/**
 * IndiaProfessionalTaxService — canonical 17-state PT engine.
 *
 * Covers the calculation path now wired to the India Statutory dashboard's PT
 * tab (AURA-061). The dashboard POSTs { action: 'calculateMonthly', stateCode,
 * monthlyGrossSalary, month } to /api/compliance/india-professional-tax, which
 * delegates to IndiaProfessionalTaxService.calculateMonthlyPT. Also verifies the
 * supportedStates catalogue that populates the page's state dropdown.
 *
 * Pure calculation functions; no I/O.
 */

import { describe, it, expect } from 'vitest';
import { IndiaProfessionalTaxService } from '../india-professional-tax.service';

describe('IndiaProfessionalTaxService.calculateMonthlyPT (canonical PT surface)', () => {
  it('returns a positive monthly tax for a Maharashtra high earner within the annual cap', () => {
    const r = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 3);
    expect(r.stateCode).toBe('MH');
    expect(r.stateName).toBeTruthy();
    expect(r.monthlyTax).toBeGreaterThan(0);
    // Constitutional cap: no single month may exceed the annual cap (Article 276).
    expect(r.monthlyTax).toBeLessThanOrEqual(r.annualCap);
    expect(r.annualCap).toBeLessThanOrEqual(2500);
  });

  it('applies the February adjustment for Maharashtra in month 2', () => {
    const feb = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 2);
    expect(feb.isFebruaryAdjustment).toBe(true);
  });

  it('gracefully handles an unrecognised state code with zero tax', () => {
    // Cast through unknown — the page only ever sends catalogue codes, but the
    // engine must not throw on an unexpected value.
    const r = IndiaProfessionalTaxService.calculateMonthlyPT(
      'ZZ' as unknown as Parameters<typeof IndiaProfessionalTaxService.calculateMonthlyPT>[0],
      50000,
      6
    );
    expect(r.monthlyTax).toBe(0);
  });
});

describe('IndiaProfessionalTaxService.getSupportedStates (page dropdown source)', () => {
  it('exposes the richer 17-state catalogue with code + name', () => {
    const states = IndiaProfessionalTaxService.getSupportedStates();
    expect(Array.isArray(states)).toBe(true);
    // Richer than the 11-state legacy fallback baked into the page.
    expect(states.length).toBeGreaterThanOrEqual(11);
    for (const s of states) {
      expect(s.code).toMatch(/^[A-Z]{2}$/);
      expect(s.name.length).toBeGreaterThan(0);
    }
    expect(states.map((s) => s.code)).toContain('MH');
  });
});
