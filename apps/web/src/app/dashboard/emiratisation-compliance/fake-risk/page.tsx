'use client';

/**
 * EPIC-16 Fake-Emiratisation risk clustering evaluator page.
 *
 * Calls POST /api/v1/emiratisation-compliance/fake-risk.
 *
 * The cohort input (other recent hires used for shared / cluster
 * signals) is captured via a StructuredArrayEditor. Replaces the
 * prior "paste a JSON array" textarea hack.
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
        {
          name: 'employeeId',
          label: 'Employee ID',
          labelAr: 'رقم الموظف',
          type: 'text',
          required: true,
        },
        {
          name: 'basicSalary',
          label: 'Basic salary',
          labelAr: 'الأجر الأساسي',
          type: 'number',
          required: true,
        },
        {
          name: 'currency',
          label: 'Currency',
          labelAr: 'العملة',
          type: 'text',
          defaultValue: 'AED',
        },
        {
          name: 'bankAccountIban',
          label: 'Bank IBAN',
          labelAr: 'حساب IBAN',
          type: 'text',
        },
        {
          name: 'permanentAddress',
          label: 'Permanent address',
          labelAr: 'العنوان الدائم',
          type: 'text',
        },
        {
          name: 'hiredOn',
          label: 'Hired on',
          labelAr: 'تاريخ التعيين',
          type: 'date',
          required: true,
        },
        {
          name: 'recruiterId',
          label: 'Recruiter ID',
          labelAr: 'رقم الموظف المختص',
          type: 'text',
        },
        {
          name: 'costCenterId',
          label: 'Cost-centre ID',
          labelAr: 'رقم مركز التكلفة',
          type: 'text',
        },
        {
          name: 'hasVisaOnFile',
          label: 'Has visa on file',
          labelAr: 'لديه تأشيرة',
          type: 'boolean',
        },
        {
          name: 'isOnRoster',
          label: 'Is on roster',
          labelAr: 'مدرج في الجدول',
          type: 'boolean',
        },
        {
          name: 'attendanceDaysLast30',
          label: 'Attendance days (last 30)',
          labelAr: 'أيام الحضور (آخر 30)',
          type: 'number',
          required: true,
        },
        {
          name: 'familyLinkedToHr',
          label: 'Family link to HR',
          labelAr: 'صلة قرابة بالموارد البشرية',
          type: 'boolean',
        },
        {
          name: 'cohort',
          label: 'Cohort (other recent hires)',
          labelAr: 'الموظفون الجدد المقارَنون',
          type: 'structured-array',
          required: true,
          helpText:
            'Other recent hires used for shared (IBAN / address) and cluster (same-day / same-recruiter / same-cost-centre) signals.',
          helpTextAr: 'موظفون مقارَنون لاكتشاف الإشارات المشتركة (IBAN / عنوان) وإشارات التجمع.',
          minRows: 0,
          defaultRows: [],
          columns: [
            {
              key: 'employeeId',
              label: 'Employee ID',
              labelAr: 'رقم الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-28',
            },
            {
              key: 'basicSalary',
              label: 'Basic salary',
              labelAr: 'الأجر',
              type: 'number',
              widthClass: 'w-28',
            },
            {
              key: 'bankAccountIban',
              label: 'IBAN',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'permanentAddress',
              label: 'Address',
              labelAr: 'العنوان',
              type: 'text',
              widthClass: 'w-40',
            },
            {
              key: 'recruiterId',
              label: 'Recruiter',
              type: 'text',
              widthClass: 'w-28',
            },
            {
              key: 'costCenterId',
              label: 'Cost centre',
              type: 'text',
              widthClass: 'w-28',
            },
            {
              key: 'hiredOn',
              label: 'Hired on',
              labelAr: 'تاريخ التعيين',
              type: 'text',
              placeholder: 'YYYY-MM-DD',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/emiratisation-compliance/fake-risk' }}
      buildPayload={(v) => ({
        action: 'profileHire',
        hire: {
          employeeId: v.employeeId,
          basicSalary: Number(v.basicSalary),
          currency: v.currency,
          bankAccountIban: (v.bankAccountIban as string) || undefined,
          permanentAddress: (v.permanentAddress as string) || undefined,
          hiredOn: v.hiredOn,
          recruiterId: (v.recruiterId as string) || undefined,
          costCenterId: (v.costCenterId as string) || undefined,
          hasVisaOnFile: v.hasVisaOnFile === 'true',
          isOnRoster: v.isOnRoster === 'true',
          attendanceDaysLast30: Number(v.attendanceDaysLast30),
          familyLinkedToHr: v.familyLinkedToHr === 'true',
        },
        cohort: (v.cohort as unknown[]) ?? [],
      })}
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
