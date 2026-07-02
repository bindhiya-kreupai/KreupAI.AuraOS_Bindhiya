import { redirect } from 'next/navigation';

// Consolidated: the alumni directory now lives at the canonical Alumni Network
// route. This orphaned mock page permanently redirects to the live directory
// (AURA-222) so any bookmarked links keep working.
export default function CommunityAlumniRedirect() {
  redirect('/dashboard/alumni-network/alumni-directory');
}
