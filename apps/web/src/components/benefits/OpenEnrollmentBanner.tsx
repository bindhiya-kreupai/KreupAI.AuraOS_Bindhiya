"use client";

import React from "react";
import { AlertCircle, Calendar, Clock, ArrowRight } from "lucide-react";

interface EnrollmentPeriod {
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

const mockEnrollment: EnrollmentPeriod = {
  startDate: "January 1, 2026",
  endDate: "January 31, 2026",
  daysRemaining: 8,
};

export default function OpenEnrollmentBanner() {
  const { startDate, endDate, daysRemaining } = mockEnrollment;
  const isUrgent = daysRemaining <= 7;

  return (
    <div
      className={`w-full max-w-4xl mx-auto p-4 rounded-xl border ${
        isUrgent
          ? "border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-900/10"
          : "border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/10"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isUrgent
                ? "bg-orange-100 dark:bg-orange-900/30"
                : "bg-celestial-indigo/10"
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 ${
                isUrgent ? "text-orange-600 dark:text-orange-400" : "text-celestial-indigo"
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ink-black dark:text-pearl">
              Open Enrollment Period
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm text-silver-mist">
                <Calendar className="w-3.5 h-3.5" />
                {startDate} - {endDate}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  isUrgent
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-celestial-indigo"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {daysRemaining} days remaining
              </span>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors text-sm">
          Enroll Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
