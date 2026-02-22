/**
 * @module WorkforcePlanningPage
 * @description Workforce Planning module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function WorkforcePlanningPage() {
  return (
    <ModulePage
      moduleCode="WORKFORCE_PLANNING"
      moduleName="Workforce Planning"
      moduleIcon="workforcePlanning"
      featureCount={8}
      isImplemented={false}
    />
  );
}

