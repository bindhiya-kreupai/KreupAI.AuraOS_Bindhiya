'use client';

/**
 * EPIC-21 Holiday-leave overlap evaluator page.
 *
 * Calls POST /api/v1/holidays-compliance/leave-overlap.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function HolidayLeaveOverlapPage() {
  return (
    <EvaluatorPage
      title="Holiday + leave overlap"
      titleAr="تداخل العطل والإجازات"
      description="Compute the leave-balance deduction after netting confirmed and provisional public holidays inside the leave window."
      descriptionAr="حساب رصيد الإجازة بعد خصم العطل الرسمية المؤكدة والمؤقتة داخل النافذة."
      fields={[
        { name: 'startDate', label: 'Leave start date', type: 'date', required: true },
        { name: 'endDate', label: 'Leave end date', type: 'date', required: true },
        { name: 'halfDayStart', label: 'Half-day at start', type: 'boolean' },
        { name: 'halfDayEnd', label: 'Half-day at end', type: 'boolean' },
        {
          name: 'holidaysJson',
          label: 'Holidays (JSON array)',
          type: 'text',
          required: true,
          placeholder:
            '[{"date":"2026-06-05","label":"Eid","holidayClass":"PUBLIC","state":"CONFIRMED"}]',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/holidays-compliance/leave-overlap' }}
      buildPayload={(v) => {
        let holidays: unknown = [];
        try {
          holidays = JSON.parse(v.holidaysJson);
        } catch {
          holidays = [];
        }
        return {
          leave: {
            startDate: v.startDate,
            endDate: v.endDate,
            halfDayStart: v.halfDayStart === 'true',
            halfDayEnd: v.halfDayEnd === 'true',
          },
          holidays,
        };
      }}
      buildVerdict={(data: any) => {
        const r = data?.result;
        if (!r) return null;
        return {
          outcome: r.requiresRerunOnConfirmation ? 'WARN' : 'PASS',
          title: `${r.adjustedLeaveDays} day(s) deducted`,
          reason: r.requiresRerunOnConfirmation
            ? 'Provisional holidays present — re-run after Eid moon-sighting confirmation.'
            : 'All overlap holidays are CONFIRMED; deduction is final.',
          severity: r.requiresRerunOnConfirmation ? 'PROVISIONAL' : undefined,
          breakdown: [
            { label: 'Total days', value: String(data?.totalDays ?? 0) },
            { label: 'Holiday overlap days', value: String(r.holidayDays ?? 0) },
            { label: 'Provisional days', value: String(r.provisionalDays ?? 0) },
            { label: 'Adjusted leave days', value: String(r.adjustedLeaveDays ?? 0) },
          ],
        };
      }}
    />
  );
}
