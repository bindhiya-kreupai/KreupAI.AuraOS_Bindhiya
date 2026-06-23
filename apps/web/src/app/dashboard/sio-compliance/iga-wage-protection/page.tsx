'use client';

/**
 * EPIC-15 Bahrain — IGA wage-protection check evaluator page.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function IgaWageProtectionPage() {
  return (
    <EvaluatorPage
      title="IGA wage-protection check"
      titleAr="فحص حماية الأجور (هيئة المعلومات والحكومة الإلكترونية)"
      description="Detect missing or late wage credits against the day-10 IGA deadline. Flags WARN, BLOCK, and MISSING_CREDIT rows."
      descriptionAr="رصد التحويلات المفقودة أو المتأخرة وفق موعد اليوم العاشر. يميّز التحذير والحظر والمفقود."
      fields={[
        {
          name: 'asOf',
          label: 'Evaluation date',
          labelAr: 'تاريخ التقييم',
          type: 'date',
          required: true,
        },
        {
          name: 'rows',
          label: 'Wage credits per employee',
          labelAr: 'تحويلات الأجور لكل موظف',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'employeeId',
              label: 'Employee ID',
              labelAr: 'رقم الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'wageMonth',
              label: 'Wage month (YYYY-MM-01)',
              labelAr: 'شهر الأجر',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'expectedAmountBhd',
              label: 'Expected (BHD)',
              labelAr: 'المتوقع',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'creditedAmountBhd',
              label: 'Credited (BHD)',
              labelAr: 'المُحوّل',
              type: 'number',
              widthClass: 'w-32',
            },
            {
              key: 'creditedAt',
              label: 'Credited at (YYYY-MM-DD)',
              labelAr: 'تاريخ التحويل',
              type: 'text',
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/sio-compliance/bahrain-permit-calendar' }}
      buildPayload={(v) => {
        const rows = (v.rows as Array<Record<string, unknown>>) ?? [];
        return {
          action: 'iga',
          input: {
            asOf: v.asOf ? new Date(String(v.asOf)).toISOString() : undefined,
            rows: rows
              .filter((r) => r.employeeId)
              .map((r) => ({
                employeeId: String(r.employeeId),
                wageMonth: new Date(String(r.wageMonth)).toISOString(),
                expectedAmountBhd: Number(r.expectedAmountBhd ?? 0),
                creditedAmountBhd:
                  r.creditedAmountBhd !== undefined && r.creditedAmountBhd !== ''
                    ? Number(r.creditedAmountBhd)
                    : undefined,
                creditedAt: r.creditedAt ? new Date(String(r.creditedAt)).toISOString() : undefined,
              })),
          },
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const outcome: 'PASS' | 'WARN' | 'FAIL' = v.escalate
          ? 'FAIL'
          : (v.totals?.warn ?? 0) > 0
            ? 'WARN'
            : 'PASS';
        return {
          outcome,
          title: v.escalate
            ? 'WPS escalation required'
            : `${v.totals?.ok ?? 0} OK · ${v.totals?.warn ?? 0} WARN`,
          reason: `OK ${v.totals?.ok ?? 0} · WARN ${v.totals?.warn ?? 0} · BLOCK ${v.totals?.block ?? 0} · MISSING ${v.totals?.missingCredit ?? 0} · Shortfall BHD ${v.totals?.totalShortfallBhd ?? 0}`,
          breakdown: (v.rows ?? []).slice(0, 24).map((r: any) => ({
            label: `${r.employeeId} · ${r.wageMonth}`,
            value: `${r.status} · ${r.reason}`,
          })),
        };
      }}
    />
  );
}
