'use client';

/**
 * EPIC-23 — Water-quality cadence evaluator page.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function WelfareWaterPage() {
  return (
    <EvaluatorPage
      title="Water-quality test cadence"
      titleAr="دورة فحص جودة المياه"
      description="Audit water-quality testing cadence per parameter. MoHRE / labour-camp standard."
      descriptionAr="مراجعة دورة فحص جودة المياه حسب المعايير."
      fields={[
        {
          name: 'tests',
          label: 'Water quality tests',
          labelAr: 'سجلات الفحص',
          type: 'structured-array',
          required: false,
          columns: [
            {
              key: 'parameter',
              label: 'Parameter',
              labelAr: 'المؤشر',
              type: 'select',
              options: [
                { value: 'MICROBIOLOGICAL', label: 'Microbiological' },
                { value: 'TDS', label: 'TDS' },
                { value: 'RESIDUAL_CHLORINE', label: 'Residual Chlorine' },
                { value: 'PH', label: 'pH' },
                { value: 'HEAVY_METALS', label: 'Heavy Metals' },
              ],
              widthClass: 'w-40',
              required: true,
            },
            {
              key: 'testedAt',
              label: 'Tested at',
              labelAr: 'تاريخ الفحص',
              type: 'date',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'certifiedLab',
              label: 'Certified lab',
              labelAr: 'مختبر معتمد',
              type: 'boolean',
              widthClass: 'w-28',
            },
            {
              key: 'passed',
              label: 'Passed',
              labelAr: 'مقبول',
              type: 'boolean',
              widthClass: 'w-24',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/accommodation-compliance/welfare-ops' }}
      buildPayload={(v) => ({
        action: 'water',
        input: {
          tests: ((v.tests as Array<Record<string, unknown>>) ?? []).map((r) => ({
            parameter: String(r.parameter ?? 'MICROBIOLOGICAL'),
            testedAt: r.testedAt
              ? new Date(String(r.testedAt)).toISOString()
              : new Date().toISOString(),
            certifiedLab: Boolean(r.certifiedLab),
            passed: Boolean(r.passed),
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.failures.length === 0 ? 'PASS' : 'FAIL',
          title: `${v.totals.coveragePct}% coverage`,
          reason:
            v.failures.length === 0
              ? 'All water-quality parameters within cadence.'
              : `${v.failures.length} failure(s) found across ${v.totals.parametersInScope} parameters.`,
          breakdown: [
            { label: 'In scope', value: String(v.totals.parametersInScope) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Failed', value: String(v.totals.failed) },
          ],
        };
      }}
    />
  );
}
