/**
 * @module SuccessionPlanningPage
 * @description Succession Planning module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function SuccessionPlanningPage() {
  return (
    <ModulePage
      moduleCode="SUCCESSION_PLANNING"
      moduleName="Succession Planning"
      moduleIcon="succession"
      featureCount={8}
      isImplemented={false}
    />
  );
}

