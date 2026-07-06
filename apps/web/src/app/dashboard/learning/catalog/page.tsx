'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, PlayCircle, Star, Clock, Search, Filter, Award, Loader2 } from 'lucide-react';
import { CourseService, EnrollmentService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface CatalogCourse {
  id?: string;
  title?: string;
  instructor?: string;
  author?: string;
  duration?: number | string;
  category?: string;
  type?: string;
  level?: string;
  completionRate?: number;
  thumbnailUrl?: string;
}

const CATEGORY_TONES: Record<string, string> = {
  Technical: 'bg-cyan-500',
  'Soft Skills': 'bg-indigo-500',
  Compliance: 'bg-rose-500',
  Process: 'bg-amber-500',
  Sales: 'bg-orange-500',
};

export default function CourseCatalogPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const toast = useToast();
  const [data, setData] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const loadCourses = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await CourseService.getCourses({ status: 'published' });
      setData(result);
    } catch (err) {
      console.error('Error loading courses:', err);
      toast.error('Failed to load courses. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((c) => {
      const cat = c.category || c.type;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [data]);

  const displayData = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((c) => {
      const matchesSearch =
        !term ||
        (c.title || '').toLowerCase().includes(term) ||
        (c.instructor || c.author || '').toLowerCase().includes(term) ||
        (c.category || c.type || '').toLowerCase().includes(term);
      const cat = c.category || c.type;
      const matchesCategory = categoryFilter === 'all' || cat === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [data, search, categoryFilter]);

  const handleEnroll = async (course: CatalogCourse) => {
    if (!course.id) {
      toast.error('This course cannot be enrolled yet.');
      return;
    }
    if (!user?.employeeId) {
      toast.error('You must be signed in to enroll.');
      return;
    }
    try {
      setEnrollingId(course.id);
      await EnrollmentService.createEnrollment({
        courseId: course.id,
        learnerId: user.employeeId,
      } as never);
      toast.success(`Enrolled in "${course.title}".`);
    } catch (err) {
      console.error('Error enrolling:', err);
      toast.error('Failed to enroll. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            Learning &amp; Development
          </h1>
          <p className="text-slate-500 text-sm">
            Browse courses, enroll in training, and upskill yourself.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 shrink-0">
        <div className="flex-1 bg-white dark:bg-slate-900 p-2 pl-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Python, Leadership, Safety..."
            className="bg-transparent outline-none flex-1 text-sm font-bold"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm ${
            showFilters
              ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              categoryFilter === 'all'
                ? 'bg-sky-500 text-white border-sky-500'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                categoryFilter === cat
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="overflow-y-auto pb-20">
        {loading || authLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <BookOpen className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-bold">No courses found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-4">Available Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayData.map((c, i) => {
                const cat = c.category || c.type || 'General';
                const tone = CATEGORY_TONES[cat] || 'bg-slate-500';
                return (
                  <div
                    key={c.id || i}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className={`h-32 ${tone} relative`}>
                      <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        {cat}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">
                        {c.instructor || c.author || 'AuraOS Academy'}
                      </p>

                      <div className="mt-auto flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.duration ? `${c.duration}h` : '—'}
                        </div>
                        {c.completionRate != null && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" /> {Math.round(c.completionRate)}
                            %
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEnroll(c)}
                        disabled={enrollingId === c.id}
                        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        {enrollingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Award className="w-4 h-4" />
                        )}
                        Enroll
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
