/**
 * @module PayrollPage
 * @description Payroll module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function PayrollPage() {
  return (
    <ModulePage
      moduleCode="PAYROLL"
      moduleName="Payroll"
      moduleIcon="payroll"
      featureCount={17}
      isImplemented={false}
    />
  );
}

