/**
 * @module UserManagementPage
 * @description User Management module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function UserManagementPage() {
  return (
    <ModulePage
      moduleCode="USER_MANAGEMENT"
      moduleName="User Management"
      moduleIcon="userManagement"
      featureCount={12}
      isImplemented={false}
    />
  );
}

