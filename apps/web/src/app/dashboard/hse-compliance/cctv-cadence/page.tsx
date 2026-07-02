'use client';

/**
 * EPIC-24 — Surveillance / CCTV cadence evaluator.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function CctvCadencePage() {
  return (
    <EvaluatorPage
      title="CCTV / surveillance cadence"
      titleAr="دورة فحص المراقبة"
      description="Audit camera functional checks and retention compliance."
      descriptionAr="مراجعة فحص الكاميرات ومدة الاحتفاظ."
      fields={[
        {
          name: 'cameras',
          label: 'Cameras (csv)',
          labelAr: 'الكاميرات (مفصولة بفواصل)',
          type: 'text',
          required: true,
          helpText: 'Comma-separated list of camera IDs.',
        },
        {
          name: 'cadenceDays',
          label: 'Functional-check cadence (days)',
          labelAr: 'دورة الفحص (يوم)',
          type: 'number',
          helpText: 'Default 30.',
        },
        {
          name: 'requiredRetentionDays',
          label: 'Required retention (days)',
          labelAr: 'احتفاظ مطلوب (يوم)',
          type: 'number',
          helpText: 'Default 90.',
        },
        {
          name: 'checks',
          label: 'Checks',
          labelAr: 'سجلات الفحص',
          type: 'structured-array',
          columns: [
            {
              key: 'cameraId',
              label: 'Camera',
              labelAr: 'الكاميرا',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'checkedAt',
              label: 'Checked at',
              labelAr: 'التاريخ',
              type: 'text',
              required: true,
              widthClass: 'w-36',
            },
            {
              key: 'functional',
              label: 'Functional',
              labelAr: 'تعمل',
              type: 'boolean',
              widthClass: 'w-24',
            },
            {
              key: 'retentionDays',
              label: 'Retention (d)',
              labelAr: 'احتفاظ',
              type: 'number',
              required: true,
              widthClass: 'w-28',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/hse-compliance/hse-residuals' }}
      buildPayload={(v) => ({
        action: 'cctv',
        input: {
          cameras: String(v.cameras ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          cadenceDays: v.cadenceDays ? Number(v.cadenceDays) : undefined,
          requiredRetentionDays: v.requiredRetentionDays
            ? Number(v.requiredRetentionDays)
            : undefined,
          checks: ((v.checks as Array<Record<string, unknown>>) ?? []).map((c) => ({
            cameraId: String(c.cameraId ?? ''),
            checkedAt: new Date(String(c.checkedAt)).toISOString(),
            functional: Boolean(c.functional),
            retentionDays: Number(c.retentionDays ?? 0),
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.failures.length === 0 ? 'PASS' : 'FAIL',
          title: `${v.totals.coveragePct}% coverage`,
          reason:
            v.failures.length === 0
              ? 'All cameras within cadence and retention.'
              : `${v.failures.length} failure(s).`,
          breakdown: [
            { label: 'Cameras', value: String(v.totals.camerasInScope) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Not functional', value: String(v.totals.notFunctional) },
          ],
        };
      }}
    />
  );
}
