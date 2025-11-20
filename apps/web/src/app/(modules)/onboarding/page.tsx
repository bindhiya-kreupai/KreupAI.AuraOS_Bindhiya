/**
 * @module OnboardingPage
 * @description Onboarding module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function OnboardingPage() {
  return (
    <ModulePage
      moduleCode="ONBOARDING"
      moduleName="Onboarding"
      moduleIcon="onboarding"
      featureCount={5}
      isImplemented={false}
    />
  );
}
