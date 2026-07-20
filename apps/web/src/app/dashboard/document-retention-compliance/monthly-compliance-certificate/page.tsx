import { redirect } from 'next/navigation';

export default function DrcMonthlyCertificateRedirectPage() {
  redirect('/dashboard/document-retention-compliance?tab=certificates');
}
