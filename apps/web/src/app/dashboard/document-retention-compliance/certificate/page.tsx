import { redirect } from 'next/navigation';

export default function CertificatePage() {
  redirect('/dashboard/document-retention-compliance?tab=certificates');
}
