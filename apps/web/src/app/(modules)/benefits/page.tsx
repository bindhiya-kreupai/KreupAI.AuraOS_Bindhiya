/**
 * @module BenefitsModuleRedirect
 * @description The legacy (modules)/benefits tab UI was backed by in-memory mock
 *   services (BenefitsClaimsService), which violates the platform's real-data rule.
 *   The canonical, fully API-wired benefits experience lives at /dashboard/benefits,
 *   so this route now permanently redirects there instead of rendering mock UI.
 * @project AURA HCM Platform
 */

import { redirect } from 'next/navigation';

export default function BenefitsModuleRedirect() {
  redirect('/dashboard/benefits');
}
