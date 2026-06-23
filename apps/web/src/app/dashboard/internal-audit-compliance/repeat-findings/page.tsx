'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RepeatFindingsPage() {
  return (
    <EvaluatorPage
      title="Internal audit — repeat finding detector"
      titleAr="كشف الملاحظات المتكررة"
      description="Group historical findings by control and category to surface recurring control failures."
      descriptionAr="تجميع الملاحظات لاكتشاف فشل متكرر في الضوابط."
      fields={[
        {
          name: 'minOccurrences',
          label: 'Min occurrences',
          labelAr: 'الحد الأدنى للتكرار',
          type: 'number',
          defaultValue: '2',
        },
        {
          name: 'history',
          label: 'Finding history',
          labelAr: 'سجل الملاحظات',
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
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'category',
              label: 'Category',
              labelAr: 'الفئة',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'raisedAt',
              label: 'Raised',
              labelAr: 'تاريخ',
              type: 'date',
              required: true,
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/internal-audit-compliance/audit' }}
      buildPayload={(v) => ({
        action: 'repeats',
        input: {
          minOccurrences: v.minOccurrences ? Number(v.minOccurrences) : 2,
          history: ((v.history as Array<Record<string, unknown>>) ?? []).map((h) => ({
            findingId: String(h.findingId ?? ''),
            controlId: String(h.controlId ?? ''),
            category: String(h.category ?? ''),
            raisedAt: new Date(String(h.raisedAt)).toISOString(),
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.repeats > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.repeats} repeat group(s) across ${v.totals.controls} control(s)`,
          reason:
            v.totals.repeats > 0
              ? 'Investigate root cause for repeating control failures.'
              : 'No repeating findings detected.',
          reasonAr: v.totals.repeats > 0 ? 'ملاحظات متكررة' : 'لا توجد تكرارات',
          breakdown: [
            { label: 'Repeat groups', value: String(v.totals.repeats) },
            { label: 'Controls', value: String(v.totals.controls) },
          ],
        };
      }}
    />
  );
}
