import { redirect } from 'next/navigation';

// AURA-440: Menu feature "Monthly Compliance Certificate (LTIFR)" maps to the
// canonical HSE monthly certificate workspace (EPIC-24 · S18/S19), which
// computes LTIFR = (LTI × 1,000,000) / total hours worked and refuses to sign
// while fatalities, HIGH/CRIT risks, overdue permits or expired training remain.
export default function HseMonthlyCertificateLtifrRedirect() {
  redirect('/dashboard/hse-compliance/certificate');
}
