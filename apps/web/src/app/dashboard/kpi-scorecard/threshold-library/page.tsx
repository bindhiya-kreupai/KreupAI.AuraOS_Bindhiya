import { redirect } from 'next/navigation';

/**
 * Menu feature "Threshold Library" canonicalizes to the existing, fully API-backed
 * KPI Scorecard thresholds workspace.
 */
export default function ThresholdLibraryRedirectPage() {
  redirect('/dashboard/kpi-scorecard/thresholds');
}
