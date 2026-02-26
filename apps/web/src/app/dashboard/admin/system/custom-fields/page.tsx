/**
 * @module CustomFieldsPage
 * @description Custom fields engine — define, order, and validate custom fields on any entity.
 * @project AURA HCM Platform
 * @section 24.4 Configuration & Customization Engine
 */

'use client';

import React from 'react';
import CustomFieldsManager from '@/components/admin/CustomFieldsManager';

export default function CustomFieldsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          System / Custom Fields
        </p>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          Custom Fields Engine
        </h1>
        <p className="text-silver-mist text-sm mt-1 max-w-2xl">
          Extend any entity — Employee, Department, Position, Candidate, Contract, or Asset — with
          custom fields. Supports 11 field types including rich text, multi-select, and file
          attachments. Drag to reorder, configure validation, and control role visibility.
        </p>
      </div>
      <CustomFieldsManager />
    </div>
  );
}
