'use client';

/**
 * EPIC-15 SIO ↔ LMRA alignment evaluator page.
 *
 * Calls POST /api/v1/sio-compliance/lmra-alignment.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function SioLmraAlignmentPage() {
  return (
    <EvaluatorPage
      title="SIO ↔ LMRA alignment"
      titleAr="مطابقة التأمينات والعمل"
      description="Diff Bahrain SIO declarations against LMRA records by CPR to surface only-in-SIO, only-in-LMRA, wage mismatches and status mismatches."
      descriptionAr="مقارنة بيانات التأمينات الاجتماعية مع هيئة تنظيم سوق العمل البحرينية."
      fields={[
        {
          name: 'sioJson',
          label: 'SIO records (JSON)',
          type: 'text',
          required: true,
          placeholder: '[{"cpr":"123","declaredWageBhd":400,"status":"ACTIVE"}]',
        },
        {
          name: 'lmraJson',
          label: 'LMRA records (JSON)',
          type: 'text',
          required: true,
          placeholder: '[{"cpr":"123","declaredWageBhd":380,"status":"ACTIVE"}]',
        },
        { name: 'wageToleranceBhd', label: 'Wage tolerance (BHD)', type: 'number' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/sio-compliance/lmra-alignment' }}
      buildPayload={(v) => ({
        sioRecords: safeParse(v.sioJson),
        lmraRecords: safeParse(v.lmraJson),
        wageToleranceBhd: v.wageToleranceBhd ? Number(v.wageToleranceBhd) : undefined,
      })}
      buildVerdict={(data: any) => {
        const r = data?.result;
        if (!r) return null;
        const s = r.summary;
        const hasDrift = s.onlyInSio + s.onlyInLmra + s.wageMismatch + s.statusMismatch > 0;
        return {
          outcome: hasDrift ? 'WARN' : 'PASS',
          title: `${s.alignmentPct}% aligned`,
          reason: hasDrift
            ? `Drift detected: ${s.onlyInSio} only-in-SIO, ${s.onlyInLmra} only-in-LMRA, ${s.wageMismatch} wage mismatches, ${s.statusMismatch} status mismatches.`
            : 'All records align within tolerance.',
          severity: hasDrift ? 'DRIFT' : undefined,
          breakdown: [
            { label: 'SIO total', value: String(s.totalSio) },
            { label: 'LMRA total', value: String(s.totalLmra) },
            { label: 'Only in SIO', value: String(s.onlyInSio) },
            { label: 'Only in LMRA', value: String(s.onlyInLmra) },
            { label: 'Wage mismatch', value: String(s.wageMismatch) },
            { label: 'Status mismatch', value: String(s.statusMismatch) },
            { label: 'Alignment %', value: String(s.alignmentPct) },
          ],
        };
      }}
    />
  );
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
