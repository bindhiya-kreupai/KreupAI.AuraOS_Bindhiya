import { redirect } from 'next/navigation';

/**
 * Menu feature "Mandatory item completion enforcement" canonicalizes to the fully
 * API-backed Compliance Audit Register workspace, whose dashboard surfaces open-mandatory
 * counts per domain and whose checklist enforces mandatory-item completion.
 */
export default function MandatoryItemCompletionEnforcementRedirectPage() {
  redirect('/dashboard/compliance-audit-register');
}
