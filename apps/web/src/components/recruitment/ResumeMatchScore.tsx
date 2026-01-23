"use client";

import React from "react";
import { CheckCircle, XCircle, Target } from "lucide-react";

interface SkillMatch {
  skill: string;
  matched: boolean;
}

interface MatchData {
  overallScore: number;
  candidateName: string;
  jobTitle: string;
  skills: SkillMatch[];
}

const mockData: MatchData = {
  overallScore: 78,
  candidateName: "Sarah Johnson",
  jobTitle: "Senior Full-Stack Engineer",
  skills: [
    { skill: "React", matched: true },
    { skill: "TypeScript", matched: true },
    { skill: "Node.js", matched: true },
    { skill: "Python", matched: true },
    { skill: "AWS", matched: true },
    { skill: "Docker", matched: true },
    { skill: "Kubernetes", matched: true },
    { skill: "Go", matched: false },
    { skill: "Terraform", matched: false },
    { skill: "CI/CD Pipelines", matched: false },
  ],
};

export default function ResumeMatchScore() {
  const { overallScore, candidateName, jobTitle, skills } = mockData;
  const matchedSkills = skills.filter((s) => s.matched);
  const unmatchedSkills = skills.filter((s) => !s.matched);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Resume Match Score</h2>
      </div>

      <p className="text-sm text-silver-mist mb-1">
        <span className="font-medium text-ink-black dark:text-pearl">{candidateName}</span> vs.
      </p>
      <p className="text-sm text-celestial-indigo font-medium mb-6">{jobTitle}</p>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative h-32 w-32">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              className="stroke-cloud dark:stroke-nebula-purple/30"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={getStrokeColor(overallScore)}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
            <span className="text-xs text-silver-mist">Match</span>
          </div>
        </div>
      </div>

      {/* Matched Skills */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-2 flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Matched Skills ({matchedSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map((s) => (
            <span
              key={s.skill}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            >
              {s.skill}
            </span>
          ))}
        </div>
      </div>

      {/* Unmatched Skills */}
      <div>
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-2 flex items-center gap-1">
          <XCircle className="h-4 w-4 text-red-500" />
          Missing Skills ({unmatchedSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {unmatchedSkills.map((s) => (
            <span
              key={s.skill}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            >
              {s.skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
