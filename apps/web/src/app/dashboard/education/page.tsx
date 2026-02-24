"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function EducationPage() {
  const features = [
    'Faculty Tenure',
    'Research Grants',
    'Adjunct Management'
  ];

  return (
    <ModuleGrid
      title="Education"
      description="Streamline academic administration, tenure tracking, and research funding."
      features={features}
      basePath="/dashboard/education"
    />
  );
}

