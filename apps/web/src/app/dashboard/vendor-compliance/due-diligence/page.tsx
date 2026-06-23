'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function VendorDueDiligencePage() {
  return (
    <EvaluatorPage
      title="Vendor compliance — due diligence cadence"
      titleAr="دورية العناية الواجبة للموردين"
      description="Surface vendors that are overdue for a full due-diligence review based on their risk tier."
      descriptionAr="إبراز الموردين الذين تأخرت مراجعتهم بناءً على درجة المخاطر."
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
              key: 'riskTier',
              label: 'Risk tier',
              labelAr: 'المخاطر',
              type: 'select',
              required: true,
              options: [
                { value: 'LOW', label: 'LOW' },
                { value: 'MEDIUM', label: 'MEDIUM' },
                { value: 'HIGH', label: 'HIGH' },
                { value: 'CRITICAL', label: 'CRITICAL' },
              ],
              widthClass: 'w-32',
            },
            {
              key: 'lastDdAt',
              label: 'Last DD at',
              labelAr: 'آخر مراجعة',
              type: 'date',
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/vendor-compliance/screening' }}
      buildPayload={(v) => ({
        action: 'dueDiligence',
        input: {
          vendors: ((v.vendors as Array<Record<string, unknown>>) ?? []).map((r) => ({
            vendorId: String(r.vendorId ?? ''),
            name: String(r.name ?? ''),
            riskTier: String(r.riskTier ?? 'MEDIUM'),
            lastDdAt: r.lastDdAt ? new Date(String(r.lastDdAt)).toISOString() : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.overdue} of ${v.totals.vendors} overdue`,
          reason:
            v.totals.overdue > 0
              ? 'Review the overdue vendors and schedule a fresh due-diligence cycle.'
              : 'All vendors current.',
          reasonAr: v.totals.overdue > 0 ? 'موردون متأخرون' : 'كل الموردين محدثون',
          breakdown: [
            { label: 'Vendors', value: String(v.totals.vendors) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Current %', value: String(v.totals.currentPct) },
          ],
        };
      }}
    />
  );
}
