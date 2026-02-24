"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function GamificationPage() {
  const features = [
    'Points System',
    'Leaderboards',
    'Badges',
    'Challenges',
    'Levels & Tiers',
    'Missions',
    'Virtual Currency',
    'Achievement Wall'
  ];

  return (
    <ModuleGrid
      title="Gamification"
      description="Manage your gamification operations and settings."
      features={features}
      basePath="/dashboard/gamification"
    />
  );
}

