'use client';

/**
 * EPIC-15 Bahrain — LMRA work-permit renewal calendar evaluator page.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function LmraPermitCalendarPage() {
  return (
    <EvaluatorPage
      title="LMRA work-permit renewal calendar"
      titleAr="تقويم تجديد تصاريح سوق العمل"
      description="Evaluate Bahrain LMRA permit expiry windows, renewals, and accruing BHD penalties."
      descriptionAr="تقييم نوافذ انتهاء تصاريح سوق العمل والتجديدات والغرامات بالدينار."
      fields={[
        {
          name: 'asOf',
          label: 'Evaluation date',
          labelAr: 'تاريخ التقييم',
          type: 'date',
          required: true,
        },
        {
          name: 'permits',
          label: 'Permits',
          labelAr: 'التصاريح',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'permitId',
              label: 'Permit ID',
              labelAr: 'رقم التصريح',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'employeeId',
              label: 'Employee ID',
              labelAr: 'رقم الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'expiresAt',
              label: 'Expires (YYYY-MM-DD)',
              labelAr: 'ينتهي',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'renewalLodged',
              label: 'Renewal lodged?',
              labelAr: 'تم التجديد؟',
              type: 'boolean',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/sio-compliance/bahrain-permit-calendar' }}
      buildPayload={(v) => {
        const rows = (v.permits as Array<Record<string, unknown>>) ?? [];
        return {
          action: 'lmra',
          input: {
            asOf: v.asOf ? new Date(String(v.asOf)).toISOString() : undefined,
            permits: rows
              .filter((r) => r.permitId)
              .map((r) => ({
                permitId: String(r.permitId),
                employeeId: String(r.employeeId ?? ''),
                expiresAt: new Date(String(r.expiresAt)).toISOString(),
                renewalLodged: Boolean(r.renewalLodged),
              })),
          },
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const exit = v.mandatoryExitTriggered;
        const overdue = (v.totals?.overdue ?? 0) + (v.totals?.penaltyHigh ?? 0);
        const outcome: 'PASS' | 'WARN' | 'FAIL' = exit
          ? 'FAIL'
          : overdue > 0 || (v.totals?.dueSoon ?? 0) > 0
            ? 'WARN'
            : 'PASS';
        return {
          outcome,
          title: exit
            ? 'Mandatory exit triggered'
            : `${v.totals?.dueSoon ?? 0} due soon · ${overdue} overdue`,
          reason: `Active ${v.totals?.active ?? 0} · Window ${v.totals?.renewalWindowOpen ?? 0} · Due ${v.totals?.dueSoon ?? 0} · Overdue ${v.totals?.overdue ?? 0} · High ${v.totals?.penaltyHigh ?? 0} · Exit ${v.totals?.mandatoryExit ?? 0} · BHD ${v.totals?.totalEstimatedPenaltyBhd ?? 0}`,
          breakdown: (v.rows ?? []).slice(0, 24).map((r: any) => ({
            label: `${r.permitId} · ${r.status}`,
            value: r.reason,
          })),
        };
      }}
    />
  );
}
