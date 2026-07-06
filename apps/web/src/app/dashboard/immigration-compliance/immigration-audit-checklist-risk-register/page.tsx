import { redirect } from 'next/navigation';

/**
 * Menu feature "Immigration Audit Checklist & Risk Register" canonicalizes to the
 * existing, fully API-backed Audit Checklist workspace (which links to the Risk Register).
 */
export default function ImmigrationAuditChecklistRiskRegisterRedirectPage() {
  redirect('/dashboard/immigration-compliance/audit-checklist');
}
