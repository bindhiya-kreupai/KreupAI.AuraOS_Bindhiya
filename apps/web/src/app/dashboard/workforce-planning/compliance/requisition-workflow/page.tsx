'use client';

/**
 * EPIC-03-S04 — Workforce requisition maker-checker evaluator page.
 *
 * Calls POST /api/v1/workforce-planning/requisition-workflow.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RequisitionWorkflowPage() {
  return (
    <EvaluatorPage
      title="Requisition maker-checker"
      titleAr="مُقدِّم-مُراجِع طلبات الشغل"
      description="Submit, approve, or reject a workforce requisition with full audit trail. Maker cannot self-approve."
      descriptionAr="تقديم أو اعتماد أو رفض طلب توظيف مع سجل تدقيق. لا يجوز للمُقدِّم اعتماد طلبه."
      fields={[
        {
          name: 'action',
          label: 'Action',
          type: 'select',
          required: true,
          options: [
            { value: 'submit', label: 'Submit' },
            { value: 'approve', label: 'Approve' },
            { value: 'reject', label: 'Reject' },
          ],
        },
        { name: 'requisitionId', label: 'Requisition ID', type: 'text', required: true },
        {
          name: 'justification',
          label: 'Justification (required when submit)',
          type: 'text',
          helpText: 'Minimum 5 characters.',
        },
        {
          name: 'reason',
          label: 'Rejection reason (required when reject)',
          type: 'text',
          helpText: 'Minimum 3 characters.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/workforce-planning/requisition-workflow' }}
      buildPayload={(v) => {
        const action = String(v.action);
        if (action === 'submit') {
          return {
            action,
            requisitionId: v.requisitionId,
            justification: v.justification,
          };
        }
        if (action === 'reject') {
          return {
            action,
            requisitionId: v.requisitionId,
            reason: v.reason,
          };
        }
        return { action, requisitionId: v.requisitionId };
      }}
      buildVerdict={(data: any) => {
        const state = data?.state;
        if (!state) return null;
        const outcome =
          state.status === 'APPROVED'
            ? 'PASS'
            : state.status === 'REJECTED'
              ? 'FAIL'
              : state.status === 'SUBMITTED'
                ? 'INFO'
                : 'INFO';
        return {
          outcome,
          title: `Requisition ${state.requisitionId}: ${state.status}`,
          reason:
            state.status === 'APPROVED'
              ? `Approved by ${state.approvedBy}.`
              : state.status === 'REJECTED'
                ? `Rejected: ${state.rejectionReason ?? '(no reason)'}`
                : `Submitted by ${state.proposedBy}.`,
          breakdown: [
            { label: 'Proposed by', value: String(state.proposedBy ?? '') },
            { label: 'Approved by', value: String(state.approvedBy ?? '') },
            { label: 'Rejected by', value: String(state.rejectedBy ?? '') },
            {
              label: 'Justification',
              value: String(state.justification ?? '').slice(0, 80),
            },
          ],
        };
      }}
    />
  );
}
