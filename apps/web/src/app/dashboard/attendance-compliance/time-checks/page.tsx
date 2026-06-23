'use client';

/**
 * EPIC-28 — Attendance / time compliance evaluator (overtime cap).
 *
 * Calls POST /api/v1/attendance-compliance/time-checks with action=overtimeCap.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function TimeChecksPage() {
  return (
    <EvaluatorPage
      title="Overtime cap evaluator"
      titleAr="فحص حد الساعات الإضافية"
      description="Evaluate weekly and monthly overtime hours against soft and statutory caps."
      descriptionAr="فحص الساعات الإضافية الأسبوعية والشهرية مقابل الحدود المرنة والقانونية."
      fields={[
        {
          name: 'weekHours',
          label: 'Week hours',
          labelAr: 'ساعات الأسبوع',
          type: 'number',
          required: true,
        },
        {
          name: 'monthHours',
          label: 'Month hours',
          labelAr: 'ساعات الشهر',
          type: 'number',
          required: true,
        },
        {
          name: 'weeklySoft',
          label: 'Weekly soft cap',
          labelAr: 'حد أسبوعي مرن',
          type: 'number',
          required: true,
          defaultValue: '8',
        },
        {
          name: 'weeklyHard',
          label: 'Weekly hard cap',
          labelAr: 'حد أسبوعي قانوني',
          type: 'number',
          required: true,
          defaultValue: '12',
        },
        {
          name: 'monthlyHard',
          label: 'Monthly hard cap',
          labelAr: 'حد شهري قانوني',
          type: 'number',
          required: true,
          defaultValue: '60',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/attendance-compliance/time-checks' }}
      buildPayload={(v) => ({
        action: 'overtimeCap',
        window: {
          weekHours: Number(v.weekHours ?? 0),
          monthHours: Number(v.monthHours ?? 0),
        },
        caps: {
          weeklySoftHours: Number(v.weeklySoft ?? 8),
          weeklyHardHours: Number(v.weeklyHard ?? 12),
          monthlyHardHours: Number(v.monthlyHard ?? 60),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.outcome,
          title: `Weekly ${v.utilisationWeeklyPct}% • Monthly ${v.utilisationMonthlyPct}%`,
          reason: v.reasons?.[0]?.en ?? '',
          reasonAr: v.reasons?.[0]?.ar,
          breakdown: v.reasons.map((r: any) => ({ label: r.code, value: r.en })),
        };
      }}
    />
  );
}
