/**
 * @module LocalizationPage
 * @description Localization module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function LocalizationPage() {
  return (
    <ModulePage
      moduleCode="LOCALIZATION"
      moduleName="Localization"
      moduleIcon="localization"
      featureCount={11}
      isImplemented={false}
    />
  );
}
