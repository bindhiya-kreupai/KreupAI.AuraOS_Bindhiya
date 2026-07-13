import { redirect } from 'next/navigation';

export default function DisposalPage() {
  redirect('/dashboard/document-retention-compliance?tab=disposal');
}
