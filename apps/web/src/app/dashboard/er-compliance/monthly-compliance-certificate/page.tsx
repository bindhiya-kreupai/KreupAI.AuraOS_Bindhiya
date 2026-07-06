import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Compliance Certificate" canonicalizes to the existing,
 * fully API-backed ER compliance certificate workspace.
 */
export default function ErMonthlyComplianceCertificateRedirectPage() {
  redirect('/dashboard/er-compliance/certificate');
}
