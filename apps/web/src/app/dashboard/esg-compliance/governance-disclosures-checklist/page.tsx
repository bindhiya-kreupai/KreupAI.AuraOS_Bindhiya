import { redirect } from 'next/navigation';

export default function GovernanceRedirect() {
  redirect('/dashboard/esg-compliance/disclosure-checklist');
}
