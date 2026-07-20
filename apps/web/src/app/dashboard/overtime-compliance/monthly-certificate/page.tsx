import { redirect } from 'next/navigation';

// AURA-484: Menu feature "Monthly Certificate" maps to the canonical monthly
// overtime certificate workspace, gated on OT cap breaches, budget overruns
// and unresolved fatigue assessments.
export default function OvertimeMonthlyCertificateRedirect() {
  redirect('/dashboard/overtime-compliance/certificate');
}
