/**
 * @module PerformanceCalibrationPage
 * @description Performance Calibration Tool page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Scale, Shield } from 'lucide-react';
import { PerformanceCalibration } from '@/components/performance/PerformanceCalibration';

export default function PerformanceCalibrationPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Scale className="w-5 h-5 text-celestial-indigo" />
          Performance Calibration
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Calibrate ratings using the 9-box grid, enforce bell curve distribution, and ensure fair
          performance assessments.
        </p>
      </div>

      {/* Calibration Tool */}
      <PerformanceCalibration />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Calibration actions are audit-logged. Only authorized managers and HR personnel can modify
          employee placements.
        </p>
      </div>
    </div>
  );
}
