import { redirect } from 'next/navigation';

// AURA-337: Menu feature "Assignment Register (capacity gated)" canonicalizes to
// the existing, API-backed accommodation assignments workspace, which allocates
// occupants to sites/rooms and refuses assignment once site capacity is reached.
export default function AccommodationAssignmentRegisterRedirect() {
  redirect('/dashboard/accommodation-compliance/assignments');
}
