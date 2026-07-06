'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DsarSlaPage() {
  return (
    <EvaluatorPage
      title="Data privacy — DSAR SLA tracker"
      titleAr="متابعة الموعد لطلبات الوصول لبيانات صاحب البيانات"
      description="Score Subject Access Requests against the local PDPL / GDPR SLA window."
      descriptionAr="تقييم طلبات الوصول مقابل الموعد القانوني."
      fields={[
        {
          name: 'requests',
          label: 'Requests',
          labelAr: 'الطلبات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'requestId',
              label: 'ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'receivedAt',
              label: 'Received',
              labelAr: 'استلام',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'acknowledgedAt',
              label: 'Acknowledged',
              labelAr: 'تأكيد',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'fulfilledAt',
              label: 'Fulfilled',
              labelAr: 'تنفيذ',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'jurisdiction',
              label: 'Jurisdiction',
              labelAr: 'الاختصاص',
              type: 'select',
              required: true,
              options: [
                { value: 'SAU', label: 'SAU' },
                { value: 'ARE', label: 'ARE' },
                { value: 'BHR', label: 'BHR' },
                { value: 'KWT', label: 'KWT' },
                { value: 'OMN', label: 'OMN' },
                { value: 'QAT', label: 'QAT' },
                { value: 'EU', label: 'EU' },
                { value: 'OTHER', label: 'OTHER' },
              ],
              widthClass: 'w-28',
            },
            {
              key: 'overrideSlaDays',
              label: 'SLA override',
              labelAr: 'تجاوز الموعد',
              type: 'number',
              widthClass: 'w-28',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/data-privacy-compliance/privacy' }}
      buildPayload={(v) => ({
        action: 'dsar',
        input: {
          requests: ((v.requests as Array<Record<string, unknown>>) ?? []).map((r) => ({
            requestId: String(r.requestId ?? ''),
            receivedAt: new Date(String(r.receivedAt)).toISOString(),
            acknowledgedAt: r.acknowledgedAt
              ? new Date(String(r.acknowledgedAt)).toISOString()
              : undefined,
            fulfilledAt: r.fulfilledAt ? new Date(String(r.fulfilledAt)).toISOString() : undefined,
            jurisdiction: String(r.jurisdiction ?? 'SAU'),
            overrideSlaDays: r.overrideSlaDays ? Number(r.overrideSlaDays) : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.breached > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.breached} of ${v.totals.requests} requests breached (${v.totals.breachPct}%)`,
          reason: v.totals.breached > 0 ? 'Review breached requests.' : 'All requests within SLA.',
          reasonAr: v.totals.breached > 0 ? 'طلبات تجاوزت الموعد' : 'جميع الطلبات ضمن الموعد',
          breakdown: [
            { label: 'Requests', value: String(v.totals.requests) },
            { label: 'Breached', value: String(v.totals.breached) },
            { label: 'Breach %', value: String(v.totals.breachPct) },
          ],
        };
      }}
    />
  );
}
