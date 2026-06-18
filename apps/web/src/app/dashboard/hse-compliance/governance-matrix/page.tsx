'use client';

/**
 * EPIC-24 — HSE governance matrix evaluator.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function HseGovernanceMatrixPage() {
  return (
    <EvaluatorPage
      title="HSE governance matrix"
      titleAr="مصفوفة حوكمة الصحة والسلامة"
      description="Evaluate HSE governance controls against their required evidence cadence."
      descriptionAr="تقييم ضوابط حوكمة السلامة وفق دورات الإثبات المطلوبة."
      fields={[
        {
          name: 'controls',
          label: 'HSE controls',
          labelAr: 'الضوابط',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'code',
              label: 'Code',
              labelAr: 'الرمز',
              type: 'text',
              required: true,
              widthClass: 'w-28',
            },
            {
              key: 'label',
              label: 'Label',
              labelAr: 'العنوان',
              type: 'text',
              required: true,
              widthClass: 'w-48',
            },
            {
              key: 'domain',
              label: 'Domain',
              labelAr: 'النطاق',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'cadenceDays',
              label: 'Cadence (days)',
              labelAr: 'دورة (يوم)',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'evidenceType',
              label: 'Evidence type',
              labelAr: 'نوع الإثبات',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'requiredRoles',
              label: 'Required roles (csv)',
              labelAr: 'الأدوار',
              type: 'text',
              widthClass: 'w-40',
            },
          ],
        },
        {
          name: 'evidences',
          label: 'Evidence records',
          labelAr: 'سجلات الإثبات',
          type: 'structured-array',
          columns: [
            {
              key: 'controlCode',
              label: 'Control code',
              labelAr: 'الرمز',
              type: 'text',
              required: true,
              widthClass: 'w-28',
            },
            {
              key: 'evidencedAt',
              label: 'Evidenced at',
              labelAr: 'التاريخ',
              type: 'date',
              required: true,
              widthClass: 'w-36',
            },
            {
              key: 'evidencedBy',
              label: 'Evidenced by',
              labelAr: 'بواسطة',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'evidenceRef',
              label: 'Ref',
              labelAr: 'المرجع',
              type: 'text',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hse-compliance/hse-residuals' }}
      buildPayload={(v) => ({
        action: 'governance',
        input: {
          controls: ((v.controls as Array<Record<string, unknown>>) ?? []).map((r) => ({
            code: String(r.code ?? ''),
            label: String(r.label ?? ''),
            domain: String(r.domain ?? 'GOVERNANCE'),
            cadenceDays: Number(r.cadenceDays ?? 30),
            evidenceType: String(r.evidenceType ?? 'MINUTE'),
            requiredRoles: String(r.requiredRoles ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          })),
          evidences: ((v.evidences as Array<Record<string, unknown>>) ?? []).map((e) => ({
            controlCode: String(e.controlCode ?? ''),
            evidencedAt: new Date(String(e.evidencedAt)).toISOString(),
            evidencedBy: String(e.evidencedBy ?? ''),
            evidenceRef: e.evidenceRef ? String(e.evidenceRef) : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue === 0 ? 'PASS' : 'WARN',
          title: `${v.totals.coveragePct}% coverage`,
          reason:
            v.totals.overdue === 0
              ? 'All HSE controls evidenced within cadence.'
              : `${v.totals.overdue}/${v.totals.controls} controls overdue.`,
          breakdown: [
            { label: 'Controls', value: String(v.totals.controls) },
            { label: 'Overdue', value: String(v.totals.overdue) },
          ],
        };
      }}
    />
  );
}
