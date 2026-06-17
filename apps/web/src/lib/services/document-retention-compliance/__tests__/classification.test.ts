import { describe, it, expect } from 'vitest';
import { classifyDocument, retentionExpiryDate } from '../classification.service';

describe('classifyDocument — EPIC-30-S02', () => {
  it('uses source hint over filename', () => {
    const r = classifyDocument({
      filename: 'random.pdf',
      source: 'PAYROLL_PAYSLIP_UPLOAD',
    });
    expect(r.category).toBe('PAYROLL_PAYSLIP');
    expect(r.matchedOn).toBe('source');
  });

  it('classifies payslip by filename', () => {
    const r = classifyDocument({ filename: '2026-05_payslip_E1234.pdf' });
    expect(r.category).toBe('PAYROLL_PAYSLIP');
    expect(r.matchedOn).toBe('filename');
  });

  it('classifies employment contract by filename', () => {
    const r = classifyDocument({ filename: 'employment_agreement_2026.pdf' });
    expect(r.category).toBe('EMPLOYEE_CONTRACT');
  });

  it('classifies identity documents (passport / emirates id)', () => {
    expect(classifyDocument({ filename: 'passport_scan.jpg' }).category).toBe('IDENTITY_DOCUMENT');
    expect(classifyDocument({ filename: 'emirates_id_back.png' }).category).toBe(
      'IDENTITY_DOCUMENT'
    );
  });

  it('classifies medical / fitness documents', () => {
    expect(classifyDocument({ filename: 'medical_fitness_certificate.pdf' }).category).toBe(
      'MEDICAL_DOCUMENT'
    );
  });

  it('classifies statutory filings (wps / gosi / nitaqat)', () => {
    expect(classifyDocument({ filename: 'wps_202605.sif' }).category).toBe('STATUTORY_FILING');
    expect(classifyDocument({ filename: 'gosi_contribution_202605.csv' }).category).toBe(
      'STATUTORY_FILING'
    );
  });

  it('falls back to OTHER when nothing matches', () => {
    const r = classifyDocument({ filename: 'untitled.pdf' });
    expect(r.category).toBe('OTHER');
    expect(r.matchedOn).toBe('fallback');
  });
});

describe('retentionExpiryDate', () => {
  const created = new Date('2026-06-17T00:00:00Z');
  const separated = new Date('2027-06-17T00:00:00Z');

  it('uses createdAt + retentionYears for normal docs', () => {
    const r = classifyDocument({ filename: 'payslip.pdf' });
    const expiry = retentionExpiryDate(r, { createdAt: created });
    expect(expiry.toISOString()).toBe('2031-06-17T00:00:00.000Z');
  });

  it('uses separationDate when retainFromSeparation=true', () => {
    const r = classifyDocument({ filename: 'employment_contract.pdf' });
    const expiry = retentionExpiryDate(r, {
      createdAt: created,
      separationDate: separated,
    });
    // 30 years from 2027-06-17 → 2057-06-17.
    expect(expiry.toISOString()).toBe('2057-06-17T00:00:00.000Z');
  });

  it('falls back to createdAt when retainFromSeparation but no separation date provided', () => {
    const r = classifyDocument({ filename: 'employment_contract.pdf' });
    const expiry = retentionExpiryDate(r, { createdAt: created });
    expect(expiry.toISOString()).toBe('2056-06-17T00:00:00.000Z');
  });
});
