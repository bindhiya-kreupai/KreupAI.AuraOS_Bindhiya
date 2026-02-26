/**
 * @module LearningPathViewer
 * @description Learning path detail — vertical timeline of courses, progress bar,
 *              locked/available/completed node states, estimated completion, certificate info (Sec 21.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Clock,
  Users,
  ChevronLeft,
  CheckCircle,
  Lock,
  Play,
  BookOpen,
  Star,
  ArrowRight,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  LearningCatalogService,
  COURSE_LEVEL_META,
  COURSE_CATEGORY_META,
  type LearningPath,
  type Course,
} from '@/services/learningCatalogService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Path Progress Bar ─────────────────────────────────────────────────────────

function PathProgressBar({ progress, isEnrolled }: { progress: number; isEnrolled: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {isEnrolled ? 'Your Progress' : 'Avg. Completion Rate'}
        </span>
        <span className="text-sm font-bold text-indigo-600">{progress}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isEnrolled ? 'bg-indigo-500' : 'bg-gray-300'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ── Course Node (Timeline) ────────────────────────────────────────────────────

interface CourseNodeProps {
  pathCourse: {
    courseId: string;
    title: string;
    duration: number;
    isRequired: boolean;
    order: number;
  };
  courseData: Course | undefined;
  state: 'completed' | 'available' | 'locked';
  isLast: boolean;
  onSelect: (course: Course) => void;
}

function CourseNode({ pathCourse, courseData, state, isLast, onSelect }: CourseNodeProps) {
  const catMeta = courseData ? COURSE_CATEGORY_META[courseData.category] : null;
  const lvlMeta = courseData ? COURSE_LEVEL_META[courseData.level] : null;

  const nodeColors = {
    completed: {
      dot: 'bg-emerald-500 border-emerald-500',
      card: 'bg-white border-emerald-100 hover:border-emerald-200',
      icon: 'text-emerald-500',
    },
    available: {
      dot: 'bg-indigo-500 border-indigo-500',
      card: 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-md',
      icon: 'text-indigo-500',
    },
    locked: {
      dot: 'bg-gray-200 border-gray-200',
      card: 'bg-gray-50 border-gray-100 opacity-70',
      icon: 'text-gray-400',
    },
  };

  const colors = nodeColors[state];

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${colors.dot}`}
        >
          {state === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : state === 'locked' ? (
            <Lock className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          )}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-6" />}
      </div>

      {/* Course Card */}
      <div className="flex-1 pb-4">
        <button
          onClick={() => courseData && state !== 'locked' && onSelect(courseData)}
          disabled={state === 'locked'}
          className={`w-full text-left border-2 rounded-2xl p-4 transition-all ${colors.card} ${
            state !== 'locked' ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">{courseData?.thumbnailEmoji ?? '📚'}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p
                    className={`font-semibold text-sm leading-tight ${state === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}
                  >
                    {pathCourse.title}
                  </p>
                  {pathCourse.isRequired && (
                    <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                      Required
                    </span>
                  )}
                </div>
                {courseData && (
                  <p
                    className={`text-xs mt-0.5 ${state === 'locked' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {courseData.instructor}
                  </p>
                )}
              </div>
            </div>

            {state === 'available' && (
              <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            )}
            {state === 'completed' && (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            )}
          </div>

          {/* Course metadata */}
          {courseData && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {catMeta && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    state === 'locked'
                      ? 'bg-gray-100 text-gray-400'
                      : `${catMeta.bgColor} ${catMeta.color}`
                  }`}
                >
                  {catMeta.label}
                </span>
              )}
              {lvlMeta && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    state === 'locked'
                      ? 'bg-gray-100 text-gray-400'
                      : `${lvlMeta.bgColor} ${lvlMeta.color}`
                  }`}
                >
                  {lvlMeta.label}
                </span>
              )}
              <span
                className={`flex items-center gap-1 text-xs ${state === 'locked' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <Clock className="w-3 h-3" />
                {formatDuration(pathCourse.duration)}
              </span>
              {courseData.rating > 0 && state !== 'locked' && (
                <span className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {courseData.rating.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {/* Progress bar for in-progress courses */}
          {courseData &&
            courseData.enrollmentStatus === 'in_progress' &&
            courseData.progress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-indigo-600 font-medium">In Progress</span>
                  <span className="text-xs font-bold text-indigo-600">{courseData.progress}%</span>
                </div>
                <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${courseData.progress}%` }}
                  />
                </div>
              </div>
            )}
        </button>
      </div>
    </div>
  );
}

// ── Course Detail Panel ────────────────────────────────────────────────────────

function CourseDetailPanel({
  course,
  onClose,
  onEnroll,
}: {
  course: Course;
  onClose: () => void;
  onEnroll: (course: Course) => Promise<void>;
}) {
  const [enrolling, setEnrolling] = useState(false);
  const catMeta = COURSE_CATEGORY_META[course.category];
  const isEnrolled = ['enrolled', 'in_progress', 'completed'].includes(course.enrollmentStatus);

  const handleEnroll = async () => {
    setEnrolling(true);
    await onEnroll(course);
    setEnrolling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full sm:w-96 bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <p className="font-semibold text-gray-900 truncate">{course.title}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-5xl text-center py-4 bg-gray-50 rounded-2xl">
            {course.thumbnailEmoji}
          </div>

          <div>
            <h2 className="font-bold text-gray-900">{course.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {course.instructor} · {course.provider}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${catMeta.bgColor} ${catMeta.color}`}
            >
              {catMeta.label}
            </span>
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" /> {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {course.rating.toFixed(1)}
            </span>
            {course.certificateOnCompletion && (
              <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                <Award className="w-3 h-3" /> Certificate
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>

          {course.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            {course.enrollmentStatus === 'completed' ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-semibold">
                <CheckCircle className="w-5 h-5" /> Completed
              </div>
            ) : course.enrollmentStatus === 'in_progress' ? (
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-colors">
                <Play className="w-4 h-4 fill-white" /> Continue ({course.progress}%)
              </button>
            ) : isEnrolled ? (
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-colors">
                <Play className="w-4 h-4 fill-white" /> Start Course
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface LearningPathViewerProps {
  pathId: string;
  onBack?: () => void;
}

export function LearningPathViewer({ pathId, onBack }: LearningPathViewerProps) {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [paths, courses] = await Promise.all([
        LearningCatalogService.getLearningPaths(),
        LearningCatalogService.getCourses(),
      ]);
      const found = paths.find((p) => p.id === pathId) ?? paths[0];
      setPath(found);
      setAllCourses(courses);
      setLoading(false);
    };
    load();
  }, [pathId]);

  const handleEnrollCourse = async (course: Course) => {
    const updated = await LearningCatalogService.enrollCourse(course.id, 'emp-current');
    setAllCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCourse(updated);
  };

  const handleEnrollPath = async () => {
    if (!path) return;
    setEnrolling(true);
    // Enroll in all required courses
    for (const pc of path.courses.filter((c) => c.isRequired)) {
      const courseData = allCourses.find((c) => c.id === pc.courseId);
      if (courseData && courseData.enrollmentStatus === 'not_enrolled') {
        await LearningCatalogService.enrollCourse(pc.courseId, 'emp-current');
      }
    }
    setPath((prev) => (prev ? { ...prev, isEnrolled: true } : prev));
    setEnrolling(false);
  };

  if (loading || !path) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const lvlMeta = COURSE_LEVEL_META[path.level];

  // Determine course states
  const getCourseState = (
    courseId: string,
    order: number
  ): 'completed' | 'available' | 'locked' => {
    const courseData = allCourses.find((c) => c.id === courseId);
    if (!courseData) return 'locked';
    if (courseData.enrollmentStatus === 'completed') return 'completed';

    if (!path.isEnrolled) {
      // If not enrolled in path, only first course is "available"
      return order <= 1 ? 'available' : 'locked';
    }

    // If enrolled: first course always available, subsequent locked if prior required not done
    if (order <= 1) return 'available';
    const previousRequired = path.courses
      .filter((pc) => pc.order < order && pc.isRequired)
      .map((pc) => allCourses.find((c) => c.id === pc.courseId));
    const allPrevRequiredDone = previousRequired.every((c) => c?.enrollmentStatus === 'completed');
    return allPrevRequiredDone ? 'available' : 'locked';
  };

  const completedCount = path.courses.filter((pc) => {
    const courseData = allCourses.find((c) => c.id === pc.courseId);
    return courseData?.enrollmentStatus === 'completed';
  }).length;

  const myProgress = path.isEnrolled ? Math.round((completedCount / path.courses.length) * 100) : 0;

  // Estimated completion date (if enrolled)
  const remainingMinutes = path.courses.reduce((sum, pc) => {
    const courseData = allCourses.find((c) => c.id === pc.courseId);
    return courseData?.enrollmentStatus !== 'completed' ? sum + pc.duration : sum;
  }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-4 md:px-6 pt-6 pb-8">
        {/* Back */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-indigo-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Learning Paths
          </button>
        )}

        <div className="flex items-start gap-4">
          <span className="text-5xl">{path.thumbnailEmoji}</span>
          <div className="flex-1">
            <h1 className="text-xl font-bold leading-tight">{path.title}</h1>
            <p className="text-sm text-indigo-200 mt-1">{path.description}</p>
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            <BookOpen className="w-3 h-3" />
            {path.courses.length} courses
          </span>
          <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3 h-3" />
            {formatDuration(path.totalDuration)}
          </span>
          <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            <Calendar className="w-3 h-3" />~{path.estimatedWeeks} weeks
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-white/20`}>
            {lvlMeta.label}
          </span>
          <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            <Users className="w-3 h-3" />
            {path.enrollmentCount.toLocaleString()} enrolled
          </span>
        </div>

        {/* Progress or CTA */}
        <div className="mt-5">
          {path.isEnrolled ? (
            <PathProgressBar progress={myProgress} isEnrolled={true} />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-200">Avg. completion rate</p>
                <p className="text-lg font-bold">{path.completionRate}%</p>
              </div>
              <button
                onClick={handleEnrollPath}
                disabled={enrolling}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 disabled:opacity-60 transition-colors"
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Path'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 p-4 md:p-6 pb-0">
          <div className="bg-white rounded-2xl p-3 text-center">
            <Target className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Target Role</p>
            <p className="text-xs font-semibold text-gray-800 mt-0.5 leading-tight">
              {path.targetRole}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-xs font-semibold text-gray-800 mt-0.5">
              {formatDuration(remainingMinutes)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center">
            <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Certificate</p>
            <p className="text-xs font-semibold text-gray-800 mt-0.5 leading-tight">
              On Completion
            </p>
          </div>
        </div>

        {/* Skills */}
        {path.skills.length > 0 && (
          <div className="px-4 md:px-6 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Skills You&apos;ll Gain
            </p>
            <div className="flex flex-wrap gap-1.5">
              {path.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Course Timeline */}
        <div className="px-4 md:px-6 mt-6 pb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Course Timeline</h2>
          <div className="space-y-0">
            {path.courses
              .sort((a, b) => a.order - b.order)
              .map((pc, i) => {
                const courseData = allCourses.find((c) => c.id === pc.courseId);
                const state = getCourseState(pc.courseId, pc.order);
                return (
                  <CourseNode
                    key={pc.courseId}
                    pathCourse={pc}
                    courseData={courseData}
                    state={state}
                    isLast={i === path.courses.length - 1}
                    onSelect={setSelectedCourse}
                  />
                );
              })}
          </div>

          {/* Certificate Banner */}
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{path.certificateTitle}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete all required courses to earn this certificate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Detail Panel */}
      {selectedCourse && (
        <CourseDetailPanel
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnrollCourse}
        />
      )}
    </div>
  );
}

export default LearningPathViewer;
