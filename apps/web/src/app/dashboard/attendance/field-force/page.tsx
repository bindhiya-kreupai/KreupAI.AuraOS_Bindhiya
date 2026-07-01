'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  Map,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FieldForceService } from '../services';

interface FieldAgent {
  id: number;
  name: string;
  role: string;
  status: 'Active' | 'Idle' | 'Offline';
  location: string;
  lastSeen: string;
  visits: number;
  distance: string;
  battery: string;
  avatar: string;
  lat: number;
  lng: number;
}

interface VisitLog {
  id: number;
  agent: string;
  client: string;
  type: string;
  time: string;
  status: string;
  notes: string;
  outcome: string;
}

interface BeatPlan {
  id: string;
  agentName: string;
  date: string;
  stops: string[];
  notes?: string;
}

export default function FieldForcePage() {
  const [agents, setAgents] = useState<FieldAgent[]>([]);
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [beatPlans, setBeatPlans] = useState<BeatPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<FieldAgent | null>(null);
  const [search, setSearch] = useState('');
  const [info, setInfo] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(
    null
  );
  const [beatModalOpen, setBeatModalOpen] = useState(false);
  const [savingBeat, setSavingBeat] = useState(false);

  useEffect(() => {
    fetchFieldData();
  }, []);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(null), 5000);
    return () => clearTimeout(t);
  }, [info]);

  const fetchFieldData = async () => {
    try {
      setLoading(true);
      const [agentsResult, visitsResult, beatsResult] = await Promise.all([
        FieldForceService.getFieldAgents(),
        FieldForceService.getVisitLogs(),
        FieldForceService.getBeatPlans(),
      ]);
      setAgents((agentsResult || []) as any);
      setVisitLogs((visitsResult || []) as any);
      setBeatPlans(beatsResult || []);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q)
    );
  });

  const handlePlanBeat = () => {
    if (!selectedAgent) {
      setInfo({ kind: 'info', text: 'Select an agent on the left to plan their beat.' });
      return;
    }
    setBeatModalOpen(true);
  };

  const handleSaveBeat = async (payload: { date: string; stops: string[]; notes: string }) => {
    if (!selectedAgent) return;
    setSavingBeat(true);
    try {
      await FieldForceService.saveBeatPlan({
        agentId: String(selectedAgent.id),
        agentName: selectedAgent.name,
        date: payload.date,
        stops: payload.stops,
        notes: payload.notes,
      });
      setBeatModalOpen(false);
      await fetchFieldData();
      setInfo({
        kind: 'success',
        text: `Beat saved for ${selectedAgent.name}: ${payload.stops.join(' → ')}.`,
      });
    } catch (error: any) {
      console.error('Error:', error);
      setInfo({ kind: 'error', text: error?.message || 'Failed to save beat plan.' });
    } finally {
      setSavingBeat(false);
    }
  };

  const handleDownloadReport = () => {
    if (visitLogs.length === 0) {
      setInfo({ kind: 'info', text: 'No visits to export.' });
      return;
    }
    const header = ['Time', 'Agent', 'Client', 'Type', 'Status', 'Outcome', 'Notes'];
    const rows = visitLogs.map((l) => [
      l.time,
      l.agent,
      l.client,
      l.type,
      l.status,
      l.outcome,
      (l.notes || '').replace(/"/g, '""'),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? '')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-500" />
            Field Force Trek
          </h1>
          <p className="text-silver-mist text-sm">
            Real-time tracking of field agents, beats, and client visits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePlanBeat}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Navigation className="w-4 h-4" /> Plan Beat
          </button>
        </div>
      </div>

      {info && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm shrink-0 ${
            info.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : info.kind === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
                : 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-200'
          }`}
        >
          {info.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Left: Agent List & Filters */}
        <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
          {/* Search & Filter */}
          <div className="relative shrink-0">
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Agents List */}
          <div className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-slate-500">Loading agents...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {agents.length === 0 ? 'No field agents found' : 'No matches'}
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                                    ${
                                      selectedAgent?.id === agent.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500/30'
                                        : 'bg-white dark:bg-slate-900/40 border-cloud dark:border-slate-800 hover:border-indigo-300'
                                    }
                                `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                          {agent.avatar}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 
                                                ${
                                                  agent.status === 'Active'
                                                    ? 'bg-emerald-500'
                                                    : agent.status === 'Idle'
                                                      ? 'bg-amber-500'
                                                      : 'bg-slate-400'
                                                }
                                            `}
                        ></span>
                      </div>
                      <div>
                        <div className="font-bold text-ink-black dark:text-pearl text-sm">
                          {agent.name}
                        </div>
                        <div className="text-xs text-silver-mist">{agent.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-500">{agent.distance}</div>
                      <div className="text-[10px] text-silver-mist">Traveled</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pl-[3.25rem]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[150px]">{agent.location}</span>
                    <span className="text-slate-300">•</span>
                    <span>{agent.lastSeen}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Planned Beats & Activity Feed */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-full overflow-hidden">
          {/* Planned Beats — real persisted beat plans from FieldForceService */}
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-500" /> Planned Beats
              </h3>
              <span className="text-xs text-silver-mist">{beatPlans.length} plan(s)</span>
            </div>
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : beatPlans.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                No beats planned yet. Select an agent and click{' '}
                <span className="font-bold">Plan Beat</span>.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {beatPlans.map((beat) => (
                  <div
                    key={beat.id}
                    className="p-3 border border-cloud dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-ink-black dark:text-pearl">
                        {beat.agentName}
                      </span>
                      <span className="text-xs text-silver-mist flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {beat.date}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                      {beat.stops.map((stop, idx) => (
                        <React.Fragment key={`${beat.id}-${idx}`}>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700">
                            {stop}
                          </span>
                          {idx < beat.stops.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    {beat.notes && (
                      <p className="text-xs text-silver-mist italic mt-1">{beat.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visit Logs */}
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Today's Activity Log
              </h3>
              <button
                onClick={handleDownloadReport}
                className="text-xs font-bold text-indigo-500 hover:underline"
              >
                Download Report
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : visitLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No visit logs for today</div>
              ) : (
                visitLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-3 p-4 border border-cloud dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-800">
                        {log.time}
                      </div>
                      <div className="w-0.5 h-full bg-cloud dark:bg-slate-700"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-ink-black dark:text-pearl">{log.client}</h4>
                          <div className="text-xs text-silver-mist">
                            {log.type} • {log.agent}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded 
                                                ${
                                                  log.status === 'Completed'
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                                                }
                                            `}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded border border-dashed border-cloud dark:border-slate-800 mt-2">
                        "{log.notes}"
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Outcome: {log.outcome}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {beatModalOpen && selectedAgent && (
        <BeatPlanModal
          agentName={selectedAgent.name}
          saving={savingBeat}
          onClose={() => setBeatModalOpen(false)}
          onSave={handleSaveBeat}
        />
      )}
    </div>
  );
}

function BeatPlanModal({
  agentName,
  saving,
  onClose,
  onSave,
}: {
  agentName: string;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: { date: string; stops: string[]; notes: string }) => void;
}) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [stopsText, setStopsText] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stops = stopsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!date) {
      setError('Please choose a date for the beat.');
      return;
    }
    if (stops.length === 0) {
      setError('Enter at least one stop (comma-separated).');
      return;
    }
    setError(null);
    onSave({ date, stops, notes: notes.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cloud dark:border-nebula-purple/30">
          <h3 className="font-bold flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-500" /> Plan Beat · {agentName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 text-sm">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-3 py-2 text-xs text-rose-800 dark:text-rose-200">
              {error}
            </div>
          )}
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">
              Stops (comma-separated)
            </span>
            <textarea
              rows={3}
              value={stopsText}
              onChange={(e) => setStopsText(e.target.value)}
              placeholder="Client A, Client B, Warehouse C"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg focus:outline-none resize-none"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">
              Notes (optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Route or priority notes"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save Beat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
