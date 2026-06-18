'use client';

/**
 * EPIC-36 Rule-pack simulation evaluator page.
 *
 * Calls POST /api/v1/gcc-rule-library/simulate.
 *
 * The proposedOverrides input is a structured array editor (one row
 * per override) — replaces the prior "paste JSON" textarea hack.
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
          labelAr: 'رمز الدولة',
          type: 'text',
          required: true,
          defaultValue: 'AE',
          placeholder: 'AE / SA / BH / QA / OM / KW',
        },
        {
          name: 'sampleSize',
          label: 'Sample size (optional)',
          labelAr: 'حجم العينة (اختياري)',
          type: 'number',
          placeholder: '50',
        },
        {
          name: 'proposedOverrides',
          label: 'Proposed overrides',
          labelAr: 'التجاوزات المقترحة',
          type: 'structured-array',
          required: true,
          helpText:
            'Each row is one (domain, ruleKey, value) tuple. The simulator compares each against the currently-active rule pack.',
          helpTextAr:
            'كل صف هو زوج (نطاق، مفتاح، قيمة). يقارن المحاكي كل واحد بالحزمة النشطة حالياً.',
          minRows: 1,
          defaultRows: [{ domain: 'GOSI', ruleKey: 'EMPLOYER_RATE', value: 0.115 }],
          columns: [
            {
              key: 'domain',
              label: 'Domain',
              labelAr: 'النطاق',
              type: 'text',
              required: true,
              placeholder: 'GOSI / WPS / EOSB / EMIRATISATION',
              widthClass: 'w-40',
            },
            {
              key: 'ruleKey',
              label: 'Rule key',
              labelAr: 'مفتاح القاعدة',
              type: 'text',
              required: true,
              placeholder: 'EMPLOYER_RATE',
              widthClass: 'w-56',
            },
            {
              key: 'value',
              label: 'Proposed value',
              labelAr: 'القيمة المقترحة',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/gcc-rule-library/simulate' }}
      buildPayload={(v) => ({
        countryCode: v.countryCode,
        proposedOverrides: (v.proposedOverrides as unknown[]) ?? [],
        scope: v.sampleSize ? { sampleSize: Number(v.sampleSize) } : undefined,
      })}
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
