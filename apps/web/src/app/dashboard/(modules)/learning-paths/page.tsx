'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Map, BookOpen, Plus, Compass, Loader2 } from 'lucide-react';
import { LearningPathService, EnrollmentService } from '@/app/dashboard/learning/services';
import { LearningPaths } from '@/components/learning/LearningPaths';
import { PathEnrollment } from '@/components/learning/PathEnrollment';
import { PathProgress } from '@/components/learning/PathProgress';
import { PathBuilder } from '@/components/learning/PathBuilder';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import type {
  LearningPathData,
  PathLevel,
  PathCourse,
  PathProgressData,
  PathMilestone,
  EnrollmentStatus,
  CourseStatus,
  CourseType,
} from '@/services/learningService';

type View = 'catalog' | 'detail' | 'progress' | 'builder';

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'my_paths', label: 'My Paths', icon: BookOpen },
  { key: 'explore', label: 'Explore', icon: Compass },
];

const LEVEL_MAP: Record<string, PathLevel> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

const ENROLLMENT_STATUS_MAP: Record<string, EnrollmentStatus> = {
  enrolled: 'enrolled',
  not_started: 'enrolled',
  in_progress: 'in_progress',
  completed: 'completed',
  paused: 'paused',
  withdrawn: 'not_enrolled',
};

// A course is "completed" when its progress hits 100, "in_progress" when partially
// started, otherwise it is "available". We do not synthesize a locked state because
// the persisted path/enrollment records do not carry prerequisite gating yet.
function courseStatusFromProgress(progress: number): CourseStatus {
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'in_progress';
  return 'available';
}

// Adapt a persisted learning-path record (courses stored as JSON) plus the
// learner's enrollment (if any) into the rich LearningPathData contract the
// PathEnrollment / PathProgress / LearningPaths components expect.
function toPathData(raw: any, enrollment: any | undefined): LearningPathData {
  const difficulty = String(raw.difficulty || raw.level || 'BEGINNER').toUpperCase();
  const moduleProgress: Record<string, number> = {};
  if (enrollment && Array.isArray(enrollment.modules)) {
    for (const m of enrollment.modules) {
      const key = m.courseId ?? m.moduleId ?? m.id;
      if (key) moduleProgress[String(key)] = Number(m.progress ?? m.completionPercentage ?? 0);
    }
  }

  const rawCourses: any[] = Array.isArray(raw.courses) ? raw.courses : [];
  const courses: PathCourse[] = rawCourses.map((c, index) => {
    const id = String(c.id ?? c.courseId ?? `course-${index}`);
    const progress = moduleProgress[id] ?? Number(c.progress ?? 0);
    return {
      id,
      title: c.title ?? c.courseTitle ?? `Course ${index + 1}`,
      description: c.description ?? '',
      type: (c.type as CourseType) ?? 'article',
      duration: Number(c.duration ?? 0),
      order: Number(c.order ?? index + 1),
      isRequired: c.isRequired ?? true,
      prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
      status: courseStatusFromProgress(progress),
      progress,
      completedDate: c.completedDate,
      instructor: c.instructor,
      provider: c.provider,
    };
  });

  const enrollmentStatus = enrollment
    ? (ENROLLMENT_STATUS_MAP[String(enrollment.status)] ?? 'enrolled')
    : 'not_enrolled';

  return {
    id: raw.id ?? '',
    title: raw.title ?? 'Untitled Path',
    description: raw.description ?? '',
    level: LEVEL_MAP[difficulty] ?? 'beginner',
    category: raw.categoryName ?? raw.category ?? 'General',
    totalDuration: Number(raw.duration ?? raw.totalDuration ?? 0),
    courses,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    enrollmentCount: raw.enrollmentCount ?? raw.enrolledCount ?? 0,
    completionRate: raw.completionRate ?? 0,
    rating: raw.rating ?? 0,
    ratingCount: raw.ratingCount ?? 0,
    thumbnailEmoji: raw.thumbnailEmoji ?? '🎯',
    status: raw.isActive === false ? 'draft' : 'published',
    isEnrolled: Boolean(enrollment),
    enrollmentStatus,
    progress: enrollment ? Number(enrollment.progress ?? 0) : 0,
    startedDate: enrollment?.startDate ?? enrollment?.enrolledDate,
    estimatedCompletion: enrollment?.dueDate,
    createdBy: raw.createdBy ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  } as LearningPathData;
}

