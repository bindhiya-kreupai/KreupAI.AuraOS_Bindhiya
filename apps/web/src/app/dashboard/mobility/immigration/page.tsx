import { redirect } from 'next/navigation';

/**
 * Canonicalized: the Visa & Immigration experience lives at
 * /dashboard/mobility/visa-immigration (the route linked from the module hub).
 * This former duplicate now redirects to avoid divergent, unmaintained UIs.
 */
export default function ImmigrationRedirectPage() {
  redirect('/dashboard/mobility/visa-immigration');
}
