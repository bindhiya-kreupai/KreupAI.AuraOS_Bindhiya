// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Edit3,
  Search,
  Users,
  Copy,
} from 'lucide-react';
import type {
  LetterTemplate,
  GeneratedLetter,
  LetterCategory,
  SupportedCountry,
} from '@/services/letterEngineService';
import { LetterEngineService } from '@/services/letterEngineService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'templates' | 'generate' | 'history';

interface DashboardState {
  templates: LetterTemplate[];
  generatedLetters: GeneratedLetter[];
  loading: boolean;
  activeTab: Tab;
  selectedTemplate: LetterTemplate | null;
  generating: boolean;
  previewHtml: string | null;
  templateVariables: Record<string, string>;
  selectedEmployeeId: string;
  bulkMode: boolean;
  generatedResult: GeneratedLetter | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<LetterCategory, { label: string; color: string; bg: string }> = {
  onboarding: { label: 'Onboarding', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  compensation: { label: 'Compensation', color: 'text-sky-700', bg: 'bg-sky-100' },
  separation: { label: 'Separation', color: 'text-red-700', bg: 'bg-red-100' },
  compliance: { label: 'Compliance', color: 'text-amber-700', bg: 'bg-amber-100' },
  disciplinary: { label: 'Disciplinary', color: 'text-orange-700', bg: 'bg-orange-100' },
};

const LETTER_TYPE_ICONS: Record<string, string> = {
  offer_letter: '📋',
  employment_contract: '📝',
  salary_certificate: '💰',
  experience_letter: '🏆',
  salary_increment: '📈',
  promotion_letter: '⬆️',
  warning_letter_1: '⚠️',
  warning_letter_2: '🔴',
  warning_letter_final: '🚫',
  termination_letter: '❌',
  noc: '✅',
  probation_confirmation: '✔️',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500',
  final: 'bg-sky-100 text-sky-700',
  sent: 'bg-purple-100 text-purple-700',
  signed: 'bg-emerald-100 text-emerald-700',
};

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Templates Tab ──────────────────────────────────────────────────────────────

function TemplatesTab({
  templates,
  onSelectTemplate,
}: {
  templates: LetterTemplate[];
  onSelectTemplate: (t: LetterTemplate) => void;
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LetterCategory | 'All'>('All');
  const [countryFilter, setCountryFilter] = useState<SupportedCountry | 'All'>('All');

  const filtered = templates.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter;
    const matchCountry = countryFilter === 'All' || t.country === countryFilter;
    return matchSearch && matchCat && matchCountry;
  });

  const categories = Object.keys(CATEGORY_STYLES) as LetterCategory[];
  const countries = Array.from(new Set(templates.map((t) => t.country)));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="text-sm outline-none w-40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as LetterCategory | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_STYLES[c].label}
            </option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value as SupportedCountry | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => {
          const catInfo = CATEGORY_STYLES[template.category];
          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{LETTER_TYPE_ICONS[template.key] || '📄'}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{template.name}</p>
                    <p className="text-xs text-slate-400">
                      v{template.version} &bull; {template.country} &bull;{' '}
                      {template.language.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${catInfo.bg} ${catInfo.color}`}
                  >
                    {catInfo.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${template.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{template.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>{template.variables.length} variables</span>
                <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700"
                >
                  <Edit3 size={12} />
                  Use Template
                </button>
                <button className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
                  <Eye size={12} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">No templates found.</div>
        )}
      </div>
    </div>
  );
}

// ── Generate Letter Tab ────────────────────────────────────────────────────────

function GenerateLetterTab({
  templates,
  selectedTemplate,
  onSelectTemplate,
  variables,
  onVariableChange,
  employeeId,
  onEmployeeChange,
  onGenerate,
  generating,
  previewHtml,
  generatedResult,
  bulkMode,
  onToggleBulk,
}: {
  templates: LetterTemplate[];
  selectedTemplate: LetterTemplate | null;
  onSelectTemplate: (t: LetterTemplate | null) => void;
  variables: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
  employeeId: string;
  onEmployeeChange: (id: string) => void;
  onGenerate: () => Promise<void>;
  generating: boolean;
  previewHtml: string | null;
  generatedResult: GeneratedLetter | null;
  bulkMode: boolean;
  onToggleBulk: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="space-y-5">
        {/* Template Selection */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Select Template</h3>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const t = templates.find((t) => t.id === e.target.value) || null;
              onSelectTemplate(t);
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            <option value="">Choose a template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.country})
              </option>
            ))}
          </select>

          {selectedTemplate && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">{LETTER_TYPE_ICONS[selectedTemplate.key] || '📄'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{selectedTemplate.name}</p>
                  <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Selection */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">
              {bulkMode ? 'Bulk Generation' : 'Select Employee'}
            </h3>
            <button
              onClick={onToggleBulk}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                bulkMode
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={12} />
              {bulkMode ? 'Single Mode' : 'Bulk Mode'}
            </button>
          </div>
          {!bulkMode ? (
            <input
              type="text"
              value={employeeId}
              onChange={(e) => onEmployeeChange(e.target.value)}
              placeholder="Employee ID (e.g. EMP-001)"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Bulk mode generates letters for multiple employees at once.
              </p>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800">
                <option>All Employees</option>
                <option>Technology Department</option>
                <option>Finance Department</option>
                <option>Annual Increment Recipients</option>
              </select>
            </div>
          )}
        </div>

        {/* Template Variables */}
        {selectedTemplate && selectedTemplate.variables.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Template Variables</h3>
            <div className="space-y-3">
              {selectedTemplate.variables.slice(0, 8).map((variable) => (
                <div key={variable.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {variable.label}
                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                    <span className="text-slate-400 ml-1">({variable.group})</span>
                  </label>
                  <input
                    type="text"
                    value={variables[variable.key] || ''}
                    onChange={(e) => onVariableChange(variable.key, e.target.value)}
                    placeholder={variable.sampleValue}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              ))}
              {selectedTemplate.variables.length > 8 && (
                <p className="text-xs text-slate-400">
                  +{selectedTemplate.variables.length - 8} more variables will be auto-populated
                  from employee profile.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={generating || !selectedTemplate}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 font-medium"
        >
          {generating ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <FileText size={16} /> {bulkMode ? 'Generate Bulk Letters' : 'Generate Letter'}
            </>
          )}
        </button>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 min-h-[500px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Letter Preview</h3>
            {generatedResult && (
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
                  <Download size={12} />
                  Download
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs hover:bg-sky-700">
                  <Send size={12} />
                  Send
                </button>
              </div>
            )}
          </div>

          {generatedResult ? (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-[400px]">
              <div className="text-center mb-4 pb-3 border-b border-slate-200">
                <p className="font-semibold text-slate-800">{generatedResult.templateName}</p>
                <p className="text-xs text-slate-400">
                  Generated for {generatedResult.employeeName}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(generatedResult.generatedAt).toLocaleString()}
                </p>
                <span
                  className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[generatedResult.status] || 'bg-slate-100 text-slate-500'}`}
                >
                  {generatedResult.status}
                </span>
              </div>
              {previewHtml ? (
                <div
                  className="text-sm text-slate-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: previewHtml.slice(0, 1000) + (previewHtml.length > 1000 ? '...' : ''),
                  }}
                />
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  Letter generated successfully. Click Download to get the full document.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
              <FileText size={48} className="mb-3 text-slate-200" />
              <p className="text-sm">Select a template and employee to generate a preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── History Tab ────────────────────────────────────────────────────────────────

function HistoryTab({ letters }: { letters: GeneratedLetter[] }) {
  const [search, setSearch] = useState('');

  const filtered = letters.filter(
    (l) =>
      !search ||
      l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      l.templateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-64">
        <Search size={14} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search letters..."
          className="text-sm outline-none w-full"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Employee</th>
              <th className="text-left p-4 font-semibold text-slate-600">Letter Type</th>
              <th className="text-left p-4 font-semibold text-slate-600">Generated By</th>
              <th className="text-left p-4 font-semibold text-slate-600">Date</th>
              <th className="text-left p-4 font-semibold text-slate-600">Status</th>
              <th className="text-right p-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((letter) => (
              <tr key={letter.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {letter.employeeName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span className="font-medium text-slate-800">{letter.employeeName}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{letter.templateName}</td>
                <td className="p-4 text-slate-500">{letter.generatedBy}</td>
                <td className="p-4 text-slate-500">
                  {new Date(letter.generatedAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[letter.status] || 'bg-slate-100 text-slate-500'}`}
                  >
                    {letter.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      <Download size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">No letters found.</div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LetterEngine() {
  const [state, setState] = useState<DashboardState>({
    templates: [],
    generatedLetters: [],
    loading: true,
    activeTab: 'templates',
    selectedTemplate: null,
    generating: false,
    previewHtml: null,
    templateVariables: {},
    selectedEmployeeId: '',
    bulkMode: false,
    generatedResult: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [templates, letters] = await Promise.all([
        LetterEngineService.getTemplates(),
        LetterEngineService.getGeneratedLetters
          ? LetterEngineService.getGeneratedLetters()
          : Promise.resolve([]),
      ]);
      setState((s) => ({
        ...s,
        templates: templates.templates || templates,
        generatedLetters: letters.letters || letters,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = useCallback(async () => {
    const { selectedTemplate, selectedEmployeeId, templateVariables } = state;
    if (!selectedTemplate) return;
    setState((s) => ({ ...s, generating: true }));
    try {
      const result = await LetterEngineService.generateLetter({
        templateId: selectedTemplate.id,
        employeeId: selectedEmployeeId,
        variables: templateVariables,
      });
      setState((s) => ({
        ...s,
        generating: false,
        generatedResult: result,
        previewHtml: result.htmlContent || null,
        activeTab: 'generate',
      }));
    } catch {
      setState((s) => ({ ...s, generating: false }));
    }
  }, [state]);

  const {
    templates,
    generatedLetters,
    loading,
    activeTab,
    selectedTemplate,
    generating,
    previewHtml,
    templateVariables,
    selectedEmployeeId,
    bulkMode,
    generatedResult,
  } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'templates', label: 'Templates' },
    { id: 'generate', label: 'Generate Letter' },
    { id: 'history', label: 'History' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading letter engine...</span>
      </div>
    );
  }

  const totalGenerated = generatedLetters.length;
  const categories = new Set(templates.map((t) => t.category)).size;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">HR Letter Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Template management and letter generation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, activeTab: 'generate' }))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700"
          >
            <Plus size={14} />
            Generate Letter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText size={18} className="text-slate-600" />}
          label="Letter Templates"
          value={templates.length}
          sub={`${categories} categories`}
          color="bg-slate-100"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Letters Generated"
          value={totalGenerated}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<Send size={18} className="text-sky-600" />}
          label="Letters Sent"
          value={
            generatedLetters.filter((l) => l.status === 'sent' || l.status === 'signed').length
          }
          color="bg-sky-100"
        />
        <StatCard
          icon={<Clock size={18} className="text-amber-600" />}
          label="Pending Signature"
          value={generatedLetters.filter((l) => l.status === 'final').length}
          color="bg-amber-100"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'templates' && (
          <TemplatesTab
            templates={templates}
            onSelectTemplate={(t) =>
              setState((s) => ({ ...s, selectedTemplate: t, activeTab: 'generate' }))
            }
          />
        )}
        {activeTab === 'generate' && (
          <GenerateLetterTab
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={(t) =>
              setState((s) => ({
                ...s,
                selectedTemplate: t,
                generatedResult: null,
                previewHtml: null,
              }))
            }
            variables={templateVariables}
            onVariableChange={(key, value) =>
              setState((s) => ({
                ...s,
                templateVariables: { ...s.templateVariables, [key]: value },
              }))
            }
            employeeId={selectedEmployeeId}
            onEmployeeChange={(id) => setState((s) => ({ ...s, selectedEmployeeId: id }))}
            onGenerate={handleGenerate}
            generating={generating}
            previewHtml={previewHtml}
            generatedResult={generatedResult}
            bulkMode={bulkMode}
            onToggleBulk={() => setState((s) => ({ ...s, bulkMode: !s.bulkMode }))}
          />
        )}
        {activeTab === 'history' && <HistoryTab letters={generatedLetters} />}
      </div>
    </div>
  );
}
