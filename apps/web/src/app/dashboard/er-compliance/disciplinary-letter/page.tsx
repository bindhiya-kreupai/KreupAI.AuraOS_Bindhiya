'use client';

/**
 * EPIC-26 — Disciplinary letter generator.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DisciplinaryLetterPage() {
  return (
    <EvaluatorPage
      title="Disciplinary letter generator"
      titleAr="مولّد خطابات التأديب"
      description="Generate a bilingual disciplinary action letter."
      descriptionAr="إنشاء خطاب تأديبي ثنائي اللغة."
      fields={[
        {
          name: 'actionType',
          label: 'Action type',
          labelAr: 'نوع الإجراء',
          type: 'select',
          required: true,
          options: [
            { value: 'VERBAL_WARNING', label: 'Verbal warning' },
            { value: 'WRITTEN_WARNING', label: 'Written warning' },
            { value: 'FINAL_WRITTEN_WARNING', label: 'Final written warning' },
            { value: 'SUSPENSION', label: 'Suspension' },
            { value: 'SALARY_DEDUCTION', label: 'Salary deduction' },
            { value: 'DEMOTION', label: 'Demotion' },
            { value: 'TERMINATION', label: 'Termination' },
            { value: 'TERMINATION_FOR_CAUSE', label: 'Termination for cause' },
          ],
        },
        {
          name: 'employeeName',
          label: 'Employee name (EN)',
          labelAr: '',
          type: 'text',
          required: true,
        },
        { name: 'employeeNameAr', label: 'Employee name (AR)', labelAr: 'الاسم', type: 'text' },
        {
          name: 'employeeId',
          label: 'Employee ID',
          labelAr: 'الرقم الوظيفي',
          type: 'text',
          required: true,
        },
        {
          name: 'misconductSummary',
          label: 'Misconduct summary (EN)',
          labelAr: '',
          type: 'text',
          required: true,
        },
        {
          name: 'misconductSummaryAr',
          label: 'Misconduct summary (AR)',
          labelAr: 'ملخص المخالفة',
          type: 'text',
        },
        {
          name: 'effectiveDate',
          label: 'Effective date',
          labelAr: 'تاريخ السريان',
          type: 'date',
          required: true,
        },
        {
          name: 'suspensionDays',
          label: 'Suspension days (if SUSPENSION)',
          labelAr: 'أيام التعليق',
          type: 'number',
        },
        {
          name: 'salaryDeductionPct',
          label: 'Salary deduction % (if SALARY_DEDUCTION)',
          labelAr: '% خصم',
          type: 'number',
        },
        { name: 'issuedBy', label: 'Issued by', labelAr: 'المُصدِر', type: 'text', required: true },
        {
          name: 'legalReference',
          label: 'Legal reference',
          labelAr: 'المرجع القانوني',
          type: 'text',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/er-compliance/disciplinary-residuals' }}
      buildPayload={(v) => ({
        action: 'letter',
        input: {
          actionType: String(v.actionType ?? 'WRITTEN_WARNING'),
          employeeName: String(v.employeeName ?? ''),
          employeeNameAr: v.employeeNameAr ? String(v.employeeNameAr) : undefined,
          employeeId: String(v.employeeId ?? ''),
          misconductSummary: String(v.misconductSummary ?? ''),
          misconductSummaryAr: v.misconductSummaryAr ? String(v.misconductSummaryAr) : undefined,
          effectiveDate: new Date(String(v.effectiveDate)).toISOString(),
          suspensionDays: v.suspensionDays ? Number(v.suspensionDays) : undefined,
          salaryDeductionPct: v.salaryDeductionPct ? Number(v.salaryDeductionPct) : undefined,
          issuedBy: String(v.issuedBy ?? ''),
          legalReference: v.legalReference ? String(v.legalReference) : undefined,
        },
      })}
      buildVerdict={(data: any) => {
        const l = data?.letter;
        if (!l) return null;
        return {
          outcome: 'INFO',
          title: l.subject,
          reason: l.body,
          reasonAr: l.bodyAr,
          breakdown: [
            { label: 'Subject (AR)', value: l.subjectAr },
            { label: 'Sign-off', value: l.signOffBlock },
          ],
        };
      }}
    />
  );
}
