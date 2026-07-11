import { redirect } from 'next/navigation';

export default function LitigationHoldsPage() {
  redirect('/dashboard/document-retention-compliance?tab=holds');
}
