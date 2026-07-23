'use client';

import { useEffect, useState } from 'react';
import { EvaluatorPage } from '@aura/ui/components/ui';

export default function SubmissionCadencePage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/v1/external-reporting-compliance/reporting');
        const data = await res.json();
        if (data.success && data.data) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error('Failed to load submission cadence defaults', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Loading obligations from database...</p>
      </main>
    );
  }

  const defaultObligations = initialData?.extObligations || [
    {
      obligationId: 'OBL_WPS',
      regulator: 'MOHRE',
      cadenceDays: 30,
      lastSubmittedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      active: true,
    },
    {
      obligationId: 'OBL_GOSI',
      regulator: 'GOSI_KSA',
      cadenceDays: 30,
      lastSubmittedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      active: true,
    },
  ];

  return (
    <EvaluatorPage
      title="External reporting — submission cadence"
      titleAr="دورية التقديم للجهات الرقابية"
      description="Score each active regulator obligation against its filing cadence. Obligations are persisted to the database."
      descriptionAr="تقييم الالتزامات الرقابية مقابل الدورة المطلوبة."
      fields={[
        {
          name: 'obligations',
          label: 'Obligations',
          labelAr: 'الالتزامات',
          type: 'structured-array',
          required: true,
          minRows: 1,
          defaultRows: defaultObligations,
          columns: [
            {
              key: 'obligationId',
              label: 'ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'regulator',
              label: 'Regulator',
              labelAr: 'الجهة',
              type: 'text',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'cadenceDays',
              label: 'Cadence (days)',
              labelAr: 'الدورية',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'lastSubmittedAt',
              label: 'Last submitted',
              labelAr: 'آخر تقديم',
              type: 'text',
              widthClass: 'w-40',
            },
            { key: 'active', label: 'Active', labelAr: 'نشط', type: 'boolean', widthClass: 'w-24' },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/external-reporting-compliance/reporting' }}
      buildPayload={(v) => ({
        action: 'submissions',
        input: {
          obligations: ((v.obligations as Array<Record<string, unknown>>) ?? []).map((o) => ({
            obligationId: String(o.obligationId ?? ''),
            regulator: String(o.regulator ?? ''),
            cadenceDays: Number(o.cadenceDays ?? 0),
            lastSubmittedAt: o.lastSubmittedAt
              ? new Date(String(o.lastSubmittedAt)).toISOString()
              : undefined,
            active: o.active === true || o.active === 'true',
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.overdue > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.overdue} overdue of ${v.totals.obligations}`,
          reason:
            v.totals.overdue > 0 ? 'Submit overdue filings immediately.' : 'All filings current.',
          reasonAr: v.totals.overdue > 0 ? 'تقديمات متأخرة' : 'كل التقديمات محدثة',
          breakdown: [
            { label: 'Obligations', value: String(v.totals.obligations) },
            { label: 'Overdue', value: String(v.totals.overdue) },
            { label: 'Current %', value: String(v.totals.currentPct) },
          ],
        };
      }}
    />
  );
}
