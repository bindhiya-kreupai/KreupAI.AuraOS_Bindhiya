'use client';

/**
 * EPIC-03-S05 — Scenario modelling evaluator page.
 *
 * Calls POST /api/v1/workforce-planning/scenario.
 *
 * Per-role rows are captured via StructuredArrayEditor — one row per
 * role with monthly cost, annual growth %, annual attrition %. The
 * page projects monthly headcount + cost over the requested horizon.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function ScenarioPage() {
  return (
    <EvaluatorPage
      title="Scenario modelling — headcount + budget"
      titleAr="نمذجة السيناريوهات — قوى عاملة وميزانية"
      description="Project monthly headcount and burn rate per role applying annual growth and attrition assumptions."
      descriptionAr="إسقاط شهري للقوى العاملة والإنفاق وفقاً لافتراضات النمو والاستنزاف السنوي."
      fields={[
        {
          name: 'startingHeadcount',
          label: 'Starting headcount',
          labelAr: 'العدد الابتدائي',
          type: 'number',
          required: true,
        },
        {
          name: 'horizonMonths',
          label: 'Horizon (months)',
          labelAr: 'أفق التخطيط (شهور)',
          type: 'number',
          required: true,
          helpText: '1 to 120 months',
        },
        {
          name: 'roles',
          label: 'Roles (monthly cost, growth, attrition)',
          labelAr: 'الأدوار',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'role',
              label: 'Role code',
              labelAr: 'رمز الدور',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'monthlyCost',
              label: 'Monthly cost',
              labelAr: 'تكلفة شهرية',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'growthPct',
              label: 'Annual growth (0..1)',
              labelAr: 'نمو سنوي',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'attritionPct',
              label: 'Annual attrition (0..1)',
              labelAr: 'استنزاف سنوي',
              type: 'number',
              required: true,
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/workforce-planning/scenario' }}
      buildPayload={(v) => {
        const roles = (v.roles as Array<Record<string, unknown>>) ?? [];
        const monthlyCostPerRole: Record<string, number> = {};
        const annualGrowthPctPerRole: Record<string, number> = {};
        const annualAttritionPctPerRole: Record<string, number> = {};
        for (const r of roles) {
          const code = String(r.role ?? '');
          if (!code) continue;
          monthlyCostPerRole[code] = Number(r.monthlyCost ?? 0);
          annualGrowthPctPerRole[code] = Number(r.growthPct ?? 0);
          annualAttritionPctPerRole[code] = Number(r.attritionPct ?? 0);
        }
        return {
          assumptions: {
            startingHeadcount: Number(v.startingHeadcount ?? 0),
            horizonMonths: Number(v.horizonMonths ?? 12),
            monthlyCostPerRole,
            annualGrowthPctPerRole,
            annualAttritionPctPerRole,
          },
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const grew = v.netHires > 0;
        return {
          outcome: grew ? 'INFO' : v.netHires < 0 ? 'WARN' : 'INFO',
          title: `Final headcount ${v.finalHeadcount} (net ${v.netHires >= 0 ? '+' : ''}${v.netHires})`,
          reason: `Total cost over ${v.horizonMonths} months: ${v.totalCost.toLocaleString()}.`,
          breakdown: [
            { label: 'Horizon months', value: String(v.horizonMonths) },
            { label: 'Final headcount', value: String(v.finalHeadcount) },
            { label: 'Net hires', value: String(v.netHires) },
            { label: 'Total cost', value: v.totalCost.toLocaleString() },
            {
              label: 'Last month burn',
              value: v.steps.length
                ? v.steps[v.steps.length - 1].monthlyCost.toLocaleString()
                : '—',
            },
          ],
        };
      }}
    />
  );
}
