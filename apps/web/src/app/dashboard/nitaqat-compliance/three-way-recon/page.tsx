'use client';

/**
 * EPIC-17 Nitaqat / GOSI / Mudad three-way reconciliation page.
 *
 * Calls POST /api/v1/nitaqat-compliance/three-way-recon.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ThreeWayReconPage() {
  return (
    <EvaluatorPage
      title="Nitaqat / GOSI / Mudad reconciliation"
      titleAr="تسوية نطاقات / التأمينات / مدد"
      description="Reconcile Qiwa, GOSI and Mudad records by national ID to surface ghost-Saudization and wage-inflation risk."
      descriptionAr="مطابقة بيانات قِوى والتأمينات ومدد للكشف عن السعودة الوهمية."
      fields={[
        {
          name: 'qiwaJson',
          label: 'Qiwa records (JSON array)',
          type: 'text',
          required: true,
          placeholder: '[{"nationalId":"...","declaredWageSar":4000,"status":"ACTIVE"}]',
        },
        {
          name: 'gosiJson',
          label: 'GOSI records (JSON array)',
          type: 'text',
          required: true,
          placeholder: '[{"nationalId":"...","contributionWageSar":4000,"status":"ACTIVE"}]',
        },
        {
          name: 'mudadJson',
          label: 'Mudad records (JSON array)',
          type: 'text',
          required: true,
          placeholder: '[{"nationalId":"...","paidWageSar":4000,"paidThisPeriod":true}]',
        },
        { name: 'wageToleranceSar', label: 'Wage tolerance (SAR)', type: 'number' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/nitaqat-compliance/three-way-recon' }}
      buildPayload={(v) => ({
        qiwa: safeParse(v.qiwaJson),
        gosi: safeParse(v.gosiJson),
        mudad: safeParse(v.mudadJson),
        wageToleranceSar: v.wageToleranceSar ? Number(v.wageToleranceSar) : undefined,
      })}
      buildVerdict={(data: any) => {
        const r = data?.result;
        if (!r) return null;
        const t = r.totals;
        const totalDisc = t.discrepancies;
        return {
          outcome: totalDisc > 0 ? 'WARN' : 'PASS',
          title: `${totalDisc} discrepanc${totalDisc === 1 ? 'y' : 'ies'}`,
          reason:
            totalDisc > 0
              ? `Ghost / mismatch signals across Qiwa (${t.qiwa}), GOSI (${t.gosi}), Mudad (${t.mudad}).`
              : 'Records align cleanly across all three sources.',
          severity: totalDisc > 0 ? 'RISK' : undefined,
          breakdown: [
            { label: 'Qiwa-only', value: String(t.qiwaOnly) },
            { label: 'Qiwa+GOSI not Mudad', value: String(t.qiwaGosiNotMudad) },
            { label: 'Qiwa+Mudad not GOSI', value: String(t.qiwaMudadNotGosi) },
            { label: 'GOSI+Mudad not Qiwa', value: String(t.gosiMudadNotQiwa) },
            { label: 'Wage mismatch', value: String(t.wageMismatch) },
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
