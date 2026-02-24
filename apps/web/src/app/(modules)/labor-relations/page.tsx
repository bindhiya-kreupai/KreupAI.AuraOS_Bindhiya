/**
 * @module LaborRelationsPage
 * @description Labor Relations module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function LaborRelationsPage() {
  return (
    <ModulePage
      moduleCode="LABOR_RELATIONS"
      moduleName="Labor Relations"
      moduleIcon="labor"
      featureCount={8}
      isImplemented={false}
    />
  );
}

