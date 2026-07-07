import { redirect } from 'next/navigation';

/**
 * Menu feature "Wages & Contributions" canonicalizes to the existing, fully API-backed
 * GOSI compliance Contributions workspace.
 */
export default function GosiWagesContributionsRedirectPage() {
  redirect('/dashboard/gosi-compliance/contributions');
}
