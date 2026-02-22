/**
 * @module CountriesPage
 * @description Countries master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function CountriesPage() {
  return (
    <EmptyPage
      module="Countries"
      icon="globe"
      features={[
        'Add Country',
        'Edit Country',
        'Delete Country',
        'View All Countries',
        'Search Countries',
        'Import Countries',
        'Export Countries',
      ]}
    />
  );
}

