import { redirect } from 'next/navigation';

// AURA-519: Menu feature "Separation Case Orchestration (10 types)" maps to
// the canonical case orchestration workspace (EPIC-27), which drives the full
// separation lifecycle across all 10 separation types
// (RESIGNATION … RETIREMENT) with the DRAFT → … → CLOSED status FSM.
export default function SeparationCaseOrchestrationRedirect() {
  redirect('/dashboard/separation-compliance/cases');
}
