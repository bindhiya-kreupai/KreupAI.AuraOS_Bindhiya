'use client';

import { useState } from 'react';
import RequisitionTagsPage from '../requisition-tags/page';
import JobTagsPage from '../job-tags/page';

type Tab = 'requisition' | 'job-position';

export default function TaPipelineTagsPage() {
  const [tab, setTab] = useState<Tab>('requisition');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <p className="text-sm uppercase text-slate-500">Nationalisation Overlay · TA Pipeline</p>
        <h1 className="text-2xl font-semibold text-slate-950">
          TA Pipeline Tags · Requisition + Job/Position
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tag localisation targets across the talent-acquisition pipeline — at the requisition level
          and at the job/position level — so recruiters see reserved seats and eligibility per
          program.
        </p>
        <div className="mt-4 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('requisition')}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === 'requisition'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Requisition tags
          </button>
          <button
            type="button"
            onClick={() => setTab('job-position')}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === 'job-position'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Job / Position tags
          </button>
        </div>
      </div>
      {tab === 'requisition' ? <RequisitionTagsPage /> : <JobTagsPage />}
    </div>
  );
}
