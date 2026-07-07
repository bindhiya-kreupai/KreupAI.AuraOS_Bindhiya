import { redirect } from 'next/navigation';

/**
 * Menu feature "Versioned Country Rule Sets" canonicalizes to the existing,
 * fully API-backed Country Rule Sets workspace (EPIC-34 · S02) with its
 * DRAFT → PUBLISHED → SUPERSEDED version lifecycle.
 */
export default function VersionedCountryRuleSetsRedirectPage() {
  redirect('/dashboard/hrms-config/rule-sets');
}
