"use client";

import React, { useState } from 'react';
import { BookOpen, Play, PenTool, Sparkles } from 'lucide-react';
import LearningPaths from '@/components/learning/LearningPaths';
import PathProgress from '@/components/learning/PathProgress';
import PathBuilder from '@/components/learning/PathBuilder';
import PathEnrollment from '@/components/learning/PathEnrollment';
import VideoPlayer from '@/components/learning/VideoPlayer';
import QuizBuilder from '@/components/learning/QuizBuilder';
import AILearningRecommendations from '@/components/learning/AILearningRecommendations';

type Tab = 'catalog' | 'my-paths' | 'builder' | 'video' | 'quizzes' | 'ai-recommendations';

export default function LearningPathsModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('catalog');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'catalog', label: 'Catalog' },
    { key: 'my-paths', label: 'My Paths' },
    { key: 'builder', label: 'Path Builder' },
    { key: 'video', label: 'Video Player' },
    { key: 'quizzes', label: 'Quizzes' },
    { key: 'ai-recommendations', label: 'AI Recommendations' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Learning & Development
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore learning paths, track progress, and develop your skills
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Sparkles className="w-4 h-4" /> Get Recommendations
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Enrolled Paths</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">4</p>
          <p className="text-[10px] text-slate-400">2 in progress</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Hours Completed</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">38</p>
          <p className="text-[10px] text-slate-400">This quarter</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Quizzes Passed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">12</p>
          <p className="text-[10px] text-slate-400">Avg score: 84%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Certifications</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">3</p>
          <p className="text-[10px] text-slate-400">1 expiring soon</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'catalog' && <LearningPaths />}
        {activeTab === 'my-paths' && (
          <div className="space-y-6">
            <PathProgress />
            <PathEnrollment />
          </div>
        )}
        {activeTab === 'builder' && <PathBuilder />}
        {activeTab === 'video' && <VideoPlayer />}
        {activeTab === 'quizzes' && <QuizBuilder />}
        {activeTab === 'ai-recommendations' && <AILearningRecommendations />}
      </div>
    </div>
  );
}
