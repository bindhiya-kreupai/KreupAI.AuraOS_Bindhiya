'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function WhistleblowerSlaPage() {
  return (
    <EvaluatorPage
      title="Whistleblower — case cycle SLA"
      titleAr="اتفاقية مستوى الخدمة لدورة البلاغات"
      description="Score each case against triage, investigation, and closure targets — surface breaches and at-risk cases."
      descriptionAr="تقييم كل قضية مقابل أهداف الفرز والتحقيق والإغلاق."
      fields={[
        {
          name: 'triageDays',
          label: 'Triage SLA (days)',
          labelAr: 'فرز',
          type: 'number',
          required: true,
          defaultValue: '5',
        },
        {
          name: 'investigationDays',
          label: 'Investigation SLA (days)',
          labelAr: 'تحقيق',
          type: 'number',
          required: true,
          defaultValue: '30',
        },
        {
          name: 'closureDays',
          label: 'Closure SLA (days)',
          labelAr: 'إغلاق',
          type: 'number',
          required: true,
          defaultValue: '90',
        },
        {
          name: 'cases',
          label: 'Cases',
          labelAr: 'القضايا',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'caseId',
              label: 'Case ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'intakeAt',
              label: 'Intake',
              labelAr: 'استلام',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'triagedAt',
              label: 'Triaged',
              labelAr: 'فرز',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'investigationStartedAt',
              label: 'Investigation start',
              labelAr: 'بدء التحقيق',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'closedAt',
              label: 'Closed',
              labelAr: 'إغلاق',
              type: 'text',
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/whistleblower-compliance/cases' }}
      buildPayload={(v) => ({
        action: 'sla',
        input: {
          config: {
            triageDays: Number(v.triageDays ?? 5),
            investigationDays: Number(v.investigationDays ?? 30),
            closureDays: Number(v.closureDays ?? 90),
          },
          cases: ((v.cases as Array<Record<string, unknown>>) ?? []).map((c) => ({
            caseId: String(c.caseId ?? ''),
            intakeAt: new Date(String(c.intakeAt)).toISOString(),
            triagedAt: c.triagedAt ? new Date(String(c.triagedAt)).toISOString() : undefined,
            investigationStartedAt: c.investigationStartedAt
              ? new Date(String(c.investigationStartedAt)).toISOString()
              : undefined,
            closedAt: c.closedAt ? new Date(String(c.closedAt)).toISOString() : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.breachPct > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.breaches} of ${v.totals.cases} case(s) breached SLA (${v.totals.breachPct}%)`,
          reason:
            v.totals.breaches > 0 ? 'Review the breached stages.' : 'All cases within SLA targets.',
          reasonAr:
            v.totals.breaches > 0 ? 'يرجى مراجعة المراحل المتأخرة' : 'جميع القضايا ضمن الأهداف',
          breakdown: [
            { label: 'Cases', value: String(v.totals.cases) },
            { label: 'Breaches', value: String(v.totals.breaches) },
            { label: 'Breach %', value: String(v.totals.breachPct) },
            { label: 'Triage SLA', value: `${v.config.triageDays}d` },
            { label: 'Investigation SLA', value: `${v.config.investigationDays}d` },
            { label: 'Closure SLA', value: `${v.config.closureDays}d` },
          ],
        };
      }}
    />
  );
}
