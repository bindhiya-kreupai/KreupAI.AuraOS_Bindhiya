'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function LegalHoldPage() {
  return (
    <EvaluatorPage
      title="Records retention — legal hold conflicts"
      titleAr="تعارض التعليق القانوني مع الإتلاف"
      description="Detect destruction requests filed during an active legal hold window."
      descriptionAr="اكتشاف طلبات الإتلاف خلال نوافذ التعليق القانوني النشطة."
      fields={[
        {
          name: 'holds',
          label: 'Legal holds',
          labelAr: 'التعليقات القانونية',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'holdId',
              label: 'Hold ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'recordId',
              label: 'Record ID',
              labelAr: 'السجل',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'startedAt',
              label: 'Started',
              labelAr: 'بدء',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'releasedAt',
              label: 'Released',
              labelAr: 'رفع',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'reason',
              label: 'Reason',
              labelAr: 'السبب',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
          ],
        },
        {
          name: 'requests',
          label: 'Destruction requests',
          labelAr: 'طلبات الإتلاف',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'recordId',
              label: 'Record ID',
              labelAr: 'السجل',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'requestedAt',
              label: 'Requested',
              labelAr: 'تاريخ الطلب',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'requestedBy',
              label: 'By',
              labelAr: 'بواسطة',
              type: 'text',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/records-retention-compliance/lifecycle' }}
      buildPayload={(v) => ({
        action: 'legalHold',
        input: {
          holds: ((v.holds as Array<Record<string, unknown>>) ?? []).map((h) => ({
            holdId: String(h.holdId ?? ''),
            recordId: String(h.recordId ?? ''),
            startedAt: new Date(String(h.startedAt)).toISOString(),
            releasedAt: h.releasedAt ? new Date(String(h.releasedAt)).toISOString() : undefined,
            reason: String(h.reason ?? ''),
          })),
          requests: ((v.requests as Array<Record<string, unknown>>) ?? []).map((r) => ({
            recordId: String(r.recordId ?? ''),
            requestedAt: new Date(String(r.requestedAt)).toISOString(),
            requestedBy: r.requestedBy ? String(r.requestedBy) : undefined,
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.conflicts > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.conflicts} conflict(s) detected`,
          reason:
            v.totals.conflicts > 0
              ? 'Destruction requested while a legal hold was active.'
              : 'No destruction-vs-hold conflicts.',
          reasonAr: v.totals.conflicts > 0 ? 'يوجد تعارض' : 'لا يوجد تعارض',
          breakdown: [
            { label: 'Records requested', value: String(v.totals.records) },
            { label: 'Conflicts', value: String(v.totals.conflicts) },
          ],
        };
      }}
    />
  );
}
