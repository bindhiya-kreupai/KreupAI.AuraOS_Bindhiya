'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FindingSlaPage() {
  return (
    <EvaluatorPage
      title="Internal audit — finding closure SLA"
      titleAr="اتفاقية مستوى الخدمة لإغلاق الملاحظات"
      description="Score open and closed audit findings against severity-tier SLA windows."
      descriptionAr="تقييم ملاحظات التدقيق مقابل أهداف الإغلاق."
      fields={[
        {
          name: 'findings',
          label: 'Findings',
          labelAr: 'الملاحظات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'findingId',
              label: 'ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'controlId',
              label: 'Control',
              labelAr: 'الضابط',
              type: 'text',
              widthClass: 'w-32',
            },
            {
              key: 'raisedAt',
              label: 'Raised',
              labelAr: 'تاريخ الإصدار',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'severity',
              label: 'Severity',
              labelAr: 'الخطورة',
              type: 'select',
              required: true,
              options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => ({ value: s, label: s })),
              widthClass: 'w-28',
            },
            {
              key: 'closedAt',
              label: 'Closed',
              labelAr: 'تاريخ الإغلاق',
              type: 'text',
              widthClass: 'w-40',
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
      endpoint={{ method: 'POST', url: '/api/v1/internal-audit-compliance/audit' }}
      buildPayload={(v) => ({
        action: 'findings',
        input: {
          findings: ((v.findings as Array<Record<string, unknown>>) ?? []).map((f) => ({
            findingId: String(f.findingId ?? ''),
            controlId: f.controlId ? String(f.controlId) : undefined,
            raisedAt: new Date(String(f.raisedAt)).toISOString(),
            severity: String(f.severity ?? 'MEDIUM'),
            closedAt: f.closedAt ? new Date(String(f.closedAt)).toISOString() : undefined,
            overrideSlaDays: f.overrideSlaDays ? Number(f.overrideSlaDays) : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.breached > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.breached} of ${v.totals.findings} breached`,
          reason: v.totals.breached > 0 ? 'Some findings exceed SLA.' : 'All findings within SLA.',
          reasonAr: v.totals.breached > 0 ? 'تجاوز ملاحظات للموعد' : 'كل الملاحظات ضمن الموعد',
          breakdown: [
            { label: 'Findings', value: String(v.totals.findings) },
            { label: 'Breached', value: String(v.totals.breached) },
            { label: 'Breach %', value: String(v.totals.breachPct) },
          ],
        };
      }}
    />
  );
}
