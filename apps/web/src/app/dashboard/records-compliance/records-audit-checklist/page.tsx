import { redirect } from 'next/navigation';

/**
 * Menu feature "Records Audit Checklist" canonicalizes to the existing,
 * fully API-backed Records Compliance Audit Checklist workspace.
 */
export default function RecordsAuditChecklistRedirectPage() {
  redirect('/dashboard/records-compliance/audit-checklist');
}
