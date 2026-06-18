'use client';

/**
 * EPIC-25 — Performance compliance evaluator (forced-distribution).
 *
 * Calls POST /api/v1/performance-compliance/checks with action=forcedDistribution.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PerformanceComplianceChecksPage() {
  return (
    <EvaluatorPage
      title="Forced-distribution detection"
      titleAr="رصد التوزيع القسري"
      description="Detect drift from the mandated rating distribution across the population."
      descriptionAr="رصد الانحراف عن توزيع التقييمات المعتمد عبر المجموعة."
      fields={[
        {
          name: 'observed',
          label: 'Observed rating counts',
          labelAr: 'التقييمات الفعلية',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'rating',
              label: 'Rating code',
              labelAr: 'رمز التقييم',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'count',
              label: 'Count',
              labelAr: 'العدد',
              type: 'number',
              required: true,
              widthClass: 'w-24',
            },
          ],
        },
        {
          name: 'target',
          label: 'Target distribution',
          labelAr: 'التوزيع المستهدف',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'rating',
              label: 'Rating code',
              labelAr: 'رمز التقييم',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'expectedShare',
              label: 'Expected (0..1)',
              labelAr: 'حصة متوقعة',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'toleranceAbs',
              label: 'Tolerance',
              labelAr: 'حدود التسامح',
              type: 'number',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/performance-compliance/checks' }}
      buildPayload={(v) => ({
        action: 'forcedDistribution',
        observed: ((v.observed as Array<Record<string, unknown>>) ?? []).map((r) => ({
          rating: String(r.rating ?? ''),
          count: Number(r.count ?? 0),
        })),
        target: ((v.target as Array<Record<string, unknown>>) ?? []).map((r) => ({
          rating: String(r.rating ?? ''),
          expectedShare: Number(r.expectedShare ?? 0),
          ...(r.toleranceAbs !== undefined && r.toleranceAbs !== ''
            ? { toleranceAbs: Number(r.toleranceAbs) }
            : {}),
        })),
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.outcome,
          title: v.summary?.en ?? 'Distribution check',
          reason: v.summary?.en ?? '',
          reasonAr: v.summary?.ar,
          breakdown: (v.deviations ?? []).map((d: any) => ({
            label: `${d.rating} (${(d.observedShare * 100).toFixed(1)}% vs ${(d.expectedShare * 100).toFixed(1)}%)`,
            value: `Δ ${(d.deltaAbs * 100).toFixed(1)}%`,
          })),
        };
      }}
    />
  );
}
