'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function LocalizationPage() {
  const features = [
    'Date/Time Formats',
    'Calendar Types',
    'Government Reports',
    'Address Formats',
    'Multi-Currency',
    'Multi-Language',
    'Country-Specific Fields',
  ];

  return (
    <ModuleGrid
      title="Localization"
      description="Manage global settings, currencies, and country-specific configurations."
      features={features}
      basePath="/dashboard/localization"
    />
  );
}
