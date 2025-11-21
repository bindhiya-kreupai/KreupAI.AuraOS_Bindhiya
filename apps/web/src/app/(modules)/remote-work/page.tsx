/**
 * @module RemoteWorkPage
 * @description Remote Work module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function RemoteWorkPage() {
  return (
    <ModulePage
      moduleCode="REMOTE_WORK"
      moduleName="Remote Work"
      moduleIcon="remoteWork"
      featureCount={8}
      isImplemented={false}
    />
  );
}
