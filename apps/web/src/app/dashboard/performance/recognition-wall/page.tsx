"use client";

import React, { useState } from 'react';
import {
  Heart, Award, Star, MessageSquare, ThumbsUp,
  Plus, Trophy, TrendingUp, Sparkles
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

const mockRecognitions: Recognition[] = [
  { id: '1', from: 'Sarah Johnson', fromAvatar: 'SJ', to: 'Mike Chen', toAvatar: 'MC', message: 'Amazing work on the Q4 product launch! Your leadership kept the team motivated throughout.', value: 'Leadership', badge: 'Star Performer', points: 50, likes: 12, timestamp: '2 hours ago' },
  { id: '2', from: 'Emily Davis', fromAvatar: 'ED', to: 'Anna Lee', toAvatar: 'AL', message: 'Thank you for staying late to help me debug the payment integration. True team player!', value: 'Teamwork', badge: 'Helping Hand', points: 30, likes: 8, timestamp: '5 hours ago' },
  { id: '3', from: 'Raj Patel', fromAvatar: 'RP', to: 'David Wilson', toAvatar: 'DW', message: 'Your innovative approach to the data pipeline saved us 40% processing time. Brilliant!', value: 'Innovation', badge: 'Innovator', points: 50, likes: 15, timestamp: '1 day ago' },
  { id: '4', from: 'Lisa Park', fromAvatar: 'LP', to: 'Emily Davis', toAvatar: 'ED', message: 'Outstanding presentation to the board. Clear, concise, and impactful.', value: 'Excellence', badge: 'Presenter Pro', points: 40, likes: 20, timestamp: '2 days ago' },
];

const leaderboard = [
  { rank: 1, name: 'Mike Chen', points: 450, avatar: 'MC' },
  { rank: 2, name: 'Emily Davis', points: 380, avatar: 'ED' },
  { rank: 3, name: 'David Wilson', points: 320, avatar: 'DW' },
  { rank: 4, name: 'Anna Lee', points: 280, avatar: 'AL' },
  { rank: 5, name: 'Sarah Johnson', points: 250, avatar: 'SJ' },
];

const companyValues = ['Leadership', 'Innovation', 'Teamwork', 'Excellence', 'Integrity', 'Customer First'];

export default function RecognitionWallPage() {
  const [selectedValue, setSelectedValue] = useState('All');

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
          <p className="text-2xl font-bold text-celestial-indigo mt-1">47</p>
          <p className="text-[10px] text-emerald-500">+15% vs last month</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Your Points</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">180</p>
          <p className="text-[10px] text-silver-mist">Rank #8</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Badges Earned</p>
          <p className="text-2xl font-bold text-quantum-rose mt-1">6</p>
          <p className="text-[10px] text-silver-mist">2 new this month</p>
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
          {mockRecognitions.map((rec) => (
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
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sunset-amber" /> Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.map((person) => (
                <div key={person.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    person.rank === 1 ? 'bg-sunset-amber/10 text-sunset-amber' :
                    person.rank === 2 ? 'bg-slate-200 text-slate-600' :
                    person.rank === 3 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-silver-mist'
                  }`}>
                    {person.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-celestial-indigo">{person.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-ink-black dark:text-pearl">{person.name}</p>
                  </div>
                  <span className="text-xs font-bold text-sunset-amber">{person.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
