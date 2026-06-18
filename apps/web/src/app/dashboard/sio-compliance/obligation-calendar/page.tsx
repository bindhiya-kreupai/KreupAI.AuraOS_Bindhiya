'use client';

/**
 * EPIC-15 Bahrain — SIO contribution due-date evaluator page.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function SioObligationCalendarPage() {
  return (
    <EvaluatorPage
      title="SIO contribution obligation calendar"
      titleAr="تقويم التزامات التأمينات الاجتماعية البحرين"
      description="Project monthly SIO wage filing + contribution settlement deadlines with Bahrain weekend shift."
      descriptionAr="إسقاط مواعيد إرسال الأجور وسداد الاشتراكات الشهرية للتأمينات مع تعديل عطلة نهاية الأسبوع."
      fields={[
        {
          name: 'asOf',
          label: 'Evaluation date',
          labelAr: 'تاريخ التقييم',
          type: 'date',
          required: true,
        },
        {
          name: 'months',
          label: 'Wage months and status',
          labelAr: 'أشهر الأجور وحالتها',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'wageMonth',
              label: 'Wage month (YYYY-MM-01)',
              labelAr: 'شهر الأجر',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'wageFiled',
              label: 'Wages filed?',
              labelAr: 'تم إرسال الأجور؟',
              type: 'boolean',
              widthClass: 'w-32',
            },
            {
              key: 'contributionSettled',
              label: 'Contribution settled?',
              labelAr: 'تم سداد الاشتراك؟',
              type: 'boolean',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/sio-compliance/bahrain-permit-calendar' }}
      buildPayload={(v) => {
        const rows = (v.months as Array<Record<string, unknown>>) ?? [];
        return {
          action: 'sio',
          input: {
            asOf: v.asOf ? new Date(String(v.asOf)).toISOString() : undefined,
            months: rows
              .filter((r) => r.wageMonth)
              .map((r) => ({
                wageMonth: new Date(String(r.wageMonth)).toISOString(),
                wageFiled: Boolean(r.wageFiled),
                contributionSettled: Boolean(r.contributionSettled),
              })),
          },
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const outcome: 'PASS' | 'WARN' | 'FAIL' =
          (v.totals?.penaltyAccruing ?? 0) > 0
            ? 'FAIL'
            : (v.totals?.overdue ?? 0) > 0 || (v.totals?.dueSoon ?? 0) > 0
              ? 'WARN'
              : 'PASS';
        return {
          outcome,
          title: `${v.totals?.open ?? 0} obligation(s) pending`,
          reason: `Open ${v.totals?.open ?? 0} · Due soon ${v.totals?.dueSoon ?? 0} · Overdue ${v.totals?.overdue ?? 0} · Penalty ${v.totals?.penaltyAccruing ?? 0}`,
          breakdown: (v.rows ?? []).slice(0, 24).map((r: any) => ({
            label: `${r.wageMonth} · ${r.kind}`,
            value: `${r.severity} · ${r.reason}`,
          })),
        };
      }}
    />
  );
}
