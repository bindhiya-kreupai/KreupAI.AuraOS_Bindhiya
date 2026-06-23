'use client';

/**
 * EPIC-14 UAE — MOHRE work-permit expiry calendar evaluator page.
 *
 * Calls POST /api/v1/visa-exit-compliance/mohre-permit-calendar with
 * a structured-array of permits + as-of date and renders status,
 * penalty band, and total AED estimate per row.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function MohrePermitCalendarPage() {
  return (
    <EvaluatorPage
      title="MOHRE work-permit expiry calendar"
      titleAr="تقويم انتهاء تصاريح العمل (وزارة الموارد البشرية)"
      description="Evaluate work-permit expiry windows, renewal lodgement, and accruing penalties for the UAE MOHRE."
      descriptionAr="تقييم نوافذ انتهاء التصاريح والتجديد والغرامات وفق وزارة الموارد البشرية."
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
            {
              key: 'cancelled',
              label: 'Cancelled?',
              labelAr: 'ملغى؟',
              type: 'boolean',
              widthClass: 'w-24',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/visa-exit-compliance/mohre-permit-calendar' }}
      buildPayload={(v) => {
        const rows = (v.permits as Array<Record<string, unknown>>) ?? [];
        return {
          asOf: v.asOf ? new Date(String(v.asOf)).toISOString() : undefined,
          permits: rows
            .filter((r) => r.permitId)
            .map((r) => ({
              permitId: String(r.permitId),
              employeeId: String(r.employeeId ?? ''),
              expiresAt: new Date(String(r.expiresAt)).toISOString(),
              renewalLodged: Boolean(r.renewalLodged),
              cancelled: Boolean(r.cancelled),
            })),
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const banRisk = v.companyBanRisk;
        const overdue =
          (v.totals?.overdue ?? 0) + (v.totals?.penaltyMedium ?? 0) + (v.totals?.penaltyHigh ?? 0);
        const outcome: 'PASS' | 'WARN' | 'FAIL' = banRisk
          ? 'FAIL'
          : overdue > 0 || v.totals?.dueSoon > 0
            ? 'WARN'
            : 'PASS';
        return {
          outcome,
          title: banRisk
            ? 'Company ban risk triggered'
            : `${v.totals?.dueSoon ?? 0} due soon · ${overdue} overdue`,
          reason: `Active ${v.totals?.active ?? 0} · Window ${v.totals?.renewalWindowOpen ?? 0} · Due ${v.totals?.dueSoon ?? 0} · Overdue ${v.totals?.overdue ?? 0} · Medium ${v.totals?.penaltyMedium ?? 0} · High ${v.totals?.penaltyHigh ?? 0} · Ban ${v.totals?.companyBanRisk ?? 0} · Estimated AED ${v.totals?.totalEstimatedPenaltyAed ?? 0}`,
          breakdown: (v.rows ?? []).slice(0, 24).map((r: any) => ({
            label: `${r.permitId} · ${r.status}`,
            value: r.reason,
          })),
        };
      }}
    />
  );
}
