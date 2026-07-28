'use client';

import { useEffect, useState } from 'react';
import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FileFormatPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/v1/external-reporting-compliance/reporting');
        const data = await res.json();
        if (data.success && data.data) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error('Failed to load file format defaults', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading formats from database...</p>
      </main>
    );
  }

  const spec = initialData?.extFormatSpec || {};
  const submission = initialData?.extFormatSubmission || {};

  return (
    <EvaluatorPage
      title="External reporting — file format validator"
      titleAr="مدقق صيغة الملف"
      description="Validate a submission's columns, row count, and encoding against the regulator schema. Specifications are persisted to the database."
      descriptionAr="فحص أعمدة وحجم وترميز الملف مقابل مواصفات الجهة."
      fields={[
        {
          name: 'schemaId',
          label: 'Schema ID',
          labelAr: 'معرف المخطط',
          type: 'text',
          required: true,
          defaultValue: spec.schemaId || 'WPS_V1',
        },
        {
          name: 'specColumns',
          label: 'Spec columns (CSV)',
          labelAr: 'الأعمدة المطلوبة',
          type: 'text',
          required: true,
          defaultValue: spec.columns
            ? spec.columns.join(', ')
            : 'EmployeeID, Salary, Allowance, Currency',
        },
        {
          name: 'maxRows',
          label: 'Max rows',
          labelAr: 'أقصى عدد صفوف',
          type: 'number',
          defaultValue: spec.maxRows ? String(spec.maxRows) : '1000',
        },
        {
          name: 'encoding',
          label: 'Required encoding',
          labelAr: 'الترميز المطلوب',
          type: 'select',
          defaultValue: spec.encoding || 'UTF-8',
          options: ['UTF-8', 'UTF-16LE', 'CP1252'].map((e) => ({ value: e, label: e })),
        },
        {
          name: 'submissionColumns',
          label: 'Submission columns (CSV)',
          labelAr: 'أعمدة الملف',
          type: 'text',
          required: true,
          defaultValue: submission.columns
            ? submission.columns.join(', ')
            : 'EmployeeID, Salary, Allowance, Currency',
        },
        {
          name: 'rowCount',
          label: 'Row count',
          labelAr: 'عدد الصفوف',
          type: 'number',
          required: true,
          defaultValue: submission.rowCount !== undefined ? String(submission.rowCount) : '250',
        },
        {
          name: 'submissionEncoding',
          label: 'Submission encoding',
          labelAr: 'ترميز الملف',
          type: 'select',
          defaultValue: submission.encoding || 'UTF-8',
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
