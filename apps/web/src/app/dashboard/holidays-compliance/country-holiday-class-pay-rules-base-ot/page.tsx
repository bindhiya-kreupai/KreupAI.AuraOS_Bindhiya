import { redirect } from 'next/navigation';

/**
 * Menu feature "Country × Holiday Class Pay Rules (base × + OT ×)" canonicalizes to the
 * existing, fully API-backed holidays compliance pay-rules workspace.
 */
export default function CountryHolidayClassPayRulesRedirectPage() {
  redirect('/dashboard/holidays-compliance/pay-rules');
}
