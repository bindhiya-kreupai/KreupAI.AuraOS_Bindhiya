'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function CarbonPerEmployeePage() {
  return (
    <EvaluatorPage
      title="Carbon per employee"
      titleAr="انبعاثات الكربون لكل موظف"
      description="Compute tCO2e per FTE across scopes 1-3 and band the intensity against an industry benchmark."
      descriptionAr="حساب الانبعاثات لكل موظف عبر النطاقات 1-3 ومقارنتها بمعيار قياسي."
      fields={[
        {
          name: 'periodLabel',
          label: 'Period label',
          labelAr: 'الفترة',
          type: 'text',
          placeholder: 'FY26',
        },
        { name: 'headcount', label: 'Headcount', labelAr: 'العدد', type: 'number', required: true },
        {
          name: 'scope1',
          label: 'Scope 1 (tCO2e)',
          labelAr: 'النطاق 1',
          type: 'number',
          required: true,
        },
        {
          name: 'scope2',
          label: 'Scope 2 (tCO2e)',
          labelAr: 'النطاق 2',
          type: 'number',
          required: true,
        },
        { name: 'scope3', label: 'Scope 3 (tCO2e)', labelAr: 'النطاق 3', type: 'number' },
        {
          name: 'benchmarkPerFte',
          label: 'Benchmark tCO2e per FTE',
          labelAr: 'المعيار',
          type: 'number',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/esg-compliance/sustainability' }}
      buildPayload={(v) => ({
        action: 'carbon',
        input: {
          periodLabel: v.periodLabel ? String(v.periodLabel) : undefined,
          headcount: Number(v.headcount ?? 0),
          scope1: Number(v.scope1 ?? 0),
          scope2: Number(v.scope2 ?? 0),
          scope3: v.scope3 ? Number(v.scope3) : undefined,
          benchmarkPerFte: v.benchmarkPerFte ? Number(v.benchmarkPerFte) : undefined,
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const outcome =
          v.intensityBand === 'HIGH' ? 'FAIL' : v.intensityBand === 'LOW' ? 'PASS' : 'INFO';
        return {
          outcome,
          title: `${v.perEmployeeTco2e} tCO2e per employee (band: ${v.intensityBand})`,
          reason: v.reason.en,
          reasonAr: v.reason.ar,
          breakdown: [
            { label: 'Total tCO2e', value: String(v.totalEmissionsTco2e) },
            { label: 'Scope 1 %', value: `${v.scope1Pct}` },
            { label: 'Scope 2 %', value: `${v.scope2Pct}` },
            { label: 'Scope 3 %', value: `${v.scope3Pct}` },
            {
              label: 'vs benchmark %',
              value: v.vsBenchmarkPct === null ? '—' : `${v.vsBenchmarkPct}`,
            },
          ],
        };
      }}
    />
  );
}
