import { redirect } from 'next/navigation';

export default function DocumentsPage() {
  redirect('/dashboard/document-retention-compliance?tab=documents');
}
