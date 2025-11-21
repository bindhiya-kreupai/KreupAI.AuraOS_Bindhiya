/**
 * @module AttendancePage
 * @description Attendance module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function AttendancePage() {
  return (
    <ModulePage
      moduleCode="ATTENDANCE"
      moduleName="Attendance"
      moduleIcon="attendance"
      featureCount={13}
      isImplemented={false}
    />
  );
}
