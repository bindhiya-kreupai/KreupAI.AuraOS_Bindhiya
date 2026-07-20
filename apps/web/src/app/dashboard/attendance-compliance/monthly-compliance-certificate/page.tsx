import { redirect } from 'next/navigation';

// AURA-345: Menu feature "Monthly Compliance Certificate" maps to the canonical
// monthly attendance certificate workspace, gated on unresolved fraud flags,
// absence detections and pending time corrections.
export default function AttendanceMonthlyCertificateRedirect() {
  redirect('/dashboard/attendance-compliance/certificate');
}
