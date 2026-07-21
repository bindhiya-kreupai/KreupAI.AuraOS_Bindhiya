'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Map, Compass, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { CareerAspirationService } from '../services';
import type { CareerAspiration } from '../types';

const DEPARTMENTS = ['Product', 'Engineering', 'Design', 'Marketing', 'Sales', 'Data Science'];
const RELOCATE_OPTIONS = [
  'Yes, globally',
  'Yes, within country',
  'No, prefer current location',
  'Remote only',
];

interface AspirationState {
  primaryPath: 'individual_contributor' | 'people_management';
  relocate: string;
  departments: string[];
  vision: string;
}

const DEFAULT_STATE: AspirationState = {
  primaryPath: 'individual_contributor',
  relocate: RELOCATE_OPTIONS[1],
  departments: [],
  vision: '',
};

export default function AspirationsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [aspiration, setAspiration] = useState<CareerAspiration | null>(null);
  const [state, setState] = useState<AspirationState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const list = await CareerAspirationService.getAspirationsByEmployeeId(user.employeeId);
      const existing = Array.isArray(list) && list.length > 0 ? list[0] : null;
      setAspiration(existing);
      if (existing) {
        const meta = (existing as unknown as Record<string, unknown>).preferences as
          | Partial<AspirationState>
          | undefined;
        setState({
          primaryPath: meta?.primaryPath ?? DEFAULT_STATE.primaryPath,
          relocate: meta?.relocate ?? DEFAULT_STATE.relocate,
          departments: existing.relatedOpportunities ?? meta?.departments ?? [],
          vision: existing.description ?? '',
        });
      }
    } catch (error) {
      console.error('Failed to load aspirations', error);
      toast.error('Failed to load career aspirations');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const toggleDepartment = useCallback((dept: string) => {
    setState((s) => {
      const has = s.departments.includes(dept);
      if (has) return { ...s, departments: s.departments.filter((d) => d !== dept) };
      if (s.departments.length >= 3) {
        toast.info('You can select up to 3 departments');
        return s;
      }
      return { ...s, departments: [...s.departments, dept] };
    });
  }, []);

  const aiSuggestion = useMemo(() => {
    if (state.primaryPath === 'people_management') {
      return 'Based on your leadership focus, consider the "Engineering Leadership 101" course and a mentorship session with a senior manager.';
    }
    return 'Based on your IC focus, consider deepening a specialization and requesting a technical mentorship with a Principal Engineer.';
  }, [state.primaryPath]);

  const handleSave = useCallback(async () => {
    if (!user?.employeeId) return;
    setSaving(true);
    try {
      const payload: Partial<CareerAspiration> = {
        employeeId: user.employeeId,
        aspirationType: 'role',
        aspirationTitle: '5-Year Career Vision',
        description: state.vision,
        timeframe: '5_years',
        relatedOpportunities: state.departments,
        isSharedWithManager: false,
        status: 'planning',
        desiredSkills: [],
        desiredExperience: [],
        inspirations: [],
        barriers: [],
        supportNeeded: [],
        pathwayRecommendations: [],
        ...({
          preferences: { primaryPath: state.primaryPath, relocate: state.relocate },
        } as object),
      };

      if (aspiration?.aspirationId) {
        await CareerAspirationService.updateAspiration(aspiration.aspirationId, payload);
      } else {
        await CareerAspirationService.createAspiration(payload);
      }
      toast.success('Aspirations saved');
      await load();
    } catch (error) {
      console.error('Failed to save aspirations', error);
      toast.error('Failed to save aspirations');
    } finally {
      setSaving(false);
    }
  }, [aspiration?.aspirationId, state, user?.employeeId, load]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Career Aspirations
          </h1>
          <p className="text-slate-500 text-sm">Define your long-term vision and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{' '}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" /> Direction
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Primary Career Path Interest
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setState((s) => ({ ...s, primaryPath: 'individual_contributor' }))
                    }
                    className={`p-4 rounded-xl text-left transition-colors ${
                      state.primaryPath === 'individual_contributor'
                        ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      Individual Contributor
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Specialized technical focus</div>
                  </button>
                  <button
                    onClick={() => setState((s) => ({ ...s, primaryPath: 'people_management' }))}
                    className={`p-4 rounded-xl text-left transition-colors ${
                      state.primaryPath === 'people_management'
                        ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      People Management
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Leadership and team growth</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Willingness to Relocate
                </label>
                <select
                  value={state.relocate}
                  onChange={(e) => setState((s) => ({ ...s, relocate: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {RELOCATE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Interested Departments (Select top 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => {
                    const active = state.departments.includes(dept);
                    return (
                      <button
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-500'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Map className="w-5 h-5 text-rose-500" /> 5-Year Vision
            </h3>

            <div className="space-y-4">
              <textarea
                value={state.vision}
                onChange={(e) => setState((s) => ({ ...s, vision: e.target.value }))}
                className="w-full h-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe where you see yourself in 5 years..."
              />

              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl">
                <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-sm mb-2">
                  AI Coach Suggestion
                </h4>
                <p className="text-sm text-indigo-600/80">{aiSuggestion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
