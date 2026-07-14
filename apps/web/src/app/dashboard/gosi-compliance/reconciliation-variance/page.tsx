import { redirect } from 'next/navigation';

/**
 * Menu feature "Reconciliation & Variance" canonicalizes to the existing, fully API-backed
 * GOSI compliance Reconciliation workspace.
 */
export default function GosiReconciliationVarianceRedirectPage() {
  redirect('/dashboard/gosi-compliance/reconciliation');
}
