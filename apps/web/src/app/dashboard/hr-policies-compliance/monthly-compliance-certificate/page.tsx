import { redirect } from 'next/navigation';

// AURA-422: Menu feature "Monthly Compliance Certificate" maps to the canonical
// monthly HR policy certificate workspace (EPIC-32 · S13 / S14), gated on
// overdue reviews, pending exceptions and policies below 90% ack coverage.
export default function PolicyMonthlyCertificateRedirect() {
  redirect('/dashboard/hr-policies-compliance/certificate');
}
