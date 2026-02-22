/**
 * @module ReportsPage
 * @description Reports module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function ReportsPage() {
  return (
    <ModulePage
      moduleCode="REPORTS"
      moduleName="Reports"
      moduleIcon="reports"
      featureCount={12}
      isImplemented={false}
    />
  );
}

