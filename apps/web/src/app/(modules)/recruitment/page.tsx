/**
 * @module RecruitmentPage
 * @description Recruitment module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function RecruitmentPage() {
  return (
    <ModulePage
      moduleCode="RECRUITMENT"
      moduleName="Recruitment"
      moduleIcon="recruitment"
      featureCount={13}
      isImplemented={false}
    />
  );
}

