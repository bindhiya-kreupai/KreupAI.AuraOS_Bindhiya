"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function CollaborationPage() {
  const features = [
    'Digital Whiteboard',
    'Task Kanban',
    'Daily Standups'
  ];

  return (
    <ModuleGrid
      title="Collaboration"
      description="Boost team productivity with shared visual workspaces and agile tools."
      features={features}
      basePath="/dashboard/collaboration"
    />
  );
}
