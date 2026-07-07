import { redirect } from 'next/navigation';

// AURA-423: Menu feature "Policy Lifecycle (publish auto-creates 12-month
// review)" maps to the canonical policy lifecycle workspace (EPIC-32 · S01 /
// S02 / S07), where publishing a policy auto-creates a HrPolicyReview at the
// configured interval (default 12 months).
export default function PolicyLifecycleRedirect() {
  redirect('/dashboard/hr-policies-compliance/policies');
}
