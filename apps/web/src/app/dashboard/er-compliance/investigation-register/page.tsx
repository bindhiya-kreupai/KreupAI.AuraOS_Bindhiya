import { redirect } from 'next/navigation';

/**
 * Menu feature "Investigation Register" canonicalizes to the existing, fully API-backed
 * ER compliance investigations workspace.
 */
export default function InvestigationRegisterRedirectPage() {
  redirect('/dashboard/er-compliance/investigations');
}
