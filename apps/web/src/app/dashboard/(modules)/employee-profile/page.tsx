/**
 * @module EmployeeProfilePage
 * @description ESS Enhanced Employee Profile — edit all fields, skills, certifications, photo
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { User, Shield } from 'lucide-react';
import { EmployeeProfileEditor } from '@/components/profile/EmployeeProfileEditor';

export default function EmployeeProfilePage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <User className="w-5 h-5 text-celestial-indigo" />
          My Profile
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          View and update your personal information, skills, and certifications.
        </p>
      </div>

      {/* Profile Editor */}
      <EmployeeProfileEditor />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Profile changes are logged for audit purposes. Sensitive fields like bank details require
          additional verification.
        </p>
      </div>
    </div>
  );
}
