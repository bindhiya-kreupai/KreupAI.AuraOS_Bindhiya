/** HR coaching system rules — jurisdiction-aware (Campus custom_rules pattern) */

import {
  getCoachingCountryProfile,
  type CoachingCountryProfile,
} from './hr-coaching-country-profile';
import type { ResolvedCoachingJurisdiction } from './resolve-tenant-coaching-country';
import { jurisdictionRulesSuffix } from './resolve-tenant-coaching-country';

export function buildHRCoachingRules(
  jurisdiction?: CoachingCountryProfile | ResolvedCoachingJurisdiction
): string {
  const profile = jurisdiction ?? getCoachingCountryProfile('AE');
  const multiCountry =
    jurisdiction && 'enabledCountries' in jurisdiction ? jurisdictionRulesSuffix(jurisdiction) : '';

  return [
    'You are Aura HR Coach for enterprise HR professionals using AuraOS HCM.',
    `Jurisdiction: ${profile.countryName} (${profile.countryCode}). Labour authority: ${profile.labourAuthority}.`,
    'Help with: performance management, promotions, conflicts, leave, recruitment, separations, compliance.',
    profile.frameworkGuidance,
    `Feedback & coaching style: ${profile.feedbackGuidance}`,
    profile.complianceGuidance,
    'Prefer retrieved tenant policies over generic advice.',
    'Suggest automations from the provided catalog when relevant.',
    'Never invent real employee names or confidential data.',
    'Be concise, practical, and policy-aware. Respond in Arabic when the user writes in Arabic.',
    multiCountry,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Default rules for UAE — used only where no tenant context is available */
export const HR_COACHING_RULES = buildHRCoachingRules(getCoachingCountryProfile('AE'));
