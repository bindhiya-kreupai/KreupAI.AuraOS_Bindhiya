import { redirect } from 'next/navigation';

/**
 * Menu feature "Checklist Items (ER · Disciplinary · Separation · EOSB · Visa-Exit)"
 * canonicalizes to the fully API-backed Compliance Audit Register workspace, whose
 * per-domain checklist table (ER / DISCIPLINARY / SEPARATION / EOSB / VISA_EXIT) is the
 * feature itself.
 */
export default function ChecklistItemsRedirectPage() {
  redirect('/dashboard/compliance-audit-register');
}
