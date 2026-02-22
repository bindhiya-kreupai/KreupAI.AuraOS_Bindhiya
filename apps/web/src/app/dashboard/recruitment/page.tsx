"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function RecruitmentPage() {
  const features = [
    'Job Requisition',
    'Job Posting',
    'Career Site',
    'Application Tracking',
    'Resume Parsing',
    'Candidate Screening',
    'Interview Management',
    'Assessment Tests',
    'Interview Feedback',
    'Offer Management',
    'Background Verification',
    'Recruitment Analytics',
    'Talent Pool'
  ];

  return (
    <ModuleGrid
      title="Recruitment"
      description="Manage your recruitment operations and settings."
      features={features}
      basePath="/dashboard/recruitment"
    />
  );
}

