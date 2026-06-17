/**
 * EPIC-34 — Per-domain payload validators.
 *
 * Closes the 🔴 RED audit finding that workspace scaffolds existed but
 * the "78% of domain validation logic was missing": HrmsConfigObject
 * accepted any JSON payload without per-domain shape enforcement.
 *
 * Each domain code registers a Zod schema. `validatePayload(domainCode,
 * payload)` returns the parsed shape (typed) or throws a structured
 * error. The registry is open — callers can extend it via
 * `registerDomainSchema(domainCode, schema)` for tenant-specific
 * extensions without touching this file.
 *
 * Concrete schemas shipped here are the regulatory floor for the six
 * most consequential workspaces (legal entity, payroll component,
 * EOSB formula, leave, attendance, WPS mapping). The remaining 16
 * workspaces accept any payload until their schemas are registered.
 */

import { z, type ZodSchema } from 'zod';

export class ConfigValidationError extends Error {
  public readonly fieldErrors: Record<string, string[]>;
  constructor(domainCode: string, fieldErrors: Record<string, string[]>) {
    super(`Domain ${domainCode} payload validation failed`);
    this.name = 'ConfigValidationError';
    this.fieldErrors = fieldErrors;
  }
}

// ----------------------------------------------------------------------------
// Built-in schemas
// ----------------------------------------------------------------------------

/** S03 LEGAL_ENTITY — per-entity profile. */
const LegalEntityProfileSchema = z.object({
  name: z.string().min(1).max(200),
  countryCode: z.string().regex(/^[A-Z]{2}$/, 'countryCode must be ISO-3166-1 alpha-2'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'currency must be ISO-4217'),
  fiscalYearStart: z.string().regex(/^\d{2}-\d{2}$/, 'fiscalYearStart must be MM-DD'),
  registrationNumber: z.string().min(1).optional(),
  baseGlAccount: z.string().min(1).optional(),
});

/** S07a PAYROLL_COMPONENT — pay-component definition. */
const PayrollComponentSchema = z.object({
  code: z.string().regex(/^[A-Z][A-Z0-9_]{1,30}$/, 'code must be UPPER_SNAKE'),
  type: z.enum(['EARNING', 'DEDUCTION', 'BENEFIT', 'STATUTORY']),
  taxable: z.boolean(),
  oneTime: z.boolean().default(false),
  formula: z.string().max(1000).optional(),
  glAccount: z.string().optional(),
});

/** S19 EOSB_FORMULA — country-specific gratuity calculation parameters. */
const EosbFormulaSchema = z
  .object({
    firstPeriodDaysPerYear: z.number().positive().max(365),
    secondPeriodDaysPerYear: z.number().positive().max(365).optional(),
    breakpointYears: z.number().nonnegative().max(50).optional(),
    capYears: z.number().positive().max(10).optional(),
    basisField: z.enum(['BASIC', 'BASIC_PLUS_ALLOWANCES', 'LAST_DRAWN']).default('BASIC'),
  })
  .refine(
    (v) => v.secondPeriodDaysPerYear == null || v.breakpointYears != null,
    'breakpointYears is required when secondPeriodDaysPerYear is set'
  );

/** S12 LEAVE — leave-type definition. */
const LeaveTypeSchema = z.object({
  code: z.string().regex(/^[A-Z][A-Z0-9_]{1,30}$/),
  name: z.string().min(1).max(120),
  nameAr: z.string().min(1).max(120).optional(),
  accrualDaysPerYear: z.number().nonnegative().max(120),
  carryForwardMax: z.number().nonnegative().max(120).optional(),
  encashable: z.boolean().default(false),
  requiresApproval: z.boolean().default(true),
  minServiceMonths: z.number().nonnegative().max(360).default(0),
});

/** S13 ATTENDANCE — shift configuration. */
const ShiftSchema = z
  .object({
    shiftCode: z.string().regex(/^[A-Z0-9_-]{1,20}$/),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'startTime must be HH:MM'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'endTime must be HH:MM'),
    breakMinutes: z.number().nonnegative().max(240).default(0),
    graceMinutes: z.number().nonnegative().max(60).default(0),
    nightShift: z.boolean().default(false),
  })
  .refine(
    (v) => v.startTime !== v.endTime,
    'startTime and endTime cannot be identical (zero-duration shift)'
  );

/** S08 WPS_MAPPING — wage protection file mapping. */
const WpsMappingSchema = z.object({
  bankCode: z.string().regex(/^[A-Z0-9]{1,20}$/),
  fileFormat: z.enum(['SIF', 'MUDAD', 'QWPS', 'BAHRAIN_LMRA', 'CSV']),
  employerId: z.string().min(1),
  establishmentName: z.string().min(1).max(200),
  bankAccountIban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/, 'iban must match ISO-13616'),
});

// ----------------------------------------------------------------------------
// Registry
// ----------------------------------------------------------------------------

const DEFAULT_SCHEMAS: Record<string, ZodSchema> = {
  LEGAL_ENTITY: LegalEntityProfileSchema,
  PAYROLL_COMPONENT: PayrollComponentSchema,
  EOSB_FORMULA: EosbFormulaSchema,
  LEAVE: LeaveTypeSchema,
  ATTENDANCE: ShiftSchema,
  WPS_MAPPING: WpsMappingSchema,
};

const registry = new Map<string, ZodSchema>(Object.entries(DEFAULT_SCHEMAS));

/** Register a tenant-specific or third-party domain schema. */
export function registerDomainSchema(domainCode: string, schema: ZodSchema): void {
  registry.set(domainCode, schema);
}

/** Drop a previously registered schema (useful in tests). */
export function unregisterDomainSchema(domainCode: string): void {
  registry.delete(domainCode);
}

/** Read-only list of domains that have validators today. */
export function listValidatedDomains(): string[] {
  return Array.from(registry.keys());
}

/**
 * Validate a config-object payload against the registered domain
 * schema. Domains without a schema are accepted as-is (returns the
 * input unchanged) so existing tenants are never blocked by a future
 * schema addition; only domains with a registered schema enforce it.
 */
export function validatePayload<T = Record<string, unknown>>(
  domainCode: string,
  payload: Record<string, unknown>
): T {
  const schema = registry.get(domainCode);
  if (!schema) return payload as T;
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ConfigValidationError(
      domainCode,
      parsed.error.flatten().fieldErrors as Record<string, string[]>
    );
  }
  return parsed.data as T;
}
