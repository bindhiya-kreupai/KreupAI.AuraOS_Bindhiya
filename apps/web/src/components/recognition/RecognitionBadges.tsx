"use client";

import React, { useState } from "react";
import { Award, Lock, CheckCircle, Filter } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  earned: boolean;
  earnedDate?: string;
  earnedCount?: number;
  requirement: string;
}

const mockBadges: Badge[] = [
  {
    id: "team-player",
    name: "Team Player",
    emoji: "\u{1F91D}",
    description: "Goes above and beyond to support teammates",
    category: "Collaboration",
    earned: true,
    earnedDate: "2025-12-15",
    earnedCount: 5,
    requirement: "Receive 3 teamwork recognitions",
  },
  {
    id: "innovator",
    name: "Innovator",
    emoji: "\u{1F4A1}",
    description: "Brings creative and original solutions to problems",
    category: "Creativity",
    earned: true,
    earnedDate: "2026-01-10",
    earnedCount: 2,
    requirement: "Receive 3 innovation recognitions",
  },
  {
    id: "customer-champion",
    name: "Customer Champion",
    emoji: "\u{1F451}",
    description: "Consistently puts customer needs first",
    category: "Service",
    earned: true,
    earnedDate: "2025-11-20",
    earnedCount: 3,
    requirement: "Receive 5 customer-focus recognitions",
  },
  {
    id: "mentor",
    name: "Mentor",
    emoji: "\u{1F393}",
    description: "Dedicates time to teaching and guiding others",
    category: "Leadership",
    earned: true,
    earnedDate: "2026-01-05",
    earnedCount: 1,
    requirement: "Mentor 2 colleagues for 3+ months",
  },
  {
    id: "rockstar",
    name: "Rockstar",
    emoji: "\u{1F31F}",
    description: "Delivers outstanding results consistently",
    category: "Performance",
    earned: false,
    requirement: "Receive 10 excellence recognitions",
  },
  {
    id: "problem-solver",
    name: "Problem Solver",
    emoji: "\u{1F527}",
    description: "Tackles the toughest challenges head-on",
    category: "Technical",
    earned: false,
    requirement: "Resolve 5 critical issues",
  },
  {
    id: "culture-builder",
    name: "Culture Builder",
    emoji: "\u{1F3D7}\u{FE0F}",
    description: "Actively shapes and improves team culture",
    category: "Culture",
    earned: false,
    requirement: "Organize 3 team events or initiatives",
  },
  {
    id: "early-bird",
    name: "Early Bird",
    emoji: "\u{1F426}",
    description: "First to respond and act in urgent situations",
    category: "Responsiveness",
    earned: true,
    earnedDate: "2025-10-28",
    earnedCount: 4,
    requirement: "Respond to 10 urgent requests within 15 min",
  },
  {
    id: "quality-guardian",
    name: "Quality Guardian",
    emoji: "\u{1F6E1}\u{FE0F}",
    description: "Maintains the highest standards of quality",
    category: "Quality",
    earned: false,
    requirement: "Achieve 99% quality score for 3 months",
  },
  {
    id: "knowledge-sharer",
    name: "Knowledge Sharer",
    emoji: "\u{1F4DA}",
    description: "Actively shares knowledge and documentation",
    category: "Knowledge",
    earned: true,
    earnedDate: "2025-12-01",
    earnedCount: 2,
    requirement: "Create 5 knowledge base articles",
  },
  {
    id: "rising-star",
    name: "Rising Star",
    emoji: "\u{1F680}",
    description: "Shows exceptional growth and potential",
    category: "Growth",
    earned: false,
    requirement: "Achieve top performance rating in first year",
  },
  {
    id: "wellness-advocate",
    name: "Wellness Advocate",
    emoji: "\u{1F9D8}",
    description: "Champions team wellness and work-life balance",
    category: "Wellbeing",
    earned: false,
    requirement: "Lead 3 wellness initiatives",
  },
];

type FilterType = "all" | "earned" | "locked";

export default function RecognitionBadges() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filteredBadges = mockBadges.filter((badge) => {
    if (filter === "earned") return badge.earned;
    if (filter === "locked") return !badge.earned;
    return true;
  });

  const earnedCount = mockBadges.filter((b) => b.earned).length;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Badge Gallery
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-aurora-green" />
          <span className="text-silver-mist">
            <strong className="text-ink-black dark:text-pearl">{earnedCount}</strong> /{" "}
            {mockBadges.length} earned
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-silver-mist" />
        {(["all", "earned", "locked"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
              filter === f
                ? "bg-celestial-indigo text-white"
                : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {filteredBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              badge.earned
                ? "border-aurora-green/30 bg-aurora-green/5 hover:border-aurora-green/50"
                : "border-cloud dark:border-nebula-purple/50 opacity-60 hover:opacity-80"
            } ${
              selectedBadge?.id === badge.id
                ? "ring-2 ring-celestial-indigo ring-offset-2 dark:ring-offset-stellar-blue"
                : ""
            }`}
          >
            {!badge.earned && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-silver-mist" />
              </div>
            )}
            {badge.earned && badge.earnedCount && badge.earnedCount > 1 && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-celestial-indigo flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">x{badge.earnedCount}</span>
              </div>
            )}
            <span className="text-3xl">{badge.emoji}</span>
            <span className="text-xs font-semibold text-ink-black dark:text-pearl text-center">
              {badge.name}
            </span>
            <span className="text-[10px] text-silver-mist text-center">
              {badge.category}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Badge Details */}
      {selectedBadge && (
        <div className="p-4 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg border border-cloud dark:border-nebula-purple/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{selectedBadge.emoji}</span>
            <div>
              <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">
                {selectedBadge.name}
              </h4>
              <span className="text-xs text-silver-mist">{selectedBadge.category}</span>
            </div>
            {selectedBadge.earned ? (
              <span className="ml-auto px-2 py-1 bg-aurora-green/10 text-aurora-green text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Earned
              </span>
            ) : (
              <span className="ml-auto px-2 py-1 bg-gray-200 dark:bg-nebula-purple/30 text-silver-mist text-xs font-medium rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          <p className="text-sm text-ink-black/80 dark:text-pearl/80 mb-2">
            {selectedBadge.description}
          </p>
          <p className="text-xs text-silver-mist">
            <strong>How to earn:</strong> {selectedBadge.requirement}
          </p>
          {selectedBadge.earned && selectedBadge.earnedDate && (
            <p className="text-xs text-aurora-green mt-1">
              First earned on {selectedBadge.earnedDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
