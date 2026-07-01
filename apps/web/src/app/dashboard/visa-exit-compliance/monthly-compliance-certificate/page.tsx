import { redirect } from 'next/navigation';

// AURA-537: Menu feature "Monthly Compliance Certificate" canonicalizes to the
// existing visa/exit compliance certificate workspace (EPIC-29), a monthly
// aggregate gated on open PRO actions, missing evidence and overdue grace cases.
export default function VisaMonthlyCertificateRedirect() {
  redirect('/dashboard/visa-exit-compliance/certificate');
}
