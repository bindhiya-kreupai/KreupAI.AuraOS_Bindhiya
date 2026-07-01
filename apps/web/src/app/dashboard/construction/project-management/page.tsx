'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { HardHat, Calendar, CheckSquare, AlertCircle, Inbox } from 'lucide-react';
import { ProjectManagementService } from '../services';
import type { ConstructionProject } from '../types';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

interface ProjectRow {
  projectId: string;
  projectName: string;
  status: string;
  progress?: number;
  deadline?: string;
  budgetLabel?: string;
  spentLabel?: string;
}

const STATUS_STYLES: Record<string, string> = {
  delayed: 'bg-rose-100 text-rose-600',
  on_hold: 'bg-amber-100 text-amber-600',
  completed: 'bg-emerald-100 text-emerald-600',
};

function toRow(p: ConstructionProject & Record<string, unknown>): ProjectRow {
  const anyP = p as Record<string, any>;
  return {
    projectId: (anyP.projectId ?? anyP.id) as string,
    projectName: anyP.projectName ?? 'Untitled Project',
    status: anyP.status ?? 'planning',
    progress: typeof anyP.progress === 'number' ? anyP.progress : anyP.timeline?.daysElapsed,
    deadline: anyP.deadline ?? anyP.timeline?.plannedEndDate,
    budgetLabel:
      anyP.budgetLabel ?? (anyP.budget?.totalBudget ? `$${anyP.budget.totalBudget}` : undefined),
    spentLabel: anyP.spentLabel,
  };
}

export default function ProjectManagementPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    projectName: '',
    projectNumber: '',
    projectType: 'commercial',
    deadline: '',
    budgetLabel: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProjectManagementService.getAllProjects();
      setProjects((Array.isArray(data) ? data : []).map((p) => toRow(p as any)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      pushToast('error', 'Project name is required');
      return;
    }
    setSubmitting(true);
    try {
      await ProjectManagementService.createProject({
        projectName: form.projectName.trim(),
        projectNumber: form.projectNumber.trim() || `PRJ-${Date.now()}`,
        projectType: form.projectType,
        status: 'planning',
        ...(form.deadline ? { deadline: form.deadline } : {}),
        ...(form.budgetLabel ? { budgetLabel: form.budgetLabel } : {}),
      } as Partial<ConstructionProject>);
      pushToast('success', 'Project created successfully');
      setModalOpen(false);
      setForm({
        projectName: '',
        projectNumber: '',
        projectType: 'commercial',
        deadline: '',
        budgetLabel: '',
      });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading projects..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HardHat className="w-6 h-6 text-indigo-500" />
            Project Management
          </h1>
          <p className="text-slate-500 text-sm">Track construction milestones and site progress.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <CheckSquare className="w-4 h-4" /> New Project
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={() => void load()} className="ml-auto font-bold underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
          <Inbox className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-bold">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto">
        {projects.map((proj) => (
          <div
            key={proj.projectId}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{proj.projectName}</h3>
                {proj.deadline && (
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Due: {proj.deadline}
                  </div>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  STATUS_STYLES[proj.status] ?? 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {proj.status.replace(/_/g, ' ')}
              </span>
            </div>

            {typeof proj.progress === 'number' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">Progress</span>
                  <span className="text-slate-500">{proj.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${proj.status === 'delayed' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, Math.max(0, proj.progress))}%` }}
                  ></div>
                </div>
              </div>
            )}

            {(proj.budgetLabel || proj.spentLabel) && (
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <div className="text-xs text-slate-500 uppercase">Budget</div>
                  <div className="font-bold">{proj.budgetLabel ?? '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase">Spent</div>
                  <div className="font-bold">{proj.spentLabel ?? '—'}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <FormModal
        open={modalOpen}
        title="New Project"
        submitLabel="Create Project"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      >
        <Field label="Project Name">
          <input
            className={inputClass}
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
            placeholder="Skyline Tower B"
            required
          />
        </Field>
        <Field label="Project Number">
          <input
            className={inputClass}
            value={form.projectNumber}
            onChange={(e) => setForm({ ...form, projectNumber: e.target.value })}
            placeholder="Auto-generated if blank"
          />
        </Field>
        <Field label="Project Type">
          <select
            className={inputClass}
            value={form.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value })}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="renovation">Renovation</option>
            <option value="mixed_use">Mixed Use</option>
          </select>
        </Field>
        <Field label="Deadline">
          <input
            className={inputClass}
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            placeholder="Dec 2025"
          />
        </Field>
        <Field label="Budget">
          <input
            className={inputClass}
            value={form.budgetLabel}
            onChange={(e) => setForm({ ...form, budgetLabel: e.target.value })}
            placeholder="$12M"
          />
        </Field>
      </FormModal>
    </div>
  );
}
