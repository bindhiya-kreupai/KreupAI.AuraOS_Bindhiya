'use client';

/**
 * EPIC-23 Accommodation hygiene safety evaluator.
 *
 * Calls POST /api/v1/accommodation-compliance/safety-controls
 * with action='hygiene'.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function HygienePage() {
  return (
    <EvaluatorPage
      title="Accommodation hygiene check"
      titleAr="فحص النظافة في السكن"
      description="Evaluate hygiene fixture ratios, cleanliness, pest evidence and bedding state for an accommodation unit."
      descriptionAr="تقييم النظافة ونسب المرافق الصحية وحالة السكن."
      fields={[
        { name: 'occupants', label: 'Occupants', type: 'number', required: true },
        { name: 'toiletFixtures', label: 'Toilet fixtures', type: 'number', required: true },
        { name: 'showerFixtures', label: 'Shower fixtures', type: 'number', required: true },
        {
          name: 'cleanlinessScore',
          label: 'Cleanliness score (1-5)',
          type: 'number',
          required: true,
        },
        { name: 'pestEvidence', label: 'Pest evidence', type: 'boolean' },
        { name: 'beddingPoor', label: 'Bedding poor (mildew/torn)', type: 'boolean' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/accommodation-compliance/safety-controls' }}
      buildPayload={(v) => ({
        action: 'hygiene',
        input: {
          occupants: Number(v.occupants),
          toiletFixtures: Number(v.toiletFixtures),
          showerFixtures: Number(v.showerFixtures),
          cleanlinessScore: Number(v.cleanlinessScore),
          pestEvidence: v.pestEvidence === 'true',
          beddingPoor: v.beddingPoor === 'true',
        },
      })}
      buildVerdict={(data: any) => buildSafetyVerdict(data?.verdict)}
    />
  );
}

function buildSafetyVerdict(v: any) {
  if (!v) return null;
  return {
    outcome: (v.pass ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
    title: `${v.band} (${v.score}/100)`,
    reason:
      v.failures?.length > 0
        ? `${v.failures.length} failure(s) detected — see breakdown.`
        : 'All hygiene controls pass.',
    severity: v.band,
    breakdown: [
      { label: 'Score', value: String(v.score) },
      { label: 'Band', value: String(v.band) },
      { label: 'Failures', value: String(v.failures?.length ?? 0) },
      ...(v.failures ?? []).slice(0, 5).map((f: any) => ({ label: f.code, value: f.severity })),
    ],
  };
}
