import { redirect } from 'next/navigation';

// Section landing route: forward to the risk-heatmap sub-module.
export default function ComplianceDashboardPage() {
  redirect('/dashboard/compliance-dashboard/risk-heatmap');
}
