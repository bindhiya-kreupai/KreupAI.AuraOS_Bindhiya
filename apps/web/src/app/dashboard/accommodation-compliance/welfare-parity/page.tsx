'use client';

/**
 * EPIC-23 — Contractor accommodation parity check.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

const profileColumns = [
  {
    key: 'label',
    label: 'Label',
    labelAr: 'الوسم',
    type: 'text' as const,
    required: true,
    widthClass: 'w-32',
  },
  {
    key: 'occupants',
    label: 'Occupants',
    labelAr: 'الشاغلون',
    type: 'number' as const,
    required: true,
    widthClass: 'w-28',
  },
  {
    key: 'floorAreaM2',
    label: 'Floor area (m²)',
    labelAr: 'المساحة م²',
    type: 'number' as const,
    required: true,
    widthClass: 'w-32',
  },
  {
    key: 'hygieneScore',
    label: 'Hygiene (0..100)',
    labelAr: 'نظافة',
    type: 'number' as const,
    required: true,
    widthClass: 'w-28',
  },
  {
    key: 'fireScore',
    label: 'Fire (0..100)',
    labelAr: 'حريق',
    type: 'number' as const,
    required: true,
    widthClass: 'w-28',
  },
  {
    key: 'acProvided',
    label: 'AC',
    labelAr: 'تكييف',
    type: 'boolean' as const,
    widthClass: 'w-20',
  },
  {
    key: 'messProvided',
    label: 'Mess',
    labelAr: 'مطعم',
    type: 'boolean' as const,
    widthClass: 'w-20',
  },
];

export default function WelfareParityPage() {
  return (
    <EvaluatorPage
      title="Contractor accommodation parity check"
      titleAr="فحص تكافؤ سكن المقاولين"
      description="Compare contractor accommodation against the principal employer's standard."
      descriptionAr="مقارنة سكن المقاول مع معيار صاحب العمل."
      fields={[
        {
          name: 'principal',
          label: 'Principal employer accommodation (1 row)',
          labelAr: 'سكن صاحب العمل (سطر واحد)',
          type: 'structured-array',
          required: true,
          minRows: 1,
          maxRows: 1,
          columns: profileColumns,
        },
        {
          name: 'contractors',
          label: 'Contractor accommodations',
          labelAr: 'سكنات المقاولين',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: profileColumns,
        },
        {
          name: 'toleranceFraction',
          label: 'Tolerance (0..1)',
          labelAr: 'هامش (0..1)',
          type: 'number',
          helpText: 'Default 0.1 (10%).',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/accommodation-compliance/welfare-ops' }}
      buildPayload={(v) => {
        const toRow = (r: Record<string, unknown>) => ({
          label: String(r.label ?? ''),
          occupants: Number(r.occupants ?? 0),
          floorAreaM2: Number(r.floorAreaM2 ?? 0),
          hygieneScore: Number(r.hygieneScore ?? 0),
          fireScore: Number(r.fireScore ?? 0),
          acProvided: Boolean(r.acProvided),
          messProvided: Boolean(r.messProvided),
        });
        const principal = ((v.principal as Array<Record<string, unknown>>) ?? [])[0] ?? {};
        return {
          action: 'parity',
          input: {
            principal: toRow(principal),
            contractors: ((v.contractors as Array<Record<string, unknown>>) ?? []).map(toRow),
            toleranceFraction: v.toleranceFraction ? Number(v.toleranceFraction) : undefined,
          },
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.gaps.length === 0 ? 'PASS' : 'WARN',
          title: `${v.totals.parityPct}% parity`,
          reason:
            v.gaps.length === 0
              ? 'All contractor accommodations meet parity.'
              : `${v.totals.contractorsWithGaps} contractor(s) below parity.`,
          breakdown: [
            { label: 'Contractors checked', value: String(v.totals.contractorsChecked) },
            { label: 'With gaps', value: String(v.totals.contractorsWithGaps) },
            { label: 'Total gaps', value: String(v.totals.gaps) },
          ],
        };
      }}
    />
  );
}
