"use client";

import React, { useState } from "react";
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
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  enrolledCount: number;
  startDate: string;
  endDate: string;
  instructors: string[];
  enrollmentStatus: "not-enrolled" | "enrolled" | "in-progress" | "completed";
  progress?: number;
  certificateAvailable: boolean;
}

const mockEnrollments: PathEnrollmentData[] = [
  {
    id: "pe-001",
    title: "Leadership Fundamentals",
    description: "Build essential leadership skills including communication, delegation, and team management for new and aspiring managers.",
    modulesCount: 8,
    estimatedDuration: "12 hours",
    difficulty: "Beginner",
    category: "Leadership",
    enrolledCount: 342,
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    instructors: ["Dr. James Wilson", "Maria Santos"],
    enrollmentStatus: "not-enrolled",
    certificateAvailable: true,
  },
  {
    id: "pe-002",
    title: "Advanced Data Analytics",
    description: "Master data visualization, statistical analysis, and predictive modeling techniques using modern tools and frameworks.",
    modulesCount: 14,
    estimatedDuration: "24 hours",
    difficulty: "Advanced",
    category: "Technical",
    enrolledCount: 189,
    startDate: "2025-01-15",
    endDate: "2025-05-15",
    instructors: ["Prof. Alan Park"],
    enrollmentStatus: "in-progress",
    progress: 45,
    certificateAvailable: true,
  },
  {
    id: "pe-003",
    title: "Effective Communication",
    description: "Enhance your verbal and written communication skills for professional settings, presentations, and stakeholder management.",
    modulesCount: 6,
    estimatedDuration: "8 hours",
    difficulty: "Beginner",
    category: "Soft Skills",
    enrolledCount: 723,
    startDate: "2025-01-10",
    endDate: "2025-03-10",
    instructors: ["Lisa Chang", "Robert Kim"],
    enrollmentStatus: "completed",
    progress: 100,
    certificateAvailable: true,
  },
  {
    id: "pe-004",
    title: "Project Management Professional",
    description: "Comprehensive preparation for PMP certification covering all knowledge areas and process groups.",
    modulesCount: 20,
    estimatedDuration: "36 hours",
    difficulty: "Intermediate",
    category: "Management",
    enrolledCount: 567,
    startDate: "2025-03-01",
    endDate: "2025-07-31",
    instructors: ["Michael Torres"],
    enrollmentStatus: "enrolled",
    progress: 0,
    certificateAvailable: true,
  },
  {
    id: "pe-005",
    title: "Cloud Architecture Mastery",
    description: "Design and implement scalable cloud solutions using AWS, Azure, and GCP with best practices for security and cost optimization.",
    modulesCount: 18,
    estimatedDuration: "40 hours",
    difficulty: "Advanced",
    category: "Technical",
    enrolledCount: 156,
    startDate: "2025-04-01",
    endDate: "2025-08-30",
    instructors: ["Dr. Sarah Chen", "David Nguyen"],
    enrollmentStatus: "not-enrolled",
    certificateAvailable: true,
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "text-aurora-green bg-aurora-green/10",
  Intermediate: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  Advanced: "text-red-500 bg-red-50 dark:bg-red-900/20",
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  "not-enrolled": { label: "Not Enrolled", color: "text-silver-mist", bgColor: "bg-slate-100 dark:bg-deep-cosmos" },
  enrolled: { label: "Enrolled", color: "text-celestial-indigo", bgColor: "bg-celestial-indigo/10" },
  "in-progress": { label: "In Progress", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  completed: { label: "Completed", color: "text-aurora-green", bgColor: "bg-aurora-green/10" },
};

export function PathEnrollment() {
  const [enrollments, setEnrollments] = useState<PathEnrollmentData[]>(mockEnrollments);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const handleEnroll = (id: string) => {
    setEnrollingId(id);
    setTimeout(() => {
      setEnrollments((prev) =>
        prev.map((path) =>
          path.id === id ? { ...path, enrollmentStatus: "enrolled" as const, progress: 0 } : path
        )
      );
      setEnrollingId(null);
    }, 1500);
  };

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
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[path.difficulty]}`}>
                          {path.difficulty}
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
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(path.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(path.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {path.certificateAvailable && (
                          <span className="flex items-center gap-1 text-celestial-indigo">
                            <Award className="w-3.5 h-3.5" />
                            Certificate
                          </span>
                        )}
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
        </div>
      </div>
    </div>
  );
}
