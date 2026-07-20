import { redirect } from 'next/navigation';

// AURA-532: Menu feature "Stage Breakdown (PLANNING/SOURCING/SELECTION/OFFER/
// PRE-EMPLOYMENT)" canonicalizes to the TA compliance hub, which renders the
// per-stage breakdown table (total / pass / fail / observation / unchecked)
// sourced from the /dashboard aggregate API.
export default function TaStageBreakdownRedirect() {
  redirect('/dashboard/talent-acquisition-compliance');
}
