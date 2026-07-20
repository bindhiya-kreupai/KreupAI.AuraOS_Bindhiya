'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Loader2, Bell, CheckCircle2, XCircle } from 'lucide-react';
import { WorkflowSettingsService } from '../services';
import { toast } from 'sonner';
import type { WorkflowSettings } from '../types';

interface NotificationSetting {
  key: keyof WorkflowSettings;
  label: string;
  description: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'enableNotifications',
    label: 'Enable Notifications',
    description: 'Master toggle for all workflow notifications',
  },
  {
    key: 'notifyOnApprovalRequest',
    label: 'Approval Request',
    description: 'Notify when an approval task is assigned',
  },
  {
    key: 'notifyOnApprovalDecision',
    label: 'Approval Decision',
    description: 'Notify when an approval is approved or rejected',
  },
  {
    key: 'notifyOnTaskAssignment',
    label: 'Task Assignment',
    description: 'Notify when a task is assigned to a user',
  },
  {
    key: 'notifyOnWorkflowCompletion',
    label: 'Workflow Completion',
    description: 'Notify when a workflow completes successfully',
  },
  {
    key: 'notifyOnWorkflowFailure',
    label: 'Workflow Failure',
    description: 'Notify when a workflow fails or is rejected',
  },
];

export default function EmailNotificationsPage() {
  const [settings, setSettings] = useState<WorkflowSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await WorkflowSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Failed to load notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof WorkflowSettings) => {
    if (!settings) return;
    const newValue = !settings[key];
    const updated = { ...settings, [key]: newValue };
    setSettings(updated);
    setSaving(true);
    try {
      await WorkflowSettingsService.updateSettings({ [key]: newValue });
      toast.success(`Notification ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      setSettings(settings);
      toast.error(error?.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-purple-500" />
            Email Notifications
          </h1>
          <p className="text-slate-500 text-sm">
            Configure which notifications are sent for workflow events.
          </p>
        </div>
      </div>

      {!settings ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">Failed to Load Settings</h3>
          <p className="text-sm text-slate-400">
            Could not load notification settings. Please try refreshing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {NOTIFICATION_SETTINGS.map((setting) => {
            const isEnabled = !!settings[setting.key];
            return (
              <div
                key={setting.key}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    {isEnabled ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{setting.label}</h3>
                    <p className="text-xs text-slate-500">{setting.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setting.key)}
                  disabled={saving}
                  className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors disabled:opacity-50 ${isEnabled ? 'bg-purple-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            );
          })}

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-sm">Additional Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Audit Log</span>
                <span
                  className={`font-bold ${settings.enableAuditLog ? 'text-emerald-500' : 'text-slate-400'}`}
                >
                  {settings.enableAuditLog ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Retention</span>
                <span className="font-bold">{settings.dataRetentionDays} days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
