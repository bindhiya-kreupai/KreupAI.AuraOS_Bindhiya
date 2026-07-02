import { redirect } from 'next/navigation';

// AURA-483: Menu feature "Budget Control" maps to the canonical overtime budget
// control workspace, tracking OT budget allocation, consumption and breaches.
export default function OvertimeBudgetControlRedirect() {
  redirect('/dashboard/overtime-compliance/budgets');
}
