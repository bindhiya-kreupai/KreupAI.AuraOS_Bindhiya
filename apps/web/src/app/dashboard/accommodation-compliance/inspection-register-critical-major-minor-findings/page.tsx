import { redirect } from 'next/navigation';

// AURA-339: Menu feature "Inspection Register (CRITICAL/MAJOR/MINOR findings)"
// canonicalizes to the existing, API-backed accommodation inspections workspace,
// which records inspections and classifies findings CRITICAL/MAJOR/MINOR.
export default function AccommodationInspectionRegisterRedirect() {
  redirect('/dashboard/accommodation-compliance/inspections');
}
