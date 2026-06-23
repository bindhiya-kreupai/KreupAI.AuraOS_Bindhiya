'use client';

/**
 * EPIC-03-S06 — Succession heat-map evaluator page.
 *
 * Calls POST /api/v1/workforce-planning/succession.
 *
 * Each row captures one critical role and the readiness of each
 * named successor. Returns vacancy risk per cell + overall coverage.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function SuccessionPage() {
  return (
    <EvaluatorPage
      title="Succession heat-map"
      titleAr="خريطة جاهزية الخلافة"
      description="Score vacancy risk for each critical role based on the readiness of named successors."
      descriptionAr="تقييم مخاطر شغور الأدوار الحرجة بناءً على جاهزية المرشحين."
      fields={[
        {
          name: 'roles',
          label: 'Roles + named successors',
          labelAr: 'الأدوار والمرشحين',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'role',
              label: 'Role',
              labelAr: 'الدور',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'incumbent',
              label: 'Incumbent',
              labelAr: 'شاغل الدور',
              type: 'text',
              widthClass: 'w-32',
            },
            {
              key: 'successorId',
              label: 'Successor ID',
              labelAr: 'رقم المرشح',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'readiness',
              label: 'Readiness',
              labelAr: 'الجاهزية',
              type: 'select',
              required: true,
              options: [
                { value: 'READY_NOW', label: 'Ready now' },
                { value: 'READY_1_YEAR', label: 'Ready in 1 year' },
                { value: 'READY_2_YEARS', label: 'Ready in 2 years' },
                { value: 'EMERGENCY_COVER', label: 'Emergency cover only' },
                { value: 'NO_SUCCESSOR', label: 'No successor' },
              ],
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/workforce-planning/succession' }}
      buildPayload={(v) => {
        const rows = (v.roles as Array<Record<string, unknown>>) ?? [];
        const byRole = new Map<
          string,
          {
            role: string;
            incumbent?: string;
            successors: Array<{ employeeId: string; readiness: string }>;
          }
        >();
        for (const r of rows) {
          const role = String(r.role ?? '');
          if (!role) continue;
          if (!byRole.has(role))
            byRole.set(role, {
              role,
              incumbent: r.incumbent ? String(r.incumbent) : undefined,
              successors: [],
            });
          byRole.get(role)!.successors.push({
            employeeId: String(r.successorId ?? ''),
            readiness: String(r.readiness ?? 'NO_SUCCESSOR'),
          });
        }
        return { roles: Array.from(byRole.values()) };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const t = v.totals;
        const outcome =
          t.coveragePct >= 80
            ? 'PASS'
            : t.coveragePct >= 50
              ? 'WARN'
              : t.rolesAtRisk > 0
                ? 'FAIL'
                : 'INFO';
        return {
          outcome,
          title: `${t.coveragePct}% coverage`,
          reason:
            t.rolesAtRisk > 0
              ? `${t.rolesAtRisk} role(s) at HIGH/CRITICAL vacancy risk.`
              : 'All evaluated roles have at least one plausible successor.',
          breakdown: [
            { label: 'Roles at risk', value: String(t.rolesAtRisk) },
            { label: 'With successor', value: String(t.rolesWithSuccessor) },
            { label: 'Emergency cover only', value: String(t.rolesWithEmergencyCover) },
            { label: 'Coverage %', value: `${t.coveragePct}%` },
          ],
        };
      }}
    />
  );
}
