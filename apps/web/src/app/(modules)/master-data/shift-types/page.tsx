/**
 * @module ShiftTypesPage
 * @description Shift Types master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function ShiftTypesPage() {
  return (
    <EmptyPage
      module="Shift Types"
      icon="attendance"
      features={[
        'Add Shift Type',
        'Edit Shift Type',
        'Delete Shift Type',
        'View All Shift Types',
        'Configure Shift Timings',
        'Set Grace Periods',
        'Define Break Times',
        'Set Weekly Off Days',
        'Configure Overtime Rules',
        'Set Night Shift Allowance',
      ]}
    />
  );
}

