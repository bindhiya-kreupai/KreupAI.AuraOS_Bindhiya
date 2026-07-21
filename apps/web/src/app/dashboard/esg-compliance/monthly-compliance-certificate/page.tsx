import { redirect } from 'next/navigation';

export default function MonthlyComplianceRedirect() {
  redirect('/dashboard/esg-compliance/certificate');
}
