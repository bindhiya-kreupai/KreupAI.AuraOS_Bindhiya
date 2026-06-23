'use client';

/**
 * EPIC-08 Employee record change-request evaluator page.
 *
 * Drives POST /api/v1/employee/record-change-requests with
 * action=propose. Sensitive-field changes are queued for
 * maker-checker; non-sensitive changes are applied inline.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RecordChangeRequestPage() {
  return (
    <EvaluatorPage
      title="Employee record change"
      titleAr="تعديل سجل الموظف"
      description="Propose a change to an employee record. Sensitive fields (bank, salary, ID, name) queue for approval; safe fields apply inline."
      descriptionAr="اقتراح تعديل سجل موظف. الحقول الحساسة تخضع لاعتماد منفصل."
      fields={[
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        {
          name: 'field',
          label: 'Field',
          type: 'text',
          required: true,
          placeholder: 'bankAccountIban | nationalIdNumber | phoneNumber …',
        },
        { name: 'before', label: 'Before (current value)', type: 'text' },
        { name: 'after', label: 'After (new value)', type: 'text', required: true },
        {
          name: 'justification',
          label: 'Justification',
          type: 'text',
          required: true,
          helpText: 'Min 5 chars. Persists in the audit log.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/employee/record-change-requests' }}
      buildPayload={(v) => ({
        action: 'propose',
        employeeId: v.employeeId,
        changes: [{ field: v.field, before: v.before, after: v.after }],
        justification: v.justification,
      })}
      buildVerdict={(data: any) => {
        const r = data?.record;
        if (!r) return null;
        const inline = r.inlineEligible === true;
        return {
          outcome: r.status === 'PENDING' ? 'WARN' : 'PASS',
          title: inline ? 'Applied inline' : `Queued for approval — ${r.status}`,
          reason: inline
            ? 'No sensitive field touched; the change was applied immediately.'
            : 'Sensitive field detected — request queued for a separate approver.',
          severity: r.status,
          breakdown: [
            { label: 'Request ID', value: String(r.requestId ?? '') },
            { label: 'Status', value: String(r.status) },
            { label: 'Inline eligible', value: String(inline) },
            { label: 'Sensitive changes', value: String((r.sensitiveChanges ?? []).length) },
          ],
        };
      }}
    />
  );
}
