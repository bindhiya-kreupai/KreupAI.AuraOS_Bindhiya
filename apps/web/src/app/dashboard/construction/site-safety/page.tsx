'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, FileText, Inbox, Search, ShieldAlert } from 'lucide-react';

import { SiteSafetyService } from '../services';
import type { SafetyIncident, SafetyInspection } from '../types';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

interface IncidentRow {
  id?: string;
  incidentId?: string;
  projectId?: string;
  incidentType?: string;
  severity?: string;
  location?: string;
  description?: string;
  status?: string;
  incidentDate?: string;
  createdAt?: string;
}

interface InspectionRow {
  id?: string;
  inspectionId?: string;
  projectId?: string;
  siteName?: string;
  inspectionType?: string;
  inspectorName?: string;
  inspector?: {
    name?: string;
  };
  overallScore?: number;
  status?: string;
  createdAt?: string;
}

interface IncidentForm {
  projectId: string;
  incidentType: string;
  severity: string;
  location: string;
  description: string;
}

const initialForm: IncidentForm = {
  projectId: '',
  incidentType: 'injury',
  severity: 'minor',
  location: '',
  description: '',
};

function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

export default function SiteSafetyPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();

  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<IncidentForm>(initialForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [inspectionData, incidentData] = await Promise.all([
        SiteSafetyService.getAllInspections(),
        SiteSafetyService.getAllIncidents(),
      ]);

      setInspections(
        Array.isArray(inspectionData) ? (inspectionData as unknown as InspectionRow[]) : []
      );

      setIncidents(Array.isArray(incidentData) ? (incidentData as unknown as IncidentRow[]) : []);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load safety data';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return incidents;
    }

    return incidents.filter((incident) => {
      return (
        incident.projectId?.toLowerCase().includes(query) ||
        incident.incidentType?.toLowerCase().includes(query) ||
        incident.severity?.toLowerCase().includes(query) ||
        incident.location?.toLowerCase().includes(query) ||
        incident.description?.toLowerCase().includes(query) ||
        incident.status?.toLowerCase().includes(query)
      );
    });
  }, [incidents, searchQuery]);

  const incidentFreeDays = useMemo(() => {
    const values = incidents
      .map((incident) => daysSince(incident.incidentDate ?? incident.createdAt))
      .filter((value): value is number => value !== null);

    if (values.length === 0) {
      return null;
    }

    return Math.min(...values);
  }, [incidents]);

  const openModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModalOpen(false);
    setForm(initialForm);
  };
  const handleReport = async (event: React.FormEvent) => {
    event.preventDefault();

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
      setForm(initialForm);
      await load();
    } catch (submitError) {
      pushToast(
        'error',
        submitError instanceof Error ? submitError.message : 'Failed to report incident'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] flex-col space-y-5 pb-8 text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />

      {loading && <LoadingOverlay message="Loading safety data..." />}

      <div className="flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldAlert className="h-6 w-6 text-indigo-500" />
            Site Safety
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor safety incidents and compliance audits.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-700"
        >
          <AlertTriangle className="h-4 w-4" />
          Report Incident
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>

          <button type="button" onClick={() => void load()} className="ml-auto font-bold underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20">
            <span className="text-3xl font-bold">{incidentFreeDays ?? '—'}</span>
          </div>

          <div className="text-lg font-bold">Days Incident Free</div>

          <div className="text-sm text-slate-500">
            {incidents.length === 0
              ? 'No incidents reported'
              : `${incidents.length} incident${incidents.length === 1 ? '' : 's'} on record`}
          </div>
        </div>

        <div className="overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold">Recent Audits</h3>

          {!loading && inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Inbox className="mb-2 h-10 w-10 text-slate-300" />
              <p className="text-sm">No inspections recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((audit, index) => {
                const score = typeof audit.overallScore === 'number' ? audit.overallScore : 0;

                const passed = score >= 90;

                return (
                  <div
                    key={audit.inspectionId ?? audit.id ?? `${audit.projectId}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div>
                      <div className="text-lg font-bold">
                        {audit.siteName ?? audit.projectId ?? 'Site'}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <FileText className="h-3 w-3" />
                        {audit.inspectionType ?? 'inspection'} •{' '}
                        {audit.inspector?.name ?? audit.inspectorName ?? 'Inspector'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          passed ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {score}%
                      </div>

                      <div
                        className={`text-xs font-bold ${
                          passed ? 'text-emerald-500' : 'text-amber-500'
                        }`}
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

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search incidents by project, type, severity, location or status..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-6 dark:border-slate-800 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold">Recent Incidents</h3>

            <p className="mt-1 text-sm text-slate-500">
              Safety incidents fetched directly from the database.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">
            {filteredIncidents.length} incident
            {filteredIncidents.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-500">
            <Inbox className="mb-3 h-10 w-10 text-slate-300" />

            <div className="font-bold">
              {searchQuery ? 'No incidents match your search.' : 'No incidents reported.'}
            </div>

            {!searchQuery && (
              <div className="mt-1 text-sm text-slate-400">
                Reported safety incidents will appear here.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Project / Site</th>
                  <th className="px-6 py-4">Incident Type</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reported Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIncidents.map((incident, index) => (
                  <tr
                    key={incident.incidentId ?? incident.id ?? `${incident.projectId}-${index}`}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 font-bold">{incident.projectId || 'Unassigned'}</td>

                    <td className="px-6 py-4">{formatLabel(incident.incidentType)}</td>

                    <td className="px-6 py-4">
                      <span className={getSeverityClass(incident.severity)}>
                        {formatLabel(incident.severity)}
                      </span>
                    </td>

                    <td className="px-6 py-4">{incident.location || 'Not provided'}</td>

                    <td className="max-w-[320px] px-6 py-4">
                      <div className="truncate">{incident.description || 'No description'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={getStatusClass(incident.status)}>
                        {formatLabel(incident.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(incident.incidentDate ?? incident.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal
        open={modalOpen}
        title="Report Incident"
        submitLabel="Submit Report"
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleReport}
      >
        <Field label="Project / Site ID">
          <input
            className={inputClass}
            value={form.projectId}
            onChange={(event) =>
              setForm({
                ...form,
                projectId: event.target.value,
              })
            }
            placeholder="e.g. Skyline Tower B"
          />
        </Field>

        <Field label="Incident Type">
          <select
            className={inputClass}
            value={form.incidentType}
            onChange={(event) =>
              setForm({
                ...form,
                incidentType: event.target.value,
              })
            }
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
            onChange={(event) =>
              setForm({
                ...form,
                severity: event.target.value,
              })
            }
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
            onChange={(event) =>
              setForm({
                ...form,
                location: event.target.value,
              })
            }
            placeholder="Level 4, East Wing"
          />
        </Field>

        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            placeholder="Describe what happened"
            required
          />
        </Field>
      </FormModal>
    </div>
  );
}

function formatLabel(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString('en-GB');
}

function getSeverityClass(severity?: string): string {
  const commonClass = 'inline-flex rounded-full px-3 py-1 text-xs font-bold';

  switch (severity) {
    case 'minor':
      return `${commonClass} bg-amber-100 text-amber-700`;

    case 'moderate':
      return `${commonClass} bg-orange-100 text-orange-700`;

    case 'serious':
    case 'fatal':
      return `${commonClass} bg-rose-100 text-rose-700`;

    default:
      return `${commonClass} bg-slate-100 text-slate-600`;
  }
}

function getStatusClass(status?: string): string {
  const commonClass = 'inline-flex rounded-full px-3 py-1 text-xs font-bold';

  switch (status) {
    case 'reported':
      return `${commonClass} bg-sky-100 text-sky-700`;

    case 'investigating':
      return `${commonClass} bg-amber-100 text-amber-700`;

    case 'resolved':
    case 'closed':
      return `${commonClass} bg-emerald-100 text-emerald-700`;

    default:
      return `${commonClass} bg-slate-100 text-slate-600`;
  }
}
