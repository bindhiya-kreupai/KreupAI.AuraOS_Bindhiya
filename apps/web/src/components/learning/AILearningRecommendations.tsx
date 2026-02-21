"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  Star,
  ChevronRight,
  RefreshCw,
  Briefcase,
} from "lucide-react";

interface RecommendedCourse {
  pathId: string;
  title: string;
  matchScore: number;
  reason: string;
  skillGaps: string[];
  estimatedImpact: string;
  priority: number;
  peerEnrollment: string;
}

interface RecommendationData {
  recommendations: RecommendedCourse[];
  basedOn: {
    currentSkills: string[];
    role: string;
    department: string;
    careerGoals: string[];
  };
  generatedAt: string;
}

const impactConfig: Record<string, { icon: typeof Briefcase; label: string; color: string; bg: string }> = {
  high: {
    icon: Target,
    label: "High Impact",
    color: "text-aurora-green",
    bg: "bg-aurora-green/10",
  },
  medium: {
    icon: TrendingUp,
    label: "Medium Impact",
    color: "text-celestial-indigo",
    bg: "bg-celestial-indigo/10",
  },
  low: {
    icon: Briefcase,
    label: "Low Impact",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
};

export default function AILearningRecommendations() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecommendations = () => {
    const isRefresh = data !== null;
    if (isRefresh) setIsRefreshing(true);

    fetch('/api/v1/learning/paths/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError('Failed to load recommendations');
        }
      })
      .catch((err) => {
        console.error('AIRecommendations fetch error:', err);
        setError('Failed to load recommendations');
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-aurora-green";
    if (score >= 80) return "text-celestial-indigo";
    return "text-yellow-600";
  };

  const filteredRecs = data?.recommendations
    ? activeFilter === "all"
      ? data.recommendations
      : data.recommendations.filter((r) => r.estimatedImpact === activeFilter)
    : [];

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen animate-pulse">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-1" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 h-48" />
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-celestial-indigo" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
                AI Recommendations
              </h1>
              <p className="text-sm text-silver-mist">
                Personalized learning suggestions based on your profile
                {data?.basedOn?.role ? ` (${data.basedOn.role})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-sm text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20 ${
              isRefreshing ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "high", "medium", "low"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-celestial-indigo text-white"
                  : "border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              }`}
            >
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1) + " Impact"}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((course) => {
            const config = impactConfig[course.estimatedImpact] || impactConfig.medium;
            const TypeIcon = config.icon;

            return (
              <div
                key={course.pathId}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${getScoreColor(course.matchScore)}`} />
                    <span
                      className={`text-sm font-bold ${getScoreColor(course.matchScore)}`}
                    >
                      {course.matchScore}%
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                  {course.title}
                </h3>
                <p className="text-sm text-silver-mist mt-1 line-clamp-2">
                  {course.reason}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-silver-mist">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Priority #{course.priority}
                  </span>
                  <span>{course.peerEnrollment}</span>
                </div>

                {course.skillGaps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {course.skillGaps.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    fetch(`/api/v1/learning/paths/${course.pathId}/enroll`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ hoursPerWeek: 5 }),
                    }).catch(console.error);
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
                >
                  Enroll Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {filteredRecs.length === 0 && (
            <div className="col-span-full rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center text-sm text-silver-mist">
              No recommendations available for the selected filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
