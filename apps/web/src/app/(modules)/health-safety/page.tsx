/**
 * @module HealthSafetyPage
 * @description Health & Safety module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function HealthSafetyPage() {
  return (
    <ModulePage
      moduleCode="HEALTH_SAFETY"
      moduleName="Health & Safety"
      moduleIcon="healthSafety"
      featureCount={5}
      isImplemented={false}
    />
  );
}
