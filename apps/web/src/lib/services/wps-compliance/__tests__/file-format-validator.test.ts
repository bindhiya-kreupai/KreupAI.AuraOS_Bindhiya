import { describe, expect, it } from 'vitest';
import { validateWpsFile } from '../file-format-validator.service';

const EXPECTED = {
  employerId: 'EMP001',
  establishmentName: 'Aurora HCM LLC',
  period: '2026-05',
  countryCode: 'AE',
};

describe('EPIC-14 WPS SIF validator', () => {
  it('passes a clean SIF file', () => {
    const content = [
      'SIF|EMPLOYER=EMP001|PERIOD=2026-05|COUNTRY=AE',
      'E001,784197812345678,WP123456,AE070331234567890123456,EBILAEAD,AED,5000,500,0,5500,30',
      'E002,784198812345678,WP123457,AE070331234567890123457,EBILAEAD,AED,4000,0,100,3900,30',
      'TOT|2|9400',
    ].join('\n');
    const r = validateWpsFile({ format: 'SIF', content, expected: EXPECTED });
    expect(r.valid).toBe(true);
    expect(r.parsedRows).toBe(2);
    expect(r.parsedTotalAmount).toBe(9400);
    expect(r.totals.errors).toBe(0);
  });

  it('flags header period mismatch', () => {
    const content = [
      'SIF|EMPLOYER=EMP001|PERIOD=2026-04|COUNTRY=AE',
      'E001,784197812345678,WP123456,AE070331234567890123456,EBILAEAD,AED,5000,500,0,5500,30',
    ].join('\n');
    const r = validateWpsFile({ format: 'SIF', content, expected: EXPECTED });
    expect(r.valid).toBe(false);
    expect(r.issues.some((i) => i.code === 'HEADER_PERIOD_MISMATCH')).toBe(true);
  });

  it('flags invalid IBAN', () => {
    const content = [
      'SIF|EMPLOYER=EMP001|PERIOD=2026-05|COUNTRY=AE',
      'E001,784197812345678,WP123456,BAD-IBAN,EBILAEAD,AED,5000,500,0,5500,30',
    ].join('\n');
    const r = validateWpsFile({ format: 'SIF', content, expected: EXPECTED });
    expect(r.issues.some((i) => i.code === 'INVALID_IBAN')).toBe(true);
  });

  it('flags duplicate employee', () => {
    const content = [
      'SIF|EMPLOYER=EMP001|PERIOD=2026-05|COUNTRY=AE',
      'E001,784197812345678,WP123456,AE070331234567890123456,EBILAEAD,AED,5000,500,0,5500,30',
      'E001,784197812345678,WP123456,AE070331234567890123456,EBILAEAD,AED,5000,500,0,5500,30',
    ].join('\n');
    const r = validateWpsFile({ format: 'SIF', content, expected: EXPECTED });
    expect(r.issues.some((i) => i.code === 'DUPLICATE_EMPLOYEE')).toBe(true);
  });

  it('flags TOT trailer count mismatch', () => {
    const content = [
      'SIF|EMPLOYER=EMP001|PERIOD=2026-05|COUNTRY=AE',
      'E001,784197812345678,WP123456,AE070331234567890123456,EBILAEAD,AED,5000,500,0,5500,30',
      'TOT|5|5500',
    ].join('\n');
    const r = validateWpsFile({ format: 'SIF', content, expected: EXPECTED });
    expect(r.issues.some((i) => i.code === 'COUNT_MISMATCH')).toBe(true);
  });

  it('flags non-numeric net pay', () => {
    const content = [
      'SIF|EMPLOYER=EMP001|PERIOD=2026-05|COUNTRY=AE',
      'E001,784197812345678,WP123456,AE070331234567890123456,EBILAEAD,AED,5000,500,0,ABC,30',
    ].join('\n');
    const r = validateWpsFile({ format: 'SIF', content, expected: EXPECTED });
    expect(r.issues.some((i) => i.code === 'NET_PAY_NON_NUMERIC')).toBe(true);
  });

  it('reports empty file', () => {
    const r = validateWpsFile({ format: 'SIF', content: '   ', expected: EXPECTED });
    expect(r.issues[0].code).toBe('EMPTY_FILE');
    expect(r.valid).toBe(false);
  });
});

describe('EPIC-13 WPS MUDAD validator', () => {
  const KSA = { ...EXPECTED, countryCode: 'SA' };

  it('passes a clean MUDAD file', () => {
    const content = [
      'H|EMP001|2026-05|SA',
      'B|E001|1098765432|SA0380000000608010167519|5500',
      'B|E002|2098765432|SA0380000000608010167520|3900',
      'T|2|9400',
    ].join('\n');
    const r = validateWpsFile({ format: 'MUDAD', content, expected: KSA });
    expect(r.valid).toBe(true);
    expect(r.parsedRows).toBe(2);
    expect(r.parsedTotalAmount).toBe(9400);
  });

  it('flags missing trailer', () => {
    const content = ['H|EMP001|2026-05|SA', 'B|E001|1098765432|SA0380000000608010167519|5500'].join(
      '\n'
    );
    const r = validateWpsFile({ format: 'MUDAD', content, expected: KSA });
    expect(r.issues.some((i) => i.code === 'MISSING_TRAILER')).toBe(true);
  });

  it('flags bad record type', () => {
    const content = ['H|EMP001|2026-05|SA', 'X|E001|junk', 'T|0|0'].join('\n');
    const r = validateWpsFile({ format: 'MUDAD', content, expected: KSA });
    expect(r.issues.some((i) => i.code === 'BAD_RECORD_TYPE')).toBe(true);
  });

  it('flags total amount mismatch in trailer', () => {
    const content = [
      'H|EMP001|2026-05|SA',
      'B|E001|1098765432|SA0380000000608010167519|5500',
      'T|1|9999',
    ].join('\n');
    const r = validateWpsFile({ format: 'MUDAD', content, expected: KSA });
    expect(r.issues.some((i) => i.code === 'TOTAL_AMOUNT_MISMATCH')).toBe(true);
  });

  it('emits bilingual messages with Arabic text', () => {
    const content = ['H|EMP001|2026-05|SA', 'B|E001||BAD|5500', 'T|1|5500'].join('\n');
    const r = validateWpsFile({ format: 'MUDAD', content, expected: KSA });
    const iban = r.issues.find((i) => i.code === 'INVALID_IBAN')!;
    expect(iban.message).toContain('IBAN');
    expect(iban.messageAr).toMatch(/[؀-ۿ]/);
  });
});

describe('Generic bank-transfer-control formats', () => {
  it('validates a clean BWPS file', () => {
    const content = [
      'HDR|EMP001|2026-05|BH',
      'E001,BH67BMAG00001299123456,950',
      'E002,BH67BMAG00001299123457,1100',
    ].join('\n');
    const r = validateWpsFile({
      format: 'BWPS',
      content,
      expected: { ...EXPECTED, countryCode: 'BH' },
    });
    expect(r.valid).toBe(true);
    expect(r.parsedRows).toBe(2);
  });

  it('rejects unsupported format', () => {
    const r = validateWpsFile({
      format: 'XYZ' as never,
      content: 'whatever',
      expected: EXPECTED,
    });
    expect(r.issues[0].code).toBe('UNSUPPORTED_FORMAT');
  });
});
