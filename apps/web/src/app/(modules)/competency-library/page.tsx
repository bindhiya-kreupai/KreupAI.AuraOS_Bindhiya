/**
 * @module CompetencyLibraryPage
 * @description Competency Library module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function CompetencyLibraryPage() {
  return (
    <ModulePage
      moduleCode="COMPETENCY_LIBRARY"
      moduleName="Competency Library"
      moduleIcon="competency"
      featureCount={5}
      isImplemented={false}
    />
  );
}

