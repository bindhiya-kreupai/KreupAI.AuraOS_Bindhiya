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

    it('listValidatedDomains includes all 11 built-in domains', () => {
      const domains = listValidatedDomains();
      expect(domains).toEqual(
        expect.arrayContaining([
          'LEGAL_ENTITY',
          'PAYROLL_COMPONENT',
          'PAYROLL_CALENDAR',
          'EOSB_FORMULA',
          'LEAVE',
          'ATTENDANCE',
          'WPS_MAPPING',
          'SOCIAL_INSURANCE',
          'NATIONALISATION',
          'IMMIGRATION',
          'BENEFITS',
        ])
      );
    });
  });

  describe('PAYROLL_CALENDAR', () => {
    it('rejects endDate before startDate', () => {
      expect(() =>
        validatePayload('PAYROLL_CALENDAR', {
          calendarCode: 'MONTHLY',
          periodLabel: 'July 2026',
          startDate: '2026-07-15',
          endDate: '2026-07-01',
          payDate: '2026-08-05',
          cutoffDate: '2026-07-01',
        })
      ).toThrow(ConfigValidationError);
    });

    it('rejects cutoffDate after endDate', () => {
      expect(() =>
        validatePayload('PAYROLL_CALENDAR', {
          calendarCode: 'MONTHLY',
          periodLabel: 'July 2026',
          startDate: '2026-07-01',
          endDate: '2026-07-31',
          payDate: '2026-08-05',
          cutoffDate: '2026-08-01',
        })
      ).toThrow(ConfigValidationError);
    });

    it('accepts a valid calendar', () => {
      const out = validatePayload<{ calendarCode: string }>('PAYROLL_CALENDAR', {
        calendarCode: 'MONTHLY',
        periodLabel: 'July 2026',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        payDate: '2026-08-05',
        cutoffDate: '2026-07-25',
      });
      expect(out.calendarCode).toBe('MONTHLY');
    });
  });

  describe('SOCIAL_INSURANCE', () => {
    it('rejects employerPct over 50', () => {
      expect(() =>
        validatePayload('SOCIAL_INSURANCE', {
          schemeCode: 'GOSI_SAUDI',
          countryCode: 'SA',
          applicableTo: 'SAUDI',
          employerPct: 51,
          employeePct: 9.75,
          effectiveFrom: '2026-01-01',
        })
      ).toThrow(ConfigValidationError);
    });

    it('accepts a valid GOSI Saudi scheme', () => {
      const out = validatePayload<{ schemeCode: string }>('SOCIAL_INSURANCE', {
        schemeCode: 'GOSI_SAUDI',
        countryCode: 'SA',
        applicableTo: 'SAUDI',
        employerPct: 11.75,
        employeePct: 9.75,
        wageFloor: 1500,
        wageCeiling: 45000,
        effectiveFrom: '2026-01-01',
      });
      expect(out.schemeCode).toBe('GOSI_SAUDI');
    });
  });

  describe('NATIONALISATION', () => {
    it('accepts a valid Emiratisation target', () => {
      const out = validatePayload<{ programmeCode: string; targetPct: number }>('NATIONALISATION', {
        programmeCode: 'EMIRATISATION',
        countryCode: 'AE',
        effectiveYear: 2026,
        targetPct: 4,
        appliesAtHeadcount: 50,
        finePerMissedHire: 7000,
        finePerMissedHireCurrency: 'AED',
      });
      expect(out.programmeCode).toBe('EMIRATISATION');
      expect(out.targetPct).toBe(4);
    });

    it('rejects targetPct over 100', () => {
      expect(() =>
        validatePayload('NATIONALISATION', {
          programmeCode: 'NITAQAT',
          countryCode: 'SA',
          effectiveYear: 2026,
          targetPct: 150,
        })
      ).toThrow(ConfigValidationError);
    });

    it('rejects unknown programme code', () => {
      expect(() =>
        validatePayload('NATIONALISATION', {
          programmeCode: 'GENERIC',
          countryCode: 'AE',
          effectiveYear: 2026,
          targetPct: 5,
        })
      ).toThrow(ConfigValidationError);
    });
  });

  describe('IMMIGRATION', () => {
    it('accepts a valid work-permit visa category', () => {
      const out = validatePayload<{ visaCategory: string }>('IMMIGRATION', {
        visaCategory: 'WORK_PERMIT_STANDARD',
        countryCode: 'AE',
        sponsor: 'EMPLOYER',
        durationMonths: 24,
        authorityCode: 'MOHRE',
      });
      expect(out.visaCategory).toBe('WORK_PERMIT_STANDARD');
    });

    it('rejects sponsor outside the enum', () => {
      expect(() =>
        validatePayload('IMMIGRATION', {
          visaCategory: 'WORK_PERMIT',
          countryCode: 'AE',
          sponsor: 'AGENCY',
          durationMonths: 12,
          authorityCode: 'MOHRE',
        })
      ).toThrow(ConfigValidationError);
    });

    it('rejects negative duration', () => {
      expect(() =>
        validatePayload('IMMIGRATION', {
          visaCategory: 'WORK_PERMIT',
          countryCode: 'AE',
          sponsor: 'EMPLOYER',
          durationMonths: 0,
          authorityCode: 'MOHRE',
        })
      ).toThrow(ConfigValidationError);
    });
  });

  describe('BENEFITS', () => {
    it('accepts a valid medical plan', () => {
      const out = validatePayload<{ planCode: string }>('BENEFITS', {
        planCode: 'GULF_MEDICAL_GOLD',
        category: 'MEDICAL',
        eligibility: 'ALL',
        dependentsCovered: true,
      });
      expect(out.planCode).toBe('GULF_MEDICAL_GOLD');
    });

    it('rejects unknown category', () => {
      expect(() =>
        validatePayload('BENEFITS', {
          planCode: 'X',
          category: 'CRYPTO',
          eligibility: 'ALL',
        })
      ).toThrow(ConfigValidationError);
    });

    it('rejects malformed currency code (must be ISO-4217)', () => {
      expect(() =>
        validatePayload('BENEFITS', {
          planCode: 'AIR_TICKET_HOME',
          category: 'TICKET',
          eligibility: 'GRADE_BASED',
          currency: 'dollars', // not 3-letter
        })
      ).toThrow(ConfigValidationError);
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
