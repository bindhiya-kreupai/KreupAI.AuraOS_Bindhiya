'use client';

/**
 * EPIC-33 HR forms conditional logic evaluator page.
 *
 * Calls POST /api/v1/hr-forms-compliance/conditional-logic.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ConditionalLogicPage() {
  return (
    <EvaluatorPage
      title="HR form conditional logic"
      titleAr="منطق نموذج الموارد البشرية الشرطي"
      description="Evaluate a form's visibility + required-field DSL against a candidate set of submission values."
      descriptionAr="تقييم منطق إظهار حقول النموذج وحقول الإلزام مقابل قيم التقديم."
      fields={[
        {
          name: 'fieldsJson',
          label: 'Form fields (JSON)',
          type: 'text',
          required: true,
          placeholder:
            '[{"code":"reason","label":"Reason","type":"text","requiredWhen":"values.action == \'TERMINATE\'"}]',
        },
        {
          name: 'valuesJson',
          label: 'Current values (JSON)',
          type: 'text',
          required: true,
          placeholder: '{"action":"TERMINATE","reason":""}',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hr-forms-compliance/conditional-logic' }}
      buildPayload={(v) => ({
        fields: safeParse(v.fieldsJson),
        values: safeParseObject(v.valuesJson),
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const missing = v.missingRequired ?? [];
        return {
          outcome: (missing.length === 0 ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
          title:
            missing.length === 0
              ? 'Form may be submitted'
              : `${missing.length} required field(s) missing`,
          reason:
            missing.length === 0
              ? 'All visible-and-required fields have values.'
              : `Missing: ${missing.join(', ')}`,
          severity: missing.length > 0 ? 'INCOMPLETE' : undefined,
          breakdown: [
            { label: 'Total fields', value: String(v.render?.fields?.length ?? 0) },
            {
              label: 'Visible',
              value: String(v.render?.fields?.filter((f: any) => f.visible).length ?? 0),
            },
            {
              label: 'Required (visible)',
              value: String(
                v.render?.fields?.filter((f: any) => f.visible && f.required).length ?? 0
              ),
            },
            { label: 'Missing required', value: String(missing.length) },
          ],
        };
      }}
    />
  );
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

function safeParseObject(s: string): Record<string, unknown> {
  try {
    const r = JSON.parse(s);
    return r && typeof r === 'object' ? r : {};
  } catch {
    return {};
  }
}
