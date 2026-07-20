'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PolicyReviewPage() {
  return (
    <EvaluatorPage
      title="Policy lifecycle — review cadence"
      titleAr="دورية مراجعة السياسات"
      description="Score every active policy against its review cadence and flag those overdue."
      descriptionAr="تقييم كل سياسة مقابل دورتها وتحديد المتأخرة."
      fields={[
        {
          name: 'policies',
          label: 'Policies',
          labelAr: 'السياسات',
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
              key: 'title',
              label: 'Title',
              labelAr: 'العنوان',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
            {
              key: 'reviewCadenceDays',
              label: 'Cadence (days)',
              labelAr: 'الدورية',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'lastReviewedAt',
              label: 'Last reviewed',
              labelAr: 'آخر مراجعة',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'active',
              label: 'Active',
              labelAr: 'فعّال',
              type: 'boolean',
              widthClass: 'w-20',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/policy-lifecycle-compliance/lifecycle' }}
      buildPayload={(v) => ({
        action: 'review',
        input: {
          policies: ((v.policies as Array<Record<string, unknown>>) ?? []).map((p) => ({
            policyId: String(p.policyId ?? ''),
            title: String(p.title ?? ''),
            reviewCadenceDays: Number(p.reviewCadenceDays ?? 0),
            lastReviewedAt: p.lastReviewedAt
              ? new Date(String(p.lastReviewedAt)).toISOString()
              : undefined,
            active: p.active === true || p.active === 'true',
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.overdue} overdue of ${v.totals.policies}`,
          reason:
            v.totals.overdue > 0
              ? 'Schedule reviews for overdue policies.'
              : 'All policies current.',
          reasonAr: v.totals.overdue > 0 ? 'سياسات متأخرة' : 'كل السياسات محدثة',
          breakdown: [
            { label: 'Policies', value: String(v.totals.policies) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Current %', value: String(v.totals.currentPct) },
          ],
        };
      }}
    />
  );
}
