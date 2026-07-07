import { redirect } from 'next/navigation';

// AURA-462: Menu feature "Country × Leave Code Entitlement (annual/sick/
// maternity/Hajj)" maps to the canonical leave entitlement rules workspace,
// defining per-country × leave code accrual and entitlement rules.
export default function LeaveEntitlementRulesRedirect() {
  redirect('/dashboard/leave-compliance/entitlements');
}
