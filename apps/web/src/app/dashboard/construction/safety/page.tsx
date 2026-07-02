'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HardHat,
  AlertTriangle,
  ClipboardCheck,
  Hammer,
  ShieldAlert,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { SiteSafetyService } from '../services';
import type { HazardIdentification, SafetyInspection } from '../types';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

export default function SafetyPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [hazards, setHazards] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hazardModal, setHazardModal] = useState(false);
  const [inspectionModal, setInspectionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hazardForm, setHazardForm] = useState({
    projectId: '',
    hazardType: '',
    hazardLevel: 'medium',
    location: '',
    description: '',
  });
  const [inspectionForm, setInspectionForm] = useState({
    projectId: '',
    inspectionType: 'daily',
    overallScore: '100',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, h, i] = await Promise.all([
        SiteSafetyService.getAllTrainings(),
        SiteSafetyService.getAllHazards(),
        SiteSafetyService.getAllInspections(),
      ]);
      setTrainings(Array.isArray(t) ? t : []);
      setHazards(Array.isArray(h) ? h : []);
      setInspections(Array.isArray(i) ? i : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HSE data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openHazards = useMemo(
    () => hazards.filter((h) => h.status !== 'eliminated' && h.status !== 'controlled').length,
    [hazards]
  );

  const handleReportHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardForm.hazardType.trim()) {
      pushToast('error', 'Hazard type is required');
      return;
    }
    setSubmitting(true);
    try {
      await SiteSafetyService.createHazard({
        projectId: hazardForm.projectId.trim() || 'unassigned',
        hazardType: hazardForm.hazardType.trim(),
        hazardLevel: hazardForm.hazardLevel as HazardIdentification['hazardLevel'],
        location: hazardForm.location.trim(),
        description: hazardForm.description.trim(),
        status: 'identified',
        identificationDate: new Date().toISOString(),
      } as Partial<HazardIdentification>);
      pushToast('success', 'Hazard reported successfully');
      setHazardModal(false);
      setHazardForm({
        projectId: '',
        hazardType: '',
        hazardLevel: 'medium',
        location: '',
        description: '',
      });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to report hazard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await SiteSafetyService.createInspection({
        projectId: inspectionForm.projectId.trim() || 'unassigned',
        inspectionType: inspectionForm.inspectionType as SafetyInspection['inspectionType'],
        overallScore: Number(inspectionForm.overallScore) || 0,
        status: 'in_progress',
        inspectionDate: new Date().toISOString(),
      } as Partial<SafetyInspection>);
      pushToast('success', 'Inspection started');
      setInspectionModal(false);
      setInspectionForm({ projectId: '', inspectionType: 'daily', overallScore: '100' });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to start inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSignatures = (training: any) => {
    const count = Array.isArray(training.attendees) ? training.attendees.length : 0;
    pushToast('info', `${training.trainingName ?? 'Training'}: ${count} recorded attendee(s)`);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading HSE data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HardHat className="w-6 h-6 text-orange-500" />
            Site Safety (HSE)
          </h1>
          <p className="text-slate-500 text-sm">
            Incident logs, ToolBox Talks, and PPE compliance.
          </p>
        </div>
        <button
          onClick={() => setHazardModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20"
        >
          <ShieldAlert className="w-4 h-4" /> Report Hazard
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex flex-col justify-between">
            <div className="text-4xl font-bold">{inspections.length}</div>
            <div className="text-xs opacity-80 uppercase font-bold">Inspections Logged</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{trainings.length}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Toolbox Talks</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{hazards.length}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Total Hazards</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{openHazards}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Open Hazards</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
          <h3 className="font-bold text-lg mb-2">ToolBox Talks Log</h3>
          {!loading && trainings.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500 text-center">
              No toolbox talks recorded yet.
            </div>
          ) : (
            trainings.map((talk: any) => (
              <div
                key={talk.trainingId ?? talk.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center font-bold text-orange-600">
                    <Hammer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                      {talk.trainingName ?? 'Toolbox Talk'}
                    </h3>
                    <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1">
                      {talk.trainingType ?? 'toolbox_talk'} • {talk.trainer ?? 'Foreman'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleViewSignatures(talk)}
                  className="text-xs font-bold text-indigo-500 hover:underline"
                >
                  View Signatures
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">
            Recent Inspections
          </h3>
          <div className="space-y-4">
            {inspections.slice(0, 5).map((insp: any) => {
              const score = typeof insp.overallScore === 'number' ? insp.overallScore : 0;
              return (
                <div
                  key={insp.inspectionId ?? insp.id}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {insp.inspectionType ?? 'inspection'}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      score >= 90
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {score}%
                  </span>
                </div>
              );
            })}
            {inspections.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-2">No inspections yet.</p>
            )}
          </div>
          <button
            onClick={() => setInspectionModal(true)}
            className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Start New Inspection
          </button>
        </div>
      </div>

      <FormModal
        open={hazardModal}
        title="Report Hazard"
        submitLabel="Report Hazard"
        submitting={submitting}
        onClose={() => setHazardModal(false)}
        onSubmit={handleReportHazard}
      >
        <Field label="Project / Site ID">
          <input
            className={inputClass}
            value={hazardForm.projectId}
            onChange={(e) => setHazardForm({ ...hazardForm, projectId: e.target.value })}
            placeholder="Skyline Tower"
          />
        </Field>
        <Field label="Hazard Type">
          <input
            className={inputClass}
            value={hazardForm.hazardType}
            onChange={(e) => setHazardForm({ ...hazardForm, hazardType: e.target.value })}
            placeholder="Exposed wiring"
            required
          />
        </Field>
        <Field label="Level">
          <select
            className={inputClass}
            value={hazardForm.hazardLevel}
            onChange={(e) => setHazardForm({ ...hazardForm, hazardLevel: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={hazardForm.location}
            onChange={(e) => setHazardForm({ ...hazardForm, location: e.target.value })}
            placeholder="Level 4, East Wing"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={hazardForm.description}
            onChange={(e) => setHazardForm({ ...hazardForm, description: e.target.value })}
          />
        </Field>
      </FormModal>

      <FormModal
        open={inspectionModal}
        title="Start New Inspection"
        submitLabel="Start Inspection"
        submitting={submitting}
        onClose={() => setInspectionModal(false)}
        onSubmit={handleStartInspection}
      >
        <Field label="Project / Site ID">
          <input
            className={inputClass}
            value={inspectionForm.projectId}
            onChange={(e) => setInspectionForm({ ...inspectionForm, projectId: e.target.value })}
            placeholder="Skyline Tower"
          />
        </Field>
        <Field label="Inspection Type">
          <select
            className={inputClass}
            value={inspectionForm.inspectionType}
            onChange={(e) =>
              setInspectionForm({ ...inspectionForm, inspectionType: e.target.value })
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="incident">Incident</option>
            <option value="regulatory">Regulatory</option>
          </select>
        </Field>
        <Field label="Initial Score (%)">
          <input
            className={inputClass}
            type="number"
            min={0}
            max={100}
            value={inspectionForm.overallScore}
            onChange={(e) => setInspectionForm({ ...inspectionForm, overallScore: e.target.value })}
          />
        </Field>
      </FormModal>
    </div>
  );
}
