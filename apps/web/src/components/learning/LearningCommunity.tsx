"use client";

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Users, Clock } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  course: string;
  author: string;
  replies: number;
  likes: number;
  lastActivity: string;
}

const discussions: Discussion[] = [
  { id: '1', title: 'Best practices for async/await error handling?', course: 'Advanced TypeScript', author: 'Sarah C.', replies: 12, likes: 8, lastActivity: '2h ago' },
  { id: '2', title: 'How do you structure large React applications?', course: 'React Architecture', author: 'James W.', replies: 24, likes: 15, lastActivity: '4h ago' },
  { id: '3', title: 'Tips for the AWS Solutions Architect exam', course: 'AWS Certification Prep', author: 'Maria G.', replies: 18, likes: 22, lastActivity: '1d ago' },
  { id: '4', title: 'Understanding SOLID principles in practice', course: 'Design Patterns', author: 'David K.', replies: 9, likes: 6, lastActivity: '2d ago' },
  { id: '5', title: 'Docker vs Kubernetes - when to use what?', course: 'DevOps Fundamentals', author: 'Alex T.', replies: 31, likes: 19, lastActivity: '3d ago' },
];

export function LearningCommunity() {
  const [filter, setFilter] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  const sorted = [...discussions].sort((a, b) => {
    if (filter === 'popular') return b.likes - a.likes;
    if (filter === 'unanswered') return a.replies - b.replies;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-celestial-indigo" />
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Learning Community</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-deep-cosmos rounded-lg p-0.5">
          {(['recent', 'popular', 'unanswered'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md capitalize transition-colors ${
                filter === f ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm' : 'text-silver-mist'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((disc) => (
          <div key={disc.id} className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-3 hover:border-celestial-indigo/50 transition-colors cursor-pointer">
            <h4 className="text-sm font-medium text-ink-black dark:text-pearl mb-1">{disc.title}</h4>
            <div className="flex items-center gap-4 text-xs text-silver-mist">
              <span className="px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full text-[10px] font-medium">{disc.course}</span>
              <span>{disc.author}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{disc.replies}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{disc.likes}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{disc.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
