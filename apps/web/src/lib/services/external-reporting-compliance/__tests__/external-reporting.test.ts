import { describe, it, expect } from 'vitest';
import {
  evaluateDisclosurePack,
  evaluateSubmissionCadence,
  validateFileFormat,
} from '../external-reporting.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-38-ER-01 — evaluateSubmissionCadence', () => {
  it('NEVER_SUBMITTED for fresh obligation', () => {
    const r = evaluateSubmissionCadence(
      [{ obligationId: 'o1', regulator: 'GAZT', active: true, cadenceDays: 90 }],
      NOW
    );
    expect(r.results[0].status).toBe('NEVER_SUBMITTED');
    expect(r.totals.overdue).toBe(1);
  });

  it('CURRENT within cadence', () => {
    const r = evaluateSubmissionCadence(
      [
        {
          obligationId: 'o1',
          regulator: 'GAZT',
          active: true,
          cadenceDays: 90,
          lastSubmittedAt: new Date('2026-06-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('CURRENT');
  });

  it('OVERDUE past cadence', () => {
    const r = evaluateSubmissionCadence(
      [
        {
          obligationId: 'o1',
          regulator: 'GAZT',
          active: true,
          cadenceDays: 30,
          lastSubmittedAt: new Date('2025-12-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('OVERDUE');
  });

  it('INACTIVE excluded from overdue count', () => {
    const r = evaluateSubmissionCadence(
      [{ obligationId: 'o1', regulator: 'GAZT', active: false, cadenceDays: 30 }],
      NOW
    );
    expect(r.results[0].status).toBe('INACTIVE');
    expect(r.totals.overdue).toBe(0);
  });
});

describe('EPIC-38-ER-02 — validateFileFormat', () => {
  const spec = {
    schemaId: 'WPS_V1',
    columns: ['employeeId', 'amount', 'iban'],
    maxRows: 10000,
    encoding: 'UTF-8' as const,
  };

  it('passes when fully compliant', () => {
    const r = validateFileFormat(spec, {
      columns: ['employeeId', 'amount', 'iban'],
      rowCount: 100,
      encoding: 'UTF-8',
    });
    expect(r.defects).toHaveLength(0);
  });

  it('flags missing column', () => {
    const r = validateFileFormat(spec, {
      columns: ['employeeId', 'amount'],
      rowCount: 10,
    });
    expect(r.defects).toContain('MISSING_COLUMN');
    expect(r.missingColumns).toEqual(['iban']);
  });

  it('flags extra column', () => {
    const r = validateFileFormat(spec, {
      columns: ['employeeId', 'amount', 'iban', 'extra'],
      rowCount: 10,
    });
    expect(r.defects).toContain('EXTRA_COLUMN');
    expect(r.extraColumns).toEqual(['extra']);
  });

  it('flags wrong order', () => {
    const r = validateFileFormat(spec, {
      columns: ['amount', 'employeeId', 'iban'],
      rowCount: 10,
    });
    expect(r.defects).toContain('WRONG_COLUMN_ORDER');
  });

  it('flags too many rows', () => {
    const r = validateFileFormat(spec, {
      columns: ['employeeId', 'amount', 'iban'],
      rowCount: 20000,
    });
    expect(r.defects).toContain('TOO_MANY_ROWS');
  });

  it('flags wrong encoding', () => {
    const r = validateFileFormat(spec, {
      columns: ['employeeId', 'amount', 'iban'],
      rowCount: 10,
      encoding: 'CP1252',
    });
    expect(r.defects).toContain('WRONG_ENCODING');
  });
});

describe('EPIC-38-ER-03 — evaluateDisclosurePack', () => {
  const req = [{ sectionCode: 'INTRO', label: 'Introduction', requireBilingual: true }];

  it('OK when both languages provided', () => {
    const r = evaluateDisclosurePack(req, [{ sectionCode: 'INTRO', en: 'Hello', ar: 'مرحبا' }]);
    expect(r.results[0].status).toBe('OK');
    expect(r.totals.completePct).toBe(100);
  });

  it('MISSING_AR when only EN', () => {
    const r = evaluateDisclosurePack(req, [{ sectionCode: 'INTRO', en: 'Hello' }]);
    expect(r.results[0].status).toBe('MISSING_AR');
  });

  it('MISSING_EN when only AR', () => {
    const r = evaluateDisclosurePack(req, [{ sectionCode: 'INTRO', ar: 'مرحبا' }]);
    expect(r.results[0].status).toBe('MISSING_EN');
  });

  it('MISSING_SECTION when not provided', () => {
    const r = evaluateDisclosurePack(req, []);
    expect(r.results[0].status).toBe('MISSING_SECTION');
    expect(r.totals.missing).toBe(1);
  });

  it('OK when bilingual not required and any one provided', () => {
    const r = evaluateDisclosurePack(
      [{ sectionCode: 'X', label: 'X', requireBilingual: false }],
      [{ sectionCode: 'X', en: 'Hi' }]
    );
    expect(r.results[0].status).toBe('OK');
  });
});
