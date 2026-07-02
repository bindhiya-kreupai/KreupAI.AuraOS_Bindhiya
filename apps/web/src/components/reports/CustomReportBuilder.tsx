'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Save,
  Play,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Loader2,
} from 'lucide-react';
import { DataSourceSelector } from './DataSourceSelector';
import { ColumnPicker } from './ColumnPicker';
import { FilterBuilder } from './FilterBuilder';
import { ChartSelector } from './ChartSelector';
import { ReportPreview } from './ReportPreview';

type Step = 'source' | 'columns' | 'filters' | 'visualization' | 'preview';

interface StepConfig {
  id: Step;
  label: string;
  number: number;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  columns: string[];
  filters: unknown[];
  chartType: string;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  schedule?: string;
}

const steps: StepConfig[] = [
  { id: 'source', label: 'Data Source', number: 1 },
  { id: 'columns', label: 'Columns', number: 2 },
  { id: 'filters', label: 'Filters', number: 3 },
  { id: 'visualization', label: 'Visualization', number: 4 },
  { id: 'preview', label: 'Preview', number: 5 },
];

export function CustomReportBuilder() {
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [chartType, setChartType] = useState<string>('table');
  const [filters, setFilters] = useState<unknown[]>([]);

  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  // Fetch saved reports on mount
  useEffect(() => {
    fetch('/api/v1/analytics/reports/custom/')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setSavedReports(Array.isArray(result.data) ? result.data : result.data.reports || []);
        }
      })
      .catch((err) => {
        console.error('CustomReportBuilder fetch error:', err);
      })
      .finally(() => setLoadingReports(false));
  }, []);

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      setError('Please enter a report name');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    fetch('/api/v1/analytics/reports/custom/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: reportName,
        description: reportDescription,
        dataSource,
        columns: selectedColumns,
        filters,
        chartType,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setSavedReports((prev) => [result.data, ...prev]);
          setShowBuilder(false);
          setReportName('');
          setReportDescription('');
          setDataSource('');
          setSelectedColumns([]);
          setFilters([]);
          setChartType('table');
          setCurrentStep('source');
          setSuccess('Report saved successfully');
        } else {
          setError(result.error?.message || 'Failed to save report');
        }
      })
      .catch((err) => {
        console.error('Save report error:', err);
        setError('Failed to save report');
      })
      .finally(() => setSaving(false));
  };

  const handleDeleteReport = (reportId: string) => {
    setError(null);
    fetch(`/api/v1/analytics/reports/custom/${reportId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
          setSuccess('Report deleted');
        } else {
          setError(result.error?.message || 'Failed to delete report');
        }
      })
      .catch(() => setError('Failed to delete report'));
  };

  // Execute a saved report against the real execution endpoint and refresh its lastRun.
  const handleRunSaved = (reportId: string) => {
    setRunning(reportId);
    setError(null);
    setSuccess(null);
    fetch(`/api/v1/reports/${reportId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters: {} }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setSuccess('Report executed successfully');
          setSavedReports((prev) =>
            prev.map((r) => (r.id === reportId ? { ...r, lastRun: new Date().toISOString() } : r))
          );
        } else {
          setError(result.error?.message || result.error || 'Failed to run report');
        }
      })
      .catch(() => setError('Failed to run report'))
      .finally(() => setRunning(null));
  };

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'source':
        return dataSource !== '';
      case 'columns':
        return selectedColumns.length > 0;
      default:
        return true;
    }
  };

  // Saved Reports List View
  if (!showBuilder) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-celestial-indigo" />
            <div>
              <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
                Custom Report Builder
              </h2>
              <p className="text-sm text-silver-mist">
                Create and manage custom reports from your HR data
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Report
          </button>
        </div>

        {/* Feedback banners */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Saved Reports */}
        {loadingReports ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-20"
              />
            ))}
          </div>
        ) : savedReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cloud dark:border-nebula-purple/50 p-8 text-center">
            <FileText className="w-10 h-10 text-silver-mist mx-auto mb-3" />
            <p className="text-sm text-silver-mist">No saved reports yet</p>
            <p className="text-xs text-silver-mist mt-1">
              Create your first custom report to get started
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-celestial-indigo" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-ink-black dark:text-pearl">
                        {report.name}
                      </h4>
                      {report.description && (
                        <p className="text-xs text-silver-mist mt-0.5 line-clamp-1">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-silver-mist">
                        <span>Source: {report.dataSource || 'N/A'}</span>
                        <span>{report.columns?.length || 0} columns</span>
                        {report.schedule && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.schedule}
                          </span>
                        )}
                        <span>Updated: {new Date(report.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunSaved(report.id)}
                      disabled={running === report.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-celestial-indigo bg-celestial-indigo/10 rounded-lg hover:bg-celestial-indigo/20 disabled:opacity-50 transition-colors"
                    >
                      {running === report.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}{' '}
                      Run
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-1.5 text-silver-mist hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Builder View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Custom Report Builder
            </h2>
            <p className="text-sm text-silver-mist">Create a custom report from your HR data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveReport}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-sm font-medium text-ink-black dark:text-pearl hover:border-celestial-indigo/30 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={handleSaveReport}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Report
          </button>
        </div>
      </div>

      {/* Report Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-silver-mist block mb-1.5">Report Name</label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Enter a name for your report..."
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-silver-mist block mb-1.5">
            Description (optional)
          </label>
          <input
            type="text"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Brief description..."
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.id
                  ? 'bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/30'
                  : idx < currentStepIndex
                    ? 'text-aurora-green'
                    : 'text-silver-mist'
              }`}
            >
              {idx < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    currentStep === step.id
                      ? 'bg-celestial-indigo text-white'
                      : 'bg-cloud dark:bg-nebula-purple/30 text-silver-mist'
                  }`}
                >
                  {step.number}
                </span>
              )}
              <span className="hidden md:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-silver-mist flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
        {currentStep === 'source' && (
          <DataSourceSelector selectedSource={dataSource} onSelect={(id) => setDataSource(id)} />
        )}
        {currentStep === 'columns' && (
          <ColumnPicker
            dataSource={dataSource}
            selectedColumns={selectedColumns}
            onChange={setSelectedColumns}
          />
        )}
        {currentStep === 'filters' && (
          <FilterBuilder dataSource={dataSource} onChange={(f) => setFilters(f)} />
        )}
        {currentStep === 'visualization' && (
          <ChartSelector
            selectedChart={chartType as 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter'}
            onChange={(chart) => setChartType(chart)}
          />
        )}
        {currentStep === 'preview' && (
          <ReportPreview dataSource={dataSource} chartType={chartType} columns={selectedColumns} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (currentStepIndex === 0) {
              setShowBuilder(false);
            } else {
              goPrev();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-ink-black dark:text-pearl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />{' '}
          {currentStepIndex === 0 ? 'Back to Reports' : 'Previous'}
        </button>
        <span className="text-xs text-silver-mist">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              canProceed()
                ? 'bg-celestial-indigo text-white hover:bg-celestial-indigo/90'
                : 'bg-cloud dark:bg-nebula-purple/30 text-silver-mist cursor-not-allowed'
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSaveReport}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Save & Generate Report
          </button>
        )}
      </div>
    </div>
  );
}
