import { redirect } from 'next/navigation';

// AURA-465: Menu feature "Monthly Compliance Certificate" maps to the canonical
// monthly leave compliance certificate workspace, gated on unresolved misuse
// flags, missing medical evidence and pending approvals.
export default function LeaveMonthlyCertificateRedirect() {
  redirect('/dashboard/leave-compliance/certificate');
}
