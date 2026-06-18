'use client';

/**
 * EPIC-26 disciplinary penalty matrix evaluator page.
 *
 * Calls POST /api/v1/er-compliance/penalty-matrix (action='recommend').
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PenaltyMatrixPage() {
  return (
    <EvaluatorPage
      title="Disciplinary penalty matrix"
      titleAr="مصفوفة العقوبات التأديبية"
      description="Recommend a disciplinary penalty for a documented misconduct given the employee's prior history."
      descriptionAr="توصية بعقوبة تأديبية لسلوك موثق بناءً على السوابق."
      fields={[
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        {
          name: 'misconductType',
          label: 'Misconduct type',
          type: 'select',
          required: true,
          options: [
            { value: 'TARDINESS', label: 'Tardiness' },
            { value: 'UNAUTHORISED_ABSENCE', label: 'Unauthorised absence' },
            { value: 'INSUBORDINATION', label: 'Insubordination' },
            { value: 'HARASSMENT', label: 'Harassment' },
            { value: 'THEFT', label: 'Theft' },
            { value: 'SAFETY_VIOLATION', label: 'Safety violation' },
          ],
        },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          options: [
            { value: 'MINOR', label: 'Minor' },
            { value: 'MODERATE', label: 'Moderate' },
            { value: 'SEVERE', label: 'Severe' },
            { value: 'GROSS', label: 'Gross misconduct' },
          ],
        },
        { name: 'countryCode', label: 'Country code', type: 'text', placeholder: 'AE' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/er-compliance/penalty-matrix' }}
      buildPayload={(v) => ({
        action: 'recommend',
        employeeId: v.employeeId,
        misconductType: v.misconductType,
        severity: v.severity || undefined,
        countryCode: v.countryCode || undefined,
      })}
      buildVerdict={(data: any) => {
        const r = data?.recommendation;
        if (!r) return null;
        return {
          outcome: r.action === 'NO_ACTION' ? 'INFO' : 'WARN',
          title: r.action ?? 'Recommendation',
          reason: r.rationale ?? r.reason ?? '',
          reasonAr: r.rationaleAr ?? r.reasonAr,
          severity: r.severity ?? r.escalationLevel,
          breakdown: [
            { label: 'Action', value: String(r.action ?? '') },
            { label: 'Escalation level', value: String(r.escalationLevel ?? '') },
            { label: 'Prior incidents', value: String(r.priorIncidents ?? 0) },
            { label: 'Repeat offender', value: String(r.repeatOffender ?? false) },
          ],
        };
      }}
    />
  );
}
