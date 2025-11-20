/**
 * @module JobLibraryPage
 * @description Job Library module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function JobLibraryPage() {
  return (
    <ModulePage
      moduleCode="JOB_LIBRARY"
      moduleName="Job Library"
      moduleIcon="jobLibrary"
      featureCount={5}
      isImplemented={false}
    />
  );
}
