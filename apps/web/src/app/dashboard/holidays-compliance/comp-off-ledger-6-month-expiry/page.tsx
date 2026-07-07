import { redirect } from 'next/navigation';

/**
 * Menu feature "Comp-Off Ledger (6-month expiry)" canonicalizes to the existing,
 * fully API-backed holidays compliance comp-off ledger workspace.
 */
export default function CompOffLedgerRedirectPage() {
  redirect('/dashboard/holidays-compliance/comp-off');
}
