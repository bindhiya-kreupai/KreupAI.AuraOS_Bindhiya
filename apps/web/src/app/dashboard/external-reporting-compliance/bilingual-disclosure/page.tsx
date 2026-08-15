'use client';

import { useEffect, useState } from 'react';
import { EvaluatorPage } from '@aura/ui/components/ui';

export default function BilingualDisclosurePage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/v1/external-reporting-compliance/reporting');
        const data = await res.json();
        if (data.success && data.data) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error('Failed to load bilingual disclosure defaults', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading disclosures from database...</p>
      </main>
    );
  }

  const defaultRequirements = initialData?.extDisclosureRequirements || [
    { sectionCode: 'SEC_A', label: 'Company Overview', requireBilingual: true },
    { sectionCode: 'SEC_B', label: 'Financial Performance', requireBilingual: true },
  ];

  const defaultSections = initialData?.extDisclosureSections || [
    { sectionCode: 'SEC_A', en: 'We are a leading firm.', ar: 'نحن شركة رائدة.' },
    { sectionCode: 'SEC_B', en: 'Revenues grew by 10%.', ar: 'نمت الإيرادات بنسبة ١٠٪.' },
  ];

  return (
    <EvaluatorPage
      title="External reporting — bilingual disclosure pack"
      titleAr="حزمة الإفصاح ثنائية اللغة"
      description="Verify every required section in the regulator disclosure pack has both English and Arabic content. Settings are saved to the database."
      descriptionAr="التحقق من اكتمال محتوى الإفصاح باللغتين."
      fields={[
        {
          name: 'requirements',
          label: 'Required sections',
          labelAr: 'الأقسام المطلوبة',
          type: 'structured-array',
          required: true,
          minRows: 1,
          defaultRows: defaultRequirements,
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
          defaultRows: defaultSections,
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
      onSuccess={(data, setValues) => {
        if (data.autoTranslatedSections) {
          setValues((prev) => ({
            ...prev,
            sections: data.autoTranslatedSections,
          }));
        }
      }}
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
        const incomplete = (v.results || []).filter((r: any) => r.status !== 'OK');
        const details = incomplete.map((r: any) => `${r.sectionCode} (${r.reason.en})`).join(', ');
        return {
          outcome: v.totals.missing > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.completePct}% complete`,
          reason:
            v.totals.missing > 0
              ? `${v.totals.missing} of ${v.totals.required} required sections incomplete. Incomplete: ${details}`
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
