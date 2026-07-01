import { redirect } from 'next/navigation';

/**
 * Menu feature "Employee Registrations" canonicalizes to the existing, fully API-backed
 * GOSI compliance Registrations workspace.
 */
export default function GosiEmployeeRegistrationsRedirectPage() {
  redirect('/dashboard/gosi-compliance/registrations');
}
