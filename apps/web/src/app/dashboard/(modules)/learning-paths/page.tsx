'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Map, BookOpen, Plus, Compass } from 'lucide-react';
import { useLearningPaths } from '@/hooks/useLearning';
import { LearningPaths } from '@/components/learning/LearningPaths';
import { PathEnrollment } from '@/components/learning/PathEnrollment';
import { PathProgress } from '@/components/learning/PathProgress';
import { PathBuilder } from '@/components/learning/PathBuilder';
import type { PathLevel } from '@/services/learningService';

type View = 'catalog' | 'detail' | 'progress' | 'builder';

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'my_paths', label: 'My Paths', icon: BookOpen },
  { key: 'explore', label: 'Explore', icon: Compass },
];

export default function LearningPathsPage() {
  const {
    paths,
    enrolledPaths,
    catalogPaths,
    enrollInPath,
    unenrollFromPath,
    startCourse,
    completeCourse,
    getPathProgress,
  } = useLearningPaths();

  const [view, setView] = useState<View>('catalog');
  const [activeTab, setActiveTab] = useState('my_paths');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const selectedPath = selectedPathId ? paths.find((p) => p.id === selectedPathId) : null;

  const handleSelectPath = useCallback((pathId: string) => {
    setSelectedPathId(pathId);
    setView('detail');
  }, []);

  const handleEnroll = useCallback(
    (pathId: string) => {
      enrollInPath(pathId);
    },
    [enrollInPath]
  );

  const handleUnenroll = useCallback(
    (pathId: string) => {
      unenrollFromPath(pathId);
      setView('catalog');
      setSelectedPathId(null);
    },
    [unenrollFromPath]
  );

  const handleViewProgress = useCallback(() => {
    setView('progress');
  }, []);

  const handleBack = useCallback(() => {
    setView('catalog');
    setSelectedPathId(null);
  }, []);

  const handleStartCourse = useCallback(
    (courseId: string) => {
      if (selectedPathId) startCourse(selectedPathId, courseId);
    },
    [selectedPathId, startCourse]
  );

  const handleCompleteCourse = useCallback(
    (courseId: string) => {
      if (selectedPathId) completeCourse(selectedPathId, courseId);
    },
    [selectedPathId, completeCourse]
  );

  const handleSavePath = useCallback(
    (data: {
      title: string;
      description: string;
      level: PathLevel;
      category: string;
      skills: string[];
      courses: unknown[];
    }) => {
      void data;
      setShowBuilder(false);
    },
    []
  );

  // Builder view
  if (showBuilder) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-celestial-indigo" />
          <div>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">Create Learning Path</p>
            <p className="text-[9px] text-silver-mist">
              Build a structured learning journey with courses and prerequisites
            </p>
          </div>
        </div>
        <PathBuilder onSave={handleSavePath} onCancel={() => setShowBuilder(false)} />
      </div>
    );
  }

  // Detail or Progress view
  if (view !== 'catalog' && selectedPath) {
    if (view === 'progress') {
      const progressData = getPathProgress(selectedPath.id);
      if (progressData) {
        return (
          <div className="p-6 max-w-7xl mx-auto space-y-4">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-celestial-indigo" />
              <div>
                <p className="text-sm font-bold text-ink-black dark:text-pearl">Path Progress</p>
                <p className="text-[9px] text-silver-mist">
                  Track your learning journey step by step
                </p>
              </div>
            </div>
            <PathProgress
              path={selectedPath}
              progressData={progressData}
              onStartCourse={handleStartCourse}
              onCompleteCourse={handleCompleteCourse}
              onBack={handleBack}
            />
          </div>
        );
      }
    }

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-celestial-indigo" />
          <div>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">Learning Path</p>
            <p className="text-[9px] text-silver-mist">Review details and enroll in this path</p>
          </div>
        </div>
        <PathEnrollment
          path={selectedPath}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
          onBack={handleBack}
          onViewProgress={handleViewProgress}
        />
      </div>
    );
  }

  // Catalog view
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-celestial-indigo" />
          <div>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">Learning Paths</p>
            <p className="text-[9px] text-silver-mist">
              Structured learning journeys to build skills and advance your career
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> Create Path
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
                activeTab === tab.key
                  ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="text-[8px] text-silver-mist">
                ({tab.key === 'my_paths' ? enrolledPaths.length : catalogPaths.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Path Catalog */}
      <LearningPaths
        paths={activeTab === 'my_paths' ? enrolledPaths : paths}
        onSelectPath={handleSelectPath}
        onEnroll={handleEnroll}
      />
    </div>
  );
}
