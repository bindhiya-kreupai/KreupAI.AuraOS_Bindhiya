import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Certificate" canonicalizes to the existing, fully API-backed
 * SIO compliance certificate workspace.
 */
export default function SioMonthlyCertificateRedirectPage() {
  redirect('/dashboard/sio-compliance/certificate');
}
