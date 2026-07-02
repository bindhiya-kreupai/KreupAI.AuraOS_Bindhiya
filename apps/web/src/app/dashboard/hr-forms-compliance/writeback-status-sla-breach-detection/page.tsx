import { redirect } from 'next/navigation';

// AURA-418: Menu feature "Writeback Status & SLA Breach Detection" maps to the
// canonical submissions workspace (EPIC-33 · S03 / S12), which surfaces per-
// submission writeback status (PENDING / FAILED / DONE) and SLA breaches, and
// exposes the manual writeback retry action.
export default function WritebackStatusSlaBreachRedirect() {
  redirect('/dashboard/hr-forms-compliance/submissions');
}
