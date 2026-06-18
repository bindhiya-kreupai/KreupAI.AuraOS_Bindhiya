'use client';

/**
 * EPIC-24 HSE PPE coverage evaluator.
 *
 * Calls POST /api/v1/hse-compliance/safety-management with action='ppe'.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PpeCoveragePage() {
  return (
    <EvaluatorPage
      title="PPE coverage"
      titleAr="تغطية معدات الحماية الشخصية"
      description="Evaluate the PPE-issuance + expiry + size coverage of an employee cohort against role-based requirements."
      descriptionAr="تقييم تغطية معدات الحماية الشخصية للموظفين حسب الدور."
      fields={[
        { name: 'asOf', label: 'As of', type: 'date' },
        {
          name: 'employeesJson',
          label: 'Employees (JSON)',
          type: 'text',
          required: true,
          placeholder: '[{"employeeId":"E1","role":"DRIVER"}]',
        },
        {
          name: 'requirementsJson',
          label: 'Requirements (JSON)',
          type: 'text',
          required: true,
          placeholder: '[{"role":"DRIVER","ppeType":"HI_VIS"}]',
        },
        {
          name: 'issuancesJson',
          label: 'Issuances (JSON)',
          type: 'text',
          required: true,
          placeholder:
            '[{"employeeId":"E1","ppeType":"HI_VIS","issuedAt":"2025-01-01","expiresAt":"2026-12-31","hasSize":true}]',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hse-compliance/safety-management' }}
      buildPayload={(v) => ({
        action: 'ppe',
        input: {
          asOf: v.asOf || new Date().toISOString().slice(0, 10),
          employees: safeParse(v.employeesJson),
          requirements: safeParse(v.requirementsJson),
          issuances: safeParse(v.issuancesJson),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: (v.totals.failures === 0 ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
          title: `${v.totals.coveragePct}% coverage`,
          reason:
            v.totals.failures > 0
              ? `${v.totals.failures} PPE failure(s) across ${v.totals.requirementsChecked} requirement(s).`
              : 'All PPE requirements satisfied.',
          severity: v.totals.failures > 0 ? 'GAP' : undefined,
          breakdown: [
            { label: 'In scope', value: String(v.totals.employeesInScope) },
            { label: 'Checked', value: String(v.totals.requirementsChecked) },
            { label: 'Failures', value: String(v.totals.failures) },
            { label: 'Coverage %', value: String(v.totals.coveragePct) },
          ],
        };
      }}
    />
  );
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
