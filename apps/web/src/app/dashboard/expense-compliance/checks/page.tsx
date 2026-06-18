'use client';

/**
 * EPIC-27 — Travel/expense compliance evaluator (per-diem cap).
 *
 * Calls POST /api/v1/expense-compliance/checks with action=perDiemCap.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ExpenseComplianceChecksPage() {
  return (
    <EvaluatorPage
      title="Per-diem cap evaluator"
      titleAr="فحص حد البدل اليومي"
      description="Validate a per-diem claim against the country + city-tier policy cap."
      descriptionAr="تحقق من مطالب البدل اليومي مقابل سقف السياسة للدولة ومستوى المدينة."
      fields={[
        {
          name: 'countryCode',
          label: 'Country code',
          labelAr: 'رمز الدولة',
          type: 'text',
          required: true,
          defaultValue: 'AE',
        },
        {
          name: 'cityTier',
          label: 'City tier',
          labelAr: 'مستوى المدينة',
          type: 'select',
          required: true,
          options: [
            { value: 'TIER_1', label: 'Tier 1' },
            { value: 'TIER_2', label: 'Tier 2' },
            { value: 'TIER_3', label: 'Tier 3' },
          ],
        },
        {
          name: 'daysClaimed',
          label: 'Days claimed',
          labelAr: 'الأيام',
          type: 'number',
          required: true,
        },
        {
          name: 'totalClaimedAmount',
          label: 'Total claim',
          labelAr: 'إجمالي المطالب',
          type: 'number',
          required: true,
        },
        {
          name: 'mealsProvided',
          label: 'Meals provided',
          labelAr: 'الوجبات مقدمة',
          type: 'boolean',
        },
        {
          name: 'currency',
          label: 'Currency',
          labelAr: 'العملة',
          type: 'text',
          defaultValue: 'AED',
          required: true,
        },
        {
          name: 'capTier1',
          label: 'Tier 1 cap / day',
          labelAr: 'سقف المستوى 1',
          type: 'number',
          required: true,
        },
        {
          name: 'capTier2',
          label: 'Tier 2 cap / day',
          labelAr: 'سقف المستوى 2',
          type: 'number',
          required: true,
        },
        {
          name: 'capTier3',
          label: 'Tier 3 cap / day',
          labelAr: 'سقف المستوى 3',
          type: 'number',
          required: true,
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/expense-compliance/checks' }}
      buildPayload={(v) => ({
        action: 'perDiemCap',
        claim: {
          countryCode: String(v.countryCode ?? ''),
          cityTier: String(v.cityTier ?? 'TIER_1'),
          daysClaimed: Number(v.daysClaimed ?? 0),
          totalClaimedAmount: Number(v.totalClaimedAmount ?? 0),
          mealsProvided: String(v.mealsProvided ?? '') === 'true',
        },
        policy: {
          countryCode: String(v.countryCode ?? ''),
          currency: String(v.currency ?? 'AED'),
          capsByTier: {
            TIER_1: Number(v.capTier1 ?? 0),
            TIER_2: Number(v.capTier2 ?? 0),
            TIER_3: Number(v.capTier3 ?? 0),
          },
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.outcome,
          title: `Daily cap ${v.effectiveDailyCap} • Total cap ${v.effectiveTotalCap}`,
          reason: v.reason?.en ?? '',
          reasonAr: v.reason?.ar,
          breakdown: [
            { label: 'Daily cap', value: String(v.effectiveDailyCap) },
            { label: 'Total cap', value: String(v.effectiveTotalCap) },
            { label: 'Overspend', value: String(v.overspend) },
          ],
        };
      }}
    />
  );
}
