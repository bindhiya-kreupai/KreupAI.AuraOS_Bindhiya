"use client";

import React, { useState, useEffect } from 'react';
import { FileQuestion, Plus, Edit2, Trash2, Copy, Play, BarChart3, Clock, Users, CheckCircle, Loader2 } from 'lucide-react';
import { AssessmentService } from '../services';

export default function QuizBuilderPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await AssessmentService.getAssessments();
        setQuizzes(result);
      } catch (error: any) {
        console.error('Error:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredQuizzes = filterStatus === 'all'
    ? quizzes
    : quizzes.filter(q => {
        if (filterStatus === 'published') return q.isPublished;
        if (filterStatus === 'draft') return !q.isPublished;
        return true;
      });

  const getStatusStyle = (isPublished: boolean) => {
    return isPublished
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
      : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
  };

  const totalQuestions = quizzes.reduce((s, q) => s + (Array.isArray(q.questions) ? q.questions.length : 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Quiz Builder</h1>
          <p className="text-sm text-silver-mist mt-1">Create and manage assessments for courses and certifications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Quizzes</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{quizzes.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Questions</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{totalQuestions}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Published</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{quizzes.filter(q => q.isPublished).length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Drafts</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{quizzes.filter(q => !q.isPublished).length}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {['all', 'published', 'draft'].map((status) => (
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

      {filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <FileQuestion className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">No quizzes found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {filteredQuizzes.map((quiz) => {
              const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

              return (
                <div key={quiz.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-celestial-indigo/10 flex-shrink-0">
                      <FileQuestion className="w-5 h-5 text-celestial-indigo" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink-black dark:text-pearl">{quiz.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusStyle(quiz.isPublished)}`}>
                          {quiz.isPublished ? 'published' : 'draft'}
                        </span>
                      </div>
                      <p className="text-xs text-silver-mist mt-0.5">{quiz.description || ''}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-silver-mist">
                        <span className="flex items-center gap-1"><FileQuestion className="w-3 h-3" /> {questionsCount} questions</span>
                        {quiz.timeLimit && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.timeLimit} min</span>}
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pass: {quiz.passingScore}%</span>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

