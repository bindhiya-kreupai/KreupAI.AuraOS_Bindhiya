/**
 * @module ReferralPortal
 * @description Submit-a-referral form with candidate details, job selection,
 *              resume upload, relationship info, and social share options
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  UserPlus,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Upload,
  CheckCircle2,
  Send,
  Copy,
  ChevronDown,
  Sparkles,
  Link,
  Mail,
  Phone,
  FileText,
  User,
  Building2,
  Clock,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface ReferralJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  mode: string;
  bonus: number;
  currency: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  openings: number;
}

export interface ReferralFormData {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateLinkedin: string;
  jobId: string;
  relationship: string;
  howLongKnown: string;
  recommendation: string;
  resumeFile: File | null;
  resumeFileName: string;
}

interface ReferralPortalProps {
  jobs: ReferralJob[];
  onSubmitReferral: (data: ReferralFormData) => void;
  referralLink?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  medium: { label: 'Medium', color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10' },
  high: { label: 'High Priority', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  critical: { label: 'Urgent', color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
};

const RELATIONSHIP_OPTIONS = [
  'Former Colleague',
  'Former Manager',
  'Friend',
  'University Classmate',
  'Industry Contact',
  'Family Member',
  'Other',
];

const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount
  );

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_REFERRAL_JOBS: ReferralJob[] = [
  {
    id: 'rj-1',
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-Time',
    mode: 'Remote',
    bonus: 2000,
    currency: 'USD',
    urgency: 'high',
    openings: 2,
  },
  {
    id: 'rj-2',
    title: 'Product Manager — AI',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-Time',
    mode: 'Hybrid',
    bonus: 2500,
    currency: 'USD',
    urgency: 'critical',
    openings: 1,
  },
  {
    id: 'rj-3',
    title: 'UX Designer',
    department: 'Design',
    location: 'London, UK',
    type: 'Full-Time',
    mode: 'Hybrid',
    bonus: 1500,
    currency: 'USD',
    urgency: 'medium',
    openings: 1,
  },
  {
    id: 'rj-4',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-Time',
    mode: 'Remote',
    bonus: 1800,
    currency: 'USD',
    urgency: 'high',
    openings: 3,
  },
  {
    id: 'rj-5',
    title: 'Data Scientist',
    department: 'Analytics',
    location: 'San Francisco, CA',
    type: 'Full-Time',
    mode: 'Onsite',
    bonus: 2200,
    currency: 'USD',
    urgency: 'medium',
    openings: 1,
  },
  {
    id: 'rj-6',
    title: 'Sales Development Rep',
    department: 'Sales',
    location: 'Austin, TX',
    type: 'Full-Time',
    mode: 'Hybrid',
    bonus: 1000,
    currency: 'USD',
    urgency: 'low',
    openings: 4,
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const ReferralPortal: React.FC<ReferralPortalProps> = ({
  jobs = MOCK_REFERRAL_JOBS,
  onSubmitReferral,
  referralLink = 'https://careers.aura.io/refer/emp-1234',
}) => {
  const [step, setStep] = useState<'select-job' | 'form' | 'success'>('select-job');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<ReferralFormData>({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateLinkedin: '',
    jobId: '',
    relationship: '',
    howLongKnown: '',
    recommendation: '',
    resumeFile: null,
    resumeFileName: '',
  });

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  const handleSelectJob = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    setForm((prev) => ({ ...prev, jobId }));
    setStep('form');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, resumeFile: file, resumeFileName: file.name }));
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const handleSubmit = useCallback(() => {
    onSubmitReferral(form);
    setStep('success');
  }, [form, onSubmitReferral]);

  const isFormValid = form.candidateName.trim() && form.candidateEmail.trim() && form.relationship;

  // ── Success View ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-neural-mint/30 bg-neural-mint/5 p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neural-mint/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-neural-mint" />
          </div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">Referral Submitted!</p>
          <p className="text-[10px] text-silver-mist max-w-sm mx-auto">
            Thank you for referring <strong>{form.candidateName}</strong> for the{' '}
            <strong>{selectedJob?.title}</strong> position. We&apos;ll keep you updated on their
            progress.
          </p>
          {selectedJob && (
            <div className="flex items-center justify-center gap-1 text-[10px]">
              <DollarSign className="w-3 h-3 text-neural-mint" />
              <span className="font-bold text-neural-mint">
                {formatCurrency(selectedJob.bonus, selectedJob.currency)} bonus
              </span>
              <span className="text-silver-mist">if hired</span>
            </div>
          )}
          <button
            onClick={() => {
              setStep('select-job');
              setSelectedJobId(null);
              setForm({
                candidateName: '',
                candidateEmail: '',
                candidatePhone: '',
                candidateLinkedin: '',
                jobId: '',
                relationship: '',
                howLongKnown: '',
                recommendation: '',
                resumeFile: null,
                resumeFileName: '',
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 mx-auto rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-3 h-3" /> Refer Another
          </button>
        </div>
      </div>
    );
  }

  // ── Form View ────────────────────────────────────────────────────────────

  if (step === 'form' && selectedJob) {
    return (
      <div className="space-y-4">
        {/* Back + Selected Job */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('select-job')}
            className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            <ChevronDown className="w-3 h-3 rotate-90" /> Change Job
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
            <Briefcase className="w-3 h-3 text-celestial-indigo" />
            <span className="text-[10px] font-bold text-ink-black dark:text-pearl">
              {selectedJob.title}
            </span>
            <span className="text-[9px] text-neural-mint font-bold">
              {formatCurrency(selectedJob.bonus, selectedJob.currency)} bonus
            </span>
          </div>
        </div>

        {/* Candidate Details */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <User className="w-4 h-4 text-celestial-indigo" />
            Candidate Details
          </p>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              label="Full Name"
              required
              icon={User}
              value={form.candidateName}
              onChange={(v) => setForm((prev) => ({ ...prev, candidateName: v }))}
              placeholder="John Doe"
            />
            <FormField
              label="Email"
              required
              icon={Mail}
              value={form.candidateEmail}
              onChange={(v) => setForm((prev) => ({ ...prev, candidateEmail: v }))}
              placeholder="john@example.com"
              type="email"
            />
            <FormField
              label="Phone"
              icon={Phone}
              value={form.candidatePhone}
              onChange={(v) => setForm((prev) => ({ ...prev, candidatePhone: v }))}
              placeholder="+1 (555) 123-4567"
            />
            <FormField
              label="LinkedIn"
              icon={Link}
              value={form.candidateLinkedin}
              onChange={(v) => setForm((prev) => ({ ...prev, candidateLinkedin: v }))}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <p className="text-[9px] font-bold text-silver-mist mb-1">Resume (Optional)</p>
            {form.resumeFileName ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10">
                <FileText className="w-3.5 h-3.5 text-celestial-indigo" />
                <span className="text-[10px] font-semibold text-ink-black dark:text-pearl flex-1">
                  {form.resumeFileName}
                </span>
                <button
                  onClick={() =>
                    setForm((prev) => ({ ...prev, resumeFile: null, resumeFileName: '' }))
                  }
                  className="text-[9px] text-coral-alert"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-lg p-3 flex items-center justify-center gap-2 text-silver-mist hover:text-celestial-indigo hover:border-celestial-indigo/30 transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Upload PDF, DOCX, or TXT</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Relationship Info */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-celestial-indigo" />
            Your Connection
          </p>

          <div>
            <p className="text-[9px] font-bold text-silver-mist mb-1">Relationship *</p>
            <div className="flex flex-wrap gap-1">
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <button
                  key={rel}
                  onClick={() => setForm((prev) => ({ ...prev, relationship: rel }))}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold border transition-colors ${
                    form.relationship === rel
                      ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                      : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="How long have you known them?"
            icon={Clock}
            value={form.howLongKnown}
            onChange={(v) => setForm((prev) => ({ ...prev, howLongKnown: v }))}
            placeholder="e.g. 3 years"
          />

          <div>
            <p className="text-[9px] font-bold text-silver-mist mb-1">Why do you recommend them?</p>
            <textarea
              value={form.recommendation}
              onChange={(e) => setForm((prev) => ({ ...prev, recommendation: e.target.value }))}
              placeholder="Share why this person would be a great fit..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-pearl/30 dark:bg-deep-cosmos/10 text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" /> Submit Referral
          </button>
          <button
            onClick={() => setStep('select-job')}
            className="px-3 py-2 rounded-lg text-[11px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Job Selection View ───────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Share Link */}
      <div className="rounded-xl border border-celestial-indigo/20 bg-celestial-indigo/5 p-3 flex items-center gap-3">
        <Link className="w-4 h-4 text-celestial-indigo shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-ink-black dark:text-pearl">Your Referral Link</p>
          <p className="text-[9px] text-silver-mist truncate">{referralLink}</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors shrink-0"
        >
          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search open positions..."
          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
        />
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredJobs.map((job) => {
          const urgCfg = URGENCY_CONFIG[job.urgency] || URGENCY_CONFIG.low;
          return (
            <div
              key={job.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3 hover:border-celestial-indigo/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                    {job.title}
                  </p>
                  <div className="flex items-center gap-2 text-[8px] text-silver-mist mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Building2 className="w-2.5 h-2.5" /> {job.department}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {job.location}
                    </span>
                  </div>
                </div>
                {(job.urgency === 'high' || job.urgency === 'critical') && (
                  <span
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold ${urgCfg.bg} ${urgCfg.color} shrink-0`}
                  >
                    {job.urgency === 'critical' && <Sparkles className="w-2.5 h-2.5" />}
                    {urgCfg.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] text-silver-mist">{job.type}</span>
                <span className="text-[8px] text-silver-mist">·</span>
                <span className="text-[8px] text-silver-mist">{job.mode}</span>
                <span className="text-[8px] text-silver-mist">·</span>
                <span className="text-[8px] text-silver-mist">
                  {job.openings} opening{job.openings !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neural-mint/10 border border-neural-mint/20">
                  <DollarSign className="w-3 h-3 text-neural-mint" />
                  <span className="text-[9px] font-bold text-neural-mint">
                    {formatCurrency(job.bonus, job.currency)} bonus
                  </span>
                </div>
                <button
                  onClick={() => handleSelectJob(job.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-3 h-3" /> Refer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-6">
          <Briefcase className="w-5 h-5 text-silver-mist/20 mx-auto mb-2" />
          <p className="text-[10px] text-silver-mist">No positions match your search</p>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const FormField: React.FC<{
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}> = ({ label, icon: Icon, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <p className="text-[9px] font-bold text-silver-mist mb-1">
      {label} {required && <span className="text-coral-alert">*</span>}
    </p>
    <div className="relative">
      <Icon className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-pearl/30 dark:bg-deep-cosmos/10 text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
      />
    </div>
  </div>
);

export default ReferralPortal;
