/**
 * NitaqatService — Saudization compliance calculation tests.
 * Saudi Nitaqat program assigns companies to colored bands (Platinum,
 * Green, Yellow, Red) based on the percentage of Saudi nationals
 * employed, with thresholds varying by industry and company size.
 */

import { describe, it, expect } from 'vitest';
import { NitaqatService } from '../nitaqat.service';

describe('NitaqatService.getCompanySizeBand', () => {
  it('classifies <50 employees as Small', () => {
    expect(NitaqatService.getCompanySizeBand(10)).toBe('Small');
    expect(NitaqatService.getCompanySizeBand(49)).toBe('Small');
  });

  it('classifies 50-499 employees as Medium', () => {
    expect(NitaqatService.getCompanySizeBand(50)).toBe('Medium');
    expect(NitaqatService.getCompanySizeBand(499)).toBe('Medium');
  });

  it('classifies 500-2999 employees as Large', () => {
    expect(NitaqatService.getCompanySizeBand(500)).toBe('Large');
    expect(NitaqatService.getCompanySizeBand(2999)).toBe('Large');
  });

  it('classifies ≥3000 employees as Giant', () => {
    expect(NitaqatService.getCompanySizeBand(3000)).toBe('Giant');
    expect(NitaqatService.getCompanySizeBand(10000)).toBe('Giant');
  });
});

describe('NitaqatService.calculateStatus', () => {
  it('computes basic ratio and counts', () => {
    const status = NitaqatService.calculateStatus(
      'co-1',
      'ICT', // industry code
      'IT Services',
      100,
      30 // 30 Saudis out of 100
    );

    expect(status.totalEmployees).toBe(100);
    expect(status.saudiEmployees).toBe(30);
    expect(status.nonSaudiEmployees).toBe(70);
    expect(status.currentRatio).toBe(30);
    expect(status.companySizeBand).toBe('Medium');
  });

  it('handles zero employees safely (no divide-by-zero)', () => {
    const status = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 0, 0);
    expect(status.currentRatio).toBe(0);
  });

  it('reports surplus when company exceeds requirement', () => {
    const status = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 80);
    // 80 Saudis is well above most thresholds; should have either no deficit or a surplus
    expect(status.deficit).toBe(0);
  });

  it('reports deficit when below threshold', () => {
    const status = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 5);
    // 5 Saudis out of 100 = 5% — very low
    expect(status.deficit).toBeGreaterThan(0);
  });

  it('generates a non-empty recommendations array', () => {
    const status = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 30);
    expect(Array.isArray(status.recommendations)).toBe(true);
    expect(status.recommendations.length).toBeGreaterThan(0);
  });

  it('assigns a band from the documented set', () => {
    const status = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 30);
    expect(['PLATINUM', 'GREEN_HIGH', 'GREEN_MEDIUM', 'GREEN_LOW', 'YELLOW', 'RED']).toContain(
      status.band
    );
  });
});

describe('NitaqatService.calculateSaudisNeededForBand', () => {
  it('returns { needed, newRatio } for any inputs', () => {
    const result = NitaqatService.calculateSaudisNeededForBand(
      100,
      80,
      'GREEN_HIGH' as any,
      'ICT'
    );
    expect(result).toHaveProperty('needed');
    expect(result).toHaveProperty('newRatio');
    expect(typeof result.needed).toBe('number');
  });

  it('returns positive needed when below target', () => {
    const result = NitaqatService.calculateSaudisNeededForBand(
      100,
      5,
      'PLATINUM' as any,
      'ICT'
    );
    expect(result.needed).toBeGreaterThan(0);
  });
});

describe('NitaqatService.simulateChange', () => {
  it('returns a new NitaqatStatus after the change', () => {
    const current = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 30);
    const after = NitaqatService.simulateChange(current, 10, 0, 'ICT');

    expect(after.saudiEmployees).toBe(40);
    expect(after.totalEmployees).toBe(110); // 100 non-Saudi 70 + new Saudi 40 = 110
    expect(after.currentRatio).toBeGreaterThan(current.currentRatio);
  });

  it('handles negative change (attrition)', () => {
    const current = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 30);
    const after = NitaqatService.simulateChange(current, -5, 0, 'ICT');

    expect(after.saudiEmployees).toBe(25);
    expect(after.currentRatio).toBeLessThan(current.currentRatio);
  });

  it('floors employee count at zero (no negative employees)', () => {
    const current = NitaqatService.calculateStatus('co-1', 'ICT', 'IT', 100, 5);
    const after = NitaqatService.simulateChange(current, -100, 0, 'ICT');

    expect(after.saudiEmployees).toBe(0);
  });
});

describe('NitaqatService.getBandBenefits', () => {
  it('returns benefits structure for PLATINUM band', () => {
    const benefits = NitaqatService.getBandBenefits('PLATINUM' as any);
    expect(benefits).toHaveProperty('benefits');
    expect(benefits).toHaveProperty('restrictions');
  });

  it('returns benefits for RED band (most restricted)', () => {
    const benefits = NitaqatService.getBandBenefits('RED' as any);
    expect(benefits.restrictions.length).toBeGreaterThan(0);
  });
});

describe('NitaqatService.getIndustries', () => {
  it('returns a list of industry definitions with code/name/nameAr', () => {
    const industries = NitaqatService.getIndustries();
    expect(industries.length).toBeGreaterThan(0);
    expect(industries[0]).toHaveProperty('code');
    expect(industries[0]).toHaveProperty('name');
    expect(industries[0]).toHaveProperty('nameAr');
  });
});
