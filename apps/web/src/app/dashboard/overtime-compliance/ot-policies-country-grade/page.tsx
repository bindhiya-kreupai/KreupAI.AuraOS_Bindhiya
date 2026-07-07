import { redirect } from 'next/navigation';

// AURA-485: Menu feature "OT Policies (country × grade)" maps to the canonical
// overtime policies workspace, defining per-country × grade OT caps, daily /
// weekly / monthly limits and eligibility rules.
export default function OvertimePoliciesRedirect() {
  redirect('/dashboard/overtime-compliance/policies');
}
