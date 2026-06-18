'use client';

/**
 * EPIC-36 Rule-pack simulation evaluator page.
 *
 * Calls POST /api/v1/gcc-rule-library/simulate.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RuleSimulationPage() {
  return (
    <EvaluatorPage
      title="Rule-pack override simulation"
      titleAr="محاكاة تجاوزات حزم القواعد"
      description="Dry-run a proposed rule-pack override to see which decisions would change before publishing it."
      descriptionAr="محاكاة تجاوز قاعدة لمعرفة القرارات التي ستتأثر قبل النشر."
      fields={[
        {
          name: 'countryCode',
          label: 'Country code',
          type: 'text',
          required: true,
          defaultValue: 'AE',
        },
        {
          name: 'overridesJson',
          label: 'Proposed overrides (JSON array)',
          type: 'text',
          required: true,
          placeholder: '[{"domain":"GOSI","ruleKey":"EMPLOYER_RATE","value":0.115}]',
          helpText: 'Each entry: { domain, ruleKey, value, effectiveFrom? }',
        },
        { name: 'sampleSize', label: 'Sample size (optional)', type: 'number' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/gcc-rule-library/simulate' }}
      buildPayload={(v) => {
        let overrides: unknown = [];
        try {
          overrides = JSON.parse(v.overridesJson);
        } catch {
          overrides = [];
        }
        return {
          countryCode: v.countryCode,
          proposedOverrides: overrides,
          scope: v.sampleSize ? { sampleSize: Number(v.sampleSize) } : undefined,
        };
      }}
      buildVerdict={(data: any) => {
        const r = data?.result;
        if (!r) return null;
        return {
          outcome: r.totals.differing > 0 ? 'WARN' : 'PASS',
          title: `${r.totals.differing} of ${r.totals.sampled} decision(s) would change`,
          reason:
            r.totals.differing > 0
              ? `Publishing this override would change ${r.totals.differing} resolved value(s). Net numeric delta: ${r.totals.netNumericDelta}.`
              : 'No diff against the current rule pack — safe to publish.',
          severity: r.totals.differing > 0 ? 'IMPACT' : undefined,
          breakdown: [
            { label: 'Country', value: String(r.countryCode) },
            { label: 'Sampled', value: String(r.totals.sampled) },
            { label: 'Differing', value: String(r.totals.differing) },
            { label: 'Net numeric Δ', value: String(r.totals.netNumericDelta) },
          ],
        };
      }}
    />
  );
}
