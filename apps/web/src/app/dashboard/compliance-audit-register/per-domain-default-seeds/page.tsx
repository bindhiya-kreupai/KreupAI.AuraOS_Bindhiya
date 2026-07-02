import { redirect } from 'next/navigation';

/**
 * Menu feature "Per-domain default seeds" canonicalizes to the fully API-backed Compliance
 * Audit Register workspace, whose "Seed defaults" actions seed per-domain checklist items
 * and risks for ER / DISCIPLINARY / SEPARATION / EOSB / VISA_EXIT.
 */
export default function PerDomainDefaultSeedsRedirectPage() {
  redirect('/dashboard/compliance-audit-register');
}