export default function LearningPathsPage() {
  const { user } = useCurrentUser();

  const [rawPaths, setRawPaths] = useState<any[]>([]);
  const [enrollmentsByPath, setEnrollmentsByPath] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<View>('catalog');
  const [activeTab, setActiveTab] = useState('my_paths');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pathList, enrollmentList] = await Promise.all([
        LearningPathService.getLearningPaths({ isActive: true }),
        user?.employeeId
          ? EnrollmentService.getEnrollments({ learnerId: user.employeeId })
          : Promise.resolve([]),
      ]);
      const byPath: Record<string, any> = {};
      for (const e of enrollmentList as any[]) {
        if (e?.learningPathId) byPath[String(e.learningPathId)] = e;
      }
      setRawPaths(pathList as any[]);
      setEnrollmentsByPath(byPath);
    } catch (err) {
      console.error('Error loading learning paths:', err);
      setError('Failed to load learning paths. Please try again.');
      setRawPaths([]);
      setEnrollmentsByPath({});
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paths = useMemo(
    () => rawPaths.map((raw) => toPathData(raw, enrollmentsByPath[String(raw.id)])),
    [rawPaths, enrollmentsByPath]
  );

  const enrolledPaths = useMemo(() => paths.filter((p) => p.isEnrolled), [paths]);
  const catalogPaths = useMemo(
    () => paths.filter((p) => !p.isEnrolled && p.status === 'published'),
    [paths]
  );

  const selectedPath = selectedPathId ? paths.find((p) => p.id === selectedPathId) : null;

  const handleSelectPath = useCallback((pathId: string) => {
    setSelectedPathId(pathId);
    setView('detail');
  }, []);

  const handleEnroll = useCallback(
    async (pathId: string) => {
      if (!user?.employeeId) {
        setError('You must be signed in to enroll.');
        return;
      }
      try {
        await EnrollmentService.createEnrollment({
          learningPathId: pathId,
          learnerId: user.employeeId,
        } as never);
        await loadData();
      } catch (err) {
        console.error('Error enrolling in path:', err);
        setError('Failed to enroll. Please try again.');
      }
    },
    [user?.employeeId, loadData]
  );

  const handleUnenroll = useCallback(
    async (pathId: string) => {
      const enrollment = enrollmentsByPath[String(pathId)];
      if (enrollment?.id) {
        try {
          await EnrollmentService.withdrawEnrollment(enrollment.id);
        } catch (err) {
          console.error('Error withdrawing from path:', err);
          setError('Failed to unenroll. Please try again.');
          return;
        }
      }
      setView('catalog');
      setSelectedPathId(null);
      await loadData();
    },
    [enrollmentsByPath, loadData]
  );

  const handleViewProgress = useCallback(() => {
    setView('progress');
  }, []);

  const handleBack = useCallback(() => {
    setView('catalog');
    setSelectedPathId(null);
  }, []);

  const updateCourseProgress = useCallback(
    async (pathId: string, progress: number) => {
      const enrollment = enrollmentsByPath[String(pathId)];
      if (!enrollment?.id) return;
      try {
        await EnrollmentService.updateProgress(
          enrollment.id,
          progress,
          Number(enrollment.timeSpent ?? 0)
        );
        await loadData();
      } catch (err) {
        console.error('Error updating course progress:', err);
        setError('Failed to update progress. Please try again.');
      }
    },
    [enrollmentsByPath, loadData]
  );

  const handleStartCourse = useCallback(() => {
    if (selectedPath) {
      // Move a not-started enrollment into progress.
      void updateCourseProgress(selectedPath.id, Math.max(selectedPath.progress, 1));
    }
  }, [selectedPath, updateCourseProgress]);

  const handleCompleteCourse = useCallback(() => {
    if (!selectedPath) return;
    const total = selectedPath.courses.length || 1;
    const completed = selectedPath.courses.filter((c) => c.status === 'completed').length + 1;
    const newProgress = Math.min(100, Math.round((completed / total) * 100));
    void updateCourseProgress(selectedPath.id, newProgress);
  }, [selectedPath, updateCourseProgress]);

  const getPathProgress = useCallback(
    (pathId: string): PathProgressData | null => {
      const path = paths.find((p) => p.id === pathId);
      if (!path) return null;
      const enrollment = enrollmentsByPath[String(pathId)];
      const completedCourses = path.courses.filter((c) => c.status === 'completed');
      const currentCourse = path.courses.find((c) => c.status === 'in_progress');
      const requiredCount = path.courses.filter((c) => c.isRequired).length;
      const milestones: PathMilestone[] = [
        {
          id: 'm-1',
          title: 'First Course Complete',
          description: 'Complete your first course',
          courseOrder: 1,
          isAchieved: completedCourses.length >= 1,
          achievedDate: completedCourses[0]?.completedDate,
          reward: '🎖️ Quick Starter',
        },
        {
          id: 'm-2',
          title: 'Halfway There',
          description: 'Complete 50% of required courses',
          courseOrder: Math.ceil(requiredCount / 2),
          isAchieved: path.progress >= 50,
          reward: '⭐ Dedicated Learner',
        },
        {
          id: 'm-3',
          title: 'Path Complete',
          description: 'Complete all required courses',
          courseOrder: path.courses.length,
          isAchieved: path.progress >= 100,
          reward: '🏆 Path Master',
        },
      ];
      return {
        pathId: path.id,
        pathTitle: path.title,
        overallProgress: path.progress,
        coursesCompleted: completedCourses.length,
        totalCourses: path.courses.length,
        currentCourse,
        timeSpent: Number(enrollment?.timeSpent ?? 0),
        streak: 0,
        badges: completedCourses.length >= 1 ? ['Quick Starter'] : [],
        milestones,
      };
    },
    [paths, enrollmentsByPath]
  );

  const handleSavePath = useCallback(
    async (data: {
      title: string;
      description: string;
      level: PathLevel;
      category: string;
      skills: string[];
      courses: unknown[];
    }) => {
      try {
        await LearningPathService.createLearningPath({
          pathCode: `LP-${Date.now()}`,
          title: data.title,
          description: data.description,
          level: data.level.toUpperCase(),
          categoryName: data.category,
          duration: 0,
          courses: data.courses,
          skills: data.skills,
          isActive: true,
        } as never);
        setShowBuilder(false);
        await loadData();
      } catch (err) {
        console.error('Error creating learning path:', err);
        setError('Failed to create learning path. Please try again.');
      }
    },
    [loadData]
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

      {error && (
        <div className="rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-4 py-2 text-[10px] font-bold text-coral-alert">
          {error}
        </div>
      )}

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
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <LearningPaths
          paths={activeTab === 'my_paths' ? enrolledPaths : paths}
          onSelectPath={handleSelectPath}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
}
