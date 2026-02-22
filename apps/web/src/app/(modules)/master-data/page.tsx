/**
 * @module MasterDataPage
 * @description Master Data module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function MasterDataPage() {
  return (
    <ModulePage
      moduleCode="MASTER_DATA"
      moduleName="Master Data"
      moduleIcon="settings"
      featureCount={24}
      isImplemented={false}
    />
  );
}

