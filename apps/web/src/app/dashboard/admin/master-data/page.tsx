"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function LocalizationPage() {
  const features = [
    'Multi-Currency',
    'Multi-Language',
    'Country-Specific Fields',
    'Tax Regimes',
    'Statutory Compliance',
    'Date/Time Formats',
    'Calendar Types',
    'Bank Integration',
    'Government Reports',
    'Regional Holidays',
    'Address Formats'
  ];

  return (
    <ModuleGrid
      title="Localization"
      description="Manage your localization operations and settings."
      features={features}
      basePath="/dashboard/admin/master-data"
    />
  );
}
