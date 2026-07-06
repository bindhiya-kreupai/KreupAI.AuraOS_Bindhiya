import { redirect } from 'next/navigation';

// AURA-463: Menu feature "Medical Evidence Vault (RESTRICTED + retention)" maps
// to the canonical leave medical evidence vault workspace, storing RESTRICTED
// medical documents with retention and access-control policies.
export default function LeaveMedicalEvidenceVaultRedirect() {
  redirect('/dashboard/leave-compliance/medical-evidence');
}
