'use client';

/**
 * EPIC-12 Fatigue / overtime safety evaluator page.
 *
 * Calls POST /api/v1/overtime-compliance/fatigue-assessment.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FatigueAssessmentPage() {
  return (
    <EvaluatorPage
      title="Fatigue assessment"
      titleAr="تقييم الإجهاد"
      description="Assess the fatigue + safety risk of a proposed work block given the employee's prior 7-day workload."
      descriptionAr="تقييم خطر الإجهاد لجدول عمل مقترح بناءً على عبء آخر 7 أيام."
      fields={[
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        { name: 'countryCode', label: 'Country code', type: 'text', placeholder: 'AE' },
        {
          name: 'hoursLast7Days',
          label: 'Hours worked (last 7 days)',
          type: 'number',
          required: true,
        },
        {
          name: 'consecutiveDays',
          label: 'Consecutive days worked',
          type: 'number',
          required: true,
        },
        {
          name: 'restHoursSinceLastShift',
          label: 'Rest hours since last shift',
          type: 'number',
          required: true,
        },
        {
          name: 'proposedHours',
          label: 'Proposed shift hours',
          type: 'number',
          required: true,
        },
        { name: 'role', label: 'Safety-critical role', type: 'text', placeholder: 'DRIVER' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/overtime-compliance/fatigue-assessment' }}
      buildPayload={(v) => ({
        employeeId: v.employeeId,
        countryCode: v.countryCode || undefined,
        role: v.role || undefined,
        measured: {
          hoursLast7Days: Number(v.hoursLast7Days),
          consecutiveDays: Number(v.consecutiveDays),
          restHoursSinceLastShift: Number(v.restHoursSinceLastShift),
          proposedHours: Number(v.proposedHours),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.allow ? (v.warnings?.length ? 'WARN' : 'PASS') : 'FAIL',
          title: v.band ?? 'Fatigue verdict',
          reason: v.reasonEn ?? v.reason ?? '',
          reasonAr: v.reasonAr,
          severity: v.band,
          breakdown: [
            { label: 'Hours last 7 days', value: String(v.measured?.hoursLast7Days ?? '—') },
            { label: 'Consecutive days', value: String(v.measured?.consecutiveDays ?? '—') },
            { label: 'Rest hrs', value: String(v.measured?.restHoursSinceLastShift ?? '—') },
            { label: 'Proposed hrs', value: String(v.measured?.proposedHours ?? '—') },
            { label: 'Risk score', value: String(v.riskScore ?? '—') },
          ],
        };
      }}
    />
  );
}
