import { redirect } from 'next/navigation';

/**
 * Menu feature "Grievance Register (multi-channel + SLA)" canonicalizes to the existing,
 * fully API-backed ER compliance grievances workspace.
 */
export default function GrievanceRegisterRedirectPage() {
  redirect('/dashboard/er-compliance/grievances');
}
