import { redirect } from 'next/navigation';

export default function HrDocumentRegisterRedirectPage() {
  redirect('/dashboard/document-retention-compliance?tab=documents');
}
