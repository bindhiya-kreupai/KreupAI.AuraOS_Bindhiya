import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Compliance Certificate" canonicalizes to the existing,
 * fully API-backed holidays compliance certificate workspace.
 */
export default function HolidaysMonthlyComplianceCertificateRedirectPage() {
  redirect('/dashboard/holidays-compliance/certificate');
}
