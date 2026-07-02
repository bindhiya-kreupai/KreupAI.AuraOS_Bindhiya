import { redirect } from 'next/navigation';

/**
 * Menu feature "Transfer & Mobility Cases (REQUESTED → APPROVED → COMPLETED)"
 * canonicalizes to the existing, fully API-backed Transfer Case workspace.
 */
export default function TransferMobilityCasesRedirectPage() {
  redirect('/dashboard/immigration-compliance/transfer-case');
}
