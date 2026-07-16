import { redirect } from 'next/navigation';

// Section landing route: forward to the DSAR SLA sub-module.
export default function DataPrivacyCompliancePage() {
  redirect('/dashboard/data-privacy-compliance/dsar-sla');
}
