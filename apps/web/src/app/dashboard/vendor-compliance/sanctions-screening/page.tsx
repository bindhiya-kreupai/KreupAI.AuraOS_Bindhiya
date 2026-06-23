'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function SanctionsScreeningPage() {
  return (
    <EvaluatorPage
      title="Vendor compliance — sanction list screening"
      titleAr="فحص قوائم العقوبات للموردين"
      description="Compare each vendor name against an uploaded sanction list and flag exact / partial matches."
      descriptionAr="مقارنة اسم كل مورد بقائمة العقوبات."
      fields={[
        {
          name: 'vendors',
          label: 'Vendors',
          labelAr: 'الموردون',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'vendorId',
              label: 'Vendor ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'name',
              label: 'Name',
              labelAr: 'الاسم',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
            {
              key: 'country',
              label: 'Country',
              labelAr: 'الدولة',
              type: 'text',
              widthClass: 'w-28',
            },
          ],
        },
        {
          name: 'list',
          label: 'Sanction list',
          labelAr: 'قائمة العقوبات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'listCode',
              label: 'List code',
              labelAr: 'القائمة',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'name',
              label: 'Name',
              labelAr: 'الاسم',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
            {
              key: 'country',
              label: 'Country',
              labelAr: 'الدولة',
              type: 'text',
              widthClass: 'w-28',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/vendor-compliance/screening' }}
      buildPayload={(v) => ({
        action: 'sanctions',
        input: {
          vendors: ((v.vendors as Array<Record<string, unknown>>) ?? []).map((r) => ({
            vendorId: String(r.vendorId ?? ''),
            name: String(r.name ?? ''),
            country: r.country ? String(r.country) : undefined,
          })),
          list: ((v.list as Array<Record<string, unknown>>) ?? []).map((r) => ({
            listCode: String(r.listCode ?? ''),
            name: String(r.name ?? ''),
            country: r.country ? String(r.country) : undefined,
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.hits > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.hits} potential hit(s)`,
          reason:
            v.totals.hits > 0
              ? 'Investigate flagged vendors before further engagement.'
              : 'All vendors clear of sanction list.',
          reasonAr: v.totals.hits > 0 ? 'مطابقات محتملة' : 'لا توجد مطابقات',
          breakdown: [
            { label: 'Vendors', value: String(v.totals.vendors) },
            { label: 'Hits', value: String(v.totals.hits) },
            { label: 'Clear %', value: String(v.totals.clearPct) },
          ],
        };
      }}
    />
  );
}
