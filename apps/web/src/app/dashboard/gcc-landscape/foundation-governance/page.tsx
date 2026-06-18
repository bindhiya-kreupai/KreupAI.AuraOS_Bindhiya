'use client';

/**
 * EPIC-01 Foundation governance evaluator page.
 *
 * Single page that exposes three governance evaluators backed by the
 * shared foundation-governance API. We render the simplest entry —
 * bilingual error catalog lookup — by default; users can paste a
 * policy JSON for PII masking via the structured-array editor.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FoundationGovernancePage() {
  return (
    <EvaluatorPage
      title="Bilingual error-catalog lookup"
      titleAr="بحث كتالوج الأخطاء ثنائي اللغة"
      description="Resolve an API error code to its canonical en + ar message, severity, and HTTP status."
      descriptionAr="تحويل رمز خطأ من واجهة برمجة التطبيقات إلى الرسالة الموحدة بالعربية والإنجليزية ودرجة الخطورة."
      fields={[
        {
          name: 'code',
          label: 'Error code',
          labelAr: 'رمز الخطأ',
          type: 'text',
          required: true,
          defaultValue: 'E4030',
          helpText: 'Example: E2001, E4030, E5001',
        },
        {
          name: 'fallback',
          label: 'Fallback (en) — used when code unknown',
          labelAr: 'الرسالة الاحتياطية (إنجليزي)',
          type: 'text',
          helpText: 'Optional: shown if the code is not in the catalog.',
        },
        {
          name: 'fallbackAr',
          label: 'Fallback (ar)',
          labelAr: 'الرسالة الاحتياطية (عربي)',
          type: 'text',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/gcc-landscape/foundation-governance' }}
      buildPayload={(v) => ({
        action: 'error-catalog',
        code: String(v.code ?? ''),
        fallback: v.fallback ? String(v.fallback) : undefined,
        fallbackAr: v.fallbackAr ? String(v.fallbackAr) : undefined,
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const outcome: 'PASS' | 'INFO' = v.matched ? 'PASS' : 'INFO';
        return {
          outcome,
          title: v.matched ? `${v.code} · ${v.severity}` : `${v.code} (not catalogued)`,
          reason: v.message,
          reasonAr: v.messageAr,
          breakdown: [
            { label: 'HTTP status', value: String(v.httpStatus) },
            { label: 'Severity', value: v.severity },
            { label: 'Matched', value: v.matched ? 'true' : 'false' },
            { label: 'Arabic message', value: v.messageAr },
          ],
        };
      }}
    />
  );
}
