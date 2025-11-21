/**
 * @module CareerPlanningPage
 * @description Career Planning module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function CareerPlanningPage() {
  return (
    <ModulePage
      moduleCode="CAREER_PLANNING"
      moduleName="Career Planning"
      moduleIcon="career"
      featureCount={4}
      isImplemented={false}
    />
  );
}
