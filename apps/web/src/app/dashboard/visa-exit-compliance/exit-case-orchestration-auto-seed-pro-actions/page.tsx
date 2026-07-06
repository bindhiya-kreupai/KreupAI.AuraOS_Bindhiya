import { redirect } from 'next/navigation';

// AURA-536: Menu feature "Exit Case Orchestration (auto-seed PRO actions)"
// canonicalizes to the existing exit case workspace (EPIC-29), which drives the
// visa-cancellation / exit lifecycle and auto-seeds the PRO action register on
// case creation.
export default function VisaExitCaseOrchestrationRedirect() {
  redirect('/dashboard/visa-exit-compliance/cases');
}
