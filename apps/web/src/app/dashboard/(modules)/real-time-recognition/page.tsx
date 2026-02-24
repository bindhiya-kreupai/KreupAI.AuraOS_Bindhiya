'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Award, Sparkles, Trophy, BarChart3, Plus } from 'lucide-react';
import { RecognitionWall, MOCK_WALL_POSTS } from '@/components/recognition/RecognitionWall';
import { GiveRecognition } from '@/components/recognition/GiveRecognition';
import type { RecognitionFormData } from '@/components/recognition/GiveRecognition';
import { RecognitionBadges, MOCK_BADGES } from '@/components/recognition/RecognitionBadges';
import {
  RecognitionLeaderboard,
  MOCK_LEADERBOARD,
} from '@/components/recognition/RecognitionLeaderboard';

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'wall', label: 'Recognition Wall', icon: Award },
  { key: 'badges', label: 'My Badges', icon: Trophy },
  { key: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
];

export default function RealTimeRecognitionPage() {
  const [activeTab, setActiveTab] = useState('wall');
  const [showGiveForm, setShowGiveForm] = useState(false);

  const handleSubmitRecognition = useCallback((data: RecognitionFormData) => {
    void data;
    setShowGiveForm(false);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-celestial-indigo" />
          <div>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">
              Real-Time Recognition
            </p>
            <p className="text-[9px] text-silver-mist">
              Give kudos, earn badges, and celebrate wins together
            </p>
          </div>
        </div>
        {activeTab === 'wall' && (
          <button
            onClick={() => setShowGiveForm((p) => !p)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Give Kudos
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setShowGiveForm(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
                activeTab === tab.key
                  ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'wall' && (
        <div className="space-y-3">
          {showGiveForm && (
            <GiveRecognition
              onSubmit={handleSubmitRecognition}
              onCancel={() => setShowGiveForm(false)}
              pointsBalance={2500}
            />
          )}
          <RecognitionWall posts={MOCK_WALL_POSTS} />
        </div>
      )}

      {activeTab === 'badges' && <RecognitionBadges badges={MOCK_BADGES} totalPoints={3100} />}

      {activeTab === 'leaderboard' && <RecognitionLeaderboard entries={MOCK_LEADERBOARD} />}
    </div>
  );
}
