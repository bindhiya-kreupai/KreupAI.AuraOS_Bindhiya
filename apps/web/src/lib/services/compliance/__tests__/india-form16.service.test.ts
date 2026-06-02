/**
 * Form16Service — India tax certificate (Form 16) generation tests.
 */

import { describe, it, expect } from 'vitest';
import { Form16Service } from '../india-form16.service';

const mkEmployer: any = () => ({
  tan: 'ABCD12345E',
  name: 'Tech Corp Pvt Ltd',
  address: '123 Tech Street, Bangalore',
  pan: 'ABCPE1234F',
});

const mkEmployee: any = () => ({
  name: 'John Doe',
  pan: 'BBCPE1234G',
  address: 'Bangalore',
  designation: 'Engineer',
  dateOfJoining: new Date('2024-04-01'),
});

const mkSalary: any = () => ({
  grossSalary: 1200000,
  exemptAllowances: {
    hra: 100000,
    lta: 20000,
    standardDeduction: 50000,
    professionalTax: 2400,
    otherExemptions: 0,
  },
  deductions: {
    section80C: 100000,
    section80CCC: 0,
    section80CCD_1: 50000,
    section80CCD_1B: 50000,
    section80CCD_2: 0,
    section80D: 25000,
    section80DD: 0,
    section80DDB: 0,
    section80E: 0,
    section80EE: 0,
    section80EEA: 0,
    section80EEB: 0,
    section80G: 0,
    section80GG: 0,
    section80GGA: 0,
    section80GGC: 0,
    section80TTA: 0,
    section80TTB: 0,
    section80U: 0,
  },
  interestOnHousingLoan: 0,
  incomeFromOtherSources: 0,
});

const mkQuarterlyTDS: any = () => [
  { quarter: 'Q1', periodFrom: new Date('2024-04-01'), periodTo: new Date('2024-06-30'), taxDeducted: 10000, taxDeposited: 10000 },
  { quarter: 'Q2', periodFrom: new Date('2024-07-01'), periodTo: new Date('2024-09-30'), taxDeducted: 10000, taxDeposited: 10000 },
];

describe('Form16Service.validateTAN', () => {
  it('accepts a 10-character TAN', () => {
    expect(Form16Service.validateTAN('ABCD12345E')).toBe(true);
  });

  it('rejects shorter TAN', () => {
    expect(Form16Service.validateTAN('ABCD123')).toBe(false);
  });

  it('rejects wrong format', () => {
    expect(Form16Service.validateTAN('1234567890')).toBe(false);
  });
});

describe('Form16Service.validatePAN', () => {
  it('accepts a valid PAN with correct category char', () => {
    expect(Form16Service.validatePAN('ABCPE1234F')).toBe(true);
  });

  it('rejects malformed PAN', () => {
    expect(Form16Service.validatePAN('ABCDE')).toBe(false);
  });
});

describe('Form16Service.computeTax — OLD regime', () => {
  it('returns a Form16TaxComputation object', () => {
    const computation = Form16Service.computeTax(mkSalary(), 'OLD');
    expect(computation).toHaveProperty('grossTotalIncome');
    expect(computation).toHaveProperty('totalTaxableIncome');
  });

  it('subtracts exempt allowances from gross', () => {
    const computation = Form16Service.computeTax(mkSalary(), 'OLD');
    expect(computation.totalTaxableIncome).toBeLessThan(mkSalary().grossSalary);
  });
});

describe('Form16Service.computeTax — NEW regime', () => {
  it('applies new tax regime rates', () => {
    const computation = Form16Service.computeTax(mkSalary(), 'NEW');
    expect(computation.totalTaxableIncome).toBeGreaterThan(0);
  });
});

describe('Form16Service.generatePartA', () => {
  it('builds Part A with totals from quarterly TDS', () => {
    const partA = Form16Service.generatePartA(
      mkEmployer(),
      mkEmployee(),
      mkQuarterlyTDS(),
      '2024-25',
      '2025-26'
    );

    expect(partA.totalTaxDeducted).toBe(20000);
    expect(partA.totalTaxDeposited).toBe(20000);
    expect(partA.financialYear).toBe('2024-25');
    expect(partA.certificateNo).toMatch(/ABCD12345E/);
  });

  it('uses employee join date when no quarterly TDS provided', () => {
    const partA = Form16Service.generatePartA(
      mkEmployer(),
      mkEmployee(),
      [],
      '2024-25',
      '2025-26'
    );
    expect(partA.periodOfEmployment.from).toEqual(new Date('2024-04-01'));
  });
});

describe('Form16Service.generatePartB', () => {
  it('builds Part B with tax computation', () => {
    const computation = Form16Service.computeTax(mkSalary(), 'OLD');
    const partB = Form16Service.generatePartB(
      mkEmployer(),
      mkEmployee(),
      mkSalary(),
      computation,
      '2024-25',
      '2025-26',
      'Bangalore',
      'CFO'
    );

    expect(partB.place).toBe('Bangalore');
    expect(partB.signatory.name).toBe('CFO');
    expect(partB.signatory.designation).toBe('Authorized Signatory');
  });
});

describe('Form16Service.generate (full)', () => {
  it('builds a complete Form16 with Part A and Part B', () => {
    const form16 = Form16Service.generate(
      mkEmployer(),
      mkEmployee(),
      mkSalary(),
      mkQuarterlyTDS(),
      '2024-25',
      'OLD',
      'CFO'
    );

    expect(form16.partA).toBeDefined();
    expect(form16.partB).toBeDefined();
    expect(form16.generatedAt).toBeInstanceOf(Date);
    expect(form16.generatedBy).toBe('CFO');
  });
});

describe('Form16Service.generateHTML', () => {
  it('returns HTML string for a complete Form 16', () => {
    const form16 = Form16Service.generate(
      mkEmployer(),
      mkEmployee(),
      mkSalary(),
      mkQuarterlyTDS(),
      '2024-25',
      'OLD',
      'CFO'
    );

    const html = Form16Service.generateHTML(form16);
    expect(typeof html).toBe('string');
    expect(html).toContain('Form 16');
    expect(html).toContain(mkEmployer().tan);
  });
});
