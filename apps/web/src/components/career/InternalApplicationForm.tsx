"use client";

import React, { useState } from 'react';
import { Send, Upload, FileText } from 'lucide-react';

interface ApplicationFormData {
  coverLetter: string;
  yearsExperience: string;
  noticePeriod: string;
  managerAware: boolean;
  resumeUploaded: boolean;
}

export function InternalApplicationForm() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    yearsExperience: '',
    noticePeriod: '2 weeks',
    managerAware: false,
    resumeUploaded: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="font-bold text-ink-black dark:text-pearl mb-2">Application Submitted</h3>
        <p className="text-sm text-silver-mist">Your internal application has been received. The hiring manager will review it shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 space-y-4">
      <h3 className="font-bold text-ink-black dark:text-pearl">Apply for Position</h3>

      <div>
        <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Why are you interested? *</label>
        <textarea
          required
          rows={4}
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          placeholder="Share why you're a great fit for this role..."
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl placeholder:text-silver-mist outline-none focus:border-celestial-indigo resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Relevant Experience</label>
          <input
            type="text"
            value={formData.yearsExperience}
            onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
            placeholder="e.g., 5 years"
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl placeholder:text-silver-mist outline-none focus:border-celestial-indigo"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Notice Period</label>
          <select
            value={formData.noticePeriod}
            onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none"
          >
            <option>Immediate</option>
            <option>2 weeks</option>
            <option>1 month</option>
            <option>2 months</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-silver-mist uppercase mb-2 block">Updated Resume</label>
        <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-lg p-4 text-center hover:border-celestial-indigo/50 transition-colors cursor-pointer">
          {formData.resumeUploaded ? (
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-500">
              <FileText className="w-4 h-4" />
              <span>resume_updated.pdf uploaded</span>
            </div>
          ) : (
            <div className="text-silver-mist">
              <Upload className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs">Click to upload or drag & drop</p>
            </div>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.managerAware}
          onChange={(e) => setFormData({ ...formData, managerAware: e.target.checked })}
          className="w-4 h-4 rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo"
        />
        <span className="text-xs text-ink-black dark:text-pearl">My current manager is aware of this application</span>
      </label>

      <button
        type="submit"
        className="w-full py-2.5 bg-celestial-indigo text-white text-sm font-medium rounded-lg hover:bg-celestial-indigo/90 transition-colors"
      >
        Submit Application
      </button>
    </form>
  );
}
