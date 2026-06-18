'use client';

/**
 * EPIC-27 Notice buyout calculator evaluator page.
 *
 * Calls POST /api/v1/separation-compliance/notice-buyout.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function NoticeBuyoutPage() {
  return (
    <EvaluatorPage
      title="Notice buyout calculator"
      titleAr="حاسبة الإخلاء من الإشعار"
      description="Compute the notice-period buyout amount the GCC labour authority would recognise for an employer buyout or employee resignation."
      descriptionAr="حساب مبلغ الإخلاء من الإشعار وفقاً لقوانين العمل الخليجية."
      fields={[
        {
          name: 'direction',
          label: 'Direction',
          type: 'select',
          required: true,
          options: [
            { value: 'EMPLOYER_BUYOUT', label: 'Employer buys out (paid TO employee)' },
            { value: 'EMPLOYEE_RECOVERY', label: 'Employee resigns (paid BY employee)' },
          ],
          defaultValue: 'EMPLOYER_BUYOUT',
        },
        { name: 'basicSalary', label: 'Basic salary (monthly)', type: 'number', required: true },
        { name: 'housingAllowance', label: 'Housing allowance', type: 'number' },
        { name: 'transportAllowance', label: 'Transport allowance', type: 'number' },
        { name: 'currency', label: 'Currency', type: 'text', required: true, defaultValue: 'AED' },
        {
          name: 'noticeRequiredDays',
          label: 'Notice required (days)',
          type: 'number',
          required: true,
          defaultValue: '30',
        },
        {
          name: 'noticeServedDays',
          label: 'Notice served (days)',
          type: 'number',
          required: true,
        },
        { name: 'countryCode', label: 'Country code', type: 'text', placeholder: 'AE' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/separation-compliance/notice-buyout' }}
      buildPayload={(v) => ({
        direction: v.direction,
        salary: {
          basicSalary: Number(v.basicSalary),
          housingAllowance: v.housingAllowance ? Number(v.housingAllowance) : undefined,
          transportAllowance: v.transportAllowance ? Number(v.transportAllowance) : undefined,
          currency: v.currency,
        },
        noticeRequiredDays: Number(v.noticeRequiredDays),
        noticeServedDays: Number(v.noticeServedDays),
        countryCode: v.countryCode || undefined,
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const cappedBand = v.cappedByLaw ? 'CAPPED' : undefined;
        return {
          outcome: v.amount > 0 ? 'INFO' : 'PASS',
          title: `${v.currency ?? ''} ${Number(v.amount ?? 0).toFixed(2)}`,
          reason: v.formula ?? '',
          reasonAr: v.formulaAr,
          severity: cappedBand,
          breakdown: [
            { label: 'Unserved days', value: String(v.unservedDays ?? 0) },
            { label: 'Daily rate', value: String(v.dailyRate ?? 0) },
            { label: 'Amount', value: `${v.currency ?? ''} ${Number(v.amount ?? 0).toFixed(2)}` },
            ...(v.cappedByLaw
              ? [
                  { label: 'Capped by law', value: String(v.cappedByLaw) },
                  {
                    label: 'Uncapped amount',
                    value: `${v.currency ?? ''} ${Number(v.uncappedAmount ?? 0).toFixed(2)}`,
                  },
                ]
              : []),
          ],
        };
      }}
    />
  );
}
