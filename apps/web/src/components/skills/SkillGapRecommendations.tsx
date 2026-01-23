"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Clock,
  Star,
  TrendingUp,
  Filter,
  GraduationCap,
  Video,
  FileText,
  Users,
} from "lucide-react";

type ResourceType = "course" | "video" | "article" | "workshop";
type GapSeverity = "critical" | "high" | "medium" | "low";

interface LearningResource {
  id: string;
  title: string;
  provider: string;
  type: ResourceType;
  duration: string;
  rating: number;
  url: string;
}

interface SkillGapRecommendation {
  id: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  severity: GapSeverity;
  resources: LearningResource[];
}

const mockRecommendations: SkillGapRecommendation[] = [
  {
    id: "1",
    skillName: "Security Practices",
    currentLevel: 45,
    requiredLevel: 80,
    gap: 35,
    severity: "critical",
    resources: [
      { id: "r1", title: "Application Security Fundamentals", provider: "Coursera", type: "course", duration: "24h", rating: 4.8, url: "#" },
      { id: "r2", title: "OWASP Top 10 Deep Dive", provider: "Pluralsight", type: "video", duration: "8h", rating: 4.6, url: "#" },
      { id: "r3", title: "Secure Coding Workshop", provider: "Internal L&D", type: "workshop", duration: "2 days", rating: 4.9, url: "#" },
    ],
  },
  {
    id: "2",
    skillName: "Cloud Architecture",
    currentLevel: 55,
    requiredLevel: 85,
    gap: 30,
    severity: "critical",
    resources: [
      { id: "r4", title: "AWS Solutions Architect Professional", provider: "AWS Training", type: "course", duration: "40h", rating: 4.7, url: "#" },
      { id: "r5", title: "Cloud Design Patterns", provider: "Microsoft Learn", type: "article", duration: "6h", rating: 4.5, url: "#" },
      { id: "r6", title: "Multi-Cloud Architecture Workshop", provider: "Internal L&D", type: "workshop", duration: "1 day", rating: 4.8, url: "#" },
    ],
  },
  {
    id: "3",
    skillName: "System Design",
    currentLevel: 65,
    requiredLevel: 90,
    gap: 25,
    severity: "high",
    resources: [
      { id: "r7", title: "Designing Data-Intensive Applications", provider: "O'Reilly", type: "article", duration: "30h", rating: 4.9, url: "#" },
      { id: "r8", title: "System Design Interview Prep", provider: "Educative", type: "course", duration: "20h", rating: 4.7, url: "#" },
    ],
  },
  {
    id: "4",
    skillName: "Mentoring",
    currentLevel: 50,
    requiredLevel: 75,
    gap: 25,
    severity: "high",
    resources: [
      { id: "r9", title: "The Art of Technical Mentoring", provider: "LinkedIn Learning", type: "video", duration: "4h", rating: 4.5, url: "#" },
      { id: "r10", title: "Coaching for Technical Leaders", provider: "Internal L&D", type: "workshop", duration: "3h", rating: 4.8, url: "#" },
    ],
  },
  {
    id: "5",
    skillName: "Technical Writing",
    currentLevel: 60,
    requiredLevel: 80,
    gap: 20,
    severity: "medium",
    resources: [
      { id: "r11", title: "Technical Writing for Engineers", provider: "Google", type: "course", duration: "12h", rating: 4.6, url: "#" },
      { id: "r12", title: "Documentation Best Practices", provider: "Write the Docs", type: "article", duration: "3h", rating: 4.4, url: "#" },
    ],
  },
  {
    id: "6",
    skillName: "Performance Optimization",
    currentLevel: 70,
    requiredLevel: 85,
    gap: 15,
    severity: "medium",
    resources: [
      { id: "r13", title: "High Performance Web Applications", provider: "Frontend Masters", type: "video", duration: "10h", rating: 4.7, url: "#" },
    ],
  },
];

const typeIcons: Record<ResourceType, React.ReactNode> = {
  course: <GraduationCap className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  article: <FileText className="w-3.5 h-3.5" />,
  workshop: <Users className="w-3.5 h-3.5" />,
};

const typeColors: Record<ResourceType, string> = {
  course: "bg-celestial-indigo/10 text-celestial-indigo",
  video: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  article: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  workshop: "bg-aurora-green/10 text-aurora-green",
};

const severityConfig: Record<GapSeverity, { label: string; colorClass: string; bgClass: string }> = {
  critical: { label: "Critical", colorClass: "text-coral-alert", bgClass: "bg-coral-alert/10 border-coral-alert/30" },
  high: { label: "High", colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30" },
  medium: { label: "Medium", colorClass: "text-celestial-indigo", bgClass: "bg-celestial-indigo/5 border-celestial-indigo/20" },
  low: { label: "Low", colorClass: "text-aurora-green", bgClass: "bg-aurora-green/5 border-aurora-green/20" },
};

export default function SkillGapRecommendations() {
  const [filterSeverity, setFilterSeverity] = useState<GapSeverity | "all">("all");

  const filteredRecommendations = mockRecommendations.filter((rec) => {
    if (filterSeverity === "all") return true;
    return rec.severity === filterSeverity;
  });

  const totalResources = mockRecommendations.reduce((sum, r) => sum + r.resources.length, 0);

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Learning Recommendations
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-aurora-green" />
          <span className="text-silver-mist">
            <strong className="text-ink-black dark:text-pearl">{totalResources}</strong> resources available
          </span>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-silver-mist" />
        {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeverity(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
              filterSeverity === s
                ? "bg-celestial-indigo text-white"
                : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {filteredRecommendations.map((rec) => {
          const severity = severityConfig[rec.severity];
          return (
            <div
              key={rec.id}
              className={`border rounded-lg p-5 ${severity.bgClass}`}
            >
              {/* Skill Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                    {rec.skillName}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severity.colorClass} bg-white/50 dark:bg-stellar-blue/50`}>
                    {severity.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-silver-mist">
                    Current: <strong className="text-ink-black dark:text-pearl">{rec.currentLevel}%</strong>
                  </span>
                  <span className="text-silver-mist">
                    Required: <strong className="text-ink-black dark:text-pearl">{rec.requiredLevel}%</strong>
                  </span>
                  <span className={`font-bold ${severity.colorClass}`}>
                    Gap: {rec.gap}%
                  </span>
                </div>
              </div>

              {/* Gap Progress Bar */}
              <div className="relative h-2 bg-white/50 dark:bg-stellar-blue/30 rounded-full mb-4 overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-celestial-indigo/40 rounded-full"
                  style={{ width: `${rec.requiredLevel}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-celestial-indigo rounded-full"
                  style={{ width: `${rec.currentLevel}%` }}
                />
              </div>

              {/* Resources */}
              <div className="space-y-2">
                {rec.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-stellar-blue rounded-lg border border-cloud/50 dark:border-nebula-purple/30 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-1.5 rounded-md ${typeColors[resource.type]}`}>
                        {typeIcons[resource.type]}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-ink-black dark:text-pearl">
                          {resource.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-silver-mist">{resource.provider}</span>
                          <span className="text-xs text-silver-mist">|</span>
                          <span className="flex items-center gap-0.5 text-xs text-silver-mist">
                            <Clock className="w-3 h-3" />
                            {resource.duration}
                          </span>
                          <span className="text-xs text-silver-mist">|</span>
                          <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                            <Star className="w-3 h-3 fill-current" />
                            {resource.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={resource.url}
                      className="p-2 text-celestial-indigo hover:bg-celestial-indigo/10 rounded-md transition-colors"
                      title="Open resource"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
