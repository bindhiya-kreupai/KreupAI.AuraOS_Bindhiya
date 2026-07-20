import { redirect } from 'next/navigation';

export default function RetentionScheduleRedirectPage() {
  redirect('/dashboard/document-retention-compliance?tab=schedule');
}
