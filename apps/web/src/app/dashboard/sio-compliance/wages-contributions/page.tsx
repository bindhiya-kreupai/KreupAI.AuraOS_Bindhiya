import { redirect } from 'next/navigation';

/**
 * Menu feature "Wages & Contributions" canonicalizes to the existing, fully API-backed
 * SIO compliance contributions workspace.
 */
export default function SioWagesContributionsRedirectPage() {
  redirect('/dashboard/sio-compliance/contributions');
}
