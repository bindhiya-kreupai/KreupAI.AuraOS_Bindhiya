'use client';

/**
 * EPIC-16 Fake-Emiratisation risk clustering evaluator page.
 *
 * Calls POST /api/v1/emiratisation-compliance/fake-risk.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FakeRiskPage() {
  return (
    <EvaluatorPage
      title="Fake-Emiratisation risk profiling"
      titleAr="تحديد مخاطر التوطين الوهمي"
      description="Score a single hire against a cohort to surface ghost-Saudization / fake-Emiratisation signals (no roster, low pay, shared IBAN, same-day cluster, etc.)."
      descriptionAr="تقييم تعيين واحد مقابل مجموعة لاكتشاف إشارات التوطين الوهمي."
      fields={[
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        { name: 'basicSalary', label: 'Basic salary', type: 'number', required: true },
        { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'AED' },
        { name: 'bankAccountIban', label: 'Bank IBAN', type: 'text' },
        { name: 'permanentAddress', label: 'Permanent address', type: 'text' },
        { name: 'hiredOn', label: 'Hired on', type: 'date', required: true },
        { name: 'recruiterId', label: 'Recruiter ID', type: 'text' },
        { name: 'costCenterId', label: 'Cost-centre ID', type: 'text' },
        { name: 'hasVisaOnFile', label: 'Has visa on file', type: 'boolean' },
        { name: 'isOnRoster', label: 'Is on roster', type: 'boolean' },
        {
          name: 'attendanceDaysLast30',
          label: 'Attendance days (last 30)',
          type: 'number',
          required: true,
        },
        { name: 'familyLinkedToHr', label: 'Family link to HR', type: 'boolean' },
        {
          name: 'cohortJson',
          label: 'Cohort (JSON array of HireSnapshot)',
          type: 'text',
          required: true,
          helpText: 'Other recent hires used for shared / cluster signals.',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/emiratisation-compliance/fake-risk' }}
      buildPayload={(v) => {
        let cohort: unknown = [];
        try {
          cohort = JSON.parse(v.cohortJson);
        } catch {
          cohort = [];
        }
        return {
          action: 'profileHire',
          hire: {
            employeeId: v.employeeId,
            basicSalary: Number(v.basicSalary),
            currency: v.currency,
            bankAccountIban: v.bankAccountIban || undefined,
            permanentAddress: v.permanentAddress || undefined,
            hiredOn: v.hiredOn,
            recruiterId: v.recruiterId || undefined,
            costCenterId: v.costCenterId || undefined,
            hasVisaOnFile: v.hasVisaOnFile === 'true',
            isOnRoster: v.isOnRoster === 'true',
            attendanceDaysLast30: Number(v.attendanceDaysLast30),
            familyLinkedToHr: v.familyLinkedToHr === 'true',
          },
          cohort,
        };
      }}
      buildVerdict={(data: any) => {
        const r = data?.result;
        if (!r) return null;
        const outcomeMap: Record<string, 'PASS' | 'WARN' | 'FAIL' | 'INFO'> = {
          LOW: 'PASS',
          MEDIUM: 'INFO',
          HIGH: 'WARN',
          CRITICAL: 'FAIL',
        };
        return {
          outcome: outcomeMap[r.riskBand] ?? 'INFO',
          title: `Risk score ${r.riskScore} — ${r.riskBand}`,
          reason: `${r.signals.length} risk signal(s) detected for ${r.employeeId}.`,
          severity: r.riskBand,
          breakdown: [
            { label: 'Score', value: String(r.riskScore) },
            { label: 'Band', value: String(r.riskBand) },
            { label: 'Signals', value: String(r.signals.length) },
            {
              label: 'Same-day same-recruiter',
              value: String(r.cluster.sameDaySameRecruiter ?? 0),
            },
            {
              label: 'Same-day same-cost-centre',
              value: String(r.cluster.sameDaySameCostCenter ?? 0),
            },
          ],
        };
      }}
    />
  );
}
