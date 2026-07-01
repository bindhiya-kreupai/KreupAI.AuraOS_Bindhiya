import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Compliance Certificate" canonicalizes to the existing,
 * fully API-backed immigration compliance Certificate workspace.
 */
export default function MonthlyComplianceCertificateRedirectPage() {
  redirect('/dashboard/immigration-compliance/certificate');
}
