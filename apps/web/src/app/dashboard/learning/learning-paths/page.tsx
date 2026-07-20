'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Map, Loader2 } from 'lucide-react';
import { LearningPathService, EnrollmentService } from '../services';
import { LearningPaths } from '@/components/learning/LearningPaths';
import type { LearningPathData, PathLevel } from '@/services/learningService';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const LEVEL_MAP: Record<string, PathLevel> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

// Adapt the API LearningPath shape to the rich LearningPaths component contract.
function toPathData(raw: any): LearningPathData {
  const difficulty = String(raw.difficulty || raw.level || 'BEGINNER').toUpperCase();
  return {
    id: raw.id ?? '',
    title: raw.title ?? 'Untitled Path',
    description: raw.description ?? '',
    level: LEVEL_MAP[difficulty] ?? 'beginner',
    category: raw.category ?? 'General',
    totalDuration: raw.duration ?? raw.totalDuration ?? 0,
    courses: Array.isArray(raw.courses) ? raw.courses : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    enrollmentCount: raw.enrolledCount ?? raw.enrollmentCount ?? 0,
    completionRate: raw.completionRate ?? 0,
    rating: raw.rating ?? 0,
    ratingCount: raw.ratingCount ?? 0,
    thumbnailEmoji: raw.thumbnailEmoji ?? '🎯',
    status: raw.isPublished ? 'published' : 'draft',
    isEnrolled: Boolean(raw.isEnrolled),
    enrollmentStatus: raw.enrollmentStatus ?? 'not_enrolled',
    progress: raw.progress ?? 0,
    createdBy: raw.createdBy ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  } as LearningPathData;
}

export default function LearningPathsPage() {
  const { user } = useCurrentUser();
  const toast = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await LearningPathService.getLearningPaths();
      setData(result);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load learning paths. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paths = useMemo(() => data.map(toPathData), [data]);

  const handleEnroll = useCallback(
    async (pathId: string) => {
      if (!user?.employeeId) {
        toast.error('You must be signed in to enroll.');
        return;
      }
      try {
        await EnrollmentService.createEnrollment({
          learningPathId: pathId,
          learnerId: user.employeeId,
        } as never);
        toast.success('Enrolled in learning path.');
        await loadData();
      } catch (error: any) {
        console.error('Error enrolling in path:', error);
        toast.error('Failed to enroll. Please try again.');
      }
    },
    [user?.employeeId, toast, loadData]
  );

  const handleSelectPath = useCallback((pathId: string) => {
    // Reserved for a future path detail view; no-op selection for now.
    void pathId;
  }, []);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            Learning Paths
          </h1>
          <p className="text-slate-500 text-sm">
            Structured curriculums to master specific skills.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : paths.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Map className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No learning paths available</p>
          <p className="text-sm">Learning paths will appear here once created.</p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          <LearningPaths paths={paths} onSelectPath={handleSelectPath} onEnroll={handleEnroll} />
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
