'use client';

import React, { useState, useEffect } from 'react';
import { JobPostingService, RecruitmentSettingsService } from '../services';
import type { RecruitmentSettings } from '../types';
import { Share2, Globe, CheckCircle2, RefreshCw, Linkedin, Building } from 'lucide-react';

type IntegrationCard = {
  id: string;
  name: string;
  icon: typeof Linkedin;
  status: 'Connected' | 'Disconnected';
  posts: number;
  lastSync: string;
};

const JOB_BOARD_CATALOG: Array<{ id: string; name: string; icon: typeof Linkedin }> = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'indeed', name: 'Indeed', icon: Building },
  { id: 'glassdoor', name: 'Glassdoor', icon: Share2 },
];

function formatLastSync(updatedDate?: string): string {
  if (!updatedDate) return 'Never';

  const timestamp = new Date(updatedDate).getTime();
  if (Number.isNaN(timestamp)) return 'Never';

  const elapsedMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (elapsedMinutes < 1) return 'Just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} mins ago`;

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;

  const elapsedDays = Math.round(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
}

function mapIntegrations(
  settings: RecruitmentSettings | null,
  activePostingCount: number
): IntegrationCard[] {
  const defaultJobBoard = String((settings as any)?.general?.defaultJobBoard || '')
    .trim()
    .toLowerCase();
  const updatedDate = (settings as any)?.updatedDate as string | undefined;

  if (!defaultJobBoard) return [];

  return JOB_BOARD_CATALOG.map((board) => ({
    id: board.id,
    name: board.name,
    icon: board.icon,
    status: board.id === defaultJobBoard ? 'Connected' : 'Disconnected',
    posts: board.id === defaultJobBoard ? activePostingCount : 0,
    lastSync: board.id === defaultJobBoard ? formatLastSync(updatedDate) : 'Never',
  }));
}

export default function JobBoardsPage() {
  const [integrations, setIntegrations] = useState<IntegrationCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const [settings, activePostings] = await Promise.all([
        RecruitmentSettingsService.getSettings(),
        JobPostingService.getPostings({ isActive: true }),
      ]);

      setIntegrations(mapIntegrations(settings, activePostings.length));
    } catch (error: any) {
      console.error('Error:', error);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            Job Board Integrations
          </h1>
          <p className="text-slate-500 text-sm">
            Automatically cross-post job openings to external platforms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pb-20">
        {!loading && integrations.length === 0 && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
              No job board integrations configured
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Choose a default external job board in recruitment settings to expose a connected
              integration here.
            </p>
          </div>
        )}

        {integrations.map((board) => (
          <div
            key={board.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-lg transition-all"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
                            ${board.status === 'Connected' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
                        `}
            >
              <board.icon className="w-8 h-8" />
            </div>

            <h3 className="font-bold text-lg">{board.name}</h3>
            <div
              className={`mt-2 mb-6 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                             ${board.status === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                        `}
            >
              {board.status === 'Connected' && <CheckCircle2 className="w-3 h-3" />}
              {board.status}
            </div>

            {board.status === 'Connected' ? (
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Active Posts</span>
                  <span className="font-bold">{board.posts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Last Sync
                  </span>
                  <span className="font-bold">{board.lastSync}</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-24 mb-6 flex items-center justify-center text-sm text-slate-400 italic">
                Connect to start posting
              </div>
            )}

            <button
              onClick={() => {
                if (board.status === 'Connected') {
                  if (!confirm(`Disconnect from ${board.name}?`)) return;
                  alert(
                    `${board.name} disconnected (local-only). OAuth revocation endpoint is pending.`
                  );
                } else {
                  alert(
                    `To connect ${board.name}, configure OAuth credentials in /api/integrations once that endpoint is added.`
                  );
                }
              }}
              className={`w-full py-2 rounded-xl font-bold text-sm transition-colors border
                            ${
                              board.status === 'Connected'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600 border-transparent shadow-lg shadow-indigo-500/20'
                            }
                        `}
            >
              {board.status === 'Connected' ? 'Disconnect' : 'Connect Account'}
            </button>
          </div>
        ))}

        {integrations.length > 0 && (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
            <Globe className="w-8 h-8 mb-4 opacity-50" />
            <span className="font-bold">Compatibility View</span>
            <span className="text-xs mt-1">
              Connection state is derived from the current default job board setting.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
