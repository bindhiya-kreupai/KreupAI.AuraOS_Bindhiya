'use client';

/**
 * EPIC-13 KSA / EPIC-14 UAE — WPS file-format validator evaluator page.
 *
 * Validates a pasted WPS file against the header context. Bilingual
 * reasons surface in the verdict breakdown.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function WpsFileFormatValidatorPage() {
  return (
    <EvaluatorPage
      title="WPS file-format validator"
      titleAr="مدقق صيغة ملف حماية الأجور"
      description="Paste a WPS file, choose the format, and check the header, IBANs, totals, and trailer."
      descriptionAr="الصق ملف حماية الأجور واختر الصيغة للتحقق من الرأس والآيبان والإجماليات والتذييل."
      fields={[
        {
          name: 'format',
          label: 'File format',
          labelAr: 'صيغة الملف',
          type: 'select',
          required: true,
          options: [
            { value: 'SIF', label: 'UAE SIF' },
            { value: 'MUDAD', label: 'KSA Mudad' },
            { value: 'QWPS', label: 'Qatar WPS' },
            { value: 'BWPS', label: 'Bahrain WPS' },
            { value: 'OWPS', label: 'Oman WPS' },
            { value: 'KWPS', label: 'Kuwait WPS' },
          ],
        },
        {
          name: 'employerId',
          label: 'Employer ID',
          labelAr: 'رقم صاحب العمل',
          type: 'text',
          required: true,
        },
        {
          name: 'period',
          label: 'Period (YYYY-MM)',
          labelAr: 'الفترة',
          type: 'text',
          required: true,
        },
        {
          name: 'countryCode',
          label: 'Country code (ISO-2)',
          labelAr: 'رمز الدولة',
          type: 'text',
          required: true,
          defaultValue: 'AE',
        },
        {
          name: 'content',
          label: 'File content',
          labelAr: 'محتوى الملف',
          type: 'text',
          required: true,
          helpText: 'Paste the file contents verbatim.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/wps-compliance/file-format-validator' }}
      buildPayload={(v) => ({
        format: String(v.format ?? 'SIF'),
        content: String(v.content ?? ''),
        expected: {
          employerId: String(v.employerId ?? ''),
          period: String(v.period ?? ''),
          countryCode: String(v.countryCode ?? 'AE'),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const outcome: 'PASS' | 'FAIL' | 'WARN' = v.valid
          ? v.totals?.warnings > 0
            ? 'WARN'
            : 'PASS'
          : 'FAIL';
        return {
          outcome,
          title: v.valid
            ? `Valid (${v.parsedRows} rows · total ${v.parsedTotalAmount})`
            : `${v.totals?.errors ?? 0} error(s) found`,
          reason: `Format ${v.format} · ${v.parsedRows} rows · ${v.totals?.errors ?? 0} errors · ${v.totals?.warnings ?? 0} warnings`,
          breakdown: (v.issues ?? []).slice(0, 24).map((i: any) => ({
            label: `${i.severity} · line ${i.line}${i.employeeCode ? ` (${i.employeeCode})` : ''}`,
            value: i.message,
          })),
        };
      }}
    />
  );
}
