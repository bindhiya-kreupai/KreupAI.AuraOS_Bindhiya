import { redirect } from 'next/navigation';

// AURA-340: Menu feature "Monthly Compliance Certificate" canonicalizes to the
// existing accommodation compliance certificate workspace, a monthly aggregate
// gated on open CRITICAL/MAJOR inspection findings and breached complaint SLAs.
export default function AccommodationMonthlyCertificateRedirect() {
  redirect('/dashboard/accommodation-compliance/certificate');
}
