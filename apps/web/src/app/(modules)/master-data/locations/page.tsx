/**
 * @module LocationsPage
 * @description Locations master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function LocationsPage() {
  return (
    <EmptyPage
      module="Locations"
      icon="location"
      features={[
        'Add Location',
        'Edit Location',
        'Delete Location',
        'View All Locations',
        'Set Location Type',
        'Configure Address',
        'Set Timezone',
        'Define Working Hours',
        'Set Capacity',
        'Mark as Headquarters',
        'Add Contact Information',
      ]}
    />
  );
}
