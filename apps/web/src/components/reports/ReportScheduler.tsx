'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, FileText, Plus, Bell, Trash2, Loader2 } from 'lucide-react';
import { RecipientSelector } from './RecipientSelector';

interface ScheduleConfig {
  id: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'excel' | 'csv';
  recipients: string[];
  isActive: boolean;
  lastRun?: string | null;
  nextRun: string;
}

const frequencies = ['daily', 'weekly', 'monthly', 'quarterly'] as const;
const formats = ['pdf', 'excel', 'csv'] as const;

export default function ReportScheduler() {
  const [schedules, setSchedules] = useState<ScheduleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<{
    reportName: string;
    frequency: ScheduleConfig['frequency'];
    format: ScheduleConfig['format'];
    recipients: string[];
  }>({
    reportName: '',
    frequency: 'weekly',
    format: 'pdf',
    recipients: [],
  });

  const loadSchedules = useCallback(() => {
    setLoading(true);
    fetch('/api/v1/analytics/reports/schedule')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setSchedules(
            json.data.map((s: any) => ({
              id: s.id,
              reportName: s.reportName,
              frequency: s.frequency,
              format: s.format,
              recipients: Array.isArray(s.recipients) ? s.recipients : [],
              isActive: s.isActive ?? true,
              lastRun: s.lastRun,
              nextRun: s.nextRun,
            }))
          );
        } else {
          setError(json.error?.message || 'Failed to load schedules');
        }
      })
      .catch(() => setError('Failed to load schedules'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleCreate = () => {
    if (!newSchedule.reportName.trim()) {
      setError('Please enter a report name');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    fetch('/api/v1/analytics/reports/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportName: newSchedule.reportName,
        frequency: newSchedule.frequency,
        format: newSchedule.format,
        recipients: newSchedule.recipients,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setSuccess('Schedule created');
          setShowNewForm(false);
          setNewSchedule({ reportName: '', frequency: 'weekly', format: 'pdf', recipients: [] });
          loadSchedules();
        } else {
          setError(result.error?.message || result.error || 'Failed to create schedule');
        }
      })
      .catch(() => setError('Failed to create schedule'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id: string) => {
    setError(null);
    fetch(`/api/v1/analytics/reports/schedule/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setSchedules((prev) => prev.filter((s) => s.id !== id));
          setSuccess('Schedule removed');
        } else {
          setError(result.error?.message || 'Failed to remove schedule');
        }
      })
      .catch(() => setError('Failed to remove schedule'));
  };

  const getFormatIcon = (format: string) => {
    const color =
      format === 'pdf'
        ? 'text-coral-alert'
        : format === 'excel'
          ? 'text-aurora-green'
          : 'text-celestial-indigo';
    return <FileText className={`w-3.5 h-3.5 ${color}`} />;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Clock className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Report Scheduler
            </h2>
            <p className="text-sm text-silver-mist">
              Configure automated report generation and delivery
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {showNewForm && (
        <div className="mb-6 p-4 border border-celestial-indigo/20 bg-celestial-indigo/5 rounded-lg">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
            New Report Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Report Name
              </label>
              <input
                type="text"
                value={newSchedule.reportName}
                onChange={(e) => setNewSchedule({ ...newSchedule, reportName: e.target.value })}
                placeholder="Enter report name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Frequency
              </label>
              <select
                value={newSchedule.frequency}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    frequency: e.target.value as ScheduleConfig['frequency'],
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Format
              </label>
              <select
                value={newSchedule.format}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    format: e.target.value as ScheduleConfig['format'],
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                {formats.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Recipients
              </label>
              <RecipientSelector
                onEmailsChange={(emails) =>
                  setNewSchedule((prev) => ({ ...prev, recipients: emails }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Schedule
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-cloud dark:border-nebula-purple/50 rounded-lg">
          <Bell className="w-8 h-8 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No scheduled reports yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-celestial-indigo/10 rounded-lg mt-0.5">
                    <Bell className="w-4 h-4 text-celestial-indigo" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-ink-black dark:text-pearl">
                      {schedule.reportName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        {getFormatIcon(schedule.format)}
                        {schedule.format.toUpperCase()}
                      </span>
                    </div>
                    {schedule.recipients.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {schedule.recipients.map((r) => (
                          <span
                            key={r}
                            className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-nebula-purple/10 text-silver-mist rounded-full"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-silver-mist">Last: {formatDate(schedule.lastRun)}</span>
                      <span className="text-celestial-indigo">
                        Next: {formatDate(schedule.nextRun)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="p-1.5 text-silver-mist hover:text-coral-alert rounded transition-colors"
                  aria-label="Remove schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
