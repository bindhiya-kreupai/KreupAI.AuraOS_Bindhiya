import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Certificate" canonicalizes to the existing, fully API-backed
 * WPS compliance Certificate workspace.
 */
export default function WpsMonthlyCertificateRedirectPage() {
  redirect('/dashboard/wps-compliance/certificate');
}
