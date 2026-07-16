'use client';

/**
 * Recruitment compliance — Background Verification (BGV).
 *
 * Wraps POST /api/v1/recruitment-compliance/bgv, whose body is a discriminated
 * union on `action`:
 *   open    { caseId, candidateId, vendorName? }        → create a BGV case
 *   consent { bgvCaseId, consentRef }                   → capture consent
 *   check   { bgvCaseId, checkType, result?, ... }      → add / update a check
 *
 * The endpoint has no GET, so the returned record is shown inline as a verdict.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EvaluatorPage } from '@aura/ui/components/ui';
import type { EvaluatorField } from '@aura/ui/components/ui';

function unwrapList(payload: unknown): any[] {
  const data = (payload as any)?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function BgvPage() {
  const [candidateOptions, setCandidateOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/recruitment/candidates?limit=100');
        const json = await res.json();
        setCandidateOptions(
          unwrapList(json).map((c: any) => ({
            value: c.id,
            label: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.id,
          }))
        );
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    })();
  }, []);

  const fields: EvaluatorField[] = useMemo(
    () => [
      {
        name: 'action',
        label: 'Action',
        labelAr: 'الإجراء',
        type: 'select',
        required: true,
        defaultValue: 'open',
        helpText: 'open = new BGV case · consent = capture consent · check = add/update a check',
        options: [
          { value: 'open', label: 'Open BGV case' },
          { value: 'consent', label: 'Capture consent' },
          { value: 'check', label: 'Add / update check' },
        ],
      },
      // open
      {
        name: 'caseId',
        label: 'Recruitment case ID (open)',
        labelAr: 'معرّف الحالة',
        type: 'text',
      },
      candidateOptions.length
        ? {
            name: 'candidateId',
            label: 'Candidate (open)',
            labelAr: 'المرشح',
            type: 'select',
            options: candidateOptions,
          }
        : {
            name: 'candidateId',
            label: 'Candidate ID (open)',
            labelAr: 'معرّف المرشح',
            type: 'text',
          },
      { name: 'vendorName', label: 'Vendor name (open)', labelAr: 'اسم المورد', type: 'text' },
      // consent / check
      {
        name: 'bgvCaseId',
        label: 'BGV case ID (consent/check)',
        labelAr: 'معرّف حالة الفحص',
        type: 'text',
      },
      {
        name: 'consentRef',
        label: 'Consent reference (consent)',
        labelAr: 'مرجع الموافقة',
        type: 'text',
      },
      // check
      {
        name: 'checkType',
        label: 'Check type (check)',
        labelAr: 'نوع الفحص',
        type: 'text',
        placeholder: 'IDENTITY',
      },
      {
        name: 'result',
        label: 'Result (check)',
        labelAr: 'النتيجة',
        type: 'select',
        options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'PASS', label: 'Pass' },
          { value: 'FAIL', label: 'Fail' },
          { value: 'DISCREPANCY', label: 'Discrepancy' },
          { value: 'WAIVED', label: 'Waived' },
        ],
      },
      {
        name: 'discrepancyAction',
        label: 'Discrepancy action (check)',
        labelAr: 'إجراء التباين',
        type: 'select',
        options: [
          { value: 'ESCALATE', label: 'Escalate' },
          { value: 'ACCEPT', label: 'Accept' },
          { value: 'REJECT', label: 'Reject' },
        ],
      },
      {
        name: 'vendorRef',
        label: 'Vendor reference (check)',
        labelAr: 'مرجع المورد',
        type: 'text',
      },
      { name: 'evidenceUrl', label: 'Evidence URL (check)', labelAr: 'رابط الدليل', type: 'text' },
      { name: 'notes', label: 'Notes (check)', labelAr: 'ملاحظات', type: 'text' },
    ],
    [candidateOptions]
  );

  const buildPayload = (v: Record<string, unknown>) => {
    const action = (v.action as string) || 'open';
    if (action === 'consent') {
      return { action, bgvCaseId: v.bgvCaseId, consentRef: v.consentRef };
    }
    if (action === 'check') {
      return {
        action,
        bgvCaseId: v.bgvCaseId,
        checkType: v.checkType,
        result: v.result || undefined,
        discrepancyAction: v.discrepancyAction || undefined,
        vendorRef: v.vendorRef || undefined,
        evidenceUrl: v.evidenceUrl || undefined,
        notes: v.notes || undefined,
      };
    }
    return {
      action: 'open',
      caseId: v.caseId,
      candidateId: v.candidateId,
      vendorName: v.vendorName || undefined,
    };
  };

  return (
    <EvaluatorPage
      title="Background Verification"
      titleAr="التحقق من الخلفية"
      description="Open a BGV case, capture candidate consent, or record a background check. Fields are labelled by the action they apply to."
      descriptionAr="افتح حالة تحقق من الخلفية، أو سجّل موافقة المرشح، أو أضف فحصًا. الحقول موسومة بالإجراء الذي تنطبق عليه."
      fields={fields}
      submitLabel="Submit action"
      submitLabelAr="إرسال الإجراء"
      endpoint={{ method: 'POST', url: '/api/v1/recruitment-compliance/bgv' }}
      buildPayload={buildPayload}
      buildVerdict={(data: any) => {
        const record = data?.data ?? data;
        const status: string | undefined = record?.status ?? record?.result;
        if (!record) return null;
        const outcome =
          status === 'PASSED' || status === 'PASS'
            ? 'PASS'
            : status === 'FAIL' || status === 'FAILED'
              ? 'FAIL'
              : status === 'DISCREPANCY'
                ? 'WARN'
                : 'INFO';
        return {
          outcome,
          title: status ? `BGV status: ${status}` : 'Action recorded',
          reason: record?.id ? `Record ${record.id} updated.` : 'The BGV action was processed.',
          breakdown: [
            { label: 'BGV case ID', value: String(record?.bgvCaseId ?? record?.id ?? '—') },
            { label: 'Status', value: String(status ?? '—') },
          ],
        };
      }}
    />
  );
}
