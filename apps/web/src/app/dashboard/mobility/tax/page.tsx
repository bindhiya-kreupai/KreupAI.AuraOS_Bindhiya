import { redirect } from 'next/navigation';

/**
 * Canonicalized: expat tax management lives at
 * /dashboard/mobility/expat-tax-manager (the route linked from the module hub).
 * This former duplicate now redirects to avoid divergent, unmaintained UIs.
 */
export default function TaxRedirectPage() {
  redirect('/dashboard/mobility/expat-tax-manager');
}
