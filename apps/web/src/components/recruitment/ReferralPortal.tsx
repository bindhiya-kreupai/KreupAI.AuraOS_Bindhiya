"use client";

import React, { useState } from "react";
import { UserPlus, Upload, Clock, CheckCircle, XCircle, Award } from "lucide-react";

type ReferralStatus = "pending" | "reviewing" | "interviewed" | "hired" | "rejected";

interface Referral {
  id: string;
  candidateName: string;
  email: string;
  position: string;
  relationship: string;
  status: ReferralStatus;
  submittedDate: string;
  bonus?: string;
}

const mockReferrals: Referral[] = [
  {
    id: "1",
    candidateName: "David Wilson",
    email: "david.wilson@email.com",
    position: "Backend Engineer",
    relationship: "Former Colleague",
    status: "hired",
    submittedDate: "Dec 15, 2025",
    bonus: "$5,000",
  },
  {
    id: "2",
    candidateName: "Maria Garcia",
    email: "maria.garcia@email.com",
    position: "Product Designer",
    relationship: "University Friend",
    status: "interviewed",
    submittedDate: "Jan 5, 2026",
  },
  {
    id: "3",
    candidateName: "James Lee",
    email: "james.lee@email.com",
    position: "DevOps Engineer",
    relationship: "Professional Network",
    status: "reviewing",
    submittedDate: "Jan 15, 2026",
  },
  {
    id: "4",
    candidateName: "Anna Kim",
    email: "anna.kim@email.com",
    position: "Frontend Engineer",
    relationship: "Former Team Member",
    status: "pending",
    submittedDate: "Jan 20, 2026",
  },
];

const statusStyles: Record<ReferralStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" },
  reviewing: { label: "Reviewing", classes: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" },
  interviewed: { label: "Interviewed", classes: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" },
  hired: { label: "Hired", classes: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" },
  rejected: { label: "Rejected", classes: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" },
};

export default function ReferralPortal() {
  const [formData, setFormData] = useState({
    candidateName: "",
    email: "",
    position: "",
    relationship: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Referral Portal</h2>
      </div>

      {/* Submit Form */}
      <div className="mb-6 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">Submit a Referral</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-silver-mist mb-1 block">Candidate Name</label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
            />
          </div>
          <div>
            <label className="text-xs text-silver-mist mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="candidate@email.com"
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
            />
          </div>
          <div>
            <label className="text-xs text-silver-mist mb-1 block">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Job title"
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
            />
          </div>
          <div>
            <label className="text-xs text-silver-mist mb-1 block">Relationship</label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl focus:outline-none focus:border-celestial-indigo"
            >
              <option value="">Select...</option>
              <option value="former_colleague">Former Colleague</option>
              <option value="university_friend">University Friend</option>
              <option value="professional_network">Professional Network</option>
              <option value="former_team_member">Former Team Member</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="mb-4">
          <label className="text-xs text-silver-mist mb-1 block">Resume</label>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-cloud dark:border-nebula-purple/50">
            <Upload className="h-5 w-5 text-silver-mist" />
            <span className="text-sm text-silver-mist">Upload resume (PDF/DOCX)</span>
            <label className="ml-auto px-3 py-1.5 rounded-lg bg-celestial-indigo/10 text-celestial-indigo text-xs font-medium cursor-pointer hover:bg-celestial-indigo/20">
              Browse
              <input type="file" accept=".pdf,.docx" className="hidden" />
            </label>
          </div>
        </div>

        <button className="w-full py-2.5 rounded-lg bg-celestial-indigo text-white font-medium text-sm hover:opacity-90 transition-opacity">
          Submit Referral
        </button>
      </div>

      {/* Referral Tracking List */}
      <div>
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">Your Referrals</h4>
        <div className="space-y-2">
          {mockReferrals.map((referral) => {
            const style = statusStyles[referral.status];
            return (
              <div
                key={referral.id}
                className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{referral.candidateName}</p>
                    {referral.bonus && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        <Award className="h-3 w-3" />
                        {referral.bonus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-silver-mist">{referral.position} | {referral.submittedDate}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.classes}`}>
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
