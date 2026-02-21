"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Layers,
  Users,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";

interface PathEnrollmentData {
  id: string;
  title: string;
  description: string;
  modulesCount: number;
  estimatedDuration: string;
  difficulty: string;
  category: string;
  enrolledCount: number;
  enrollmentStatus: "not-enrolled" | "enrolled" | "in-progress" | "completed";
  progress?: number;
  skills: string[];
}

const difficultyColors: Record<string, string> = {
  beginner: "text-aurora-green bg-aurora-green/10",
  intermediate: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  advanced: "text-red-500 bg-red-50 dark:bg-red-900/20",
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  "not-enrolled": { label: "Not Enrolled", color: "text-silver-mist", bgColor: "bg-slate-100 dark:bg-deep-cosmos" },
  enrolled: { label: "Enrolled", color: "text-celestial-indigo", bgColor: "bg-celestial-indigo/10" },
  "in-progress": { label: "In Progress", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  completed: { label: "Completed", color: "text-aurora-green", bgColor: "bg-aurora-green/10" },
};

export function PathEnrollment() {
  const [enrollments, setEnrollments] = useState<PathEnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/learning/paths')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const mapped: PathEnrollmentData[] = result.data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            description: p.description as string,
            modulesCount: (p.modulesCount as number) || 0,
            estimatedDuration: (p.duration as string) || 'N/A',
            difficulty: ((p.level || p.difficulty || 'beginner') as string).toLowerCase(),
            category: (p.category as string) || 'General',
            enrolledCount: (p.enrolledCount as number) || 0,
            enrollmentStatus: "not-enrolled" as const,
            progress: 0,
            skills: (p.skills as string[]) || [],
          }));
          setEnrollments(mapped);
        } else {
          setError('Failed to load enrollment data');
        }
      })
      .catch((err) => {
        console.error('PathEnrollment fetch error:', err);
        setError('Failed to load enrollment data');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = (id: string) => {
    setEnrollingId(id);
    fetch(`/api/v1/learning/paths/${id}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoursPerWeek: 5 }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setEnrollments((prev) =>
            prev.map((path) =>
              path.id === id ? { ...path, enrollmentStatus: "enrolled" as const, progress: 0 } : path
            )
          );
        }
      })
      .catch(console.error)
      .finally(() => setEnrollingId(null));
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-56 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72 mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Learning Path Enrollment
          </h1>
          <p className="text-silver-mist mt-1">
            Browse and enroll in structured learning paths to build your skills
          </p>
        </div>

        {/* Enrollment Cards */}
        <div className="space-y-4">
          {enrollments.map((path) => {
            const status = statusConfig[path.enrollmentStatus];
            const isEnrolling = enrollingId === path.id;
            const diffColor = difficultyColors[path.difficulty] || difficultyColors.beginner;

            return (
              <div
                key={path.id}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-celestial-indigo" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
                          {path.title}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor}`}>
                          {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="text-sm text-silver-mist mt-1.5 line-clamp-2">
                        {path.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-silver-mist">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {path.modulesCount} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {path.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {path.enrolledCount} enrolled
                        </span>
                      </div>

                      {/* Progress bar for in-progress/enrolled */}
                      {(path.enrollmentStatus === "in-progress" || path.enrollmentStatus === "enrolled") && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-silver-mist">Progress</span>
                            <span className="text-xs font-medium text-ink-black dark:text-pearl">
                              {path.progress || 0}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
                            <div
                              className="h-full rounded-full bg-celestial-indigo transition-all"
                              style={{ width: `${path.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 self-center">
                      {path.enrollmentStatus === "not-enrolled" && (
                        <button
                          onClick={() => handleEnroll(path.id)}
                          disabled={isEnrolling}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 disabled:opacity-70 transition-colors"
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              Enroll Now
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                      {path.enrollmentStatus === "enrolled" && (
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-celestial-indigo text-celestial-indigo font-medium hover:bg-celestial-indigo/5 transition-colors">
                          Start Learning
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      {path.enrollmentStatus === "in-progress" && (
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors">
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      {path.enrollmentStatus === "completed" && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-aurora-green/10 text-aurora-green">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium text-sm">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {enrollments.length === 0 && (
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center text-sm text-silver-mist">
              No learning paths available for enrollment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
