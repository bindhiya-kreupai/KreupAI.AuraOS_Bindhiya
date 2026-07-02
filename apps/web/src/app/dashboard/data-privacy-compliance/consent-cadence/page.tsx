'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ConsentCadencePage() {
  return (
    <EvaluatorPage
      title="Data privacy — consent cadence audit"
      titleAr="مراجعة دورية للموافقات"
      description="Identify consents that need re-confirmation per the configured cadence window."
      descriptionAr="تحديد الموافقات التي تحتاج إعادة تأكيد."
      fields={[
        {
          name: 'records',
          label: 'Consent records',
          labelAr: 'سجلات الموافقة',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'subjectId',
              label: 'Subject ID',
              labelAr: 'صاحب البيانات',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'purpose',
              label: 'Purpose',
              labelAr: 'الغرض',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'grantedAt',
              label: 'Granted',
              labelAr: 'منح',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'withdrawnAt',
              label: 'Withdrawn',
              labelAr: 'سحب',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'reconfirmDays',
              label: 'Reconfirm (days)',
              labelAr: 'إعادة تأكيد',
              type: 'number',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/data-privacy-compliance/privacy' }}
      buildPayload={(v) => ({
        action: 'consent',
        input: {
          records: ((v.records as Array<Record<string, unknown>>) ?? []).map((r) => ({
            subjectId: String(r.subjectId ?? ''),
            purpose: String(r.purpose ?? ''),
            grantedAt: new Date(String(r.grantedAt)).toISOString(),
            withdrawnAt: r.withdrawnAt ? new Date(String(r.withdrawnAt)).toISOString() : undefined,
            reconfirmDays: r.reconfirmDays ? Number(r.reconfirmDays) : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.stale > 0 ? 'WARN' : 'PASS',
          title: `${v.totals.activePct}% active`,
          reason: `${v.totals.active} active, ${v.totals.stale} stale, ${v.totals.withdrawn} withdrawn.`,
          reasonAr: 'ملخص حالات الموافقة',
          breakdown: [
            { label: 'Records', value: String(v.totals.records) },
            { label: 'Active', value: String(v.totals.active) },
            { label: 'Stale', value: String(v.totals.stale) },
            { label: 'Withdrawn', value: String(v.totals.withdrawn) },
            { label: 'Active %', value: String(v.totals.activePct) },
          ],
        };
      }}
    />
  );
}
