'use client';

/**
 * EPIC-24 HSE emergency-drill cadence evaluator.
 *
 * Calls POST /api/v1/hse-compliance/safety-management with action='drill'.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DrillCadencePage() {
  return (
    <EvaluatorPage
      title="Emergency-drill cadence"
      titleAr="دورية تدريبات الطوارئ"
      description="Identify which emergency drill types (FIRE / EARTHQUAKE / CHEMICAL / EVACUATION_GENERAL) are overdue."
      descriptionAr="تحديد تدريبات الطوارئ المتأخرة عن الدورة الزمنية."
      fields={[
        { name: 'asOf', label: 'As of', type: 'date' },
        {
          name: 'drillsJson',
          label: 'Drills (JSON)',
          type: 'text',
          required: true,
          placeholder:
            '[{"drillType":"FIRE","conductedAt":"2026-03-01","attendancePct":92,"passed":true}]',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hse-compliance/safety-management' }}
      buildPayload={(v) => ({
        action: 'drill',
        input: {
          asOf: v.asOf || new Date().toISOString().slice(0, 10),
          drills: safeParse(v.drillsJson),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: (v.totals.overdue === 0 ? 'PASS' : 'WARN') as 'PASS' | 'WARN',
          title: `${v.totals.coveragePct}% drill coverage`,
          reason:
            v.totals.overdue > 0
              ? `${v.totals.overdue} drill type(s) overdue.`
              : 'All drill types within cadence.',
          severity: v.totals.overdue > 0 ? 'OVERDUE' : undefined,
          breakdown: [
            { label: 'Drill types', value: String(v.totals.drillTypesInScope) },
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
