'use client';

/**
 * EPIC-20 Leave approval-matrix evaluator page.
 *
 * Calls POST /api/v1/leave-compliance/approval-matrix.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function LeaveApprovalMatrixPage() {
  return (
    <EvaluatorPage
      title="Leave approval matrix"
      titleAr="مصفوفة اعتماد الإجازات"
      description="Resolve the approver chain that should fire for a leave request, given the leave type, total days, and country."
      descriptionAr="تحديد سلسلة المعتمدين لطلب إجازة بناءً على النوع وعدد الأيام والدولة."
      fields={[
        {
          name: 'leaveType',
          label: 'Leave type',
          type: 'select',
          required: true,
          options: [
            { value: 'ANNUAL', label: 'Annual' },
            { value: 'SICK', label: 'Sick' },
            { value: 'HAJJ', label: 'Hajj' },
            { value: 'UNPAID', label: 'Unpaid' },
            { value: 'MATERNITY', label: 'Maternity' },
            { value: 'PATERNITY', label: 'Paternity' },
            { value: 'BEREAVEMENT', label: 'Bereavement' },
          ],
        },
        { name: 'totalDays', label: 'Total days', type: 'number', required: true },
        { name: 'country', label: 'Country code', type: 'text', placeholder: 'AE' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/leave-compliance/approval-matrix' }}
      buildPayload={(v) => ({
        action: 'buildChain',
        leaveType: v.leaveType,
        totalDays: Number(v.totalDays),
        country: v.country || undefined,
      })}
      buildVerdict={(data: any) => {
        const rule = data?.rule;
        const chain = data?.chain ?? [];
        if (!rule) return null;
        return {
          outcome: 'INFO',
          title: `Rule: ${rule.id}`,
          reason: `Chain depth ${chain.length}. Roles: ${chain.map((c: any) => `L${c.level} ${c.role}`).join(' → ')}`,
          breakdown: [
            { label: 'Rule ID', value: String(rule.id) },
            { label: 'Chain depth', value: String(chain.length) },
            ...chain.map((c: any, i: number) => ({
              label: `L${c.level}`,
              value: `${c.role}${c.required ? '' : ' (optional)'}`,
            })),
          ],
        };
      }}
    />
  );
}
