'use client';

/**
 * EPIC-24 — HSE audit checklist evaluator.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function HseChecklistPage() {
  return (
    <EvaluatorPage
      title="HSE audit checklist"
      titleAr="قائمة تدقيق السلامة"
      description="Score the site against a weighted HSE audit checklist."
      descriptionAr="تقييم الموقع وفق قائمة تدقيق سلامة موزونة."
      fields={[
        {
          name: 'items',
          label: 'Checklist items',
          labelAr: 'البنود',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'code',
              label: 'Code',
              labelAr: 'الرمز',
              type: 'text',
              required: true,
              widthClass: 'w-24',
            },
            {
              key: 'question',
              label: 'Question (EN)',
              labelAr: '',
              type: 'text',
              required: true,
              widthClass: 'w-64',
            },
            {
              key: 'questionAr',
              label: 'Question (AR)',
              labelAr: 'السؤال',
              type: 'text',
              required: true,
              widthClass: 'w-64',
            },
            {
              key: 'weight',
              label: 'Weight (1..10)',
              labelAr: 'الوزن',
              type: 'number',
              required: true,
              widthClass: 'w-24',
            },
            {
              key: 'critical',
              label: 'Critical',
              labelAr: 'حرج',
              type: 'boolean',
              widthClass: 'w-20',
            },
          ],
        },
        {
          name: 'responses',
          label: 'Responses',
          labelAr: 'الردود',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'code',
              label: 'Code',
              labelAr: 'الرمز',
              type: 'text',
              required: true,
              widthClass: 'w-24',
            },
            { key: 'pass', label: 'Pass', labelAr: 'مقبول', type: 'boolean', widthClass: 'w-20' },
            { key: 'noted', label: 'Notes', labelAr: 'ملاحظات', type: 'text', widthClass: 'w-64' },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hse-compliance/hse-residuals' }}
      buildPayload={(v) => ({
        action: 'checklist',
        input: {
          items: ((v.items as Array<Record<string, unknown>>) ?? []).map((r) => ({
            code: String(r.code ?? ''),
            question: String(r.question ?? ''),
            questionAr: String(r.questionAr ?? ''),
            weight: Number(r.weight ?? 1),
            critical: Boolean(r.critical),
          })),
          responses: ((v.responses as Array<Record<string, unknown>>) ?? []).map((r) => ({
            code: String(r.code ?? ''),
            pass: Boolean(r.pass),
            noted: r.noted ? String(r.noted) : undefined,
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.pass ? 'PASS' : 'FAIL',
          title: `${v.scorePct}% — ${v.band}`,
          reason: v.pass ? 'HSE checklist passed.' : `${v.failedItems.length} item(s) failed.`,
          breakdown: [
            { label: 'Score', value: `${v.scorePct}%` },
            { label: 'Band', value: v.band },
            { label: 'Items', value: String(v.totals.itemCount) },
            { label: 'Answered', value: String(v.totals.answered) },
            { label: 'Failed', value: String(v.totals.failed) },
          ],
        };
      }}
    />
  );
}
