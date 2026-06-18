'use client';

/**
 * EPIC-09 Organisation change-request evaluator page.
 *
 * Drives POST /api/v1/org-compliance/change-requests with action=propose.
 * Approve / reject are exercised from the pending-list page.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function OrgChangeRequestPage() {
  return (
    <EvaluatorPage
      title="Org change request"
      titleAr="طلب تغيير الهيكل التنظيمي"
      description="Propose a department or position CREATE / UPDATE / DELETE. The change is queued for maker-checker approval."
      descriptionAr="اقتراح إنشاء أو تعديل أو حذف قسم أو وظيفة. يخضع التغيير لاعتماد منفصل."
      fields={[
        {
          name: 'entity',
          label: 'Entity',
          type: 'select',
          required: true,
          options: [
            { value: 'department', label: 'Department' },
            { value: 'position', label: 'Position' },
          ],
        },
        {
          name: 'operation',
          label: 'Operation',
          type: 'select',
          required: true,
          options: [
            { value: 'CREATE', label: 'Create' },
            { value: 'UPDATE', label: 'Update' },
            { value: 'DELETE', label: 'Delete' },
          ],
        },
        { name: 'targetId', label: 'Target ID (UPDATE/DELETE)', type: 'text' },
        {
          name: 'dataJson',
          label: 'Data (JSON)',
          type: 'text',
          placeholder: '{ "name": "Engineering" }',
          helpText: 'Required for CREATE + UPDATE. Provide a JSON object.',
        },
        {
          name: 'justification',
          label: 'Justification',
          type: 'text',
          required: true,
          placeholder: 'Documented business reason',
          helpText: 'Min 5 chars.',
        },
        { name: 'effectiveFrom', label: 'Effective from (optional)', type: 'date' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/org-compliance/change-requests' }}
      buildPayload={(v) => {
        let data: unknown;
        const dataJsonStr = String(v.dataJson ?? '');
        if (dataJsonStr) {
          try {
            data = JSON.parse(dataJsonStr);
          } catch {
            data = { _parseError: dataJsonStr };
          }
        }
        return {
          action: 'propose',
          entity: v.entity,
          operation: v.operation,
          payload: {
            targetId: v.targetId || undefined,
            data,
          },
          justification: v.justification,
          effectiveFrom: v.effectiveFrom || undefined,
        };
      }}
      buildVerdict={(data: any) => {
        const r = data?.record;
        if (!r) return null;
        return {
          outcome: r.status === 'PENDING' ? 'INFO' : 'PASS',
          title: `Request ${r.requestId?.slice(0, 8) ?? ''}… — ${r.status}`,
          reason: `${r.entity} ${r.operation} proposed by ${r.proposedBy}.`,
          severity: r.status,
          breakdown: [
            { label: 'Request ID', value: String(r.requestId ?? '') },
            { label: 'Entity', value: String(r.entity) },
            { label: 'Operation', value: String(r.operation) },
            { label: 'Status', value: String(r.status) },
            { label: 'Proposed by', value: String(r.proposedBy ?? '') },
          ],
        };
      }}
    />
  );
}
