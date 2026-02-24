/**
 * @module OpenEnrollmentBanner
 * @description Enrollment period alert banner with countdown and status
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, CalendarDays } from 'lucide-react';
import type { EnrollmentWindow } from '@/services/benefitsService';

interface OpenEnrollmentBannerProps {
  window: EnrollmentWindow;
}

export const OpenEnrollmentBanner: React.FC<OpenEnrollmentBannerProps> = ({ window: ew }) => {
  const isUrgent = ew.daysRemaining <= 5;
  const isClosingSoon = ew.daysRemaining <= 10 && ew.daysRemaining > 5;

  if (!ew.isActive) {
    return (
      <div className="rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-pearl/50 dark:bg-deep-cosmos/30 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-silver-mist/10">
            <CalendarDays className="w-5 h-5 text-silver-mist" />
          </div>
          <div>
            <p className="text-sm font-semibold text-silver-mist">Enrollment Period Closed</p>
            <p className="text-xs text-silver-mist/70 mt-0.5">
              The next open enrollment period has not been announced yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const bgColor = isUrgent
    ? 'bg-coral-alert/5 dark:bg-coral-alert/10 border-coral-alert/30'
    : isClosingSoon
      ? 'bg-sunset-amber/5 dark:bg-sunset-amber/10 border-sunset-amber/30'
      : 'bg-celestial-indigo/5 dark:bg-celestial-indigo/10 border-celestial-indigo/30';

  const iconColor = isUrgent
    ? 'text-coral-alert'
    : isClosingSoon
      ? 'text-sunset-amber'
      : 'text-celestial-indigo';

  const Icon = isUrgent ? AlertTriangle : isClosingSoon ? Clock : CheckCircle2;

  return (
    <div className={`rounded-2xl border ${bgColor} p-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl ${isUrgent ? 'bg-coral-alert/10' : isClosingSoon ? 'bg-sunset-amber/10' : 'bg-celestial-indigo/10'}`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${isUrgent ? 'text-coral-alert' : 'text-ink-black dark:text-pearl'}`}
            >
              {ew.name}
            </p>
            <p className="text-xs text-silver-mist mt-0.5">
              {new Date(ew.startDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
              {' — '}
              {new Date(ew.endDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-[10px] text-silver-mist/70 mt-0.5">
              Effective date:{' '}
              {new Date(ew.effectiveDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isUrgent
              ? 'bg-coral-alert/10 text-coral-alert'
              : isClosingSoon
                ? 'bg-sunset-amber/10 text-sunset-amber'
                : 'bg-celestial-indigo/10 text-celestial-indigo'
          }`}
        >
          <Clock className="w-4 h-4" />
          <div className="text-center">
            <span className="text-lg font-bold">{ew.daysRemaining}</span>
            <span className="text-xs font-medium ml-1">
              {ew.daysRemaining === 1 ? 'day' : 'days'} remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenEnrollmentBanner;
