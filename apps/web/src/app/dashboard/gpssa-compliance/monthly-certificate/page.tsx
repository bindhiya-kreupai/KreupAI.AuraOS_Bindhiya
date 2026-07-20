import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Certificate" canonicalizes to the existing, fully API-backed
 * GPSSA compliance certificate workspace.
 */
export default function GpssaMonthlyCertificateRedirectPage() {
  redirect('/dashboard/gpssa-compliance/certificate');
}
