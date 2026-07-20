import { redirect } from 'next/navigation';

/**
 * Menu feature "WPS Submissions" canonicalizes to the existing, fully API-backed
 * WPS compliance Submissions workspace.
 */
export default function WpsSubmissionsRedirectPage() {
  redirect('/dashboard/wps-compliance/submissions');
}
