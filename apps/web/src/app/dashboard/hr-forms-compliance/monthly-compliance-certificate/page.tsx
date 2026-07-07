import { redirect } from 'next/navigation';

// AURA-414: Menu feature "Monthly Compliance Certificate" maps to the canonical
// monthly HR forms certificate workspace (EPIC-33 · S13 / S14), which refuses to
// sign while writeback failures or SLA breaches remain.
export default function FormsMonthlyCertificateRedirect() {
  redirect('/dashboard/hr-forms-compliance/certificate');
}
