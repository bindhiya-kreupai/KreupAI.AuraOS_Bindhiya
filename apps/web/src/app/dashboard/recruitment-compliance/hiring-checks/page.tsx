'use client';

/**
 * EPIC-22 — Recruitment hiring-compliance evaluator (equal-pay check on offer).
 *
 * Calls POST /api/v1/recruitment-compliance/hiring-checks with action=equalPay.
 * Sister flows (shortlistBias, nationalizationGate) hit the same endpoint
 * with different action discriminators.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function HiringChecksPage() {
  return (
    <EvaluatorPage
      title="Equal-pay band check on offer"
      titleAr="فحص نطاق المساواة في الأجور"
      description="Validate that the proposed offer sits within the pay band and aligns with peer median for the candidate's demographic group."
      descriptionAr="تحقق من أن العرض ضمن نطاق الأجور ومتوافق مع متوسط رواتب زملاء نفس المجموعة."
      fields={[
        { name: 'candidateGender', label: 'Candidate gender', labelAr: 'جنس المرشح', type: 'text' },
        {
          name: 'candidateNationality',
          label: 'Candidate nationality',
          labelAr: 'جنسية المرشح',
          type: 'text',
        },
        {
          name: 'offerSalary',
          label: 'Offer salary',
          labelAr: 'الراتب المعروض',
          type: 'number',
          required: true,
        },
        { name: 'grade', label: 'Grade', labelAr: 'الدرجة', type: 'text', required: true },
        { name: 'bandMin', label: 'Band min', labelAr: 'حد أدنى', type: 'number', required: true },
        {
          name: 'bandMid',
          label: 'Band mid',
          labelAr: 'نقطة وسطى',
          type: 'number',
          required: true,
        },
        { name: 'bandMax', label: 'Band max', labelAr: 'حد أقصى', type: 'number', required: true },
        {
          name: 'currency',
          label: 'Currency',
          labelAr: 'العملة',
          type: 'text',
          defaultValue: 'AED',
          required: true,
        },
        {
          name: 'peers',
          label: 'Peer comparators',
          labelAr: 'الأقران',
          type: 'structured-array',
          minRows: 0,
          columns: [
            {
              key: 'employeeId',
              label: 'Employee',
              labelAr: 'الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'grade',
              label: 'Grade',
              labelAr: 'الدرجة',
              type: 'text',
              required: true,
              widthClass: 'w-24',
            },
            {
              key: 'salary',
              label: 'Salary',
              labelAr: 'الراتب',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            { key: 'gender', label: 'Gender', labelAr: 'الجنس', type: 'text', widthClass: 'w-24' },
            {
              key: 'nationality',
              label: 'Nationality',
              labelAr: 'الجنسية',
              type: 'text',
              widthClass: 'w-24',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/recruitment-compliance/hiring-checks' }}
      buildPayload={(v) => ({
        action: 'equalPay',
        offerCandidate: {
          gender: String(v.candidateGender ?? '') || undefined,
          nationality: String(v.candidateNationality ?? '') || undefined,
        },
        offerSalary: Number(v.offerSalary ?? 0),
        band: {
          grade: String(v.grade ?? ''),
          min: Number(v.bandMin ?? 0),
          mid: Number(v.bandMid ?? 0),
          max: Number(v.bandMax ?? 0),
          currency: String(v.currency ?? 'AED'),
        },
        peers: (v.peers as Array<Record<string, unknown>>) ?? [],
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.outcome,
          title: `Band position: ${v.bandPosition} (compa-ratio ${v.compaRatio})`,
          reason: v.reasons?.[0]?.en ?? '',
          reasonAr: v.reasons?.[0]?.ar,
          breakdown: [
            { label: 'Compa-ratio', value: String(v.compaRatio) },
            { label: 'Band position', value: v.bandPosition },
            v.gapPct !== undefined
              ? { label: 'Peer-gap %', value: `${(v.gapPct * 100).toFixed(1)}%` }
              : null,
          ].filter(Boolean) as Array<{ label: string; value: string }>,
        };
      }}
    />
  );
}
