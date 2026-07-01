import { redirect } from 'next/navigation';

/**
 * Menu feature "HR Audit Cycles & Findings" canonicalizes to the existing,
 * fully API-backed Document Retention Compliance Audit workspace.
 */
export default function HrAuditCyclesFindingsRedirectPage() {
  redirect('/dashboard/document-retention-compliance/audit');
}
