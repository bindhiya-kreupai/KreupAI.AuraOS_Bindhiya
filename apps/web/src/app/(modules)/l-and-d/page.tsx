/**
 * @module LearningDevelopmentPage
 * @description L&D module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function LearningDevelopmentPage() {
  return (
    <ModulePage
      moduleCode="LEARNING_DEVELOPMENT"
      moduleName="L&D"
      moduleIcon="learning"
      featureCount={17}
      isImplemented={false}
    />
  );
}

