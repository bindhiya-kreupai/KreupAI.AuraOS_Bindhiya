"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function AiAutomationPage() {
  const features = [
    'AI Analytics',
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
    'Job Boards',
    'Email Parsing',
    'Auto Accruals',
    'NLP Insights'
  ];

  return (
    <ModuleGrid
      title="AI & Automation"
      description="AI-powered workforce intelligence and recruitment automation."
      features={features}
      basePath="/dashboard/ai-automation"
    />
  );
}
