'use client';

/**
 * EPIC-26 — Hearing-notice template completeness evaluator.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function HearingNoticePage() {
  return (
    <EvaluatorPage
      title="Hearing-notice completeness"
      titleAr="اكتمال إشعار الجلسة"
      description="Validate that a disciplinary hearing notice includes all required elements."
      descriptionAr="التحقق من اكتمال إشعار الجلسة التأديبية."
      fields={[
        {
          name: 'noticeId',
          label: 'Notice ID',
          labelAr: 'رقم الإشعار',
          type: 'text',
          required: true,
        },
        { name: 'hearingDate', label: 'Hearing date', labelAr: 'تاريخ الجلسة', type: 'date' },
        { name: 'hearingTime', label: 'Hearing time (HH:MM)', labelAr: 'الوقت', type: 'text' },
        { name: 'venue', label: 'Venue', labelAr: 'المكان', type: 'text' },
        {
          name: 'allegations',
          label: 'Allegations',
          labelAr: 'الاتهامات',
          type: 'structured-array',
          columns: [
            {
              key: 'en',
              label: 'EN',
              labelAr: '',
              type: 'text',
              required: true,
              widthClass: 'w-64',
            },
            {
              key: 'ar',
              label: 'AR',
              labelAr: 'الاتهام',
              type: 'text',
              required: true,
              widthClass: 'w-64',
            },
          ],
        },
        {
          name: 'rightToRepresentation',
          label: 'Right to representation stated',
          labelAr: 'حق التمثيل',
          type: 'boolean',
        },
        {
          name: 'rightToRespondInWriting',
          label: 'Right to respond in writing stated',
          labelAr: 'حق الرد الخطي',
          type: 'boolean',
        },
        {
          name: 'rightToCallWitnesses',
          label: 'Right to call witnesses stated',
          labelAr: 'حق استدعاء الشهود',
          type: 'boolean',
        },
        {
          name: 'noticePeriodDays',
          label: 'Notice period (days)',
          labelAr: 'فترة الإشعار',
          type: 'number',
        },
        {
          name: 'servedBilingually',
          label: 'Served bilingually (EN+AR)',
          labelAr: 'تسليم ثنائي اللغة',
          type: 'boolean',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/er-compliance/disciplinary-residuals' }}
      buildPayload={(v) => ({
        action: 'hearingNotice',
        input: {
          noticeId: String(v.noticeId ?? ''),
          hearingDate: v.hearingDate ? new Date(String(v.hearingDate)).toISOString() : undefined,
          hearingTime: v.hearingTime ? String(v.hearingTime) : undefined,
          venue: v.venue ? String(v.venue) : undefined,
          allegations: ((v.allegations as Array<Record<string, unknown>>) ?? []).map((a) => ({
            en: String(a.en ?? ''),
            ar: String(a.ar ?? ''),
          })),
          rightToRepresentation: Boolean(v.rightToRepresentation),
          rightToRespondInWriting: Boolean(v.rightToRespondInWriting),
          rightToCallWitnesses: Boolean(v.rightToCallWitnesses),
          noticePeriodDays: v.noticePeriodDays ? Number(v.noticePeriodDays) : undefined,
          servedBilingually: Boolean(v.servedBilingually),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.pass ? 'PASS' : 'FAIL',
          title: `${v.completenessPct}% complete`,
          reason: v.pass
            ? 'Notice meets all required elements.'
            : `${v.issues.length} issue(s) found.`,
          breakdown: v.issues.slice(0, 5).map((i: any) => ({ label: i.code, value: i.severity })),
        };
      }}
    />
  );
}
