/**
 * @module InternalApplicationForm
 * @description ESS Internal Application — apply flow for internal job openings
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  Briefcase,
  MapPin,
  Building2,
  CheckCircle2,
  Loader2,
  FileText,
  AlertTriangle,
  Star,
  Info,
  Upload,
  X,
} from 'lucide-react';
import type { InternalJob } from './InternalJobMarketplace';

// ── Props ──────────────────────────────────────────────────────────────────────

interface InternalApplicationFormProps {
  job: InternalJob;
  onBack: () => void;
  onSubmitted: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const InternalApplicationForm: React.FC<InternalApplicationFormProps> = ({
  job,
  onBack,
  onSubmitted,
}) => {
  const [motivation, setMotivation] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [managerAware, setManagerAware] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const canSubmit = motivation.trim().length >= 20 && relevantExperience.trim().length >= 20;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setApplicationId(`APP-${Date.now()}`);
    setSubmitted(true);
    setSubmitting(false);
  }, [canSubmit]);

  // ── Success State ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="space-y-5">
        <button
          onClick={onSubmitted}
          className="flex items-center gap-1.5 text-xs text-silver-mist hover:text-twilight dark:hover:text-pearl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Job Marketplace
        </button>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-neural-mint/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-neural-mint" />
          </div>
          <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">
            Application Submitted!
          </h3>
          <p className="text-sm text-silver-mist mb-1">{job.title}</p>
          <p className="text-xs text-silver-mist/70 mb-6">
            Reference:{' '}
            <span className="font-mono font-semibold text-celestial-indigo">{applicationId}</span>
          </p>

          <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-4 max-w-md">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-celestial-indigo mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                  What Happens Next
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-silver-mist">
                  <li>The hiring manager ({job.hiringManager}) will review your application.</li>
                  <li>You&apos;ll be notified of next steps within 5 business days.</li>
                  <li>Your current manager may be contacted for endorsement.</li>
                  <li>You can track your application status in your career dashboard.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Application Form ───────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-silver-mist hover:text-twilight dark:hover:text-pearl transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Listings
      </button>

      {/* Job Summary Card */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl">{job.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-silver-mist">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {job.level}
              </span>
            </div>
            <p className="text-xs text-silver-mist mt-2">{job.description}</p>
          </div>
          {job.matchScore && (
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-quantum-rose/10 text-quantum-rose text-[10px] font-bold">
              <Star className="w-3 h-3 fill-current" />
              {job.matchScore}%
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="mt-3 pt-3 border-t border-cloud/50 dark:border-nebula-purple/20">
          <p className="text-[10px] text-silver-mist font-semibold uppercase tracking-wider mb-1.5">
            Requirements
          </p>
          <ul className="space-y-1">
            {job.requirements.map((req, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[11px] text-ink-black dark:text-pearl"
              >
                <CheckCircle2 className="w-3 h-3 text-neural-mint mt-0.5 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-5 space-y-4">
        <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <FileText className="w-4 h-4 text-celestial-indigo" />
          Your Application
        </h4>

        {/* Motivation */}
        <div>
          <label className="text-[10px] text-silver-mist font-medium">
            Why are you interested in this role? *
          </label>
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={4}
            placeholder="Describe why this role interests you and how it aligns with your career goals..."
            className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
          />
          <p className="text-[9px] text-silver-mist mt-0.5">
            {motivation.length}/500 characters (min 20)
          </p>
        </div>

        {/* Relevant Experience */}
        <div>
          <label className="text-[10px] text-silver-mist font-medium">
            Relevant Experience & Skills *
          </label>
          <textarea
            value={relevantExperience}
            onChange={(e) => setRelevantExperience(e.target.value)}
            rows={4}
            placeholder="Highlight your experience, skills, and achievements relevant to this position..."
            className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
          />
          <p className="text-[9px] text-silver-mist mt-0.5">
            {relevantExperience.length}/500 characters (min 20)
          </p>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="text-[10px] text-silver-mist font-medium">
            Additional Notes (optional)
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={2}
            placeholder="Anything else you'd like the hiring manager to know..."
            className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
          />
        </div>

        {/* Resume upload */}
        <div>
          <label className="text-[10px] text-silver-mist font-medium">
            Updated Resume (optional)
          </label>
          {resumeFile ? (
            <div className="mt-0.5 flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-pearl/30 dark:bg-deep-cosmos/20">
              <FileText className="w-4 h-4 text-celestial-indigo shrink-0" />
              <span className="text-xs text-ink-black dark:text-pearl flex-1 truncate">
                {resumeFile.name}
              </span>
              <button
                onClick={() => setResumeFile(null)}
                className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos"
              >
                <X className="w-3.5 h-3.5 text-silver-mist" />
              </button>
            </div>
          ) : (
            <label className="mt-0.5 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-cloud dark:border-nebula-purple/30 cursor-pointer hover:border-celestial-indigo/50 transition-colors">
              <Upload className="w-4 h-4 text-silver-mist" />
              <span className="text-xs text-silver-mist">Upload PDF or DOCX</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setResumeFile(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {/* Manager awareness */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setManagerAware(!managerAware)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
              managerAware
                ? 'border-celestial-indigo bg-celestial-indigo'
                : 'border-cloud dark:border-nebula-purple/30'
            }`}
          >
            {managerAware && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <span className="text-xs text-ink-black dark:text-pearl">
            My current manager is aware of this application
          </span>
        </label>

        {!managerAware && (
          <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-sunset-amber mt-0.5 shrink-0" />
            <p className="text-[10px] text-silver-mist">
              Your manager may be contacted as part of the internal transfer process. We recommend
              discussing your interest beforehand.
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InternalApplicationForm;
