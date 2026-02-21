"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceReviewService } from '../core/services';
import {
  Heart, Award, Star, MessageSquare, ThumbsUp,
  Plus, Trophy, TrendingUp, Sparkles, Loader2
} from 'lucide-react';

interface Recognition {
  id: string;
  from: string;
  fromAvatar: string;
  to: string;
  toAvatar: string;
  message: string;
  value: string;
  badge: string;
  points: number;
  likes: number;
  timestamp: string;
}

const companyValues = ['Leadership', 'Innovation', 'Teamwork', 'Excellence', 'Integrity', 'Customer First'];

export default function RecognitionWallPage() {
  const [selectedValue, setSelectedValue] = useState('All');
  const [loading, setLoading] = useState(true);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Recognition data could come from reviews or a dedicated endpoint
        // For now, derive from reviews that have strengths/feedback
        const reviews = await PerformanceReviewService.getReviews();
        const derived: Recognition[] = reviews
          .filter((r: any) => r.strengths || r.managerComments)
          .slice(0, 10)
          .map((r: any, idx: number) => ({
            id: r.id,
            from: 'Manager',
            fromAvatar: 'MG',
            to: `Employee ${r.employeeId?.slice(-4) || idx}`,
            toAvatar: (r.employeeId?.slice(-2) || 'EE').toUpperCase(),
            message: r.managerComments || (Array.isArray(r.strengths) ? r.strengths[0] : 'Great work!'),
            value: 'Excellence',
            badge: 'Star Performer',
            points: 50,
            likes: 0,
            timestamp: r.completedAt ? new Date(r.completedAt).toLocaleDateString() : 'Recent',
          }));
        setRecognitions(derived);
      } catch (error) {
        console.error('Failed to load recognitions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Recognition Wall</h1>
          <p className="text-sm text-silver-mist mt-1">Celebrate achievements and appreciate your colleagues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg font-medium text-sm hover:bg-celestial-indigo/90 transition-colors">
          <Sparkles className="w-4 h-4" /> Give Recognition
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Recognitions This Month</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{recognitions.length}</p>
          <p className="text-[10px] text-silver-mist">From performance reviews</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Your Points</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">0</p>
          <p className="text-[10px] text-silver-mist">Start giving to earn</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Badges Earned</p>
          <p className="text-2xl font-bold text-quantum-rose mt-1">0</p>
          <p className="text-[10px] text-silver-mist">Keep contributing</p>
        </div>
      </div>

      {/* Value Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedValue('All')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
            selectedValue === 'All' ? 'bg-celestial-indigo text-white' : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist'
          }`}
        >
          All Values
        </button>
        {companyValues.map((value) => (
          <button
            key={value}
            onClick={() => setSelectedValue(value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedValue === value ? 'bg-celestial-indigo text-white' : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recognition Feed */}
        <div className="lg:col-span-2 space-y-4">
          {recognitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Sparkles className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-bold text-lg">No recognitions yet</p>
              <p className="text-sm mt-1">Be the first to recognize a colleague</p>
            </div>
          ) : (
            recognitions.map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-celestial-indigo">{rec.fromAvatar}</span>
                  </div>
                  <div>
                    <p className="text-sm text-ink-black dark:text-pearl">
                      <span className="font-medium">{rec.from}</span>
                      <span className="text-silver-mist"> recognized </span>
                      <span className="font-medium">{rec.to}</span>
                    </p>
                    <p className="text-[10px] text-silver-mist">{rec.timestamp}</p>
                  </div>
                </div>
                <p className="text-sm text-ink-black dark:text-pearl mb-3 pl-12">{rec.message}</p>
                <div className="flex items-center justify-between pl-12">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-sunset-amber/10 text-sunset-amber rounded-full font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" /> {rec.badge}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full font-medium">
                      {rec.value}
                    </span>
                    <span className="text-[10px] text-silver-mist">+{rec.points} pts</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-silver-mist hover:text-quantum-rose transition-colors">
                    <Heart className="w-3.5 h-3.5" /> {rec.likes}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sunset-amber" /> Leaderboard
            </h3>
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Trophy className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">Leaderboard data will populate as recognitions grow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
