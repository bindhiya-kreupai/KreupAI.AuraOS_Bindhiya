/**
 * @module PathEnrollment
 * @description Learning path enrollment view — path details, course list,
 *              skill tags, reviews, and enroll/unenroll actions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  Users,
  BookOpen,
  CheckCircle2,
  Lock,
  Video,
  FileText,
  HelpCircle,
  Wrench,
  Zap,
  TrendingUp,
  Target,
  Calendar,
  LogOut,
} from 'lucide-react';
import type {
  LearningPathData,
  PathLevel,
  CourseType,
  CourseStatus,
} from '@/services/learningService';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface PathEnrollmentProps {
  path: LearningPathData;
  onEnroll: (pathId: string) => void;
  onUnenroll: (pathId: string) => void;
  onBack: () => void;
  onViewProgress: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<PathLevel, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  intermediate: {
    label: 'Intermediate',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  advanced: { label: 'Advanced', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  expert: { label: 'Expert', color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
};

const COURSE_TYPE_ICON: Record<CourseType, LucideIcon> = {
  video: Video,
  article: FileText,
  quiz: HelpCircle,
  project: Wrench,
  workshop: Users,
  interactive: Zap,
};

const STATUS_ICON: Record<CourseStatus, { icon: LucideIcon; color: string }> = {
  completed: { icon: CheckCircle2, color: 'text-neural-mint' },
  in_progress: { icon: Play, color: 'text-celestial-indigo' },
  available: { icon: TrendingUp, color: 'text-sunset-amber' },
  locked: { icon: Lock, color: 'text-silver-mist' },
};

// ── Component ────────────────────────────────────────────────────────────────────

export const PathEnrollment: React.FC<PathEnrollmentProps> = ({
  path,
  onEnroll,
  onUnenroll,
  onBack,
  onViewProgress,
}) => {
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);

  const levelCfg = LEVEL_CONFIG[path.level];
  const completedCourses = path.courses.filter((c) => c.status === 'completed').length;
  const requiredCourses = path.courses.filter((c) => c.isRequired).length;
  const totalDuration = path.courses.reduce((s, c) => s + c.duration, 0);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[9px] text-silver-mist hover:text-celestial-indigo transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back to catalog
      </button>

      {/* Path Hero */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-celestial-indigo/10 flex items-center justify-center text-2xl shrink-0">
              {path.thumbnailEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-ink-black dark:text-pearl">{path.title}</p>
                <span
                  className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${levelCfg.color} ${levelCfg.bg}`}
                >
                  {levelCfg.label}
                </span>
              </div>
              <p className="text-[9px] text-silver-mist mt-1 leading-relaxed">{path.description}</p>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[8px] text-silver-mist flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {totalDuration}h total
                </span>
                <span className="text-[8px] text-silver-mist flex items-center gap-0.5">
                  <BookOpen className="w-3 h-3" /> {path.courses.length} courses ({requiredCourses}{' '}
                  required)
                </span>
                <span className="text-[8px] text-silver-mist flex items-center gap-0.5">
                  <Users className="w-3 h-3" /> {path.enrollmentCount} enrolled
                </span>
                <span className="text-[8px] text-sunset-amber flex items-center gap-0.5 font-bold">
                  <Star className="w-3 h-3 fill-current" /> {path.rating} ({path.ratingCount}{' '}
                  reviews)
                </span>
                <span className="text-[8px] text-silver-mist flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {path.completionRate}% completion rate
                </span>
              </div>

              {/* Skills */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {path.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enroll / Progress Actions */}
        <div className="px-4 py-3 border-t border-cloud/50 dark:border-nebula-purple/10 bg-pearl/20 dark:bg-deep-cosmos/10">
          {!path.isEnrolled ? (
            <button
              onClick={() => onEnroll(path.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" /> Enroll in This Path
            </button>
          ) : (
            <div className="space-y-2">
              {/* Progress */}
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-silver-mist">
                  {completedCourses}/{path.courses.length} courses completed
                </span>
                <span className="font-bold text-celestial-indigo">{path.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
                <div
                  className={`h-full rounded-full transition-all ${path.progress >= 100 ? 'bg-neural-mint' : 'bg-celestial-indigo'}`}
                  style={{ width: `${path.progress}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onViewProgress}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                >
                  <Target className="w-3.5 h-3.5" /> View Progress
                </button>
                {!showUnenrollConfirm ? (
                  <button
                    onClick={() => setShowUnenrollConfirm(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold border border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-coral-alert hover:border-coral-alert/30 transition-colors"
                  >
                    <LogOut className="w-3 h-3" /> Leave
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onUnenroll(path.id);
                        setShowUnenrollConfirm(false);
                      }}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-coral-alert text-white hover:opacity-90 transition-opacity"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowUnenrollConfirm(false)}
                      className="px-3 py-2 rounded-xl text-[10px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {path.startedDate && (
                <p className="text-[7px] text-silver-mist flex items-center gap-0.5">
                  <Calendar className="w-2 h-2" />
                  Started{' '}
                  {new Date(path.startedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {path.estimatedCompletion && (
                    <>
                      {' '}
                      • Est. completion:{' '}
                      {new Date(path.estimatedCompletion).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course List */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
          <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
            Courses in this path
          </p>
        </div>
        {path.courses.map((course, idx) => {
          const TypeIcon = COURSE_TYPE_ICON[course.type] || BookOpen;
          const stCfg = STATUS_ICON[course.status];
          const StIcon = stCfg.icon;
          return (
            <div
              key={course.id}
              className={`flex items-center gap-3 px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0 ${
                course.status === 'in_progress'
                  ? 'bg-celestial-indigo/5'
                  : course.status === 'locked'
                    ? 'opacity-60'
                    : ''
              }`}
            >
              <span className="text-[9px] font-bold text-silver-mist w-5">{idx + 1}</span>
              <StIcon className={`w-4 h-4 ${stCfg.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <TypeIcon className="w-3 h-3 text-silver-mist" />
                  <p
                    className={`text-[9px] font-bold truncate ${course.status === 'locked' ? 'text-silver-mist' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {course.title}
                  </p>
                  {!course.isRequired && (
                    <span className="px-1 py-0.5 rounded text-[6px] font-bold bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist shrink-0">
                      OPT
                    </span>
                  )}
                </div>
                <p className="text-[7px] text-silver-mist mt-0.5">{course.description}</p>
              </div>
              <span className="text-[7px] text-silver-mist shrink-0">{course.duration}h</span>
              {course.status === 'in_progress' && (
                <span className="text-[8px] font-bold text-celestial-indigo shrink-0">
                  {course.progress}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Path Info */}
      <div className="flex items-center gap-2 text-[7px] text-silver-mist">
        <span>Created by {path.createdBy}</span>
        <span>•</span>
        <span>
          Updated{' '}
          {new Date(path.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
};

export default PathEnrollment;
