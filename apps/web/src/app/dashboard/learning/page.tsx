"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { LearningAnalyticsService } from './services';

export default function LearningDevelopmentPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await LearningAnalyticsService.getAnalytics();
        setAnalytics(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    'Course Catalog',
    'Learning Paths',
    'Training Calendar',
    'Enrollment',
    'Attendance Tracking',
    'Assessment Engine',
    'Quiz Builder',
    'Certifications',
    'External Training',
    'Training Feedback',
    'AI Recommendations',
    'Skill Gap Analysis',
    'Training Budget',
    'Vendor Management',
    'E-Learning Platform',
    'Mentoring',
    'Learning Community',
    'Knowledge Repository',
    'Compliance Training',
    'ROI Measurement'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <ModuleGrid
      title="Learning & Development"
      description="LMS, training operations, and skill development platform."
      features={features}
      basePath="/dashboard/learning"
    />
  );
}
