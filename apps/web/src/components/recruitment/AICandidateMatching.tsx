"use client";

import React from "react";
import { Brain, Star, ThumbsUp, AlertCircle, ChevronRight } from "lucide-react";

interface SkillBreakdown {
  skill: string;
  matchPercent: number;
}

interface CandidateMatch {
  id: string;
  name: string;
  currentRole: string;
  matchScore: number;
  recommendation: "strong" | "good" | "moderate";
  skills: SkillBreakdown[];
  experience: string;
  location: string;
}

const mockCandidates: CandidateMatch[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    currentRole: "Senior Software Engineer at TechCorp",
    matchScore: 94,
    recommendation: "strong",
    skills: [
      { skill: "React", matchPercent: 100 },
      { skill: "TypeScript", matchPercent: 95 },
      { skill: "Node.js", matchPercent: 90 },
      { skill: "AWS", matchPercent: 85 },
      { skill: "System Design", matchPercent: 80 },
    ],
    experience: "8 years",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    name: "Michael Chen",
    currentRole: "Full-Stack Developer at StartupABC",
    matchScore: 87,
    recommendation: "strong",
    skills: [
      { skill: "React", matchPercent: 95 },
      { skill: "TypeScript", matchPercent: 90 },
      { skill: "Node.js", matchPercent: 85 },
      { skill: "AWS", matchPercent: 70 },
      { skill: "System Design", matchPercent: 75 },
    ],
    experience: "6 years",
    location: "New York, NY",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    currentRole: "Software Engineer at BigTech Inc.",
    matchScore: 79,
    recommendation: "good",
    skills: [
      { skill: "React", matchPercent: 90 },
      { skill: "TypeScript", matchPercent: 85 },
      { skill: "Node.js", matchPercent: 70 },
      { skill: "AWS", matchPercent: 80 },
      { skill: "System Design", matchPercent: 65 },
    ],
    experience: "5 years",
    location: "Austin, TX",
  },
  {
    id: "4",
    name: "David Park",
    currentRole: "Frontend Engineer at DesignCo",
    matchScore: 68,
    recommendation: "moderate",
    skills: [
      { skill: "React", matchPercent: 95 },
      { skill: "TypeScript", matchPercent: 80 },
      { skill: "Node.js", matchPercent: 50 },
      { skill: "AWS", matchPercent: 40 },
      { skill: "System Design", matchPercent: 55 },
    ],
    experience: "4 years",
    location: "Seattle, WA",
  },
];

const recommendationConfig = {
  strong: { label: "Strong Match", icon: Star, classes: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" },
  good: { label: "Good Match", icon: ThumbsUp, classes: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" },
  moderate: { label: "Moderate", icon: AlertCircle, classes: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" },
};

export default function AICandidateMatching() {
  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-400";
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">AI Candidate Matching</h2>
      </div>
      <p className="text-sm text-silver-mist mb-6">
        Position: <span className="font-medium text-ink-black dark:text-pearl">Senior Full-Stack Engineer</span>
      </p>

      {/* Ranked List */}
      <div className="space-y-4">
        {mockCandidates.map((candidate, rank) => {
          const recConfig = recommendationConfig[candidate.recommendation];
          const RecIcon = recConfig.icon;
          return (
            <div
              key={candidate.id}
              className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-sm font-bold text-celestial-indigo">
                    #{rank + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-black dark:text-pearl">{candidate.name}</p>
                    <p className="text-xs text-silver-mist">{candidate.currentRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${recConfig.classes}`}>
                    <RecIcon className="h-3 w-3" />
                    {recConfig.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-silver-mist" />
                </div>
              </div>

              {/* Match Score Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-silver-mist">Overall Match</span>
                  <span className={`text-sm font-bold ${
                    candidate.matchScore >= 80 ? "text-green-600 dark:text-green-400" :
                    candidate.matchScore >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                    "text-red-500"
                  }`}>{candidate.matchScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreBarColor(candidate.matchScore)}`}
                    style={{ width: `${candidate.matchScore}%` }}
                  />
                </div>
              </div>

              {/* Skill Breakdown */}
              <div className="space-y-1.5">
                {candidate.skills.map((skill) => (
                  <div key={skill.skill} className="flex items-center gap-2">
                    <span className="text-xs text-silver-mist w-24 truncate">{skill.skill}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(skill.matchPercent)}`}
                        style={{ width: `${skill.matchPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-silver-mist w-8 text-right">{skill.matchPercent}%</span>
                  </div>
                ))}
              </div>

              {/* Meta Info */}
              <div className="mt-3 flex items-center gap-4 text-xs text-silver-mist">
                <span>Experience: {candidate.experience}</span>
                <span>Location: {candidate.location}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
