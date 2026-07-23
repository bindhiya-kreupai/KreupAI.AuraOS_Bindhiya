'use client';

/**
 * EPIC-27 — Travel/expense compliance evaluator (per-diem cap).
 *
 * Calls POST /api/v1/expense-compliance/checks with action=perDiemCap.
 */

import { useEffect, useState } from 'react';
import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ExpenseComplianceChecksPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/v1/expense-compliance/checks');
        const data = await res.json();
        if (data.success && data.data) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error('Failed to load expense settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading policy caps from database...</p>
      </main>
    );
  }

  const claim = initialData?.perDiemClaim || {};
  const policy = initialData?.perDiemPolicy || {};

  return (
    <EvaluatorPage
      title="Per-diem cap evaluator"
      titleAr="فحص حد البدل اليومي"
      description="Validate a per-diem claim against the country + city-tier policy cap. Settings are saved to the database."
      descriptionAr="تحقق من مطالب البدل اليومي مقابل سقف السياسة للدولة ومستوى المدينة."
      fields={[
        {
          name: 'countryCode',
          label: 'Country code',
          labelAr: 'رمز الدولة',
          type: 'text',
          required: true,
          defaultValue: claim.countryCode || policy.countryCode || 'AE',
        },
        {
          name: 'cityTier',
          label: 'City tier',
          labelAr: 'مستوى المدينة',
          type: 'select',
          required: true,
          defaultValue: claim.cityTier || 'TIER_1',
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
          defaultValue: claim.daysClaimed !== undefined ? String(claim.daysClaimed) : '5',
        },
        {
          name: 'totalClaimedAmount',
          label: 'Total claim',
          labelAr: 'إجمالي المطالب',
          type: 'number',
          required: true,
          defaultValue:
            claim.totalClaimedAmount !== undefined ? String(claim.totalClaimedAmount) : '1500',
        },
        {
          name: 'mealsProvided',
          label: 'Meals provided',
          labelAr: 'الوجبات مقدمة',
          type: 'boolean',
          defaultValue: claim.mealsProvided === true ? 'true' : 'false',
        },
        {
          name: 'currency',
          label: 'Currency',
          labelAr: 'العملة',
          type: 'text',
          defaultValue: policy.currency || 'AED',
          required: true,
        },
        {
          name: 'capTier1',
          label: 'Tier 1 cap / day',
          labelAr: 'سقف المستوى 1',
          type: 'number',
          required: true,
          defaultValue:
            policy.capsByTier?.TIER_1 !== undefined ? String(policy.capsByTier.TIER_1) : '500',
        },
        {
          name: 'capTier2',
          label: 'Tier 2 cap / day',
          labelAr: 'سقف المستوى 2',
          type: 'number',
          required: true,
          defaultValue:
            policy.capsByTier?.TIER_2 !== undefined ? String(policy.capsByTier.TIER_2) : '300',
        },
        {
          name: 'capTier3',
          label: 'Tier 3 cap / day',
          labelAr: 'سقف المستوى 3',
          type: 'number',
          required: true,
          defaultValue:
            policy.capsByTier?.TIER_3 !== undefined ? String(policy.capsByTier.TIER_3) : '150',
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
