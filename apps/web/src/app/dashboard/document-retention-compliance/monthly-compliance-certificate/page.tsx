import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Compliance Certificate" canonicalizes to the existing,
 * fully API-backed Document Retention Compliance Certificate workspace.
 */
export default function DrcMonthlyCertificateRedirectPage() {
  redirect('/dashboard/document-retention-compliance/certificate');
}
