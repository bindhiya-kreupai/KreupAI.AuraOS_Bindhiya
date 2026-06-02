"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Clock, ChevronRight, Zap, Brain, Loader2 } from 'lucide-react';
import { LearningAnalyticsService } from '../services';
import { CourseService } from '../services';

export default function AIRecommendationsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesResult, analyticsResult] = await Promise.all([
          CourseService.getCourses(),
          LearningAnalyticsService.getAnalytics(),
        ]);
        setCourses(coursesResult);
        setAnalytics(analyticsResult);
      } catch (error: any) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">AI Recommendations</h1>
          <p className="text-sm text-silver-mist mt-1">Personalized learning suggestions based on your goals and skills</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI-Powered</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-celestial-indigo/10 dark:from-purple-500/20 dark:to-celestial-indigo/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">Your Learning Profile</p>
            <p className="text-xs text-silver-mist mt-1">
              Based on {analytics?.totalEnrollments || 0} enrollments and {analytics?.completedEnrollments || 0} completions,
              we recommend focusing on courses that match your skill development goals.
              Your average score is <span className="font-medium text-purple-600 dark:text-purple-400">{analytics?.averageScore || 0}%</span>.
            </p>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <Sparkles className="w-10 h-10 mb-2 opacity-30" />
          <p className="font-bold">No recommendations available</p>
          <p className="text-sm">Enroll in courses to get personalized recommendations.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Recommended for You</h3>
          </div>
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {courses.map((course) => (
              <div key={course.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-celestial-indigo/10 flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-celestial-indigo" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">{course.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-silver-mist font-medium">{course.level}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                      <span>{course.category || course.type}</span>
                      {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}m</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Zap className="w-3 h-3 text-purple-500" />
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 italic">
                        {course.skills?.length > 0 ? `Skills: ${course.skills.join(', ')}` : 'Recommended based on your profile'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.rating && (
                      <span className="text-xs font-bold text-emerald-600">{course.rating}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

