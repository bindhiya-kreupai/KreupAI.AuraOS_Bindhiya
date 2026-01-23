"use client";

import React from "react";
import { FileText, DollarSign, Calendar, Gift, Send, Briefcase, User } from "lucide-react";

interface OfferDetails {
  candidateName: string;
  position: string;
  department: string;
  salary: string;
  startDate: string;
  benefits: string[];
  reportingTo: string;
  location: string;
}

const mockOffer: OfferDetails = {
  candidateName: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  department: "Engineering",
  salary: "$185,000/year",
  startDate: "February 15, 2026",
  benefits: [
    "Health, Dental & Vision Insurance",
    "401(k) with 6% match",
    "25 days PTO + holidays",
    "Remote work flexibility",
    "Annual learning budget ($10,000)",
    "Stock options (10,000 shares)",
  ],
  reportingTo: "John Smith, Engineering Manager",
  location: "San Francisco, CA (Hybrid)",
};

export default function OfferLetterPreview() {
  const offer = mockOffer;

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-celestial-indigo" />
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Offer Letter Preview</h2>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
          Draft
        </span>
      </div>

      {/* Letter Header */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-cloud dark:border-nebula-purple/50">
        <p className="text-xs text-silver-mist mb-2">OFFER OF EMPLOYMENT</p>
        <p className="text-sm text-ink-black dark:text-pearl">
          Dear <span className="font-semibold">{offer.candidateName}</span>,
        </p>
        <p className="text-sm text-silver-mist mt-2">
          We are pleased to extend this offer of employment for the position of{" "}
          <span className="text-ink-black dark:text-pearl font-medium">{offer.position}</span>{" "}
          in the {offer.department} department.
        </p>
      </div>

      {/* Offer Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="h-9 w-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
            <User className="h-4 w-4 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-xs text-silver-mist">Candidate</p>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{offer.candidateName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="h-9 w-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-xs text-silver-mist">Position</p>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{offer.position}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-silver-mist">Compensation</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">{offer.salary}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="h-9 w-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-xs text-silver-mist">Start Date</p>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{offer.startDate}</p>
          </div>
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="mb-6 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink-black dark:text-pearl mb-3">
          <Gift className="h-4 w-4 text-celestial-indigo" />
          Benefits Package
        </h4>
        <ul className="space-y-2">
          {offer.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl">
              <div className="h-1.5 w-1.5 rounded-full bg-celestial-indigo" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Info */}
      <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-silver-mist">Reporting To</p>
          <p className="text-ink-black dark:text-pearl font-medium">{offer.reportingTo}</p>
        </div>
        <div>
          <p className="text-xs text-silver-mist">Location</p>
          <p className="text-ink-black dark:text-pearl font-medium">{offer.location}</p>
        </div>
      </div>

      {/* Send Button */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium text-sm hover:opacity-90 transition-opacity">
        <Send className="h-4 w-4" />
        Send for Signature
      </button>
    </div>
  );
}
