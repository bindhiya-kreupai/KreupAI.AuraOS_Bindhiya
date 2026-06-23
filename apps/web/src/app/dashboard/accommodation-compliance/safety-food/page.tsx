'use client';

/**
 * EPIC-23 Accommodation food safety evaluator.
 *
 * Calls POST /api/v1/accommodation-compliance/safety-controls
 * with action='food'.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FoodSafetyPage() {
  return (
    <EvaluatorPage
      title="Accommodation food safety"
      titleAr="سلامة الغذاء في السكن"
      description="Evaluate cold-storage temp, hot-holding temp, food-handler health cards, pest control and sanitation."
      descriptionAr="تقييم سلامة الغذاء في وحدة السكن."
      fields={[
        { name: 'coldStorageTempOk', label: 'Cold-storage temp OK', type: 'boolean' },
        { name: 'hotHoldingTempOk', label: 'Hot-holding temp OK', type: 'boolean' },
        {
          name: 'handlersHealthCardsValid',
          label: 'Food handlers health cards valid',
          type: 'boolean',
        },
        {
          name: 'pestControlQuarterly',
          label: 'Quarterly pest control performed',
          type: 'boolean',
        },
        { name: 'pestEvidenceInPrep', label: 'Pest evidence in prep area', type: 'boolean' },
        {
          name: 'sanitationScore',
          label: 'Sanitation score (1-5)',
          type: 'number',
          required: true,
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/accommodation-compliance/safety-controls' }}
      buildPayload={(v) => ({
        action: 'food',
        input: {
          coldStorageTempOk: v.coldStorageTempOk === 'true',
          hotHoldingTempOk: v.hotHoldingTempOk === 'true',
          handlersHealthCardsValid: v.handlersHealthCardsValid === 'true',
          pestControlQuarterly: v.pestControlQuarterly === 'true',
          pestEvidenceInPrep: v.pestEvidenceInPrep === 'true',
          sanitationScore: Number(v.sanitationScore),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: (v.pass ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
          title: `${v.band} (${v.score}/100)`,
          reason:
            v.failures?.length > 0
              ? `${v.failures.length} food-safety failure(s) detected.`
              : 'Food-safety controls satisfied.',
          severity: v.band,
          breakdown: [
            { label: 'Score', value: String(v.score) },
            { label: 'Band', value: String(v.band) },
            { label: 'Failures', value: String(v.failures?.length ?? 0) },
            ...(v.failures ?? [])
              .slice(0, 6)
              .map((f: any) => ({ label: f.code, value: f.severity })),
          ],
        };
      }}
    />
  );
}
