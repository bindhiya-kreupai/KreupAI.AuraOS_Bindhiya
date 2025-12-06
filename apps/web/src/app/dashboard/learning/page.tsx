"use client";

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';

export default function LearningDevelopmentPage() {
  const features = [
    'Course Catalog',
    'Learning Paths',
    'Training Calendar',
    'Enrollment',
    'Attendance Tracking',
    'Assessment Engine',
    'Certifications',
    'External Training',
    'Training Feedback',
    'Skill Gap Analysis',
    'Training Budget',
    'Vendor Management',
    'E-Learning Platform',
    'Mentoring',
    'Knowledge Repository',
    'Compliance Training',
    'ROI Measurement'
  ];

  return (
    <ModuleGrid
      title="Learning & Development"
      description="LMS, training operations, and skill development platform."
      features={features}
      basePath="/dashboard/learning"
    />
  );
}
