'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function CareerHubPage() {
  const features = ['Career Ladders', 'Internal Mobility', 'Career Goals', 'Aspirations'];

  return (
    <ModuleGrid
      title="Career Planning"
      description="Grow your career: explore ladders, internal roles, goals, and aspirations."
      icon={TrendingUp}
      features={features}
      basePath="/dashboard/career"
    />
  );
}
