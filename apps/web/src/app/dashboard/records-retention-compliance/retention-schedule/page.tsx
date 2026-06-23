'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RetentionSchedulePage() {
  return (
    <EvaluatorPage
      title="Records retention — schedule cadence"
      titleAr="جدول الاحتفاظ بالسجلات"
      description="Score each record against its retention window, surfacing overdue-for-destruction and within-retention buckets."
      descriptionAr="تقييم السجلات مقابل فترات الاحتفاظ."
      fields={[
        {
          name: 'records',
          label: 'Records',
          labelAr: 'السجلات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'recordId',
              label: 'Record ID',
              labelAr: 'المعرف',
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
              widthClass: 'w-32',
            },
            {
              key: 'createdAt',
              label: 'Created at',
              labelAr: 'تاريخ الإنشاء',
              type: 'date',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'retentionDays',
              label: 'Retention (days)',
              labelAr: 'الاحتفاظ',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'destroyedAt',
              label: 'Destroyed at',
              labelAr: 'تاريخ الإتلاف',
              type: 'date',
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/records-retention-compliance/lifecycle' }}
      buildPayload={(v) => ({
        action: 'retention',
        input: {
          records: ((v.records as Array<Record<string, unknown>>) ?? []).map((r) => ({
            recordId: String(r.recordId ?? ''),
            category: String(r.category ?? ''),
            createdAt: new Date(String(r.createdAt)).toISOString(),
            retentionDays: Number(r.retentionDays ?? 0),
            destroyedAt: r.destroyedAt ? new Date(String(r.destroyedAt)).toISOString() : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const issues = v.totals.OVERDUE_FOR_DESTRUCTION + v.totals.PREMATURELY_DESTROYED;
        return {
          outcome: issues > 0 ? 'FAIL' : 'PASS',
          title: `${issues} issue(s) across ${v.totals.records} record(s)`,
          reason:
            issues > 0
              ? `${v.totals.OVERDUE_FOR_DESTRUCTION} overdue; ${v.totals.PREMATURELY_DESTROYED} premature.`
              : 'All records within proper retention lifecycle.',
          reasonAr: issues > 0 ? 'مخالفات في دورة الاحتفاظ' : 'دورة الاحتفاظ سليمة',
          breakdown: [
            { label: 'Within retention', value: String(v.totals.WITHIN_RETENTION) },
            { label: 'Due for review', value: String(v.totals.DUE_FOR_REVIEW) },
            { label: 'Overdue', value: String(v.totals.OVERDUE_FOR_DESTRUCTION) },
            { label: 'Properly destroyed', value: String(v.totals.PROPERLY_DESTROYED) },
            { label: 'Prematurely destroyed', value: String(v.totals.PREMATURELY_DESTROYED) },
          ],
        };
      }}
    />
  );
}
