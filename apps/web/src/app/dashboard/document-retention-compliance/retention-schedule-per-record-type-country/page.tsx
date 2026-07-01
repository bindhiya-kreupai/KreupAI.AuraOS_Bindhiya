import { redirect } from 'next/navigation';

/**
 * Menu feature "Retention Schedule (per record type × country)" canonicalizes to
 * the existing, fully API-backed Document Retention Compliance Schedule workspace.
 */
export default function RetentionScheduleRedirectPage() {
  redirect('/dashboard/document-retention-compliance/schedule');
}
