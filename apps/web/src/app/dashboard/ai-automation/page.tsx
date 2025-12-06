"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AiAutomationPage() {
  const features = [
    'Org Health Predictor',
    'AI Coaching Bot',
    'Workflow Generator',
    'Resume Screening',
    'Attrition Prediction',
    'Leave Forecasting',
    'Anomaly Detection',
    'Chatbot',
    'Interview Scheduling',
    'Performance Analysis',
    'L&D Recommendation',
    'Job Matching',
    'Email Parsing',
    'Auto Accruals',
    'NLP Insights'
  ];

  return (
    <ModuleGrid
      title="AI & Automation"
      description="Manage your ai & automation operations and settings."
      features={features}
      basePath="/dashboard/ai-automation"
    />
  );
}
