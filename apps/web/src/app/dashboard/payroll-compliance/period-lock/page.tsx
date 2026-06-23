'use client';

/**
 * EPIC-10 Payroll period-lock + cut-off gate evaluator page.
 *
 * Calls POST /api/v1/payroll-compliance/period-lock.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PeriodLockPage() {
  return (
    <EvaluatorPage
      title="Payroll period lock"
      titleAr="إغلاق فترة الرواتب"
      description="Test whether a proposed retro-active payroll change is permitted given the period's cut-off + lock state."
      descriptionAr="فحص ما إذا كان التعديل المقترح على فترة الرواتب مسموحاً به بناءً على حالة الإقفال."
      fields={[
        {
          name: 'period',
          label: 'Period (YYYY-MM)',
          type: 'text',
          required: true,
          placeholder: '2026-05',
        },
        { name: 'cutOffDate', label: 'Cut-off date', type: 'date', required: true },
        { name: 'processedAt', label: 'Processed at (optional)', type: 'datetime-local' },
        { name: 'releasedAt', label: 'Released at (optional)', type: 'datetime-local' },
        {
          name: 'changeType',
          label: 'Change type',
          type: 'select',
          required: true,
          options: [
            { value: 'ATTENDANCE_REGULARIZATION', label: 'Attendance regularization' },
            { value: 'LEAVE_APPLICATION', label: 'Leave application' },
            { value: 'LEAVE_CANCELLATION', label: 'Leave cancellation' },
            { value: 'SALARY_CHANGE', label: 'Salary change' },
            { value: 'NEW_HIRE', label: 'New hire' },
            { value: 'TERMINATION', label: 'Termination' },
            { value: 'EXPENSE_CLAIM', label: 'Expense claim' },
          ],
        },
        { name: 'actorRole', label: 'Actor role', type: 'text', placeholder: 'HR_MANAGER' },
        {
          name: 'hasJustification',
          label: 'Has written justification',
          type: 'boolean',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/payroll-compliance/period-lock' }}
      buildPayload={(v) => ({
        period: {
          period: v.period,
          cutOffDate: v.cutOffDate,
          processedAt: v.processedAt || undefined,
          releasedAt: v.releasedAt || undefined,
        },
        changeType: v.changeType,
        actorRole: v.actorRole || undefined,
        hasJustification: v.hasJustification === 'true',
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.allow ? 'PASS' : 'FAIL',
          title: v.allow ? 'Change permitted' : 'Change blocked',
          reason: v.reasonEn ?? v.reason ?? '',
          reasonAr: v.reasonAr,
          severity: v.periodStatus,
          breakdown: [
            { label: 'Period status', value: String(v.periodStatus ?? '') },
            { label: 'Requires justification', value: String(v.requiresJustification ?? false) },
            { label: 'Requires senior approval', value: String(v.requiresSeniorApproval ?? false) },
          ],
        };
      }}
    />
  );
}
