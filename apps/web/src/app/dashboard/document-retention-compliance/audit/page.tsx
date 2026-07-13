import { redirect } from 'next/navigation';

export default function AuditPage() {
  redirect('/dashboard/document-retention-compliance?tab=audit');
}
