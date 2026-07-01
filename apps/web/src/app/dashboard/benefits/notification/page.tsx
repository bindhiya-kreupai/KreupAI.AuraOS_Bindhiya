'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Mail, AlertTriangle, CheckCircle2, Send, X, Loader2, Inbox } from 'lucide-react';
import { BenefitSettingsService, BenefitCampaignService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import type { BenefitSettings, BenefitCampaign } from '../types';

type CampaignType = 'Urgent' | 'Info';

interface CampaignDraft {
  title: string;
  type: CampaignType;
  channel: string;
  message: string;
}

const EMPTY_DRAFT: CampaignDraft = {
  title: '',
  type: 'Info',
  channel: 'Email & Push',
  message: '',
};

const QUICK_TEMPLATES = [
  {
    name: 'Enrollment Closing Soon',
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-50',
    draft: {
      title: 'Enrollment Closing Soon',
      type: 'Urgent' as CampaignType,
      channel: 'Email & Push',
      message:
        'Open enrollment closes soon. Please review and confirm your benefit elections before the deadline to avoid gaps in coverage.',
    },
  },
  {
    name: 'Plan Change Confirmation',
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-50',
    draft: {
      title: 'Plan Change Confirmation',
      type: 'Info' as CampaignType,
      channel: 'Email',
      message:
        'Your recent benefit plan change has been processed. Review the updated coverage details in your employee portal.',
    },
  },
  {
    name: 'ID Card Digital Copy',
    icon: Mail,
    color: 'text-blue-500 bg-blue-50',
    draft: {
      title: 'ID Card Digital Copy',
      type: 'Info' as CampaignType,
      channel: 'Email',
      message:
        'A digital copy of your insurance ID card is now available. Download it anytime from your benefits dashboard.',
    },
  },
];

export default function NotificationPage() {
  const [settings, setSettings] = useState<BenefitSettings | null>(null);
  const [campaigns, setCampaigns] = useState<BenefitCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<CampaignDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

  const { toasts, removeToast, success, error: toastError } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [data, campaignList] = await Promise.all([
        BenefitSettingsService.getSettings(),
        BenefitCampaignService.getCampaigns(),
      ]);
      setSettings(data);
      setCampaigns(campaignList);
    } catch (err) {
      console.error('Error:', err);
      toastError('Failed to load notification settings.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const refreshCampaigns = useCallback(async () => {
    const campaignList = await BenefitCampaignService.getCampaigns();
    setCampaigns(campaignList);
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async (
    field: 'sendEnrollmentReminders' | 'sendCoverageChangeNotifications',
    newValue: boolean
  ) => {
    if (savingField) return;
    setSavingField(field);
    try {
      const response = await BenefitSettingsService.updateSettings({ [field]: newValue });
      if (response?.success) {
        await fetchSettings();
        success('Notification setting updated.');
      } else {
        toastError('Failed to update setting.');
      }
    } catch (err) {
      console.error('Error:', err);
      toastError('Failed to update setting.');
    } finally {
      setSavingField(null);
    }
  };

  const openModal = (prefill?: CampaignDraft) => {
    setDraft(prefill ? { ...prefill } : EMPTY_DRAFT);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(EMPTY_DRAFT);
    setErrors({});
  };

  const handleSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const nextErrors: { title?: string; message?: string } = {};
    if (!draft.title.trim()) nextErrors.title = 'Title is required.';
    if (!draft.message.trim()) nextErrors.message = 'Message is required.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    try {
      const response = await BenefitCampaignService.createCampaign({
        title: draft.title.trim(),
        type: draft.type,
        channel: draft.channel.trim() || 'Email',
        message: draft.message.trim(),
      });
      if (response?.success) {
        await refreshCampaigns();
        success('Campaign queued successfully.');
        closeModal();
      } else {
        toastError('Failed to queue campaign.');
      }
    } catch (err) {
      console.error('Error:', err);
      toastError('Failed to queue campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const reminderDays = settings?.reminderDaysBefore ?? [];

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" />
            Benefit Notifications
          </h1>
          <p className="text-slate-500 text-sm">
            Send automated alerts and reminders to employees.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          <Send className="w-4 h-4" /> Create New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pb-20">
        {/* Left column: Settings + Campaigns */}
        <div className="space-y-4">
          {/* Notification Settings */}
          <div>
            <h3 className="font-bold text-slate-500 text-sm uppercase mb-2">
              Notification Settings
            </h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
                </div>
              ) : !settings ? (
                <div className="text-sm text-slate-400 py-4">
                  Notification settings are unavailable.
                </div>
              ) : (
                <>
                  {/* Enrollment reminders */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm">Enrollment Reminders</div>
                      <p className="text-xs text-slate-400">
                        Notify employees before their enrollment window closes.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.sendEnrollmentReminders}
                      disabled={savingField !== null}
                      saving={savingField === 'sendEnrollmentReminders'}
                      onChange={(v) => handleToggle('sendEnrollmentReminders', v)}
                    />
                  </div>

                  {/* Coverage change notifications */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm">Coverage Change Notifications</div>
                      <p className="text-xs text-slate-400">
                        Alert employees when their coverage is modified.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.sendCoverageChangeNotifications}
                      disabled={savingField !== null}
                      saving={savingField === 'sendCoverageChangeNotifications'}
                      onChange={(v) => handleToggle('sendCoverageChangeNotifications', v)}
                    />
                  </div>

                  {/* Reminder days before */}
                  <div>
                    <div className="font-bold text-sm mb-2">Reminder Schedule</div>
                    {reminderDays.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {reminderDays.map((d) => (
                          <span
                            key={d}
                            className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold"
                          >
                            {d} {d === 1 ? 'day' : 'days'} before
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No reminder days configured.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Campaigns */}
          <div>
            <h3 className="font-bold text-slate-500 text-sm uppercase mb-2">Campaigns</h3>
            {campaigns.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">No campaigns yet.</p>
                  <p className="text-xs text-slate-400">Create one to get started.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="mt-1 flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Create New Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        campaign.type === 'Urgent'
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      {campaign.type === 'Urgent' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">{campaign.title}</p>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-500 shrink-0">
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{campaign.channel}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{campaign.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-500 text-sm uppercase mb-2">Quick Templates</h3>
          <div className="grid grid-cols-1 gap-3">
            {QUICK_TEMPLATES.map((temp) => (
              <button
                type="button"
                key={temp.name}
                onClick={() => openModal(temp.draft)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors group text-left w-full"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${temp.color} dark:bg-slate-800`}
                >
                  <temp.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">
                  {temp.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-500" /> Create New Campaign
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCampaign} className="px-6 py-5 space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-slate-500 mb-1"
                  htmlFor="campaign-title"
                >
                  Title
                </label>
                <input
                  id="campaign-title"
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. Open Enrollment Reminder"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-bold text-slate-500 mb-1"
                    htmlFor="campaign-type"
                  >
                    Type
                  </label>
                  <select
                    id="campaign-type"
                    value={draft.type}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, type: e.target.value as CampaignType }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Info">Info</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-bold text-slate-500 mb-1"
                    htmlFor="campaign-channel"
                  >
                    Channel
                  </label>
                  <input
                    id="campaign-channel"
                    type="text"
                    value={draft.channel}
                    onChange={(e) => setDraft((d) => ({ ...d, channel: e.target.value }))}
                    placeholder="e.g. Email & Push"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-slate-500 mb-1"
                  htmlFor="campaign-message"
                >
                  Message
                </label>
                <textarea
                  id="campaign-message"
                  value={draft.message}
                  onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                  rows={4}
                  placeholder="Write the message employees will receive…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}{' '}
                  Queue Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  saving?: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSwitch({ checked, disabled, saving, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      {saving ? (
        <Loader2 className="w-3.5 h-3.5 text-white animate-spin mx-auto" />
      ) : (
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      )}
    </button>
  );
}
