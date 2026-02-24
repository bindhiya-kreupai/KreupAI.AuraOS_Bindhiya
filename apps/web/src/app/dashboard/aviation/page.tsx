"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AviationPage() {
  const features = [
    'Cabin Crew',
    'Pilot Training',
    'Ground Operations'
  ];

  return (
    <ModuleGrid
      title="Aviation"
      description="Coordinate flight crews, manage pilot training, and oversee ground ops."
      features={features}
      basePath="/dashboard/aviation"
    />
  );
}

