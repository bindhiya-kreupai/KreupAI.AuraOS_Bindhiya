import { redirect } from 'next/navigation';

// AURA-344: Menu feature "Fraud Register (BUDDY_PUNCH / GEO_MISMATCH /
// TIME_DRIFT)" maps to the canonical attendance fraud register workspace,
// tracking buddy-punch, geo-mismatch and time-drift flags with investigation.
export default function AttendanceFraudRegisterRedirect() {
  redirect('/dashboard/attendance-compliance/fraud-flags');
}
