'use client';

/**
 * EPIC-30 Document classification + retention expiry evaluator page.
 *
 * Calls POST /api/v1/document-retention-compliance/classify.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DocumentClassifyPage() {
  return (
    <EvaluatorPage
      title="Document classification"
      titleAr="تصنيف الوثائق"
      description="Classify a document by filename / source / MIME type and compute its retention expiry date."
      descriptionAr="تصنيف وثيقة وحساب تاريخ انتهاء الاحتفاظ بها."
      fields={[
        { name: 'filename', label: 'Filename', type: 'text', required: true },
        { name: 'mimeType', label: 'MIME type', type: 'text', placeholder: 'application/pdf' },
        {
          name: 'source',
          label: 'Source',
          type: 'text',
          placeholder: 'PAYROLL_PAYSLIP_UPLOAD',
        },
        { name: 'createdAt', label: 'Created at', type: 'date' },
        { name: 'separationDate', label: 'Separation date (if applicable)', type: 'date' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/document-retention-compliance/classify' }}
      buildPayload={(v) => ({
        filename: v.filename,
        mimeType: v.mimeType || undefined,
        source: v.source || undefined,
        createdAt: v.createdAt || undefined,
        separationDate: v.separationDate || undefined,
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.category === 'OTHER' ? 'WARN' : 'PASS',
          title: v.category,
          reason: `Matched via "${v.matchedOn}". Retention: ${v.retention?.retentionYears} years${v.retention?.retainFromSeparation ? ' (from separation)' : ''}.`,
          severity: v.retention?.regulatoryBasis,
          breakdown: [
            { label: 'Category', value: String(v.category) },
            { label: 'Matched on', value: String(v.matchedOn) },
            { label: 'Retention years', value: String(v.retention?.retentionYears ?? '—') },
            {
              label: 'From separation',
              value: String(v.retention?.retainFromSeparation ?? false),
            },
            { label: 'Expiry', value: String(v.expiry ?? '—') },
          ],
        };
      }}
    />
  );
}
