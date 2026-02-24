/**
 * @module SkillsPage
 * @description Skills master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function SkillsPage() {
  return (
    <EmptyPage
      module="Skills"
      icon="skill"
      features={[
        'Add Skill',
        'Edit Skill',
        'Delete Skill',
        'View All Skills',
        'Categorize Skills',
        'Define Proficiency Levels',
        'Link Related Skills',
        'Import Skills',
        'Export Skills',
      ]}
    />
  );
}

