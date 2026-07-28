import { redirect } from 'next/navigation';

/**
 * Menu feature "Disciplinary Actions (hearing gated issuance)" canonicalizes to the existing,
 * fully API-backed ER compliance disciplinary actions workspace.
 */
export default function DisciplinaryActionsHearingGatedIssuanceRedirectPage() {
  redirect('/dashboard/er-compliance/disciplinary');
}
