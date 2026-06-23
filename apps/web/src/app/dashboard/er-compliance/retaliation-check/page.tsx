'use client';

/**
 * EPIC-25 retaliation-check evaluator page.
 *
 * Calls POST /api/v1/er-compliance/retaliation-check to assess a
 * proposed adverse action against the employee's active protection
 * window.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RetaliationCheckPage() {
  return (
    <EvaluatorPage
      title="Retaliation protection check"
      titleAr="فحص الحماية من الانتقام"
      description="Assess whether a proposed adverse action is permitted given the employee's active whistleblower / grievance protection window."
      descriptionAr="تقييم ما إذا كان الإجراء العقابي المقترح مسموحاً به في ضوء نافذة حماية الموظف."
      fields={[
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        {
          name: 'actionType',
          label: 'Action type',
          type: 'select',
          required: true,
          options: [
            { value: 'DISCIPLINARY_ACTION', label: 'Disciplinary action' },
            { value: 'TERMINATION', label: 'Termination' },
            { value: 'DEMOTION', label: 'Demotion' },
            { value: 'SALARY_REDUCTION', label: 'Salary reduction' },
            { value: 'INVOLUNTARY_TRANSFER', label: 'Involuntary transfer' },
            { value: 'NEGATIVE_PERFORMANCE_REVIEW', label: 'Negative performance review' },
          ],
        },
        { name: 'country', label: 'Country code', type: 'text', placeholder: 'AE' },
        {
          name: 'justification',
          label: 'Justification',
          type: 'text',
          placeholder: 'Documented business reason',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/er-compliance/retaliation-check' }}
      buildPayload={(v) => ({
        employeeId: v.employeeId,
        actionType: v.actionType,
        country: v.country || undefined,
        justification: v.justification || undefined,
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.allow ? 'PASS' : 'FAIL',
          title: v.allow ? 'Action permitted' : 'Action blocked',
          reason: v.reasonEn ?? v.reason ?? '',
          reasonAr: v.reasonAr,
          severity: v.protectionBand,
          breakdown: [
            { label: 'Window active', value: String(v.protectionActive ?? false) },
            { label: 'Whistleblower', value: String(v.whistleblower ?? false) },
            { label: 'Expires', value: String(v.protectionExpiresOn ?? '—') },
            { label: 'Requires senior review', value: String(v.requiresSeniorReview ?? false) },
          ],
        };
      }}
    />
  );
}
