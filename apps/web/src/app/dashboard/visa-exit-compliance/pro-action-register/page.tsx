import { redirect } from 'next/navigation';

// AURA-538: Menu feature "PRO Action Register" canonicalizes to the existing,
// API-backed PRO actions workspace (EPIC-29 · S13/S14), which tracks
// OPEN/COMPLETED PRO tasks per exit case with assignment and completion.
export default function VisaProActionRegisterRedirect() {
  redirect('/dashboard/visa-exit-compliance/pro-actions');
}
