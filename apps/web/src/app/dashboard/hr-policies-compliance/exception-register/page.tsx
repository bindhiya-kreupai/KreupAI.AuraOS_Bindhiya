import { redirect } from 'next/navigation';

// AURA-421: Menu feature "Exception Register" maps to the canonical policy
// exception register workspace (EPIC-32 · S10), PENDING -> APPROVED / REJECTED
// / CLOSED lifecycle.
export default function ExceptionRegisterRedirect() {
  redirect('/dashboard/hr-policies-compliance/exceptions');
}
