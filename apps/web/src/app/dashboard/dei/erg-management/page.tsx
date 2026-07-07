'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, Heart, Calendar, MessageCircle, Plus, Loader2 } from 'lucide-react';
import { listErgs, createErg, joinErg, leaveErg, type DeiErg } from '../dei-api';
import { useDeiToast, DeiModal, deiInputClass } from '../dei-ui';

const CATEGORIES = [
  { value: 'gender', label: 'Gender Identity' },
  { value: 'ethnicity', label: 'Race & Ethnicity' },
  { value: 'lgbtq', label: 'LGBTQ+' },
  { value: 'disability', label: 'Disability' },
  { value: 'veterans', label: 'Veterans' },
  { value: 'parents', label: 'Parents' },
  { value: 'cultural', label: 'Cultural' },
];

const COLOR_CLASSES = [
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-slate-600',
];

export default function ErgManagementPage() {
  const [groups, setGroups] = useState<DeiErg[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'cultural', description: '' });
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setGroups(await listErgs());
    } catch {
      notify('error', 'Failed to load ERGs.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePropose = useCallback(async () => {
    if (!form.name.trim()) {
      notify('error', 'ERG name is required.');
      return;
    }
    try {
      setSubmitting(true);
      await createErg({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        colorClass: COLOR_CLASSES[groups.length % COLOR_CLASSES.length],
      });
      notify('success', 'ERG proposed.');
      setModalOpen(false);
      setForm({ name: '', category: 'cultural', description: '' });
      await load();
    } catch {
      notify('error', 'Could not propose ERG.');
    } finally {
      setSubmitting(false);
    }
  }, [form, groups.length, notify, load]);

  const toggleMembership = useCallback(
    async (erg: DeiErg) => {
      try {
        setBusyId(erg.id);
        if (erg.isMember) {
          await leaveErg(erg.id);
          notify('success', `Left ${erg.name}.`);
        } else {
          await joinErg(erg.id);
          notify('success', `Joined ${erg.name}.`);
        }
        await load();
      } catch {
        notify('error', 'Membership update failed.');
      } finally {
        setBusyId(null);
      }
    },
    [notify, load]
  );

  const categoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label || value;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            ERG Management
          </h1>
          <p className="text-slate-500 text-sm">
            Employee Resource Groups aimed at fostering community.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Propose New ERG
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500">
          No ERGs yet. Propose the first one to build community.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map((erg) => {
            const color = erg.colorClass || 'bg-indigo-500';
            return (
              <div
                key={erg.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
              >
                <div className={`h-24 ${color} p-6 flex justify-between items-start text-white`}>
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Heart className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => toggleMembership(erg)}
                    disabled={busyId === erg.id}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    {busyId === erg.id ? '…' : erg.isMember ? 'Leave Group' : 'Join Group'}
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-1">{erg.name}</h3>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-3">
                    {categoryLabel(erg.category)}
                  </div>
                  <p className="text-slate-500 text-sm mb-6 flex-1">
                    {erg.description || 'A community group for shared connection and support.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1 font-bold">
                        <Users className="w-4 h-4" /> {erg.memberCount}
                      </span>
                      {erg.nextEvent && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {erg.nextEvent}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => notify('success', `Opening chat for ${erg.name}.`)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-indigo-600 transition-colors"
                      aria-label={`Message ${erg.name}`}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeiModal
        open={modalOpen}
        title="Propose New ERG"
        submitLabel="Propose"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handlePropose}
      >
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Name
          </label>
          <input
            className={deiInputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Women in Tech"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Category
          </label>
          <select
            className={deiInputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Description
          </label>
          <textarea
            className={deiInputClass}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Purpose and goals of this group"
          />
        </div>
      </DeiModal>
    </div>
  );
}
