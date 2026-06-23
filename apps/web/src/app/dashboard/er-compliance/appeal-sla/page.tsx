'use client';

/**
 * EPIC-26 — Appeal SLA cadence evaluator.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function AppealSlaPage() {
  return (
    <EvaluatorPage
      title="Appeal SLA cadence"
      titleAr="دورة الالتزام بطعون التأديب"
      description="Track acknowledgement and resolution SLA against open appeals."
      descriptionAr="متابعة دورة الإقرار والحل للطعون المفتوحة."
      fields={[
        {
          name: 'appeals',
          label: 'Appeals',
          labelAr: 'الطعون',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'appealId',
              label: 'Appeal ID',
              labelAr: 'الرقم',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'employeeId',
              label: 'Employee',
              labelAr: 'الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-28',
            },
            {
              key: 'filedAt',
              label: 'Filed at',
              labelAr: 'تاريخ التقديم',
              type: 'date',
              required: true,
              widthClass: 'w-36',
            },
            {
              key: 'acknowledgedAt',
              label: 'Acknowledged',
              labelAr: 'الإقرار',
              type: 'date',
              widthClass: 'w-36',
            },
            {
              key: 'resolvedAt',
              label: 'Resolved',
              labelAr: 'الحل',
              type: 'date',
              widthClass: 'w-36',
            },
            {
              key: 'status',
              label: 'Status',
              labelAr: 'الحالة',
              type: 'select',
              options: [
                { value: 'OPEN', label: 'Open' },
                { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'WITHDRAWN', label: 'Withdrawn' },
              ],
              required: true,
              widthClass: 'w-36',
            },
          ],
        },
        {
          name: 'ackDays',
          label: 'Ack SLA (days)',
          labelAr: 'دورة الإقرار',
          type: 'number',
          helpText: 'Default 3.',
        },
        {
          name: 'resolveDays',
          label: 'Resolve SLA (days)',
          labelAr: 'دورة الحل',
          type: 'number',
          helpText: 'Default 21.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/er-compliance/disciplinary-residuals' }}
      buildPayload={(v) => ({
        action: 'appealSla',
        input: {
          appeals: ((v.appeals as Array<Record<string, unknown>>) ?? []).map((a) => ({
            appealId: String(a.appealId ?? ''),
            employeeId: String(a.employeeId ?? ''),
            filedAt: new Date(String(a.filedAt)).toISOString(),
            acknowledgedAt: a.acknowledgedAt
              ? new Date(String(a.acknowledgedAt)).toISOString()
              : undefined,
            resolvedAt: a.resolvedAt ? new Date(String(a.resolvedAt)).toISOString() : undefined,
            status: String(a.status ?? 'OPEN'),
          })),
          ackDays: v.ackDays ? Number(v.ackDays) : undefined,
          resolveDays: v.resolveDays ? Number(v.resolveDays) : undefined,
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.breaches === 0 ? 'PASS' : 'FAIL',
          title: `${v.totals.compliancePct}% compliance`,
          reason:
            v.totals.breaches === 0
              ? 'No SLA breaches found.'
              : `${v.totals.breaches} appeal(s) in breach, ${v.totals.atRisk} at risk.`,
          breakdown: [
            { label: 'Checked', value: String(v.totals.appealsChecked) },
            { label: 'Breaches', value: String(v.totals.breaches) },
            { label: 'At risk', value: String(v.totals.atRisk) },
          ],
        };
      }}
    />
  );
}
