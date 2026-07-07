/**
 * @module ReportsPage
 * @description Reports module home — mounts the report dashboard (favorites, history,
 *              scheduled reports), the report builder (template picker + generate), and the
 *              report viewer (post-generation preview/download). Replaces the previous
 *              placeholder ModulePage.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import { ChevronLeft, LayoutDashboard, CalendarClock } from 'lucide-react';
import { ReportDashboard } from '@/components/reports/ReportDashboard';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { ReportViewer } from '@/components/reports/ReportViewer';
import ReportScheduler from '@/components/reports/ReportScheduler';
import {
  ReportGenerationService,
  type GeneratedReport,
  type ReportPreviewData,
} from '@/services/reportGenerationService';

type View = 'dashboard' | 'builder' | 'viewer' | 'schedules';

export default function ReportsPage() {
  const [view, setView] = useState<View>('dashboard');
  const [activeReport, setActiveReport] = useState<GeneratedReport | null>(null);
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null);

  const openViewer = async (report: GeneratedReport) => {
    setActiveReport(report);
    const preview =
      report.preview ?? (await ReportGenerationService.getReportPreview(report.templateId));
    setPreviewData(
      preview ?? { columns: [], rows: [], totalRows: 0, sampleNote: 'No preview available' }
    );
    setView('viewer');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {view !== 'dashboard' && (
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-1.5 text-sm text-silver-mist hover:text-celestial-indigo transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Reports
          </button>
        )}

        {view === 'dashboard' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-celestial-indigo text-white"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => setView('schedules')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Schedules
            </button>
          </div>
        )}

        {view === 'dashboard' && (
          <ReportDashboard onOpenBuilder={() => setView('builder')} onViewReport={openViewer} />
        )}

        {view === 'schedules' && <ReportScheduler />}

        {view === 'builder' && (
          <ReportBuilder
            onReportGenerated={(report) => {
              void openViewer(report);
            }}
          />
        )}

        {view === 'viewer' && previewData && (
          <ReportViewer
            report={activeReport ?? undefined}
            previewData={previewData}
            onClose={() => setView('dashboard')}
          />
        )}
      </div>
    </div>
  );
}
