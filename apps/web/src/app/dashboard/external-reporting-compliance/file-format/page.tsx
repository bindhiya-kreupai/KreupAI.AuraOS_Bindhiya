'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FileFormatPage() {
  return (
    <EvaluatorPage
      title="External reporting — file format validator"
      titleAr="مدقق صيغة الملف"
      description="Validate a submission's columns, row count, and encoding against the regulator schema."
      descriptionAr="فحص أعمدة وحجم وترميز الملف مقابل مواصفات الجهة."
      fields={[
        {
          name: 'schemaId',
          label: 'Schema ID',
          labelAr: 'معرف المخطط',
          type: 'text',
          required: true,
          defaultValue: 'WPS_V1',
        },
        {
          name: 'specColumns',
          label: 'Spec columns (CSV)',
          labelAr: 'الأعمدة المطلوبة',
          type: 'text',
          required: true,
        },
        { name: 'maxRows', label: 'Max rows', labelAr: 'أقصى عدد صفوف', type: 'number' },
        {
          name: 'encoding',
          label: 'Required encoding',
          labelAr: 'الترميز المطلوب',
          type: 'select',
          defaultValue: 'UTF-8',
          options: ['UTF-8', 'UTF-16LE', 'CP1252'].map((e) => ({ value: e, label: e })),
        },
        {
          name: 'submissionColumns',
          label: 'Submission columns (CSV)',
          labelAr: 'أعمدة الملف',
          type: 'text',
          required: true,
        },
        {
          name: 'rowCount',
          label: 'Row count',
          labelAr: 'عدد الصفوف',
          type: 'number',
          required: true,
        },
        {
          name: 'submissionEncoding',
          label: 'Submission encoding',
          labelAr: 'ترميز الملف',
          type: 'select',
          options: ['UTF-8', 'UTF-16LE', 'CP1252'].map((e) => ({ value: e, label: e })),
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/external-reporting-compliance/reporting' }}
      buildPayload={(v) => ({
        action: 'format',
        input: {
          spec: {
            schemaId: String(v.schemaId ?? ''),
            columns: String(v.specColumns ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            maxRows: v.maxRows ? Number(v.maxRows) : undefined,
            encoding: v.encoding ? String(v.encoding) : undefined,
          },
          submission: {
            columns: String(v.submissionColumns ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            rowCount: Number(v.rowCount ?? 0),
            encoding: v.submissionEncoding ? String(v.submissionEncoding) : undefined,
          },
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.defects.length > 0 ? 'FAIL' : 'PASS',
          title: v.defects.length > 0 ? `${v.defects.length} defect(s)` : 'File matches spec',
          reason: v.reason.en,
          reasonAr: v.reason.ar,
          breakdown: [
            { label: 'Defects', value: v.defects.join(', ') || 'none' },
            { label: 'Missing cols', value: v.missingColumns.join(', ') || '—' },
            { label: 'Extra cols', value: v.extraColumns.join(', ') || '—' },
          ],
        };
      }}
    />
  );
}
