import { redirect } from 'next/navigation';

/**
 * Menu feature "Records Risk Register (L×I)" canonicalizes to the existing,
 * fully API-backed Records Compliance Risk Register workspace.
 */
export default function RecordsRiskRegisterRedirectPage() {
  redirect('/dashboard/records-compliance/risk-register');
}
