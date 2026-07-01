import { redirect } from 'next/navigation';

/**
 * Menu feature "Per-Employee Completeness Score (GREEN/AMBER/RED)" canonicalizes to
 * the existing, fully API-backed Records Compliance Completeness workspace.
 */
export default function PerEmployeeCompletenessRedirectPage() {
  redirect('/dashboard/records-compliance/completeness');
}
