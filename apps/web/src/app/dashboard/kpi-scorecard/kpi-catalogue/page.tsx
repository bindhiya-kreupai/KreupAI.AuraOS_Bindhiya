import { redirect } from 'next/navigation';

/**
 * Menu feature "KPI Catalogue" canonicalizes to the existing, fully API-backed
 * KPI catalog workspace.
 */
export default function KpiCatalogueRedirectPage() {
  redirect('/dashboard/kpi-scorecard/catalog');
}
