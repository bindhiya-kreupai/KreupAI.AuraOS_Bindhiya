'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, AlertCircle, Inbox } from 'lucide-react';
import { SiteSafetyService } from '../services';
import type { SafetyInspection, SafetyIncident } from '../types';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

export default function SiteSafetyPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [inspections, setInspections] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    incidentType: 'injury',
    severity: 'minor',
    location: '',
    description: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [insp, inc] = await Promise.all([
        SiteSafetyService.getAllInspections(),
        SiteSafetyService.getAllIncidents(),
      ]);
      setInspections(Array.isArray(insp) ? insp : []);
      setIncidents(Array.isArray(inc) ? inc : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load safety data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const incidentFreeDays = useMemo(() => {
    const dates = incidents
      .map((i) => daysSince(i.incidentDate ?? i.createdAt))
      .filter((d): d is number => d !== null);
    if (dates.length === 0) return null;
    return Math.min(...dates);
  }, [incidents]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      pushToast('error', 'Description is required');
      return;
    }
    setSubmitting(true);
    try {
      await SiteSafetyService.createIncident({
        projectId: form.projectId.trim() || 'unassigned',
        incidentType: form.incidentType as SafetyIncident['incidentType'],
        severity: form.severity as SafetyIncident['severity'],
        location: form.location.trim(),
        description: form.description.trim(),
        status: 'reported',
        incidentDate: new Date().toISOString(),
      } as Partial<SafetyIncident>);
      pushToast('success', 'Incident reported successfully');
      setModalOpen(false);
      setForm({
        projectId: '',
        incidentType: 'injury',
        severity: 'minor',
        location: '',
        description: '',
      });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading safety data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            Site Safety
          </h1>
          <p className="text-slate-500 text-sm">Monitor safety incidents and compliance audits.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" /> Report Incident
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mb-4">
            <span className="text-3xl font-bold">{incidentFreeDays ?? '—'}</span>
          </div>
          <div className="text-lg font-bold">Days Incident Free</div>
          <div className="text-sm text-slate-500">
            {incidents.length === 0
              ? 'No incidents reported'
              : `${incidents.length} incident${incidents.length === 1 ? '' : 's'} on record`}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">Recent Audits</h3>
          {!loading && inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Inbox className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-sm">No inspections recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((audit: SafetyInspection & Record<string, any>) => {
                const score = typeof audit.overallScore === 'number' ? audit.overallScore : 0;
                const passed = score >= 90;
                return (
                  <div
                    key={audit.inspectionId ?? audit.id}
                    className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <div className="font-bold text-lg">
                        {audit.siteName ?? audit.projectId ?? 'Site'}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> {audit.inspectionType ?? 'inspection'} •{' '}
                        {audit.inspector?.name ?? audit.inspectorName ?? 'Inspector'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}
                      >
                        {score}%
                      </div>
                      <div
                        className={`text-xs font-bold ${passed ? 'text-emerald-500' : 'text-amber-500'}`}
                      >
                        {passed ? 'Passed' : 'Warning'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title="Report Incident"
        submitLabel="Submit Report"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleReport}
      >
        <Field label="Project / Site ID">
          <input
            className={inputClass}
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            placeholder="e.g. Skyline Tower B"
          />
        </Field>
        <Field label="Incident Type">
          <select
            className={inputClass}
            value={form.incidentType}
            onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
          >
            <option value="injury">Injury</option>
            <option value="near_miss">Near Miss</option>
            <option value="property_damage">Property Damage</option>
            <option value="environmental">Environmental</option>
            <option value="security">Security</option>
          </select>
        </Field>
        <Field label="Severity">
          <select
            className={inputClass}
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="serious">Serious</option>
            <option value="fatal">Fatal</option>
          </select>
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Level 4, East Wing"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what happened"
            required
          />
        </Field>
      </FormModal>
    </div>
  );
}
