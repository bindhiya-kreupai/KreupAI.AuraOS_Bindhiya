'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  ArrowUpRight,
  Loader2,
  X,
  Bookmark,
  Send,
} from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { JobsService } from '../services';
import { ToastContainer } from '../components/Toast';
import type { AlumniJob, JobType, JobLocation, Toast } from '../types';

interface PostJobForm {
  jobTitle: string;
  companyName: string;
  jobType: JobType;
  workLocation: JobLocation;
  locationCity: string;
  jobDescription: string;
  applicationUrl: string;
}

const EMPTY_FORM: PostJobForm = {
  jobTitle: '',
  companyName: '',
  jobType: 'full_time',
  workLocation: 'on_site',
  locationCity: '',
  jobDescription: '',
  applicationUrl: '',
};

function relativeDate(value: Date | string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

export default function AlumniJobsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [jobs, setJobs] = useState<AlumniJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState<PostJobForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [busyJob, setBusyJob] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, message }]);
  }, []);
  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await JobsService.getAllJobs();
      setJobs(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.jobTitle.trim() || !form.companyName.trim()) {
        pushToast('error', 'Job title and company name are required.');
        return;
      }
      setSubmitting(true);
      try {
        await JobsService.createJob({
          jobTitle: form.jobTitle.trim(),
          companyName: form.companyName.trim(),
          jobType: form.jobType,
          workLocation: form.workLocation,
          locationCity: form.locationCity.trim() || undefined,
          jobDescription: form.jobDescription.trim() || undefined,
          applicationUrl: form.applicationUrl.trim() || undefined,
          postedByName: user?.email,
        });
        pushToast('success', 'Job posted to the alumni network.');
        setShowPost(false);
        setForm(EMPTY_FORM);
        await load();
      } catch (err) {
        pushToast('error', err instanceof Error ? err.message : 'Failed to post job.');
      } finally {
        setSubmitting(false);
      }
    },
    [form, user?.email, pushToast, load]
  );

  const handleApply = useCallback(
    async (job: AlumniJob) => {
      if (!user?.employeeId) {
        pushToast('error', 'You must be signed in to apply.');
        return;
      }
      setBusyJob(`apply-${job.jobId}`);
      try {
        await JobsService.applyForJob(job.jobId, user.employeeId, {
          applicantEmail: user.email,
        });
        pushToast('success', `Application submitted for ${job.jobTitle}.`);
        await load();
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Failed to apply.');
      } finally {
        setBusyJob(null);
      }
    },
    [user?.employeeId, user?.email, pushToast, load]
  );

  const handleSave = useCallback(
    async (job: AlumniJob) => {
      if (!user?.employeeId) {
        pushToast('error', 'You must be signed in to save jobs.');
        return;
      }
      setBusyJob(`save-${job.jobId}`);
      try {
        await JobsService.saveJob(job.jobId, user.employeeId);
        pushToast('success', `Saved ${job.jobTitle}.`);
        await load();
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Failed to save job.');
      } finally {
        setBusyJob(null);
      }
    },
    [user?.employeeId, pushToast, load]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <ToastContainer toasts={toasts} onClose={closeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Alumni Jobs
          </h1>
          <p className="text-slate-500 text-sm">
            Exclusive opportunities shared by the alumni network.
          </p>
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4" /> Post a Job
        </button>
      </div>

      {loading || authLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => void load()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No jobs posted yet. Be the first to share an opportunity.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">
                      {job.jobTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {job.companyName}
                      </span>
                      {job.locationCity || job.workLocation ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{' '}
                          {job.locationCity || job.workLocation.replace('_', ' ')}
                        </span>
                      ) : null}
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold uppercase">
                        {job.jobType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-indigo-500">
                    {relativeDate(job.postedDate)}
                  </div>
                  {job.postedByName ? (
                    <div className="text-xs text-slate-400 mt-1">Shared by {job.postedByName}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => void handleApply(job)}
                  disabled={busyJob === `apply-${job.jobId}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
                >
                  {busyJob === `apply-${job.jobId}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}{' '}
                  Apply
                </button>
                <button
                  onClick={() => void handleSave(job)}
                  disabled={busyJob === `save-${job.jobId}`}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
                >
                  {busyJob === `save-${job.jobId}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}{' '}
                  Save
                </button>
                <span className="ml-auto text-xs text-slate-400">
                  {job.applicationCount ?? 0} applied
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPost ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg">Post a Job</h2>
              <button
                onClick={() => setShowPost(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePost} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value as JobType }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Work Location</label>
                  <select
                    value={form.workLocation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, workLocation: e.target.value as JobLocation }))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="on_site">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={form.locationCity}
                  onChange={(e) => setForm((f) => ({ ...f, locationCity: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.jobDescription}
                  onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Application URL</label>
                <input
                  type="url"
                  value={form.applicationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, applicationUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPost(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
