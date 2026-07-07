import { redirect } from 'next/navigation';

// AURA-533: Menu feature "TA Risk Register (L×I bands)" canonicalizes to the
// existing, fully API-backed TA risk register workspace (EPIC-03/04/05), which
// scores each entry by Likelihood × Impact and bands it LOW/MEDIUM/HIGH/CRITICAL.
export default function TaRiskRegisterBandsRedirect() {
  redirect('/dashboard/talent-acquisition-compliance/risk-register');
}
