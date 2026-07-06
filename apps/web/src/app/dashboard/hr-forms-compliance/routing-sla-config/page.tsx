import { redirect } from 'next/navigation';

// AURA-415: Menu feature "Routing & SLA Config" maps to the canonical routing
// workspace (EPIC-33 · S03), where per-template approval stages, approver roles
// and SLA hours are configured.
export default function RoutingSlaConfigRedirect() {
  redirect('/dashboard/hr-forms-compliance/routings');
}
