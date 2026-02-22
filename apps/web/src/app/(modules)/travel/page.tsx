/**
 * @module TravelPage
 * @description Travel module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function TravelPage() {
  return (
    <ModulePage
      moduleCode="TRAVEL"
      moduleName="Travel"
      moduleIcon="travel"
      featureCount={12}
      isImplemented={false}
    />
  );
}

