/**
 * @module EngagementPage
 * @description Engagement module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function EngagementPage() {
  return (
    <ModulePage
      moduleCode="ENGAGEMENT"
      moduleName="Engagement"
      moduleIcon="engagement"
      featureCount={8}
      isImplemented={false}
    />
  );
}
