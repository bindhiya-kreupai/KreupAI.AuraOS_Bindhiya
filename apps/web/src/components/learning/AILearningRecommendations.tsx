"use client";

import React, { useState } from "react";
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
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  relevanceScore: number;
  reason: string;
  type: "role-based" | "trending" | "skill-gap";
  enrolledCount: number;
}

const mockRecommendations: RecommendedCourse[] = [
  {
    id: "rec-001",
    title: "Strategic Decision Making",
    description: "Framework for making high-impact decisions with incomplete information in leadership roles.",
    category: "Leadership",
    duration: "6 hours",
    relevanceScore: 96,
    reason: "Aligned with your Senior Manager role trajectory",
    type: "role-based",
    enrolledCount: 234,
  },
  {
    id: "rec-002",
    title: "Generative AI for Business",
    description: "Understand and leverage generative AI tools for productivity, innovation, and competitive advantage.",
    category: "Technology",
    duration: "8 hours",
    relevanceScore: 94,
    reason: "Trending among your peers - 89% completion rate",
    type: "trending",
    enrolledCount: 1205,
  },
  {
    id: "rec-003",
    title: "Advanced SQL & Data Pipelines",
    description: "Master complex queries, window functions, CTEs, and building reliable data pipelines.",
    category: "Technical",
    duration: "14 hours",
    relevanceScore: 91,
    reason: "Identified skill gap from last performance review",
    type: "skill-gap",
    enrolledCount: 467,
  },
  {
    id: "rec-004",
    title: "Conflict Resolution & Mediation",
    description: "Techniques for managing workplace conflicts, mediating disputes, and fostering collaborative environments.",
    category: "Soft Skills",
    duration: "4 hours",
    relevanceScore: 88,
    reason: "Required for people management advancement",
    type: "role-based",
    enrolledCount: 312,
  },
  {
    id: "rec-005",
    title: "Cloud Cost Optimization",
    description: "Strategies and tools for reducing cloud infrastructure costs while maintaining performance.",
    category: "Technical",
    duration: "10 hours",
    relevanceScore: 85,
    reason: "Top trending course this quarter - 156% enrollment increase",
    type: "trending",
    enrolledCount: 589,
  },
  {
    id: "rec-006",
    title: "Stakeholder Communication",
    description: "Master the art of communicating with executives, cross-functional teams, and external stakeholders.",
    category: "Communication",
    duration: "5 hours",
    relevanceScore: 82,
    reason: "Gap identified: presentation skills rated 3/5 in 360 review",
    type: "skill-gap",
    enrolledCount: 678,
  },
];

const typeConfig = {
  "role-based": {
    icon: Briefcase,
    label: "Role-Based",
    color: "text-celestial-indigo",
    bg: "bg-celestial-indigo/10",
  },
  trending: {
    icon: TrendingUp,
    label: "Trending",
    color: "text-aurora-green",
    bg: "bg-aurora-green/10",
  },
  "skill-gap": {
    icon: Target,
    label: "Skill Gap",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
};

export default function AILearningRecommendations() {
  const [recommendations] = useState<RecommendedCourse[]>(mockRecommendations);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredRecs =
    activeFilter === "all"
      ? recommendations
      : recommendations.filter((r) => r.type === activeFilter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-aurora-green";
    if (score >= 80) return "text-celestial-indigo";
    return "text-yellow-600";
  };

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
                Personalized learning suggestions based on your profile and goals
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
          {["all", "role-based", "trending", "skill-gap"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-celestial-indigo text-white"
                  : "border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              }`}
            >
              {filter === "all"
                ? "All"
                : filter
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((course) => {
            const config = typeConfig[course.type];
            const TypeIcon = config.icon;

            return (
              <div
                key={course.id}
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
                    <Star className={`w-4 h-4 ${getScoreColor(course.relevanceScore)}`} />
                    <span
                      className={`text-sm font-bold ${getScoreColor(course.relevanceScore)}`}
                    >
                      {course.relevanceScore}%
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                  {course.title}
                </h3>
                <p className="text-sm text-silver-mist mt-1 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-silver-mist">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{course.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </div>
                  <span>{course.enrolledCount} enrolled</span>
                </div>

                <div className="mt-3 px-3 py-2 rounded-lg bg-cloud/50 dark:bg-nebula-purple/10">
                  <p className="text-xs text-silver-mist italic">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {course.reason}
                  </p>
                </div>

                <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                  Enroll Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
