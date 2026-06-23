/**
 * EPIC-29 — Payroll compliance checks.
 *
 * Actions:
 *   { action: 'minWage', ... }       → minimum-wage enforcer per country
 *   { action: 'reconcileDeductions' } → statutory-deduction reconciliation
 *   { action: 'payslipCompleteness' } → mandatory-fields completeness
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  checkPayslipCompleteness,
  enforceMinimumWage,
  reconcileStatutoryDeductions,
} from '@/lib/services/payroll-compliance/payroll-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const minWageSchema = z.object({
  action: z.literal('minWage'),
  countryCode: z.string().min(2),
  basicSalary: z.number().min(0),
  currency: z.string().min(1),
  isNational: z.boolean(),
  overridePolicy: z
    .object({
      countryCode: z.string().min(2),
      nationalMin: z.number().min(0),
      nonNationalMin: z.number().min(0),
      currency: z.string().min(1),
    })
    .optional(),
});

const dedRecSchema = z.object({
  action: z.literal('reconcileDeductions'),
  payslip: z.array(z.object({ code: z.string().min(1), amount: z.number() })),
  remittance: z.array(z.object({ code: z.string().min(1), amount: z.number() })),
  toleranceAbs: z.number().min(0).optional(),
});

const payslipSchema = z.object({
  action: z.literal('payslipCompleteness'),
  countryCode: z.string().min(2),
  payslip: z.object({
    employeeId: z.string().optional(),
    employeeName: z.string().optional(),
    employerName: z.string().optional(),
    payPeriodStart: z.string().optional(),
    payPeriodEnd: z.string().optional(),
    basicSalary: z.number().optional(),
    allowances: z.number().optional(),
    deductions: z.number().optional(),
    netPay: z.number().optional(),
    wpsReference: z.string().optional(),
    gosiAmount: z.number().optional(),
  }),
});

const inputSchema = z.discriminatedUnion('action', [minWageSchema, dedRecSchema, payslipSchema]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'payroll_compliance:read',
      'payroll_compliance:manage',
      'payroll:read',
      'payroll:manage',
      'dashboard:read'
    )
  ) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    if (body.action === 'minWage') {
      const verdict = enforceMinimumWage({
        countryCode: body.countryCode,
        basicSalary: body.basicSalary,
        currency: body.currency,
        isNational: body.isNational,
        overridePolicy: body.overridePolicy,
      });
      return ok({ verdict });
    }
    if (body.action === 'reconcileDeductions') {
      const verdict = reconcileStatutoryDeductions({
        payslip: body.payslip,
        remittance: body.remittance,
        toleranceAbs: body.toleranceAbs,
      });
      return ok({ verdict });
    }
    const verdict = checkPayslipCompleteness({
      countryCode: body.countryCode,
      payslip: body.payslip,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate payroll compliance check', err);
  }
});
