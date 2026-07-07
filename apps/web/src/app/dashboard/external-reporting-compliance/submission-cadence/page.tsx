'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function SubmissionCadencePage() {
  return (
    <EvaluatorPage
      title="External reporting — submission cadence"
      titleAr="دورية التقديم للجهات الرقابية"
      description="Score each active regulator obligation against its filing cadence."
      descriptionAr="تقييم الالتزامات الرقابية مقابل الدورة المطلوبة."
      fields={[
        {
          name: 'obligations',
          label: 'Obligations',
          labelAr: 'الالتزامات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'obligationId',
              label: 'ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'regulator',
              label: 'Regulator',
              labelAr: 'الجهة',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'cadenceDays',
              label: 'Cadence (days)',
              labelAr: 'الدورية',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'lastSubmittedAt',
              label: 'Last submitted',
              labelAr: 'آخر تقديم',
              type: 'text',
              widthClass: 'w-40',
            },
            { key: 'active', label: 'Active', labelAr: 'نشط', type: 'boolean', widthClass: 'w-24' },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/external-reporting-compliance/reporting' }}
      buildPayload={(v) => ({
        action: 'submissions',
        input: {
          obligations: ((v.obligations as Array<Record<string, unknown>>) ?? []).map((o) => ({
            obligationId: String(o.obligationId ?? ''),
            regulator: String(o.regulator ?? ''),
            cadenceDays: Number(o.cadenceDays ?? 0),
            lastSubmittedAt: o.lastSubmittedAt
              ? new Date(String(o.lastSubmittedAt)).toISOString()
              : undefined,
            active: o.active === true || o.active === 'true',
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.overdue} overdue of ${v.totals.obligations}`,
          reason:
            v.totals.overdue > 0 ? 'Submit overdue filings immediately.' : 'All filings current.',
          reasonAr: v.totals.overdue > 0 ? 'تقديمات متأخرة' : 'كل التقديمات محدثة',
          breakdown: [
            { label: 'Obligations', value: String(v.totals.obligations) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Current %', value: String(v.totals.currentPct) },
          ],
        };
      }}
    />
  );
}
