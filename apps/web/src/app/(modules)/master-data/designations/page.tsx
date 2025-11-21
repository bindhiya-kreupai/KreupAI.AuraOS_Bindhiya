/**
 * @module DesignationsPage
 * @description Designations master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function DesignationsPage() {
  return (
    <EmptyPage
      module="Designations"
      icon="designation"
      features={[
        'Add Designation',
        'Edit Designation',
        'Delete Designation',
        'View All Designations',
        'Designation Hierarchy',
        'Link to Grade',
        'Link to Job Family',
        'Set Reporting Structure',
        'Define Skill Requirements',
      ]}
    />
  );
}
