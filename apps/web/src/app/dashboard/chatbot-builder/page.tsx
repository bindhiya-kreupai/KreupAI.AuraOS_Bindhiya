"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function ChatbotBuilderPage() {
  const features = [
    'Dialogue Designer',
    'Entity Management',
    'Intent Library',
    'Training Data',
    'Multi-Channel',
    'Analytics Dashboard',
    'Handoff Rules',
    'Multi-lingual'
  ];

  return (
    <ModuleGrid
      title="Chatbot Builder"
      description="Manage your chatbot builder operations and settings."
      features={features}
      basePath="/dashboard/chatbot-builder"
    />
  );
}
