import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly + Go-Live Certificate (with gating)" canonicalizes to
 * the existing, fully API-backed Certificate workspace (EPIC-34 · S28, S29),
 * where signing is gated on open config objects, implementation items,
 * connector health, and migration state.
 */
export default function MonthlyGoLiveCertificateRedirectPage() {
  redirect('/dashboard/hrms-config/certificate');
}
