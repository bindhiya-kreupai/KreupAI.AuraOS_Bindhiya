'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ControlTestsPage() {
  return (
    <EvaluatorPage
      title="Internal audit — control test cadence"
      titleAr="دورية اختبار الضوابط"
      description="Identify in-scope controls overdue for their next test."
      descriptionAr="تحديد الضوابط التي تأخر اختبارها."
      fields={[
        {
          name: 'controls',
          label: 'Controls',
          labelAr: 'الضوابط',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'controlId',
              label: 'ID',
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
              key: 'testCadenceDays',
              label: 'Cadence (days)',
              labelAr: 'الدورية',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'lastTestedAt',
              label: 'Last tested',
              labelAr: 'آخر اختبار',
              type: 'date',
              widthClass: 'w-40',
            },
            {
              key: 'inScope',
              label: 'In scope',
              labelAr: 'في النطاق',
              type: 'boolean',
              widthClass: 'w-24',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/internal-audit-compliance/audit' }}
      buildPayload={(v) => ({
        action: 'controls',
        input: {
          controls: ((v.controls as Array<Record<string, unknown>>) ?? []).map((c) => ({
            controlId: String(c.controlId ?? ''),
            name: String(c.name ?? ''),
            testCadenceDays: Number(c.testCadenceDays ?? 0),
            lastTestedAt: c.lastTestedAt
              ? new Date(String(c.lastTestedAt)).toISOString()
              : undefined,
            inScope: c.inScope === true || c.inScope === 'true',
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.overdue} overdue of ${v.totals.controls}`,
          reason: v.totals.overdue > 0 ? 'Schedule control re-tests.' : 'All controls current.',
          reasonAr: v.totals.overdue > 0 ? 'ضوابط متأخرة' : 'كل الضوابط محدثة',
          breakdown: [
            { label: 'Controls', value: String(v.totals.controls) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Current %', value: String(v.totals.currentPct) },
          ],
        };
      }}
    />
  );
}
