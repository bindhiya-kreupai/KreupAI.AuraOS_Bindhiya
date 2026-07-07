import { redirect } from 'next/navigation';

// AURA-529: Menu feature "Lifecycle Audit Checklist (5 stages, 25 categories)"
// canonicalizes to the existing, fully API-backed TA audit checklist workspace
// (EPIC-03/04/05) which catalogues items across the PLANNING → SOURCING →
// SELECTION → OFFER → PRE_EMPLOYMENT stages and their 25 categories, with
// PASS/FAIL/OBSERVATION result tracking.
export default function TaLifecycleAuditChecklistRedirect() {
  redirect('/dashboard/talent-acquisition-compliance/audit-checklist');
}
