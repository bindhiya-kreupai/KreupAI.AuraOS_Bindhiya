import { redirect } from 'next/navigation';

// AURA-534: Menu feature "Authority Portal Evidence" canonicalizes to the
// existing, API-backed evidence capture workspace (EPIC-29 · S14), which stores
// authority-portal artefacts (GDRFA/MOHRE/QIWA/MUDAD/LMRA/GAMCA/MOI) per exit case.
export default function VisaAuthorityPortalEvidenceRedirect() {
  redirect('/dashboard/visa-exit-compliance/evidence');
}
