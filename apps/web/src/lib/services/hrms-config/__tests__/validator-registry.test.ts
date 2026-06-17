import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validatePayload,
  ConfigValidationError,
  registerDomainSchema,
  unregisterDomainSchema,
  listValidatedDomains,
} from '../validator-registry';

describe('hrms-config validator-registry', () => {
  describe('built-in domain schemas', () => {
    it('LEGAL_ENTITY accepts a valid profile', () => {
      const out = validatePayload<{ countryCode: string }>('LEGAL_ENTITY', {
        name: 'Acme UAE LLC',
        countryCode: 'AE',
        currency: 'AED',
        fiscalYearStart: '01-01',
      });
      expect(out.countryCode).toBe('AE');
    });

    it('LEGAL_ENTITY rejects bad countryCode (must be ISO-3166-1)', () => {
      try {
        validatePayload('LEGAL_ENTITY', {
          name: 'X',
          countryCode: 'United Arab Emirates', // too long
          currency: 'AED',
          fiscalYearStart: '01-01',
        });
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ConfigValidationError);
        const fe = (err as ConfigValidationError).fieldErrors;
        expect(fe.countryCode?.[0]).toMatch(/ISO-3166/);
      }
    });

    it('LEGAL_ENTITY rejects bad fiscalYearStart format', () => {
      expect(() =>
        validatePayload('LEGAL_ENTITY', {
          name: 'X',
          countryCode: 'AE',
          currency: 'AED',
          fiscalYearStart: '2026-01-01', // wrong shape
        })
      ).toThrow(ConfigValidationError);
    });

    it('PAYROLL_COMPONENT enforces UPPER_SNAKE code', () => {
      expect(() =>
        validatePayload('PAYROLL_COMPONENT', {
          code: 'basicSalary', // wrong shape
          type: 'EARNING',
          taxable: true,
        })
      ).toThrow(ConfigValidationError);

      // accepts correct shape
      const out = validatePayload<{ code: string }>('PAYROLL_COMPONENT', {
        code: 'BASIC_SALARY',
        type: 'EARNING',
        taxable: true,
      });
      expect(out.code).toBe('BASIC_SALARY');
    });

    it('EOSB_FORMULA requires breakpointYears when secondPeriodDaysPerYear is set', () => {
      // missing breakpointYears → should fail the .refine()
      expect(() =>
        validatePayload('EOSB_FORMULA', {
          firstPeriodDaysPerYear: 21,
          secondPeriodDaysPerYear: 30,
          // breakpointYears intentionally omitted
        })
      ).toThrow(ConfigValidationError);

      // with breakpointYears → accepted
      const out = validatePayload<{ breakpointYears: number }>('EOSB_FORMULA', {
        firstPeriodDaysPerYear: 21,
        secondPeriodDaysPerYear: 30,
        breakpointYears: 5,
      });
      expect(out.breakpointYears).toBe(5);
    });

    it('EOSB_FORMULA defaults basisField when omitted', () => {
      const out = validatePayload<{ basisField: string }>('EOSB_FORMULA', {
        firstPeriodDaysPerYear: 21,
      });
      expect(out.basisField).toBe('BASIC');
    });

    it('LEAVE rejects negative accrual', () => {
      expect(() =>
        validatePayload('LEAVE', {
          code: 'ANNUAL',
          name: 'Annual',
          accrualDaysPerYear: -1,
        })
      ).toThrow(ConfigValidationError);
    });

    it('ATTENDANCE rejects zero-duration shift (start === end)', () => {
      expect(() =>
        validatePayload('ATTENDANCE', {
          shiftCode: 'NIGHT',
          startTime: '22:00',
          endTime: '22:00',
          breakMinutes: 0,
        })
      ).toThrow(ConfigValidationError);
    });

    it('ATTENDANCE rejects malformed times (must be HH:MM)', () => {
      expect(() =>
        validatePayload('ATTENDANCE', {
          shiftCode: 'DAY',
          startTime: '9:00 AM',
          endTime: '6:00 PM',
        })
      ).toThrow(ConfigValidationError);
    });

    it('WPS_MAPPING enforces ISO-13616 IBAN', () => {
      expect(() =>
        validatePayload('WPS_MAPPING', {
          bankCode: 'EMIRATESNBD',
          fileFormat: 'SIF',
          employerId: 'E1',
          establishmentName: 'Acme',
          bankAccountIban: 'NOT_AN_IBAN',
        })
      ).toThrow(ConfigValidationError);
    });
  });

  describe('open registry', () => {
    it('passes through payloads for domains without a registered schema', () => {
      const out = validatePayload<Record<string, unknown>>('DOCUMENT_RETENTION', {
        anyShape: 'is allowed',
        until: 'a schema is registered for this domain',
      });
      expect(out.anyShape).toBe('is allowed');
    });

    it('registerDomainSchema activates validation for a previously-open domain', () => {
      const customSchema = z.object({
        retentionYears: z.number().int().min(1).max(99),
      });
      registerDomainSchema('CUSTOM_DOC_RETENTION', customSchema);
      try {
        expect(() => validatePayload('CUSTOM_DOC_RETENTION', { retentionYears: 0 })).toThrow(
          ConfigValidationError
        );
        const ok = validatePayload<{ retentionYears: number }>('CUSTOM_DOC_RETENTION', {
          retentionYears: 7,
        });
        expect(ok.retentionYears).toBe(7);
      } finally {
        unregisterDomainSchema('CUSTOM_DOC_RETENTION');
      }
    });

    it('listValidatedDomains includes the built-in domains', () => {
      const domains = listValidatedDomains();
      expect(domains).toContain('LEGAL_ENTITY');
      expect(domains).toContain('PAYROLL_COMPONENT');
      expect(domains).toContain('EOSB_FORMULA');
      expect(domains).toContain('LEAVE');
      expect(domains).toContain('ATTENDANCE');
      expect(domains).toContain('WPS_MAPPING');
    });
  });

  describe('ConfigValidationError shape', () => {
    it('surfaces per-field error messages for downstream API formatting', () => {
      try {
        validatePayload('PAYROLL_COMPONENT', {
          code: 'lower_case',
          type: 'NOT_A_TYPE',
          taxable: 'maybe',
        });
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ConfigValidationError);
        const fe = (err as ConfigValidationError).fieldErrors;
        expect(fe.code).toBeDefined();
        expect(fe.type).toBeDefined();
        expect(fe.taxable).toBeDefined();
      }
    });
  });
});
