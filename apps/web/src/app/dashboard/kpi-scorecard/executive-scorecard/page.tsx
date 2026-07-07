import { redirect } from 'next/navigation';

/**
 * Menu feature "Executive Scorecard" canonicalizes to the existing, fully API-backed
 * KPI Scorecard workspace.
 */
export default function ExecutiveScorecardRedirectPage() {
  redirect('/dashboard/kpi-scorecard/scorecard');
}
