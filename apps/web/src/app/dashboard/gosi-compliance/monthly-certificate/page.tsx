import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Certificate" canonicalizes to the existing, fully API-backed
 * GOSI compliance Certificate workspace.
 */
export default function GosiMonthlyCertificateRedirectPage() {
  redirect('/dashboard/gosi-compliance/certificate');
}
