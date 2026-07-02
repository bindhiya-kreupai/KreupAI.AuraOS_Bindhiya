import { redirect } from 'next/navigation';

/**
 * Menu feature "Wages & Contributions" canonicalizes to the existing, fully API-backed
 * GPSSA compliance contributions workspace.
 */
export default function GpssaWagesContributionsRedirectPage() {
  redirect('/dashboard/gpssa-compliance/contributions');
}
