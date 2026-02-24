/**
 * @module PathProgress
 * @description Learning path progress tracker — course timeline,
 *              milestones, streaks, current course detail, and completion status
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Lock,
  Play,
  Circle,
  Clock,
  Award,
  Flame,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Wrench,
  Users,
  Zap,
  Trophy,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import type {
  LearningPathData,
  CourseStatus,
  CourseType,
  PathProgressData,
} from '@/services/learningService';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface PathProgressProps {
  path: LearningPathData;
  progressData: PathProgressData;
  onStartCourse: (courseId: string) => void;
  onCompleteCourse: (courseId: string) => void;
  onBack: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const COURSE_TYPE_ICON: Record<CourseType, LucideIcon> = {
  video: Video,
  article: FileText,
  quiz: HelpCircle,
  project: Wrench,
  workshop: Users,
  interactive: Zap,
};

const STATUS_CONFIG: Record<
  CourseStatus,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  completed: {
    label: 'Completed',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
    icon: Play,
  },
  available: {
    label: 'Available',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    icon: Circle,
  },
  locked: { label: 'Locked', color: 'text-silver-mist', bg: 'bg-silver-mist/10', icon: Lock },
};

// ── Component ────────────────────────────────────────────────────────────────────

export const PathProgress: React.FC<PathProgressProps> = ({
  path,
  progressData,
  onStartCourse,
  onCompleteCourse,
  onBack,
}) => {
  const completedCourses = path.courses.filter((c) => c.status === 'completed');
  const requiredCourses = path.courses.filter((c) => c.isRequired);
  const requiredCompleted = requiredCourses.filter((c) => c.status === 'completed');

  const timeSpentHours = Math.round(progressData.timeSpent / 60);
  const remainingHours = path.totalDuration - timeSpentHours;

  return (
    <div className="space-y-3">
      {/* Back + Path Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-silver-mist" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-celestial-indigo/10 flex items-center justify-center text-lg">
          {path.thumbnailEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-ink-black dark:text-pearl truncate">
            {path.title}
          </p>
          <p className="text-[8px] text-silver-mist">
            {path.category} • {path.courses.length} courses • {path.totalDuration}h total
          </p>
        </div>
        <div className="text-center">
          <p
            className={`text-[18px] font-black ${path.progress >= 100 ? 'text-neural-mint' : 'text-celestial-indigo'}`}
          >
            {path.progress}%
          </p>
          <p className="text-[7px] text-silver-mist font-bold">PROGRESS</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        <div className="flex items-center justify-between text-[8px] mb-1.5">
          <span className="text-silver-mist">
            {completedCourses.length} of {path.courses.length} courses completed
          </span>
          <span className="font-bold text-celestial-indigo">
            {requiredCompleted.length}/{requiredCourses.length} required
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
          <div
            className={`h-full rounded-full transition-all ${path.progress >= 100 ? 'bg-neural-mint' : 'bg-celestial-indigo'}`}
            style={{ width: `${path.progress}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-celestial-indigo" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">{timeSpentHours}h</p>
          <p className="text-[7px] text-silver-mist font-bold">Time Spent</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <BarChart3 className="w-3.5 h-3.5 mx-auto mb-1 text-sunset-amber" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">
            {remainingHours > 0 ? `${remainingHours}h` : '0h'}
          </p>
          <p className="text-[7px] text-silver-mist font-bold">Remaining</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Flame className="w-3.5 h-3.5 mx-auto mb-1 text-coral-alert" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">
            {progressData.streak}
          </p>
          <p className="text-[7px] text-silver-mist font-bold">Day Streak</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Award className="w-3.5 h-3.5 mx-auto mb-1 text-neural-mint" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">
            {progressData.badges.length}
          </p>
          <p className="text-[7px] text-silver-mist font-bold">Badges</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        <p className="text-[10px] font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-sunset-amber" /> Milestones
        </p>
        <div className="flex items-center gap-2">
          {progressData.milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  milestone.isAchieved
                    ? 'bg-neural-mint/10 border-2 border-neural-mint'
                    : 'bg-cloud/50 dark:bg-nebula-purple/10 border-2 border-cloud dark:border-nebula-purple/20'
                }`}
              >
                {milestone.isAchieved ? (
                  <CheckCircle2 className="w-4 h-4 text-neural-mint" />
                ) : (
                  <span className="text-[8px] font-bold text-silver-mist">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[8px] font-bold truncate ${milestone.isAchieved ? 'text-neural-mint' : 'text-ink-black dark:text-pearl'}`}
                >
                  {milestone.title}
                </p>
                {milestone.reward && (
                  <p className="text-[7px] text-silver-mist">{milestone.reward}</p>
                )}
              </div>
              {idx < progressData.milestones.length - 1 && (
                <div
                  className={`h-0.5 w-6 rounded shrink-0 ${milestone.isAchieved ? 'bg-neural-mint' : 'bg-cloud dark:bg-nebula-purple/20'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Course Timeline */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
          <p className="text-[10px] font-bold text-ink-black dark:text-pearl">Course Path</p>
        </div>

        {path.courses.map((course, idx) => {
          const stCfg = STATUS_CONFIG[course.status];
          const StIcon = stCfg.icon;
          const TypeIcon = COURSE_TYPE_ICON[course.type] || BookOpen;
          const isLast = idx === path.courses.length - 1;

          return (
            <div key={course.id} className="relative">
              {/* Timeline connector */}
              {!isLast && (
                <div
                  className={`absolute left-[26px] top-[40px] w-0.5 h-[calc(100%-24px)] ${
                    course.status === 'completed'
                      ? 'bg-neural-mint'
                      : 'bg-cloud dark:bg-nebula-purple/20'
                  }`}
                />
              )}

              <div
                className={`flex items-start gap-3 px-3 py-2.5 ${
                  course.status === 'in_progress' ? 'bg-celestial-indigo/5' : ''
                }`}
              >
                {/* Status Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${stCfg.bg} border-2 ${
                    course.status === 'completed'
                      ? 'border-neural-mint'
                      : course.status === 'in_progress'
                        ? 'border-celestial-indigo'
                        : course.status === 'available'
                          ? 'border-sunset-amber'
                          : 'border-cloud dark:border-nebula-purple/20'
                  }`}
                >
                  <StIcon className={`w-3.5 h-3.5 ${stCfg.color}`} />
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <TypeIcon className="w-3 h-3 text-silver-mist" />
                    <p
                      className={`text-[10px] font-bold truncate ${
                        course.status === 'locked'
                          ? 'text-silver-mist'
                          : 'text-ink-black dark:text-pearl'
                      }`}
                    >
                      {course.title}
                    </p>
                    {!course.isRequired && (
                      <span className="px-1 py-0.5 rounded text-[6px] font-bold bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist shrink-0">
                        OPT
                      </span>
                    )}
                  </div>
                  <p className="text-[8px] text-silver-mist mt-0.5">{course.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[7px]">
                    <span className="text-silver-mist flex items-center gap-0.5">
                      <Clock className="w-2 h-2" /> {course.duration}h
                    </span>
                    {course.provider && <span className="text-silver-mist">{course.provider}</span>}
                    {course.instructor && (
                      <span className="text-silver-mist">by {course.instructor}</span>
                    )}
                    <span className={`font-bold ${stCfg.color}`}>{stCfg.label}</span>
                  </div>

                  {/* Progress bar for in-progress */}
                  {course.status === 'in_progress' && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-[7px] mb-0.5">
                        <span className="text-silver-mist">Progress</span>
                        <span className="font-bold text-celestial-indigo">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
                        <div
                          className="h-full rounded-full bg-celestial-indigo"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {course.completedDate && (
                    <p className="text-[7px] text-neural-mint mt-0.5">
                      Completed{' '}
                      {new Date(course.completedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {course.status === 'available' && (
                    <button
                      onClick={() => onStartCourse(course.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                    >
                      <Play className="w-3 h-3" /> Start
                    </button>
                  )}
                  {course.status === 'in_progress' && (
                    <button
                      onClick={() => onCompleteCourse(course.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-bold bg-neural-mint text-white hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                  )}
                  {course.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-neural-mint" />
                  )}
                  {course.status === 'locked' && <Lock className="w-4 h-4 text-silver-mist/40" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PathProgress;
