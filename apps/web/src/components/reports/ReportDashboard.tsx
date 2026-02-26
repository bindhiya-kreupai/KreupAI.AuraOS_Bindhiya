/**
 * @module ReportDashboard
 * @description Report dashboard with favorites, recent history, scheduled reports, and quick generate.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Clock,
  CalendarClock,
  Download,
  Trash2,
  Play,
  RefreshCw,
  FileText,
  Plus,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  ReportGenerationService,
  CATEGORY_META,
  STATUS_META,
  type ReportTemplate,
  type GeneratedReport,
  type ScheduledReport,
  type ReportCategory,
} from '@/services/reportGenerationService';

// ── Mini status badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: GeneratedReport['status'] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.color}`}
    >
      {status === 'generating' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
      {status === 'ready' && <CheckCircle className="w-2.5 h-2.5" />}
      {status === 'failed' && <AlertCircle className="w-2.5 h-2.5" />}
      {meta.label}
    </span>
  );
}

// ── Favorite Template Card ────────────────────────────────────────────────────

function FavoriteCard({
  template,
  onGenerate,
}: {
  template: ReportTemplate;
  onGenerate: (tpl: ReportTemplate) => void;
}) {
  const meta = CATEGORY_META[template.category];
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4 hover:border-celestial-indigo/40 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-xl ${meta.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
        >
          <FileText className={`w-4 h-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-black dark:text-pearl leading-snug truncate">
            {template.name}
          </p>
          <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
        </div>
      </div>
      {template.lastGenerated && (
        <p className="text-[11px] text-silver-mist mb-3">
          Last generated {new Date(template.lastGenerated).toLocaleDateString()}
        </p>
      )}
      <button
        onClick={() => onGenerate(template)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-celestial-indigo/10 dark:bg-celestial-indigo/20 text-celestial-indigo text-xs font-semibold hover:bg-celestial-indigo hover:text-white transition-colors"
      >
        <Play className="w-3 h-3" />
        Quick Generate
      </button>
    </div>
  );
}

// ── History Row ───────────────────────────────────────────────────────────────

function HistoryRow({ report }: { report: GeneratedReport }) {
  const meta = CATEGORY_META[report.category];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-cloud/50 dark:border-nebula-purple/20 last:border-0 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg ${meta.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
      >
        <FileText className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
          {report.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
          <span className="text-[10px] text-silver-mist">·</span>
          <span className="text-[10px] text-silver-mist">
            {new Date(report.generatedAt).toLocaleDateString()}
          </span>
          {report.rowCount !== undefined && (
            <>
              <span className="text-[10px] text-silver-mist">·</span>
              <span className="text-[10px] text-silver-mist">{report.rowCount} rows</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={report.status} />
        <span className="text-[11px] text-silver-mist uppercase font-medium">{report.format}</span>
        <span className="text-[11px] text-silver-mist">{formatFileSize(report.fileSize)}</span>
        {report.status === 'ready' && report.downloadUrl && (
          <a
            href={report.downloadUrl}
            className="p-1.5 rounded-lg hover:bg-celestial-indigo/10 text-celestial-indigo transition-colors"
            aria-label="Download report"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Scheduled Report Row ──────────────────────────────────────────────────────

function ScheduledRow({
  schedule,
  onDelete,
}: {
  schedule: ScheduledReport;
  onDelete: (id: string) => void;
}) {
  const meta = CATEGORY_META[schedule.category];
  const freqLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-cloud/50 dark:border-nebula-purple/20 last:border-0 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg ${meta.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
      >
        <CalendarClock className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
          {schedule.templateName}
        </p>
        <p className="text-[11px] text-silver-mist mt-0.5">
          {freqLabels[schedule.schedule.frequency]} at {schedule.schedule.time}
          {' · '}Next: {new Date(schedule.nextRunAt).toLocaleDateString()}
          {' · '}
          {schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            schedule.isActive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}
        >
          {schedule.isActive ? 'Active' : 'Paused'}
        </span>
        <button
          onClick={() => onDelete(schedule.id)}
          className="p-1.5 rounded-lg hover:bg-quantum-rose/10 text-silver-mist hover:text-quantum-rose transition-colors"
          aria-label="Remove scheduled report"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ReportDashboardProps {
  onOpenBuilder?: () => void;
  onViewReport?: (report: GeneratedReport) => void;
}

export function ReportDashboard({ onOpenBuilder, _onViewReport }: ReportDashboardProps) {
  const [favorites, setFavorites] = useState<ReportTemplate[]>([]);
  const [history, setHistory] = useState<GeneratedReport[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ReportCategory | 'all'>('all');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      ReportGenerationService.getFavoriteReports(),
      ReportGenerationService.getReportHistory({ pageSize: 10 }),
      ReportGenerationService.getScheduledReports(),
    ])
      .then(([fav, hist, sched]) => {
        setFavorites(fav);
        setHistory(hist);
        setScheduled(sched);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleQuickGenerate = async (tpl: ReportTemplate) => {
    await ReportGenerationService.generateReport({
      templateId: tpl.id,
      format: tpl.defaultFormat,
    });
    const hist = await ReportGenerationService.getReportHistory({ pageSize: 10 });
    setHistory(hist);
  };

  const handleDeleteSchedule = async (id: string) => {
    await ReportGenerationService.deleteScheduledReport(id);
    setScheduled((prev) => prev.filter((s) => s.id !== id));
  };

  const CATEGORIES: { value: ReportCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'hr', label: 'HR' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'analytics', label: 'Analytics' },
  ];

  const filteredHistory =
    activeCategory === 'all' ? history : history.filter((r) => r.category === activeCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink-black dark:text-pearl">Reports</h2>
          <p className="text-xs text-silver-mist mt-0.5">
            Generate, schedule, and download reports across all modules
          </p>
        </div>
        <button
          onClick={onOpenBuilder}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Pinned Reports
            </h3>
            <button
              onClick={onOpenBuilder}
              className="text-xs text-celestial-indigo hover:underline flex items-center gap-1"
            >
              Browse all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {favorites.slice(0, 4).map((tpl) => (
              <FavoriteCard key={tpl.id} template={tpl} onGenerate={handleQuickGenerate} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/20">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
            <Clock className="w-4 h-4 text-silver-mist" />
            Recent Reports
          </h3>
          <div className="flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-celestial-indigo text-white'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <FileText className="w-8 h-8 text-silver-mist/20 mb-3" />
            <p className="text-sm text-silver-mist">No reports generated yet</p>
            <button
              onClick={onOpenBuilder}
              className="mt-3 text-xs text-celestial-indigo hover:underline"
            >
              Generate your first report
            </button>
          </div>
        ) : (
          filteredHistory.map((report) => <HistoryRow key={report.id} report={report} />)
        )}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/20">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-silver-mist" />
            Scheduled Reports
          </h3>
          <button
            onClick={onOpenBuilder}
            className="flex items-center gap-1 text-xs text-celestial-indigo hover:underline"
          >
            <Plus className="w-3 h-3" />
            Schedule
          </button>
        </div>

        {scheduled.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <CalendarClock className="w-8 h-8 text-silver-mist/20 mb-3" />
            <p className="text-sm text-silver-mist">No scheduled reports</p>
          </div>
        ) : (
          scheduled.map((sched) => (
            <ScheduledRow key={sched.id} schedule={sched} onDelete={handleDeleteSchedule} />
          ))
        )}
      </div>
    </div>
  );
}

export default ReportDashboard;
