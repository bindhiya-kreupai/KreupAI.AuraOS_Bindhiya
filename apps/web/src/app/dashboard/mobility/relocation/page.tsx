import { redirect } from 'next/navigation';

/**
 * Canonicalized: relocation management lives at
 * /dashboard/mobility/relocation-packages (the route linked from the module hub).
 * This former duplicate now redirects to avoid divergent, unmaintained UIs.
 */
export default function RelocationRedirectPage() {
  redirect('/dashboard/mobility/relocation-packages');
}
