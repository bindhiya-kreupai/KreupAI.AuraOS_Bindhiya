/**
 * @module DepartmentsPage
 * @description Departments master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function DepartmentsPage() {
  return (
    <EmptyPage
      module="Departments"
      icon="department"
      features={[
        'Add Department',
        'Edit Department',
        'Delete Department',
        'View All Departments',
        'Department Hierarchy',
        'Assign Head of Department',
        'Set Cost Center',
        'Budget Allocation',
        'View Employee Count',
      ]}
    />
  );
}

