import { redirect } from 'next/navigation';

// AURA-464: Menu feature "Misuse Register (Monday/Friday pattern, medical
// forgery)" maps to the canonical leave misuse & abuse register workspace,
// flagging Monday/Friday absence patterns and suspected medical forgery.
export default function LeaveMisuseRegisterRedirect() {
  redirect('/dashboard/leave-compliance/misuse-flags');
}
