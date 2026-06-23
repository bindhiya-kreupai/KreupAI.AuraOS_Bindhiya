'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PolicyVersionDiffPage() {
  return (
    <EvaluatorPage
      title="Policy lifecycle — server-side version diff"
      titleAr="مقارنة إصدارات السياسات على الخادم"
      description="Show added / removed lines between two policy version bodies, plus deterministic hashes for evidentiary use."
      descriptionAr="عرض الفروق بين إصدارات السياسة."
      fields={[
        { name: 'policyId', label: 'Policy ID', labelAr: 'المعرف', type: 'text', required: true },
        {
          name: 'previousVersion',
          label: 'Previous version label',
          labelAr: 'الإصدار السابق',
          type: 'text',
        },
        {
          name: 'nextVersion',
          label: 'Next version label',
          labelAr: 'الإصدار التالي',
          type: 'text',
        },
        {
          name: 'previous',
          label: 'Previous body',
          labelAr: 'النص السابق',
          type: 'text',
          required: true,
          helpText: 'Paste full markdown body',
        },
        { name: 'next', label: 'Next body', labelAr: 'النص التالي', type: 'text', required: true },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/policy-lifecycle-compliance/lifecycle' }}
      buildPayload={(v) => ({
        action: 'diff',
        input: {
          policyId: String(v.policyId ?? ''),
          previousVersion: v.previousVersion ? String(v.previousVersion) : undefined,
          nextVersion: v.nextVersion ? String(v.nextVersion) : undefined,
          previous: String(v.previous ?? ''),
          next: String(v.next ?? ''),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.changed ? 'WARN' : 'PASS',
          title: v.changed ? `${v.addedLines} added, ${v.removedLines} removed` : 'No changes',
          reason: v.changed
            ? `Hash changed from ${v.previousHash.slice(0, 8)} to ${v.nextHash.slice(0, 8)}`
            : 'Bodies are identical — no diff to review.',
          reasonAr: v.changed ? 'يوجد تغييرات' : 'لا توجد تغييرات',
          breakdown: [
            { label: 'Added lines', value: String(v.addedLines) },
            { label: 'Removed lines', value: String(v.removedLines) },
            { label: 'Prev hash', value: v.previousHash.slice(0, 12) },
            { label: 'Next hash', value: v.nextHash.slice(0, 12) },
          ],
        };
      }}
    />
  );
}
