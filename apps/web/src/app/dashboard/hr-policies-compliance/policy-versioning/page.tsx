'use client';

/**
 * EPIC-32 HR policy versioning evaluator page.
 *
 * Calls POST /api/v1/hr-policies-compliance/policy-versioning.
 * Defaults to verifyAcknowledgement (the most useful one-shot check);
 * the publish + acknowledge actions are exercised via the policy
 * documents page.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PolicyVersioningPage() {
  return (
    <EvaluatorPage
      title="Policy versioning + acknowledgement"
      titleAr="إصدارات السياسات والإقرار"
      description="Verify that an employee's prior acknowledgement still matches the current published content of a policy."
      descriptionAr="التحقق من أن إقرار الموظف السابق يطابق النسخة الحالية المنشورة."
      fields={[
        {
          name: 'action',
          label: 'Action',
          type: 'select',
          required: true,
          defaultValue: 'verifyAcknowledgement',
          options: [
            { value: 'verifyAcknowledgement', label: 'Verify acknowledgement' },
            { value: 'publish', label: 'Publish policy version' },
            { value: 'acknowledge', label: 'Acknowledge policy' },
          ],
        },
        { name: 'policyId', label: 'Policy ID', type: 'text', required: true },
        { name: 'employeeId', label: 'Employee ID (verify/ack)', type: 'text' },
        { name: 'version', label: 'New version (publish)', type: 'text', placeholder: 'v1.2.0' },
        { name: 'contentMarkdown', label: 'Content markdown (publish, optional)', type: 'text' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hr-policies-compliance/policy-versioning' }}
      buildPayload={(v) => {
        if (v.action === 'publish') {
          return {
            action: 'publish',
            policyId: v.policyId,
            version: v.version,
            contentMarkdown: v.contentMarkdown || undefined,
          };
        }
        if (v.action === 'acknowledge') {
          return {
            action: 'acknowledge',
            policyId: v.policyId,
            employeeId: v.employeeId,
          };
        }
        return {
          action: 'verifyAcknowledgement',
          policyId: v.policyId,
          employeeId: v.employeeId,
        };
      }}
      buildVerdict={(data: any) => {
        if (data?.verdict) {
          const v = data.verdict;
          return {
            outcome: v.match ? 'PASS' : 'FAIL',
            title: v.match
              ? 'Acknowledgement valid'
              : 'Acknowledgement stale — re-acknowledgement required',
            reason: v.match
              ? 'Stored content hash matches the current policy version.'
              : 'The policy has been republished since this acknowledgement; the employee must re-sign.',
            breakdown: [
              { label: 'Ack version', value: String(v.ackVersion ?? '—') },
              { label: 'Current version', value: String(v.currentVersion ?? '—') },
              { label: 'Match', value: String(v.match) },
            ],
          };
        }
        if (data?.record) {
          const r = data.record;
          return {
            outcome: 'PASS',
            title: r.version ? `Recorded · ${r.version}` : 'Recorded',
            reason: 'Action recorded with content hash + non-repudiable audit log entry.',
            breakdown: [
              { label: 'Policy ID', value: String(r.policyId ?? '') },
              { label: 'Version', value: String(r.version ?? '') },
              { label: 'Content hash', value: String(r.contentHash ?? '').slice(0, 16) + '…' },
              {
                label: r.acknowledgedAt ? 'Acknowledged at' : 'Published at',
                value: String(r.acknowledgedAt ?? r.publishedAt ?? ''),
              },
            ],
          };
        }
        return null;
      }}
    />
  );
}
