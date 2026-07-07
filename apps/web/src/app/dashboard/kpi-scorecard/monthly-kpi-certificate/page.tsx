import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly KPI Certificate" canonicalizes to the existing, fully API-backed
 * KPI Scorecard certificate workspace.
 */
export default function MonthlyKpiCertificateRedirectPage() {
  redirect('/dashboard/kpi-scorecard/certificate');
}
