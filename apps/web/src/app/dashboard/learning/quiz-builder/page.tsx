"use client";

import React, { useState } from 'react';
import { FileQuestion, Plus, Edit2, Trash2, Copy, Play, BarChart3, Clock, Users, CheckCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  course: string;
  questions: number;
  duration: number;
  attempts: number;
  avgScore: number;
  status: 'draft' | 'published' | 'archived';
  lastModified: string;
}

const mockQuizzes: Quiz[] = [
  { id: '1', title: 'React Fundamentals Assessment', course: 'Frontend Engineering', questions: 20, duration: 30, attempts: 45, avgScore: 78, status: 'published', lastModified: '2 days ago' },
  { id: '2', title: 'Security Best Practices', course: 'Compliance Training', questions: 15, duration: 20, attempts: 120, avgScore: 85, status: 'published', lastModified: '1 week ago' },
  { id: '3', title: 'Leadership Principles Quiz', course: 'Management Training', questions: 10, duration: 15, attempts: 32, avgScore: 72, status: 'published', lastModified: '3 days ago' },
  { id: '4', title: 'Data Privacy Certification', course: 'Compliance', questions: 25, duration: 45, attempts: 0, avgScore: 0, status: 'draft', lastModified: '1 day ago' },
  { id: '5', title: 'Agile Methodology Test', course: 'Project Management', questions: 18, duration: 25, attempts: 67, avgScore: 81, status: 'published', lastModified: '2 weeks ago' },
];

const questionTypes = [
  { type: 'Multiple Choice', count: 45 },
  { type: 'True/False', count: 22 },
  { type: 'Fill in the Blank', count: 15 },
  { type: 'Matching', count: 8 },
  { type: 'Essay', count: 5 },
];

export default function QuizBuilderPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredQuizzes = filterStatus === 'all' ? mockQuizzes : mockQuizzes.filter(q => q.status === filterStatus);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'draft': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'archived': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Quiz Builder</h1>
          <p className="text-sm text-silver-mist mt-1">Create and manage assessments for courses and certifications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Quizzes</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{mockQuizzes.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Questions</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{mockQuizzes.reduce((s, q) => s + q.questions, 0)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Attempts</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{mockQuizzes.reduce((s, q) => s + q.attempts, 0)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Score</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {Math.round(mockQuizzes.filter(q => q.avgScore > 0).reduce((s, q) => s + q.avgScore, 0) / mockQuizzes.filter(q => q.avgScore > 0).length)}%
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'published', 'draft', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filterStatus === status
                ? 'bg-celestial-indigo text-white'
                : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Quiz List */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-celestial-indigo/10 flex-shrink-0">
                  <FileQuestion className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{quiz.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusStyle(quiz.status)}`}>
                      {quiz.status}
                    </span>
                  </div>
                  <p className="text-xs text-silver-mist mt-0.5">{quiz.course}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-silver-mist">
                    <span className="flex items-center gap-1"><FileQuestion className="w-3 h-3" /> {quiz.questions} questions</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.duration} min</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {quiz.attempts} attempts</span>
                    {quiz.avgScore > 0 && (
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Avg: {quiz.avgScore}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Preview">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Analytics">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Type Distribution */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Question Type Distribution</h3>
        <div className="space-y-2">
          {questionTypes.map((qt) => (
            <div key={qt.type} className="flex items-center gap-3">
              <span className="text-xs text-ink-black dark:text-pearl w-32">{qt.type}</span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${(qt.count / 95) * 100}%` }} />
              </div>
              <span className="text-xs text-silver-mist w-8 text-right">{qt.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
