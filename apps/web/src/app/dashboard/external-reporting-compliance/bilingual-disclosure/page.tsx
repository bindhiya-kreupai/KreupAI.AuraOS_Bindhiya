'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function BilingualDisclosurePage() {
  return (
    <EvaluatorPage
      title="External reporting — bilingual disclosure pack"
      titleAr="حزمة الإفصاح ثنائية اللغة"
      description="Verify every required section in the regulator disclosure pack has both English and Arabic content."
      descriptionAr="التحقق من اكتمال محتوى الإفصاح باللغتين."
      fields={[
        {
          name: 'requirements',
          label: 'Required sections',
          labelAr: 'الأقسام المطلوبة',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'sectionCode',
              label: 'Code',
              labelAr: 'الرمز',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'label',
              label: 'Label',
              labelAr: 'الاسم',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
            {
              key: 'requireBilingual',
              label: 'Require bilingual',
              labelAr: 'مطلوب باللغتين',
              type: 'boolean',
              widthClass: 'w-32',
            },
          ],
        },
        {
          name: 'sections',
          label: 'Provided sections',
          labelAr: 'الأقسام المقدمة',
          type: 'structured-array',
          columns: [
            {
              key: 'sectionCode',
              label: 'Code',
              labelAr: 'الرمز',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'en',
              label: 'EN body',
              labelAr: 'الإنجليزية',
              type: 'text',
              widthClass: 'w-48',
            },
            { key: 'ar', label: 'AR body', labelAr: 'العربية', type: 'text', widthClass: 'w-48' },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/external-reporting-compliance/reporting' }}
      buildPayload={(v) => ({
        action: 'disclosure',
        input: {
          requirements: ((v.requirements as Array<Record<string, unknown>>) ?? []).map((r) => ({
            sectionCode: String(r.sectionCode ?? ''),
            label: String(r.label ?? ''),
            requireBilingual: r.requireBilingual === true || r.requireBilingual === 'true',
          })),
          sections: ((v.sections as Array<Record<string, unknown>>) ?? []).map((s) => ({
            sectionCode: String(s.sectionCode ?? ''),
            en: s.en ? String(s.en) : undefined,
            ar: s.ar ? String(s.ar) : undefined,
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.missing > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.completePct}% complete`,
          reason:
            v.totals.missing > 0
              ? `${v.totals.missing} of ${v.totals.required} required sections incomplete.`
              : 'All required sections provided bilingually.',
          reasonAr: v.totals.missing > 0 ? 'بعض الأقسام غير مكتملة' : 'كل الأقسام مكتملة',
          breakdown: [
            { label: 'Required', value: String(v.totals.required) },
            { label: 'Complete', value: String(v.totals.complete) },
            { label: 'Missing', value: String(v.totals.missing) },
          ],
        };
      }}
    />
  );
}
