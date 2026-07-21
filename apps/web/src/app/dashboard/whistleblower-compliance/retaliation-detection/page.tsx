'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RetaliationDetectorPage() {
  return (
    <EvaluatorPage
      title="Whistleblower — retaliation correlation"
      titleAr="ربط الانتقام لمقدمي البلاغات"
      description="Cross-correlate report dates with adverse HR events to flag potential retaliation against reporters."
      descriptionAr="ربط تواريخ البلاغات بالأحداث العملية السلبية للكشف عن الانتقام المحتمل."
      fields={[
        {
          name: 'windowDays',
          label: 'Window (days)',
          labelAr: 'النافذة بالأيام',
          type: 'number',
          defaultValue: '90',
        },
        {
          name: 'reporters',
          label: 'Reporters',
          labelAr: 'المخبرون',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'sealedId',
              label: 'Sealed ID',
              labelAr: 'المعرف المختوم',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'filedAt',
              label: 'Filed at',
              labelAr: 'تاريخ التقديم',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
          ],
        },
        {
          name: 'events',
          label: 'Adverse events',
          labelAr: 'الأحداث السلبية',
          type: 'structured-array',
          columns: [
            {
              key: 'sealedId',
              label: 'Sealed ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'eventType',
              label: 'Event',
              labelAr: 'الحدث',
              type: 'select',
              required: true,
              options: [
                { value: 'DISCIPLINARY', label: 'DISCIPLINARY' },
                { value: 'TRANSFER', label: 'TRANSFER' },
                { value: 'TERMINATION', label: 'TERMINATION' },
                { value: 'DEMOTION', label: 'DEMOTION' },
                { value: 'PIP', label: 'PIP' },
                { value: 'OT_CUT', label: 'OT_CUT' },
                { value: 'SHIFT_CHANGE', label: 'SHIFT_CHANGE' },
              ],
              widthClass: 'w-40',
            },
            {
              key: 'occurredAt',
              label: 'Occurred at',
              labelAr: 'تاريخ',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            { key: 'reason', label: 'Reason', labelAr: 'السبب', type: 'text', widthClass: 'w-48' },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/whistleblower-compliance/cases' }}
      buildPayload={(v) => ({
        action: 'retaliation',
        input: {
          windowDays: v.windowDays ? Number(v.windowDays) : 90,
          reporters: ((v.reporters as Array<Record<string, unknown>>) ?? []).map((r) => ({
            sealedId: String(r.sealedId ?? ''),
            filedAt: new Date(String(r.filedAt)).toISOString(),
          })),
          events: ((v.events as Array<Record<string, unknown>>) ?? []).map((e) => ({
            sealedId: String(e.sealedId ?? ''),
            eventType: String(e.eventType ?? 'DISCIPLINARY'),
            occurredAt: new Date(String(e.occurredAt)).toISOString(),
            reason: e.reason ? String(e.reason) : undefined,
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const hi = v.totals.high;
        return {
          outcome: hi > 0 ? 'FAIL' : v.totals.flagged > 0 ? 'WARN' : 'PASS',
          title: `${v.totals.flagged} of ${v.totals.reporters} reporter(s) flagged`,
          reason: `${hi} HIGH-likelihood case(s); ${v.totals.medium} MEDIUM.`,
          reasonAr: `${hi} حالات احتمال مرتفع و ${v.totals.medium} متوسط.`,
          breakdown: [
            { label: 'Reporters', value: String(v.totals.reporters) },
            { label: 'Flagged', value: String(v.totals.flagged) },
            { label: 'HIGH', value: String(v.totals.high) },
            { label: 'MEDIUM', value: String(v.totals.medium) },
          ],
        };
      }}
    />
  );
}
