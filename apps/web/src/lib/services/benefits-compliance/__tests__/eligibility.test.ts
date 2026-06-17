import { describe, it, expect } from 'vitest';
import {
  evaluateEligibilityAgainstCatalogue,
  type EligibilityContext,
} from '../eligibility.service';

/**
 * EPIC-22-S02 closure tests — pure evaluator only.
 * `BenefitEligibilityService.evaluate/.evaluateAllForEmployee` are thin
 * prisma wrappers; the business logic lives in this pure function.
 */

const baseCtx: EligibilityContext = {
  employee: {
    id: 'emp-1',
    countryCode: 'UAE',
    grade: { code: 'G5', level: 5 },
    tenureMonths: 24,
    employmentStatus: 'ACTIVE',
    isProbation: false,
    hasDependants: true,
  },
};

describe('evaluateEligibilityAgainstCatalogue', () => {
  it('returns ELIGIBLE when there are no gates and no expression', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c1', benefitCode: 'WELLNESS_EAP', status: 'ACTIVE' },
      baseCtx
    );
    expect(v).toEqual(
      expect.objectContaining({
        eligible: true,
        reasonCode: 'ELIGIBLE',
        catalogueId: 'c1',
        benefitCode: 'WELLNESS_EAP',
      })
    );
  });

  it('returns NOT_IN_COUNTRY when catalogue country differs from employee', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c2', benefitCode: 'MEDICAL_INSURANCE_KSA', countryCode: 'KSA', status: 'ACTIVE' },
      baseCtx
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('NOT_IN_COUNTRY');
    expect(v.reasonAr.length).toBeGreaterThan(0);
  });

  it('returns ELIGIBLE when catalogue country matches', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c3', benefitCode: 'MEDICAL_INSURANCE_UAE', countryCode: 'UAE', status: 'ACTIVE' },
      baseCtx
    );
    expect(v.eligible).toBe(true);
  });

  it('returns GRADE_BELOW_MIN when employee grade level is below catalogue minGrade', () => {
    const ctx: EligibilityContext = {
      employee: { ...baseCtx.employee, grade: { code: 'G2', level: 2 } },
    };
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c4', benefitCode: 'HOUSING_ALLOWANCE', minGrade: 'G5', status: 'ACTIVE' },
      ctx
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('GRADE_BELOW_MIN');
  });

  it('returns EMPLOYMENT_INACTIVE when employmentStatus is not ACTIVE', () => {
    const ctx: EligibilityContext = {
      employee: { ...baseCtx.employee, employmentStatus: 'TERMINATED' },
    };
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c5', benefitCode: 'AIR_TICKET_ANNUAL', status: 'ACTIVE' },
      ctx
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('EMPLOYMENT_INACTIVE');
  });

  it('evaluates a DSL eligibilityExpression — truthy → ELIGIBLE', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      {
        id: 'c6',
        benefitCode: 'EDUCATION_ASSISTANCE',
        status: 'ACTIVE',
        policyJson: {
          eligibilityExpression: 'employee.tenureMonths >= 12 && employee.hasDependants',
        },
      },
      baseCtx
    );
    expect(v.eligible).toBe(true);
  });

  it('evaluates a DSL eligibilityExpression — falsy → EXPRESSION_FALSE', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      {
        id: 'c7',
        benefitCode: 'EDUCATION_ASSISTANCE',
        status: 'ACTIVE',
        policyJson: { eligibilityExpression: 'employee.tenureMonths >= 60' },
      },
      baseCtx
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('EXPRESSION_FALSE');
  });

  it('fails closed (EXPRESSION_ERROR) when the expression is malformed', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      {
        id: 'c8',
        benefitCode: 'WELLNESS_EAP',
        status: 'ACTIVE',
        policyJson: { eligibilityExpression: 'employee.tenureMonths >= ((' },
      },
      baseCtx
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('EXPRESSION_ERROR');
    expect(v.reason).toMatch(/Eligibility expression could not be evaluated/);
  });

  it('returns CATALOGUE_INACTIVE when status is not ACTIVE', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c9', benefitCode: 'LIFE_INSURANCE_GROUP', status: 'RETIRED' },
      baseCtx
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('CATALOGUE_INACTIVE');
  });

  it('returns CATALOGUE_INACTIVE when asOf is before effectiveFrom', () => {
    const asOf = new Date('2025-01-01');
    const effectiveFrom = new Date('2026-01-01');
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c10', benefitCode: 'MEAL_VOUCHER', status: 'ACTIVE' },
      baseCtx,
      asOf,
      effectiveFrom
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('CATALOGUE_INACTIVE');
  });

  it('returns CATALOGUE_INACTIVE when asOf is after effectiveTo', () => {
    const asOf = new Date('2027-01-01');
    const effectiveFrom = new Date('2026-01-01');
    const effectiveTo = new Date('2026-06-30');
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c11', benefitCode: 'BONUS_2026', status: 'ACTIVE' },
      baseCtx,
      asOf,
      effectiveFrom,
      effectiveTo
    );
    expect(v.eligible).toBe(false);
    expect(v.reasonCode).toBe('CATALOGUE_INACTIVE');
  });

  it('combines gates correctly — country first, then grade, then DSL', () => {
    // Country gate fails first; DSL is not evaluated.
    const ctx: EligibilityContext = {
      employee: { ...baseCtx.employee, countryCode: 'INDIA' },
    };
    const v = evaluateEligibilityAgainstCatalogue(
      {
        id: 'c12',
        benefitCode: 'AIR_TICKET_INDIA',
        countryCode: 'UAE',
        minGrade: 'G3',
        status: 'ACTIVE',
        policyJson: { eligibilityExpression: 'employee.tenureMonths >= 0' },
      },
      ctx
    );
    expect(v.reasonCode).toBe('NOT_IN_COUNTRY');
  });

  it('exposes bilingual reason strings on every verdict', () => {
    const v = evaluateEligibilityAgainstCatalogue(
      { id: 'c13', benefitCode: 'WELLNESS_EAP', status: 'ACTIVE' },
      baseCtx
    );
    expect(v.reason.length).toBeGreaterThan(0);
    expect(v.reasonAr.length).toBeGreaterThan(0);
    expect(v.reason).not.toEqual(v.reasonAr);
  });
});
