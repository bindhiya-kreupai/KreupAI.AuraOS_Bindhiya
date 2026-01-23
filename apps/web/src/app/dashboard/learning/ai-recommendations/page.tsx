"use client";

import React from 'react';
import { Sparkles, BookOpen, Clock, Star, TrendingUp, Target, ChevronRight, Zap, Brain } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: string;
  matchScore: number;
  reason: string;
  skills: string[];
  category: string;
}

const recommendations: Recommendation[] = [
  { id: '1', title: 'Advanced System Design Patterns', provider: 'Internal', duration: '8 hours', level: 'Advanced', matchScore: 96, reason: 'Aligned with your Staff Engineer goal', skills: ['System Design', 'Architecture'], category: 'Technical' },
  { id: '2', title: 'Technical Leadership Essentials', provider: 'SkillUp', duration: '12 hours', level: 'Intermediate', matchScore: 92, reason: 'Based on your career interests', skills: ['Leadership', 'Communication'], category: 'Leadership' },
  { id: '3', title: 'Kubernetes Deep Dive', provider: 'CloudAcademy', duration: '6 hours', level: 'Advanced', matchScore: 88, reason: 'Trending in your department', skills: ['DevOps', 'Cloud'], category: 'Technical' },
  { id: '4', title: 'Effective Code Reviews', provider: 'Internal', duration: '2 hours', level: 'Intermediate', matchScore: 85, reason: 'Skill gap identified in review', skills: ['Code Quality', 'Mentoring'], category: 'Technical' },
  { id: '5', title: 'Data-Driven Decision Making', provider: 'Coursera', duration: '4 hours', level: 'Beginner', matchScore: 82, reason: 'Recommended by your manager', skills: ['Analytics', 'Strategy'], category: 'Business' },
  { id: '6', title: 'Public Speaking for Engineers', provider: 'Internal', duration: '3 hours', level: 'Beginner', matchScore: 78, reason: 'Popular among peers at your level', skills: ['Presentation', 'Communication'], category: 'Soft Skills' },
];

const skillGaps = [
  { skill: 'System Design', current: 3, target: 5, priority: 'high' },
  { skill: 'Technical Writing', current: 2, target: 4, priority: 'medium' },
  { skill: 'Team Leadership', current: 2, target: 4, priority: 'high' },
  { skill: 'Cloud Architecture', current: 3, target: 4, priority: 'medium' },
  { skill: 'Mentoring', current: 1, target: 3, priority: 'low' },
];

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">AI Recommendations</h1>
          <p className="text-sm text-silver-mist mt-1">Personalized learning suggestions based on your goals and skills</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI-Powered</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-celestial-indigo/10 dark:from-purple-500/20 dark:to-celestial-indigo/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">Your Learning Profile</p>
            <p className="text-xs text-silver-mist mt-1">
              Based on your career goal of &quot;Staff Engineer&quot;, performance reviews, skill assessments, and peer learning patterns,
              we recommend focusing on <span className="font-medium text-purple-600 dark:text-purple-400">System Design</span> and
              <span className="font-medium text-purple-600 dark:text-purple-400"> Technical Leadership</span> courses.
            </p>
          </div>
        </div>
      </div>

      {/* Skill Gaps */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Identified Skill Gaps</h3>
        <div className="space-y-3">
          {skillGaps.map((gap) => (
            <div key={gap.skill} className="flex items-center gap-4">
              <span className="text-xs font-medium text-ink-black dark:text-pearl w-32">{gap.skill}</span>
              <div className="flex-1 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 flex-1 rounded-sm ${
                      i < gap.current ? 'bg-celestial-indigo' : i < gap.target ? 'bg-celestial-indigo/20 border border-dashed border-celestial-indigo/50' : 'bg-slate-100 dark:bg-deep-cosmos'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                gap.priority === 'high' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' :
                gap.priority === 'medium' ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' :
                'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>
                {gap.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Recommended for You</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {recommendations.map((rec) => (
            <div key={rec.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-celestial-indigo/10 flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{rec.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-silver-mist font-medium">{rec.level}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                    <span>{rec.provider}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Zap className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 italic">{rec.reason}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {rec.skills.map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${rec.matchScore >= 90 ? 'text-emerald-600' : rec.matchScore >= 80 ? 'text-celestial-indigo' : 'text-sunset-amber'}`}>
                    {rec.matchScore}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
