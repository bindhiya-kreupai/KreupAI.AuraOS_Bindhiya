'use client';

/**
 * EPIC-13 GOSI obligation calendar evaluator page.
 *
 * Calls POST /api/v1/gosi-compliance/obligation-calendar with a
 * structured-array list of wage months and their satisfaction flags.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function GosiObligationCalendarPage() {
  return (
    <EvaluatorPage
      title="GOSI obligation calendar"
      titleAr="تقويم التزامات التأمينات الاجتماعية"
      description="Project monthly wage-filing and contribution-settlement deadlines with weekend shift and 30-day grace window."
      descriptionAr="إسقاط مواعيد إرسال الأجور وسداد الاشتراكات الشهرية مع تعديل عطلة نهاية الأسبوع ومهلة 30 يوماً."
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
          label: 'Wage months (YYYY-MM-01) and status',
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
      endpoint={{ method: 'POST', url: '/api/v1/gosi-compliance/obligation-calendar' }}
      buildPayload={(v) => {
        const rows = (v.months as Array<Record<string, unknown>>) ?? [];
        const months = rows
          .filter((r) => r.wageMonth)
          .map((r) => ({
            wageMonth: new Date(String(r.wageMonth)).toISOString(),
            wageFiled: Boolean(r.wageFiled),
            contributionSettled: Boolean(r.contributionSettled),
          }));
        return {
          asOf: v.asOf ? new Date(String(v.asOf)).toISOString() : undefined,
          months,
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const overdue = v.totals?.overdue ?? 0;
        const penalty = v.totals?.penaltyAccruing ?? 0;
        const outcome: 'PASS' | 'WARN' | 'FAIL' =
          penalty > 0 ? 'FAIL' : overdue > 0 || v.totals?.dueSoon > 0 ? 'WARN' : 'PASS';
        return {
          outcome,
          title:
            overdue + penalty === 0
              ? `${v.totals?.open ?? 0} obligation(s) pending`
              : `${overdue + penalty} obligation(s) overdue`,
          reason: `Open: ${v.totals?.open ?? 0} · Due soon: ${v.totals?.dueSoon ?? 0} · Overdue: ${overdue} · Penalty accruing: ${penalty}`,
          breakdown: (v.rows ?? []).slice(0, 24).map((r: any) => ({
            label: `${r.wageMonth} ${r.kind}`,
            value: `${r.severity} · due ${r.effectiveDeadline?.toString?.()?.slice(0, 10) ?? ''}`,
          })),
        };
      }}
    />
  );
}
