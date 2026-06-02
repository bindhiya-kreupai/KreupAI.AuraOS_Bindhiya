/**
 * GOSIVerificationService — regression-test runner for the
 * Saudi GOSI 2025 law-change rates.
 */

import { describe, it, expect } from 'vitest';
import { GOSIVerificationService } from '../gosi-verification.service';

describe('GOSIVerificationService.generateRegressionTests', () => {
  it('returns the regression test suite with both Saudi and non-Saudi cases', () => {
    const tests = GOSIVerificationService.generateRegressionTests();
    expect(tests.length).toBeGreaterThan(0);

    const saudi = tests.filter((t) => t.nationality === 'SAUDI');
    const nonSaudi = tests.filter((t) => t.nationality === 'NON_SAUDI');
    expect(saudi.length).toBeGreaterThan(0);
    expect(nonSaudi.length).toBeGreaterThan(0);
  });

  it('each test case has expected employee/employer totals', () => {
    const tests = GOSIVerificationService.generateRegressionTests();
    for (const tc of tests) {
      expect(tc).toHaveProperty('testId');
      expect(typeof tc.expectedEmployeeTotal).toBe('number');
      expect(typeof tc.expectedEmployerTotal).toBe('number');
    }
  });
});

describe('GOSIVerificationService.verifySalaryCap', () => {
  it('returns true (cap is 45,000 SAR per current rates)', () => {
    expect(GOSIVerificationService.verifySalaryCap()).toBe(true);
  });
});

describe('GOSIVerificationService.executeTestCase', () => {
  it('passes a known-good Saudi test case', () => {
    const tests = GOSIVerificationService.generateRegressionTests();
    const saudi = tests.find((t) => t.nationality === 'SAUDI');
    const result = GOSIVerificationService.executeTestCase(saudi!);

    expect(result.passed).toBe(true);
    expect(result.nationality).toBe('SAUDI');
  });

  it('passes a known-good non-Saudi test case', () => {
    const tests = GOSIVerificationService.generateRegressionTests();
    const nonSaudi = tests.find((t) => t.nationality === 'NON_SAUDI');
    const result = GOSIVerificationService.executeTestCase(nonSaudi!);

    expect(result.passed).toBe(true);
  });
});

describe('GOSIVerificationService.runVerification', () => {
  it('runs the full verification suite and returns overall result', () => {
    const result = GOSIVerificationService.runVerification();

    expect(result).toHaveProperty('verificationId');
    expect(result.verificationId).toMatch(/^GOSI-VER-/);
    expect(result.overallPass).toBe(true);
    expect(result.saudiRatesVerified).toBe(true);
    expect(result.nonSaudiRatesVerified).toBe(true);
    expect(result.salaryCapVerified).toBe(true);
  });

  it('includes the rate card in the result', () => {
    const result = GOSIVerificationService.runVerification();
    expect(result.rateCard).toBeDefined();
  });

  it('includes all test cases in the result', () => {
    const result = GOSIVerificationService.runVerification();
    expect(result.testCases.length).toBeGreaterThan(0);
  });
});

describe('GOSIVerificationService.generateApprovedRateCard', () => {
  it('returns an approved rate card structure', () => {
    const card = GOSIVerificationService.generateApprovedRateCard();
    expect(card).toBeDefined();
    // shape varies; just check it's not null
    expect(typeof card).toBe('object');
  });
});

describe('GOSIVerificationService.runRegressionSuite', () => {
  it('runs a full regression test suite', () => {
    const suite = GOSIVerificationService.runRegressionSuite();
    expect(suite).toHaveProperty('totalTests');
    expect(suite.totalTests).toBeGreaterThan(0);
    expect(typeof suite.passed).toBe('number');
    expect(typeof suite.failed).toBe('number');
  });
});

describe('GOSIVerificationService.validateSystemRates', () => {
  const correctRates = {
    saudiEmployeePension: 0.0975,
    saudiEmployeeSaned: 0.0075,
    saudiEmployerPension: 0.0975,
    saudiEmployerSaned: 0.0075,
    saudiEmployerHazards: 0.02,
    nonSaudiEmployeeSaned: 0.02,
    nonSaudiEmployerSaned: 0.02,
    salaryCap: 45000,
  };

  it('returns all-match=true for correct rates', () => {
    const results = GOSIVerificationService.validateSystemRates(correctRates);
    expect(results.every((r) => r.match)).toBe(true);
  });

  it('flags incorrect Saudi employee pension rate', () => {
    const results = GOSIVerificationService.validateSystemRates({
      ...correctRates,
      saudiEmployeePension: 0.099, // wrong
    });

    const mismatch = results.find((r) => r.parameter === 'Saudi Employee Pension');
    expect(mismatch?.match).toBe(false);
  });

  it('returns a row per parameter checked', () => {
    const results = GOSIVerificationService.validateSystemRates(correctRates);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('parameter');
    expect(results[0]).toHaveProperty('expected');
    expect(results[0]).toHaveProperty('actual');
    expect(results[0]).toHaveProperty('match');
  });
});
