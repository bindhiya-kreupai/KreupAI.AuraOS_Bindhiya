/**
 * @module WellnessPage
 * @description Wellness module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function WellnessPage() {
  return (
    <ModulePage
      moduleCode="WELLNESS"
      moduleName="Wellness"
      moduleIcon="wellness"
      featureCount={7}
      isImplemented={false}
    />
  );
}
