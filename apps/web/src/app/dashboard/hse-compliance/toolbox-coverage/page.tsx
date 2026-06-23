'use client';

/**
 * EPIC-24 HSE toolbox-talk coverage evaluator.
 *
 * Calls POST /api/v1/hse-compliance/safety-management with action='toolbox'.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ToolboxCoveragePage() {
  return (
    <EvaluatorPage
      title="Toolbox-talk coverage"
      titleAr="تغطية جلسات السلامة"
      description="Identify employees who are overdue for the periodic toolbox safety talk."
      descriptionAr="تحديد الموظفين المتأخرين عن حضور جلسات السلامة الدورية."
      fields={[
        { name: 'asOf', label: 'As of', type: 'date' },
        { name: 'cadenceDays', label: 'Cadence (days)', type: 'number', defaultValue: '7' },
        {
          name: 'employeesJson',
          label: 'Employees (JSON)',
          type: 'text',
          required: true,
          placeholder: '[{"employeeId":"E1"}]',
        },
        {
          name: 'attendancesJson',
          label: 'Attendances (JSON)',
          type: 'text',
          required: true,
          placeholder: '[{"employeeId":"E1","attendedAt":"2026-06-10"}]',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hse-compliance/safety-management' }}
      buildPayload={(v) => ({
        action: 'toolbox',
        input: {
          asOf: v.asOf || new Date().toISOString().slice(0, 10),
          cadenceDays: v.cadenceDays ? Number(v.cadenceDays) : undefined,
          employees: safeParse(v.employeesJson),
          attendances: safeParse(v.attendancesJson),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: (v.totals.overdue === 0 ? 'PASS' : 'WARN') as 'PASS' | 'WARN',
          title: `${v.totals.coveragePct}% coverage`,
          reason:
            v.totals.overdue > 0
              ? `${v.totals.overdue} employee(s) overdue for their toolbox talk.`
              : 'All employees within cadence.',
          severity: v.totals.overdue > 0 ? 'OVERDUE' : undefined,
          breakdown: [
            { label: 'In scope', value: String(v.totals.employeesInScope) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Coverage %', value: String(v.totals.coveragePct) },
          ],
        };
      }}
    />
  );
}

function safeParse(input: unknown): unknown {
  try {
    return JSON.parse(String(input ?? ''));
  } catch {
    return [];
  }
}
