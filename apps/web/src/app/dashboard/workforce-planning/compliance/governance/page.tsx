'use client';

/**
 * EPIC-03-S07 — Governance control matrix evaluator page.
 *
 * Calls POST /api/v1/workforce-planning/governance.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function GovernancePage() {
  return (
    <EvaluatorPage
      title="Workforce governance control matrix"
      titleAr="مصفوفة ضوابط الحوكمة"
      description="Track whether every required workforce-planning control has fresh evidence within its cadence window."
      descriptionAr="تتبع وجود دليل حديث ضمن دورة كل ضابط حوكمة مطلوب."
      fields={[
        {
          name: 'controls',
          label: 'Required controls',
          labelAr: 'الضوابط المطلوبة',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            { key: 'code', label: 'Code', type: 'text', required: true, widthClass: 'w-32' },
            { key: 'label', label: 'Label', type: 'text', required: true, widthClass: 'w-48' },
            { key: 'domain', label: 'Domain', type: 'text', required: true, widthClass: 'w-32' },
            {
              key: 'cadenceDays',
              label: 'Cadence (days)',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'evidenceType',
              label: 'Evidence type',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
          ],
        },
        {
          name: 'evidences',
          label: 'Recorded evidence',
          labelAr: 'الأدلة المسجلة',
          type: 'structured-array',
          columns: [
            {
              key: 'controlCode',
              label: 'Control code',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'evidencedAt',
              label: 'Evidenced at (ISO)',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
            {
              key: 'evidencedBy',
              label: 'Evidenced by',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
          ],
        },
        {
          name: 'asOf',
          label: 'As-of date (ISO, optional)',
          labelAr: 'تاريخ التقييم',
          type: 'text',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/workforce-planning/governance' }}
      buildPayload={(v) => {
        const controls = ((v.controls as Array<Record<string, unknown>>) ?? []).map((c) => ({
          code: String(c.code ?? ''),
          label: String(c.label ?? ''),
          domain: String(c.domain ?? ''),
          requiredRoles: [] as string[],
          cadenceDays: Number(c.cadenceDays ?? 90),
          evidenceType: String(c.evidenceType ?? 'SIGNED_MINUTE'),
        }));
        const evidences = ((v.evidences as Array<Record<string, unknown>>) ?? []).map((e) => ({
          controlCode: String(e.controlCode ?? ''),
          evidencedAt: new Date(String(e.evidencedAt ?? new Date().toISOString())).toISOString(),
          evidencedBy: String(e.evidencedBy ?? ''),
        }));
        const asOf = v.asOf ? new Date(String(v.asOf)).toISOString() : undefined;
        return { controls, evidences, asOf };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const t = v.totals;
        const outcome = t.overdue === 0 ? 'PASS' : t.coveragePct >= 50 ? 'WARN' : 'FAIL';
        return {
          outcome,
          title: `${t.coveragePct}% on-time`,
          reason:
            t.overdue > 0
              ? `${t.overdue} of ${t.controls} controls overdue.`
              : 'All controls evidenced within cadence.',
          breakdown: [
            { label: 'Controls', value: String(t.controls) },
            { label: 'Overdue', value: String(t.overdue) },
            { label: 'Coverage %', value: `${t.coveragePct}%` },
          ],
        };
      }}
    />
  );
}
