'use client';

/**
 * EPIC-29 — Payroll compliance evaluator (minimum-wage enforcer).
 *
 * Calls POST /api/v1/payroll-compliance/checks with action=minWage.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PayrollComplianceChecksPage() {
  return (
    <EvaluatorPage
      title="Minimum-wage enforcer"
      titleAr="فحص الحد الأدنى للأجور"
      description="Check whether an employee's basic salary meets the statutory minimum wage in the configured country."
      descriptionAr="تحقق من أن الراتب الأساسي يلبي الحد الأدنى القانوني للأجور في الدولة."
      fields={[
        {
          name: 'countryCode',
          label: 'Country code',
          labelAr: 'رمز الدولة',
          type: 'select',
          required: true,
          options: [
            { value: 'AE', label: 'United Arab Emirates' },
            { value: 'SA', label: 'Saudi Arabia' },
            { value: 'BH', label: 'Bahrain' },
            { value: 'QA', label: 'Qatar' },
            { value: 'OM', label: 'Oman' },
            { value: 'KW', label: 'Kuwait' },
          ],
        },
        {
          name: 'basicSalary',
          label: 'Basic salary',
          labelAr: 'الراتب الأساسي',
          type: 'number',
          required: true,
        },
        {
          name: 'currency',
          label: 'Currency',
          labelAr: 'العملة',
          type: 'text',
          required: true,
          defaultValue: 'AED',
        },
        {
          name: 'isNational',
          label: 'Is national',
          labelAr: 'مواطن',
          type: 'boolean',
          required: true,
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/payroll-compliance/checks' }}
      buildPayload={(v) => ({
        action: 'minWage',
        countryCode: String(v.countryCode ?? ''),
        basicSalary: Number(v.basicSalary ?? 0),
        currency: String(v.currency ?? 'AED'),
        isNational: String(v.isNational ?? '') === 'true',
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.outcome,
          title: `Applicable min ${v.applicableMin} ${v.policy?.currency ?? ''}`,
          reason: v.reason?.en ?? '',
          reasonAr: v.reason?.ar,
          breakdown: [
            { label: 'Applicable minimum', value: String(v.applicableMin) },
            { label: 'Shortfall', value: String(v.shortfall) },
            { label: 'Policy country', value: v.policy?.countryCode ?? '' },
          ],
        };
      }}
    />
  );
}
