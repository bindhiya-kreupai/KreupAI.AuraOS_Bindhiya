/**
 * @module GamificationPage
 * @description Gamification module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function GamificationPage() {
  return (
    <ModulePage
      moduleCode="GAMIFICATION"
      moduleName="Gamification"
      moduleIcon="gamification"
      featureCount={8}
      isImplemented={false}
    />
  );
}
