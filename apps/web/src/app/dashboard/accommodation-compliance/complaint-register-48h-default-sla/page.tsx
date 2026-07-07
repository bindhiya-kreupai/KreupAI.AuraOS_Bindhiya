import { redirect } from 'next/navigation';

// AURA-338: Menu feature "Complaint Register (48h default SLA)" canonicalizes to
// the existing, API-backed accommodation complaints workspace, which logs
// occupant complaints with a default 48h resolution SLA and assign/resolve flow.
export default function AccommodationComplaintRegisterRedirect() {
  redirect('/dashboard/accommodation-compliance/complaints');
}
