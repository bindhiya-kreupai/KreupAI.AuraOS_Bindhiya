/**
 * @module OrgDesignPage
 * @description Org Design module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function OrgDesignPage() {
  return (
    <ModulePage
      moduleCode="ORG_DESIGN"
      moduleName="Org Design"
      moduleIcon="orgDesign"
      featureCount={8}
      isImplemented={false}
    />
  );
}

