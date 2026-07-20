import { redirect } from 'next/navigation';

/**
 * Menu feature "Renewal Alert Ladder (60/30/7-day + EXPIRED)" canonicalizes to the
 * existing, fully API-backed Renewal Alerts workspace.
 */
export default function RenewalAlertLadderRedirectPage() {
  redirect('/dashboard/immigration-compliance/renewal-alerts');
}
