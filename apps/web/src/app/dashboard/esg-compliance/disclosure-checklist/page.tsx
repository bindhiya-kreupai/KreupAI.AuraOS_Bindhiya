'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DisclosureChecklistPage() {
  return (
    <EvaluatorPage
      title="Governance disclosure checklist"
      titleAr="قائمة إفصاحات الحوكمة"
      description="Verify each mandatory governance disclosure has been filed within its cadence window."
      descriptionAr="التحقق من تقديم كل إفصاح حوكمة إلزامي خلال نافذته الزمنية."
      fields={[
        {
          name: 'disclosures',
          label: 'Disclosures',
          labelAr: 'الإفصاحات',
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
              key: 'labelAr',
              label: 'Label (AR)',
              labelAr: 'الاسم بالعربية',
              type: 'text',
              widthClass: 'w-48',
            },
            {
              key: 'mandatory',
              label: 'Mandatory',
              labelAr: 'إلزامي',
              type: 'boolean',
              widthClass: 'w-24',
            },
            { key: 'filed', label: 'Filed', labelAr: 'مقدم', type: 'boolean', widthClass: 'w-20' },
            {
              key: 'filedAt',
              label: 'Filed at',
              labelAr: 'تاريخ',
              type: 'date',
              widthClass: 'w-40',
            },
            {
              key: 'cadenceDays',
              label: 'Cadence (days)',
              labelAr: 'التكرار',
              type: 'number',
              widthClass: 'w-24',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/esg-compliance/sustainability' }}
      buildPayload={(v) => {
        const disclosures = ((v.disclosures as Array<Record<string, unknown>>) ?? []).map((r) => ({
          code: String(r.code ?? ''),
          label: String(r.label ?? ''),
          labelAr: r.labelAr ? String(r.labelAr) : undefined,
          mandatory: r.mandatory === true || r.mandatory === 'true',
          filed: r.filed === true || r.filed === 'true',
          filedAt: r.filedAt ? new Date(String(r.filedAt)).toISOString() : undefined,
          cadenceDays: r.cadenceDays ? Number(r.cadenceDays) : undefined,
        }));
        return { action: 'disclosure', input: { disclosures, asOf: new Date().toISOString() } };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const hasGap = v.totals.missing + v.totals.stale > 0;
        return {
          outcome: hasGap ? 'FAIL' : 'PASS',
          title: `${v.totals.coveragePct}% coverage`,
          reason: hasGap
            ? `${v.totals.missing} missing, ${v.totals.stale} stale of ${v.totals.mandatory} mandatory disclosures.`
            : 'All mandatory disclosures are current.',
          reasonAr: hasGap
            ? `${v.totals.missing} مفقود، ${v.totals.stale} متأخر من ${v.totals.mandatory} إفصاحات إلزامية`
            : 'جميع الإفصاحات الإلزامية حالية',
          breakdown: [
            { label: 'Mandatory', value: String(v.totals.mandatory) },
            { label: 'Filed', value: String(v.totals.filed) },
            { label: 'Stale', value: String(v.totals.stale) },
            { label: 'Missing', value: String(v.totals.missing) },
          ],
        };
      }}
    />
  );
}
