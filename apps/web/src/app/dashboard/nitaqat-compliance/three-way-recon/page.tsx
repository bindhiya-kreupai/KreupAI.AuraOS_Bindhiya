'use client';

/**
 * EPIC-17 Nitaqat / GOSI / Mudad three-way reconciliation page.
 *
 * Calls POST /api/v1/nitaqat-compliance/three-way-recon.
 *
 * Each of the three source registers (Qiwa, GOSI, Mudad) is captured
 * via a StructuredArrayEditor — one row per worker. Replaces the
 * prior "paste a JSON array" textarea hack.
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
          name: 'qiwa',
          label: 'Qiwa records (declared roster)',
          labelAr: 'سجلات قِوى',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'nationalId',
              label: 'National ID',
              labelAr: 'رقم الهوية',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'declaredWageSar',
              label: 'Declared wage (SAR)',
              labelAr: 'الأجر المُعلن',
              type: 'number',
              required: true,
              widthClass: 'w-36',
            },
            {
              key: 'status',
              label: 'Status',
              labelAr: 'الحالة',
              type: 'select',
              options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ],
              widthClass: 'w-28',
            },
          ],
        },
        {
          name: 'gosi',
          label: 'GOSI records (insurance roster)',
          labelAr: 'سجلات التأمينات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'nationalId',
              label: 'National ID',
              labelAr: 'رقم الهوية',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'contributionWageSar',
              label: 'Contribution wage (SAR)',
              labelAr: 'أجر الاشتراك',
              type: 'number',
              required: true,
              widthClass: 'w-36',
            },
            {
              key: 'status',
              label: 'Status',
              labelAr: 'الحالة',
              type: 'select',
              options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ],
              widthClass: 'w-28',
            },
          ],
        },
        {
          name: 'mudad',
          label: 'Mudad records (payroll roster)',
          labelAr: 'سجلات مدد',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'nationalId',
              label: 'National ID',
              labelAr: 'رقم الهوية',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'paidWageSar',
              label: 'Paid wage (SAR)',
              labelAr: 'الأجر المدفوع',
              type: 'number',
              required: true,
              widthClass: 'w-36',
            },
            {
              key: 'paidThisPeriod',
              label: 'Paid this period',
              labelAr: 'مدفوع هذه الدورة',
              type: 'boolean',
              widthClass: 'w-28',
            },
          ],
        },
        {
          name: 'wageToleranceSar',
          label: 'Wage tolerance (SAR)',
          labelAr: 'هامش تفاوت الأجر',
          type: 'number',
          helpText: 'Differences within this tolerance are ignored.',
          helpTextAr: 'تجاهل الفروق التي ضمن هذا الهامش.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/nitaqat-compliance/three-way-recon' }}
      buildPayload={(v) => ({
        qiwa: (v.qiwa as unknown[]) ?? [],
        gosi: (v.gosi as unknown[]) ?? [],
        mudad: (v.mudad as unknown[]) ?? [],
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
