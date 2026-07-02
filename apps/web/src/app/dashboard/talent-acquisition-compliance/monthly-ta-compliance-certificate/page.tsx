import { redirect } from 'next/navigation';

// AURA-530: Menu feature "Monthly TA Compliance Certificate" canonicalizes to
// the existing TA compliance certificate workspace (EPIC-03/04/05), a monthly
// aggregate gated on HIGH/CRITICAL checklist failures, overdue items and open
// critical risks before it can be signed.
export default function TaMonthlyCertificateRedirect() {
  redirect('/dashboard/talent-acquisition-compliance/certificate');
}
