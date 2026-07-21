import { redirect } from 'next/navigation';

// Section landing route: forward to the first legal sub-module.
export default function LegalPage() {
  redirect('/dashboard/legal/contracts');
}
