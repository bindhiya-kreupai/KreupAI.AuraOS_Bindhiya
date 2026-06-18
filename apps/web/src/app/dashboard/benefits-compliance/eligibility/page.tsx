'use client';

/**
 * EPIC-22 Benefits eligibility evaluator page.
 *
 * Calls POST /api/v1/benefits-compliance/eligibility (action='evaluate').
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function BenefitsEligibilityPage() {
  return (
    <EvaluatorPage
      title="Benefits eligibility"
      titleAr="أهلية المزايا"
      description="Evaluate one benefit code against an employee context. Returns the eligibility verdict with reason."
      descriptionAr="تقييم استحقاق المزايا لموظف بناءً على السياق. تعيد الحكم مع السبب."
      fields={[
        { name: 'benefitCode', label: 'Benefit code', type: 'text', required: true },
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        { name: 'countryCode', label: 'Country code', type: 'text', placeholder: 'AE' },
        { name: 'tenureMonths', label: 'Tenure (months)', type: 'number' },
        { name: 'grade', label: 'Grade', type: 'text' },
        { name: 'employmentType', label: 'Employment type', type: 'text' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/benefits-compliance/eligibility' }}
      buildPayload={(v) => ({
        action: 'evaluate',
        benefitCode: v.benefitCode,
        context: {
          employee: {
            id: v.employeeId,
            countryCode: v.countryCode || undefined,
            tenureMonths: v.tenureMonths ? Number(v.tenureMonths) : undefined,
            grade: v.grade || undefined,
            employmentType: v.employmentType || undefined,
          },
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.eligible ? 'PASS' : 'FAIL',
          title: v.reasonCode ?? 'Eligibility result',
          reason: v.reason ?? '',
          reasonAr: v.reasonAr,
          severity: v.eligible ? undefined : 'INELIGIBLE',
          breakdown: [
            { label: 'Benefit code', value: String(v.benefitCode ?? '') },
            { label: 'Eligible', value: String(v.eligible) },
            { label: 'Reason code', value: String(v.reasonCode ?? '') },
          ],
        };
      }}
    />
  );
}
