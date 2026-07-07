'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function AckCoveragePage() {
  return (
    <EvaluatorPage
      title="Policy lifecycle — acknowledgement coverage"
      titleAr="نسبة إقرار السياسات"
      description="Measure the % of the target audience that has acknowledged each policy version within the configured window."
      descriptionAr="قياس نسبة المخاطبين الذين أقروا بالسياسة ضمن النافذة."
      fields={[
        {
          name: 'requirements',
          label: 'Requirements (audience comma-separated)',
          labelAr: 'المتطلبات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'policyId',
              label: 'Policy ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'publishedAt',
              label: 'Published',
              labelAr: 'تاريخ النشر',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'ackWindowDays',
              label: 'Window (days)',
              labelAr: 'النافذة',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'audience',
              label: 'Audience (CSV)',
              labelAr: 'المخاطبون',
              type: 'text',
              required: true,
              widthClass: 'w-60',
            },
          ],
        },
        {
          name: 'records',
          label: 'Acknowledgements',
          labelAr: 'الإقرارات',
          type: 'structured-array',
          columns: [
            {
              key: 'policyId',
              label: 'Policy ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'employeeId',
              label: 'Employee',
              labelAr: 'الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'acknowledgedAt',
              label: 'Ack at',
              labelAr: 'تاريخ الإقرار',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/policy-lifecycle-compliance/lifecycle' }}
      buildPayload={(v) => ({
        action: 'ack',
        input: {
          requirements: ((v.requirements as Array<Record<string, unknown>>) ?? []).map((r) => ({
            policyId: String(r.policyId ?? ''),
            publishedAt: new Date(String(r.publishedAt)).toISOString(),
            ackWindowDays: Number(r.ackWindowDays ?? 0),
            audience: String(r.audience ?? '')
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
          })),
          records: ((v.records as Array<Record<string, unknown>>) ?? []).map((r) => ({
            policyId: String(r.policyId ?? ''),
            employeeId: String(r.employeeId ?? ''),
            acknowledgedAt: new Date(String(r.acknowledgedAt)).toISOString(),
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue > 0 ? 'WARN' : 'PASS',
          title: `${v.totals.fullyCovered} of ${v.totals.policies} fully covered`,
          reason:
            v.totals.overdue > 0
              ? `${v.totals.overdue} pending acknowledgement(s) past the window.`
              : 'All audiences have responded within window.',
          reasonAr: v.totals.overdue > 0 ? 'إقرارات متأخرة' : 'كل الإقرارات ضمن النافذة',
          breakdown: [
            { label: 'Policies', value: String(v.totals.policies) },
            { label: 'Fully covered', value: String(v.totals.fullyCovered) },
            { label: 'Overdue acks', value: String(v.totals.overdue) },
          ],
        };
      }}
    />
  );
}
