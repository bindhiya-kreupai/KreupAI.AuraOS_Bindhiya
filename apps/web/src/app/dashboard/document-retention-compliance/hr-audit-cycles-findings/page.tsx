import { redirect } from 'next/navigation';

export default function HrAuditCyclesFindingsRedirectPage() {
  redirect('/dashboard/document-retention-compliance?tab=audit');
}
