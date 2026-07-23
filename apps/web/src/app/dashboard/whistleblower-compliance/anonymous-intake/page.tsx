'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function WhistleblowerIntakePage() {
  return (
    <EvaluatorPage
      title="Whistleblower — anonymous intake"
      titleAr="استلام بلاغ المخبر — مجهول"
      description="Submit a confidential report. The system records a tenant-salted content hash so the reporter can later confirm authorship without revealing identity."
      descriptionAr="إرسال بلاغ سري. يتم تسجيل بصمة المحتوى مع ملح المستأجر لإثبات الإرسال لاحقاً دون كشف الهوية."
      fields={[
        {
          name: 'category',
          label: 'Category',
          labelAr: 'الفئة',
          type: 'select',
          required: true,
          options: [
            { value: 'FRAUD', label: 'Fraud' },
            { value: 'HARASSMENT', label: 'Harassment' },
            { value: 'DISCRIMINATION', label: 'Discrimination' },
            { value: 'SAFETY', label: 'Safety' },
            { value: 'BRIBERY', label: 'Bribery' },
            { value: 'OTHER', label: 'Other' },
          ],
        },
        {
          name: 'severity',
          label: 'Severity',
          labelAr: 'الخطورة',
          type: 'select',
          required: true,
          options: [
            { value: 'LOW', label: 'LOW' },
            { value: 'MEDIUM', label: 'MEDIUM' },
            { value: 'HIGH', label: 'HIGH' },
            { value: 'CRITICAL', label: 'CRITICAL' },
          ],
        },
        {
          name: 'body',
          label: 'Report (min 10 chars)',
          labelAr: 'تفاصيل البلاغ',
          type: 'text',
          required: true,
          helpText: 'Avoid including your name or other identifying details.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/whistleblower-compliance/intake' }}
      buildPayload={(v) => ({
        action: 'submit',
        input: {
          category: String(v.category ?? 'OTHER'),
          severity: String(v.severity ?? 'MEDIUM'),
          body: String(v.body ?? ''),
        },
      })}
      buildVerdict={(data: any) => {
        const s = data?.state;
        if (!s) return null;
        return {
          outcome: 'INFO',
          title: `Report received — ${s.reportId}`,
          reason: `Status: ${s.status}. Content hash: ${s.contentHash.slice(0, 16)}…`,
          reasonAr: `الحالة: ${s.status}.`,
          breakdown: [
            { label: 'Report ID', value: s.reportId },
            { label: 'Category', value: s.category },
            { label: 'Severity', value: s.severity },
            { label: 'Hash prefix', value: s.contentHash.slice(0, 16) },
          ],
        };
      }}
    />
  );
}
