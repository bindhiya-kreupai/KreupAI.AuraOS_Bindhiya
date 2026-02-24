/**
 * @module AILearningRecommendationsPage
 * @description ESS AI-powered learning recommendations — personalized
 *              suggestions and trending courses
 * @route /dashboard/ai-learning-recommendations
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { AILearningRecommendations } from '@/components/learning/AILearningRecommendations';

export default function AILearningRecommendationsPage() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <AILearningRecommendations />
    </div>
  );
}
