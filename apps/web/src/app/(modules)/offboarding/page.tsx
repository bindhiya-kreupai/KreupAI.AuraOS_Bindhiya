/**
 * @module OffboardingPage
 * @description Offboarding module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function OffboardingPage() {
  return (
    <ModulePage
      moduleCode="OFFBOARDING"
      moduleName="Offboarding"
      moduleIcon="offboarding"
      featureCount={4}
      isImplemented={false}
    />
  );
}
