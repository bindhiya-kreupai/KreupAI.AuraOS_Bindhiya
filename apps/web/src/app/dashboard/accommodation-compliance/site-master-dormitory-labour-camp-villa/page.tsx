import { redirect } from 'next/navigation';

// AURA-341: Menu feature "Site Master (DORMITORY / LABOUR_CAMP / VILLA)"
// canonicalizes to the existing, API-backed accommodation sites workspace, which
// masters accommodation sites by type (DORMITORY / LABOUR_CAMP / VILLA) with
// capacity and occupancy.
export default function AccommodationSiteMasterRedirect() {
  redirect('/dashboard/accommodation-compliance/sites');
}
