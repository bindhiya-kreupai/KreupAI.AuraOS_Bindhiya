import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Compliance Certificate" canonicalizes to the existing,
 * fully API-backed Records Compliance Certificate workspace.
 */
export default function RecordsMonthlyCertificateRedirectPage() {
  redirect('/dashboard/records-compliance/certificate');
}
