/**
 * @module CourseCatalog
 * @description Course catalog — grid of course cards, filter sidebar (category/level/format/duration),
 *              search, sort options, enroll button, course detail modal (Sec 21.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Star,
  Clock,
  Users,
  Play,
  BookOpen,
  FileText,
  Video,
  ClipboardCheck,
  Code2,
  Crown,
  Shield,
  Smile,
  Package,
  BarChart3,
  Lock,
  DollarSign,
  X,
  ChevronDown,
  CheckCircle,
  Award,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  LearningCatalogService,
  COURSE_CATEGORY_META,
  COURSE_LEVEL_META,
  COURSE_FORMAT_META,
  type Course,
  type CourseCategory,
  type CourseLevel,
  type CourseFormat,
  type CourseFilters,
} from '@/services/learningCatalogService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const FORMAT_ICONS: Record<CourseFormat, React.ElementType> = {
  video: Play,
  scorm: BookOpen,
  document: FileText,
  workshop: Users,
  webinar: Video,
  assessment: ClipboardCheck,
};

const CATEGORY_ICONS: Record<CourseCategory, React.ElementType> = {
  technical: Code2,
  leadership: Crown,
  compliance: Shield,
  soft_skills: Smile,
  product: Package,
  sales: BarChart3,
  hr: Users,
  finance: DollarSign,
  data_analytics: BarChart3,
  security: Lock,
};

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ course, onClick }: { course: Course; onClick: (course: Course) => void }) {
  const catMeta = COURSE_CATEGORY_META[course.category];
  const lvlMeta = COURSE_LEVEL_META[course.level];
  const FormatIcon = FORMAT_ICONS[course.format];

  const enrollStatusColor =
    course.enrollmentStatus === 'completed'
      ? 'bg-emerald-50 text-emerald-600'
      : course.enrollmentStatus === 'in_progress'
        ? 'bg-indigo-50 text-indigo-600'
        : course.enrollmentStatus === 'enrolled'
          ? 'bg-blue-50 text-blue-600'
          : '';

  const enrollStatusLabel =
    course.enrollmentStatus === 'completed'
      ? 'Completed'
      : course.enrollmentStatus === 'in_progress'
        ? `${course.progress}% done`
        : course.enrollmentStatus === 'enrolled'
          ? 'Enrolled'
          : null;

  return (
    <button
      onClick={() => onClick(course)}
      className="bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all flex flex-col gap-3 group"
    >
      {/* Thumbnail / Emoji */}
      <div className="flex items-start justify-between">
        <span className="text-4xl">{course.thumbnailEmoji}</span>
        <div className="flex flex-col items-end gap-1">
          {enrollStatusLabel && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${enrollStatusColor}`}>
              {enrollStatusLabel}
            </span>
          )}
          {course.isFeatured && !enrollStatusLabel && (
            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Title + Instructor */}
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">{course.instructor}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${catMeta.bgColor} ${catMeta.color}`}
        >
          {catMeta.label}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${lvlMeta.bgColor} ${lvlMeta.color}`}
        >
          {lvlMeta.label}
        </span>
      </div>

      {/* Progress bar (if enrolled) */}
      {course.enrollmentStatus === 'in_progress' && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <StarRating rating={course.rating} count={course.ratingCount} />
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FormatIcon className="w-3 h-3" />
          <Clock className="w-3 h-3" />
          <span>{formatDuration(course.duration)}</span>
        </div>
      </div>
    </button>
  );
}

// ── Course Detail Modal ────────────────────────────────────────────────────────

function CourseDetailModal({
  course,
  onClose,
  onEnroll,
}: {
  course: Course;
  onClose: () => void;
  onEnroll: (course: Course) => void;
}) {
  const catMeta = COURSE_CATEGORY_META[course.category];
  const lvlMeta = COURSE_LEVEL_META[course.level];
  const FormatIcon = FORMAT_ICONS[course.format];
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    await onEnroll(course);
    setEnrolling(false);
  };

  const isEnrolled = ['enrolled', 'in_progress', 'completed'].includes(course.enrollmentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-gray-100 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{course.thumbnailEmoji}</span>
              <div>
                <p className="font-bold text-gray-900 leading-tight">{course.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {course.instructor} · {course.provider}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Badges + Stats */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${catMeta.bgColor} ${catMeta.color}`}
            >
              {catMeta.label}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${lvlMeta.bgColor} ${lvlMeta.color}`}
            >
              {lvlMeta.label}
            </span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
              <FormatIcon className="w-3 h-3" />
              {COURSE_FORMAT_META[course.format].label}
            </span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(course.duration)}
            </span>
          </div>

          {/* Rating & Enrollment */}
          <div className="flex items-center gap-4">
            <StarRating rating={course.rating} count={course.ratingCount} />
            <span className="text-xs text-gray-400">
              {course.enrollmentCount.toLocaleString()} enrolled
            </span>
            {course.certificateOnCompletion && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <Award className="w-3 h-3" /> Certificate
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>

          {/* Skills */}
          {course.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Skills You&apos;ll Gain
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Prerequisites
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.prerequisites.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Modules */}
          {course.modules.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Course Modules ({course.modules.length})
              </p>
              <div className="space-y-1.5">
                {course.modules.map((mod) => {
                  const ModIcon = FORMAT_ICONS[mod.type] ?? Play;
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.isCompleted ? 'bg-emerald-100' : 'bg-gray-100'}`}
                      >
                        {mod.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ModIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${mod.isCompleted ? 'text-emerald-700' : 'text-gray-700'}`}
                        >
                          {mod.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{mod.duration}m</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          {course.reviews.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Reviews
              </p>
              <div className="space-y-2">
                {course.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{review.reviewerName}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-xs text-gray-500">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enroll CTA */}
          <div className="pt-2">
            {course.enrollmentStatus === 'completed' ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-semibold">
                <CheckCircle className="w-5 h-5" />
                Course Completed
              </div>
            ) : course.enrollmentStatus === 'in_progress' ? (
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-colors">
                <Play className="w-4 h-4 fill-white" />
                Continue Course ({course.progress}%)
              </button>
            ) : isEnrolled ? (
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-2xl font-semibold hover:bg-blue-100 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Start Learning
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {enrolling
                  ? 'Enrolling...'
                  : course.requiresApproval
                    ? 'Request Approval'
                    : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface CourseCatalogProps {
  onCourseEnrolled?: (courseId: string) => void;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'duration_asc', label: 'Shortest First' },
  { value: 'duration_desc', label: 'Longest First' },
];

const DURATION_OPTIONS = [
  { label: 'Any', min: 0, max: Infinity },
  { label: 'Under 1h', min: 0, max: 60 },
  { label: '1–3h', min: 60, max: 180 },
  { label: '3–8h', min: 180, max: 480 },
  { label: '8h+', min: 480, max: Infinity },
];

export function CourseCatalog({ onCourseEnrolled }: CourseCatalogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | ''>('');
  const [selectedFormat, setSelectedFormat] = useState<CourseFormat | ''>('');
  const [selectedDuration, setSelectedDuration] = useState(0); // index into DURATION_OPTIONS
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load courses
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const dur = DURATION_OPTIONS[selectedDuration];
      const filters: CourseFilters = {
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        format: selectedFormat || undefined,
        minDuration: dur.min > 0 ? dur.min : undefined,
        maxDuration: dur.max < Infinity ? dur.max : undefined,
        search: search || undefined,
      };
      const data = await LearningCatalogService.getCourses(filters);

      // Sort
      const sorted = [...data].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return b.publishedDate.localeCompare(a.publishedDate);
          case 'duration_asc':
            return a.duration - b.duration;
          case 'duration_desc':
            return b.duration - a.duration;
          default:
            return b.enrollmentCount - a.enrollmentCount; // popular
        }
      });

      setCourses(sorted);
      setLoading(false);
    };

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, selectedCategory, selectedLevel, selectedFormat, selectedDuration, sortBy]);

  const handleEnroll = async (course: Course) => {
    const updated = await LearningCatalogService.enrollCourse(course.id, 'emp-current');
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCourse?.id === updated.id) setSelectedCourse(updated);
    onCourseEnrolled?.(course.id);
  };

  const activeFilterCount = [
    selectedCategory,
    selectedLevel,
    selectedFormat,
    selectedDuration > 0,
  ].filter(Boolean).length;

  const categories = Object.entries(COURSE_CATEGORY_META) as [
    CourseCategory,
    (typeof COURSE_CATEGORY_META)[CourseCategory],
  ][];
  const levels = Object.entries(COURSE_LEVEL_META) as [
    CourseLevel,
    (typeof COURSE_LEVEL_META)[CourseLevel],
  ][];
  const formats = Object.entries(COURSE_FORMAT_META) as [
    CourseFormat,
    (typeof COURSE_FORMAT_META)[CourseFormat],
  ][];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
            <p className="text-sm text-gray-500 mt-0.5">{courses.length} courses available</p>
          </div>
        </div>

        {/* Search + Filter toggle + Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, skills, instructors..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilterCount > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 ? `${activeFilterCount}` : 'Filter'}
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                {categories.map(([cat, meta]) => {
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        selectedCategory === cat
                          ? `${meta.bgColor} ${meta.color} ring-2 ring-current ring-offset-1`
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level + Format row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Level
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { value: '', label: 'Any Level' },
                    ...levels.map(([lv, m]) => ({ value: lv, label: m.label })),
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedLevel(opt.value as CourseLevel | '')}
                      className={`text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        selectedLevel === opt.value
                          ? 'bg-indigo-100 text-indigo-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Format
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { value: '', label: 'Any Format' },
                    ...formats.map(([f, m]) => ({ value: f, label: m.label })),
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedFormat(opt.value as CourseFormat | '')}
                      className={`text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        selectedFormat === opt.value
                          ? 'bg-indigo-100 text-indigo-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Duration
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedDuration(i)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      selectedDuration === i
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLevel('');
                  setSelectedFormat('');
                  setSelectedDuration(0);
                }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Course Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="w-12 h-12 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-500">No courses found</p>
            <p className="text-sm text-gray-400 mt-1">Try different filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={setSelectedCourse} />
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
}

export default CourseCatalog;
