import { redirect } from 'next/navigation';

// AURA-442: Menu feature "Risk Assessments (L × S → residual band)" maps to the
// canonical HSE risk assessment workspace (EPIC-24 · S03/S04), which stores
// likelihood × severity (1–5 each) producing inherent and residual risk scores
// (1–25) banded LOW / MEDIUM / HIGH / CRITICAL.
export default function HseRiskAssessmentsRedirect() {
  redirect('/dashboard/hse-compliance/risk-assessments');
}
