import { redirect } from 'next/navigation';

// AURA-517: Menu feature "Monthly Compliance Certificate" maps to the
// canonical separation compliance certificate workspace (EPIC-27 · S18/S19),
// gated on pending clearances, missing exit interviews, unresolved
// abandonment and IT access left open after case close.
export default function SeparationMonthlyCertificateRedirect() {
  redirect('/dashboard/separation-compliance/certificate');
}
