'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

const COUNTRY_OPTS = ['SAU', 'ARE', 'BHR', 'KWT', 'OMN', 'QAT', 'EU', 'US', 'IND', 'OTHER'].map(
  (c) => ({ value: c, label: c })
);

export default function CrossBorderTransferPage() {
  return (
    <EvaluatorPage
      title="Data privacy — cross-border transfer eligibility"
      titleAr="أهلية نقل البيانات عبر الحدود"
      description="Verify each planned cross-border transfer has a valid legal basis under the source PDPL."
      descriptionAr="التحقق من الأساس القانوني لكل نقل بيانات عبر الحدود."
      fields={[
        {
          name: 'requests',
          label: 'Transfers',
          labelAr: 'عمليات النقل',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'transferId',
              label: 'ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'fromCountry',
              label: 'From',
              labelAr: 'من',
              type: 'select',
              required: true,
              options: COUNTRY_OPTS,
              widthClass: 'w-24',
            },
            {
              key: 'toCountry',
              label: 'To',
              labelAr: 'إلى',
              type: 'select',
              required: true,
              options: COUNTRY_OPTS,
              widthClass: 'w-24',
            },
            {
              key: 'dataCategory',
              label: 'Data category',
              labelAr: 'فئة البيانات',
              type: 'select',
              required: true,
              options: ['GENERIC', 'SENSITIVE', 'SPECIAL_CATEGORY', 'HEALTH', 'BIOMETRIC'].map(
                (c) => ({ value: c, label: c })
              ),
              widthClass: 'w-36',
            },
            {
              key: 'legalBasis',
              label: 'Legal basis',
              labelAr: 'الأساس القانوني',
              type: 'select',
              options: [
                'ADEQUACY_DECISION',
                'SCC',
                'BCR',
                'CONSENT',
                'CONTRACT',
                'PUBLIC_INTEREST',
                'NONE',
              ].map((c) => ({ value: c, label: c })),
              widthClass: 'w-40',
            },
            {
              key: 'hasDpia',
              label: 'DPIA done',
              labelAr: 'تقييم أثر',
              type: 'boolean',
              widthClass: 'w-24',
            },
            {
              key: 'hasDataSubjectConsent',
              label: 'Consent',
              labelAr: 'الموافقة',
              type: 'boolean',
              widthClass: 'w-24',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/data-privacy-compliance/privacy' }}
      buildPayload={(v) => ({
        action: 'transfer',
        input: {
          requests: ((v.requests as Array<Record<string, unknown>>) ?? []).map((r) => ({
            transferId: String(r.transferId ?? ''),
            fromCountry: String(r.fromCountry ?? 'SAU'),
            toCountry: String(r.toCountry ?? 'EU'),
            dataCategory: String(r.dataCategory ?? 'GENERIC'),
            legalBasis: r.legalBasis ? String(r.legalBasis) : undefined,
            hasDpia: r.hasDpia === true || r.hasDpia === 'true',
            hasDataSubjectConsent:
              r.hasDataSubjectConsent === true || r.hasDataSubjectConsent === 'true',
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.blocked > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.allowed} allowed, ${v.totals.blocked} blocked`,
          reason:
            v.totals.blocked > 0
              ? `${v.totals.blocked} transfer(s) lack a valid legal basis or controls.`
              : 'All planned transfers cleared.',
          reasonAr: v.totals.blocked > 0 ? 'بعض التحويلات ممنوعة' : 'جميع التحويلات مسموحة',
          breakdown: [
            { label: 'Requests', value: String(v.totals.requests) },
            { label: 'Allowed', value: String(v.totals.allowed) },
            { label: 'Blocked', value: String(v.totals.blocked) },
          ],
        };
      }}
    />
  );
}
