import { redirect } from 'next/navigation';

// AURA-343: Menu feature "Country × Grade Policy (tolerances, SLAs, Ramadan)"
// maps to the canonical attendance policy workspace, defining per-country ×
// grade tolerances, approval SLAs and Ramadan working-hours rules.
export default function AttendanceCountryGradePolicyRedirect() {
  redirect('/dashboard/attendance-compliance/policies');
}
