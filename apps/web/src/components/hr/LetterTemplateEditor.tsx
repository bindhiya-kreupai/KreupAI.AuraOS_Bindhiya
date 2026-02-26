'use client';

/**
 * @component LetterTemplateEditor
 * @description HR letter template editor — template list by category, rich text area,
 *   variable inserter panel, preview mode with sample data, country/language selector,
 *   save/duplicate/deactivate, version history.
 * @project AURA HCM Platform
 * @section 10.7 — Letter Engine
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  Eye,
  EyeOff,
  Save,
  Copy,
  Archive,
  RefreshCw,
  CheckCircle2,
  Variable,
  X,
  Info,
  History,
} from 'lucide-react';
import type {
  LetterTemplate,
  LetterCategory,
  SupportedCountry,
  VariableGroup,
  TemplateVariable,
} from '@/services/letterEngineService';
import { LetterEngineService } from '@/services/letterEngineService';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<LetterCategory, { label: string; color: string; bg: string }> = {
  onboarding: { label: 'Onboarding', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  compensation: { label: 'Compensation', color: 'text-blue-700', bg: 'bg-blue-100' },
  separation: { label: 'Separation', color: 'text-orange-700', bg: 'bg-orange-100' },
  compliance: { label: 'Compliance', color: 'text-purple-700', bg: 'bg-purple-100' },
  disciplinary: { label: 'Disciplinary', color: 'text-red-700', bg: 'bg-red-100' },
};

const COUNTRY_FLAGS: Record<SupportedCountry, string> = {
  UAE: '🇦🇪',
  KSA: '🇸🇦',
  IND: '🇮🇳',
  GBR: '🇬🇧',
  USA: '🇺🇸',
  GENERIC: '🌐',
};

const GROUP_LABELS: Record<VariableGroup, string> = {
  employee: 'Employee',
  company: 'Company',
  compensation: 'Compensation',
  dates: 'Dates',
  position: 'Position',
  legal: 'Legal',
};

const GROUP_COLORS: Record<VariableGroup, string> = {
  employee: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  company: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  compensation: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  dates: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  position: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  legal: 'bg-red-100 text-red-700 hover:bg-red-200',
};

// ── Sample Data for Preview ───────────────────────────────────────────────────

const SAMPLE_VARIABLES: Record<string, string> = {
  'employee.name': 'Ahmed Al-Mansouri',
  'employee.firstName': 'Ahmed',
  'employee.employeeId': 'EMP-0201',
  'employee.designation': 'Senior Software Engineer',
  'employee.department': 'Technology',
  'employee.nationality': 'UAE National',
  'employee.passportNumber': 'A12345678',
  'employee.email': 'ahmed.almansouri@kreupai.com',
  'company.name': 'KreupAI Technologies LLC',
  'company.address': 'Dubai Internet City, Building 17, Dubai, UAE',
  'company.tradeNo': 'UAE-LLC-2018-04512',
  'company.hrSignatory': 'Fatima Al-Rashidi',
  'company.hrTitle': 'Head of Human Resources',
  'compensation.basicSalary': '15,000',
  'compensation.hra': '5,000',
  'compensation.transportAllowance': '2,000',
  'compensation.grossSalary': '22,000',
  'compensation.currency': 'AED',
  'compensation.newSalary': '25,000',
  'compensation.incrementAmount': '3,000',
  'compensation.incrementPercent': '13.6%',
  'dates.joiningDate': '01 March 2023',
  'dates.probationEndDate': '31 August 2023',
  'dates.effectiveDate': '01 April 2026',
  'dates.lastWorkingDay': '31 March 2026',
  'dates.issueDate': '25 February 2026',
  'dates.separationDate': '31 March 2026',
  'dates.yearsOfService': '3 years 2 months',
  'position.newTitle': 'Principal Engineer',
  'position.previousTitle': 'Senior Software Engineer',
  'position.reportingTo': 'David Chen',
  'legal.probationDuration': '6 months',
  'legal.noticePeriod': '30 days',
  'legal.warningNumber': 'First',
  'legal.warningReason': 'Repeated attendance policy violations',
  'legal.terminationReason': 'Redundancy due to organizational restructuring',
  'legal.nocPurpose': 'Visa change of status / sponsorship transfer',
};

// ── Variable Chip ──────────────────────────────────────────────────────────────

function _VariableChip({
  variable,
  onInsert,
}: {
  variable: TemplateVariable;
  onInsert: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onInsert(variable.key)}
      title={`${variable.description}\nSample: ${variable.sampleValue}`}
      className={`text-xs px-2 py-1 rounded-md font-mono font-medium transition-colors ${GROUP_COLORS[variable.group]}`}
    >
      {`{{${variable.key}}}`}
    </button>
  );
}

// ── Template List Item ─────────────────────────────────────────────────────────

function TemplateListItem({
  template,
  isSelected,
  onSelect,
}: {
  template: LetterTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const cat = CATEGORY_LABELS[template.category];
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
        isSelected
          ? 'bg-blue-50 border border-blue-300'
          : 'hover:bg-slate-50 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}
          >
            {template.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cat.bg} ${cat.color}`}
            >
              {cat.label}
            </span>
            <span className="text-xs text-slate-400">{COUNTRY_FLAGS[template.country]}</span>
            <span className="text-xs text-slate-400">v{template.version}</span>
          </div>
        </div>
        {!template.isActive && (
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            Inactive
          </span>
        )}
      </div>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LetterTemplateEditor() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editName, setEditName] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LetterCategory | 'all'>('all');
  const [activeVariableGroup, setActiveVariableGroup] = useState<VariableGroup>('employee');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [_showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    LetterEngineService.getLetterTemplates().then((t) => {
      setTemplates(t);
      if (t.length > 0) selectTemplate(t[0]);
      setLoading(false);
    });
  }, []);

  function selectTemplate(template: LetterTemplate) {
    setSelectedTemplate(template);
    setEditContent(template.htmlContent.trim());
    setEditName(template.name);
    setPreviewMode(false);
    setSaved(false);
  }

  function insertVariable(key: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditContent((prev) => prev + `{{${key}}}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editContent;
    const newText = text.slice(0, start) + `{{${key}}}` + text.slice(end);
    setEditContent(newText);
    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + key.length + 4, start + key.length + 4);
    }, 0);
  }

  async function handleSave() {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const updated = await LetterEngineService.updateTemplate(selectedTemplate.id, {
        name: editName,
        htmlContent: editContent,
      });
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTemplate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    if (!selectedTemplate) return;
    const copy = await LetterEngineService.duplicateTemplate(selectedTemplate.id);
    setTemplates((prev) => [...prev, copy]);
    selectTemplate(copy);
  }

  async function handleDeactivate() {
    if (!selectedTemplate) return;
    const updated = await LetterEngineService.updateTemplate(selectedTemplate.id, {
      isActive: !selectedTemplate.isActive,
    });
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTemplate(updated);
  }

  function renderPreview(): string {
    return editContent.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const v = SAMPLE_VARIABLES[key.trim()];
      return (
        v ??
        `<span style="background:#fef3c7;color:#92400e;padding:2px 4px;border-radius:3px;font-style:italic">[${key.trim()}]</span>`
      );
    });
  }

  const variableGroups = LetterEngineService.getVariableGroups();
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories: Array<{ id: LetterCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'separation', label: 'Separation' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'disciplinary', label: 'Disciplinary' },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Letter Template Editor</h1>
          <p className="text-xs text-slate-500">Create and manage HR letter templates</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTemplate && (
            <>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <History className="w-3.5 h-3.5" /> v{selectedTemplate.version}
              </button>
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button
                onClick={handleDeactivate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Archive className="w-3.5 h-3.5" />{' '}
                {selectedTemplate.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg font-medium ${saved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saved ? 'Saved!' : 'Save Template'}
              </button>
            </>
          )}
          <button
            onClick={() => setShowNewTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </button>
        </div>
      </div>

      {/* Main Layout: 3 columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Template List */}
        <div className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-2 border-b border-slate-100 flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Template List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center p-6 text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <p className="text-center text-xs text-slate-400 p-6">No templates found</p>
            ) : (
              filteredTemplates.map((t) => (
                <TemplateListItem
                  key={t.id}
                  template={t}
                  isSelected={selectedTemplate?.id === t.id}
                  onSelect={() => selectTemplate(t)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: Editor / Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTemplate ? (
            <>
              {/* Editor Toolbar */}
              <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm font-semibold text-slate-800 bg-transparent border-none outline-none flex-1 min-w-0"
                />

                <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_LABELS[selectedTemplate.category].bg} ${CATEGORY_LABELS[selectedTemplate.category].color}`}
                  >
                    {CATEGORY_LABELS[selectedTemplate.category].label}
                  </span>
                  <span className="text-sm">{COUNTRY_FLAGS[selectedTemplate.country]}</span>
                </div>

                <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                  <button className="p-1.5 rounded hover:bg-slate-100" title="Bold">
                    <Bold className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-slate-100" title="Italic">
                    <Italic className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-slate-100" title="Underline">
                    <Underline className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-slate-100" title="Align Left">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-slate-100" title="Align Center">
                    <AlignCenter className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>

                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    previewMode
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {previewMode ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
              </div>

              {/* Editor / Preview Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {previewMode ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto">
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      Preview using sample data. Unfilled variables are highlighted in yellow.
                    </div>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderPreview() }}
                    />
                  </div>
                ) : (
                  <div className="h-full">
                    <textarea
                      ref={textareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full min-h-[500px] font-mono text-xs text-slate-700 bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                      placeholder="Enter HTML template content here. Use {{variable.name}} placeholders for dynamic content."
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>

              {/* Legal Clause Footer */}
              {selectedTemplate.legalClause && (
                <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 shrink-0">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Legal Reference:</span>{' '}
                    {selectedTemplate.legalClause}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a template to edit</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Variable Panel */}
        <div className="w-72 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Variable className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-700">Variable Inserter</p>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click a variable to insert at cursor position
            </p>
          </div>

          {/* Group Tabs */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100">
            {(Object.keys(GROUP_LABELS) as VariableGroup[]).map((group) => (
              <button
                key={group}
                onClick={() => setActiveVariableGroup(group)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  activeVariableGroup === group
                    ? GROUP_COLORS[group]
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {GROUP_LABELS[group]}
              </button>
            ))}
          </div>

          {/* Variable List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1.5">
              {(variableGroups[activeVariableGroup] ?? []).map((variable) => (
                <div key={variable.key} className="group">
                  <button
                    onClick={() => insertVariable(variable.key)}
                    disabled={previewMode}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      previewMode
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <code
                        className={`text-xs font-mono font-medium ${GROUP_COLORS[variable.group].split(' ')[1]}`}
                      >
                        {`{{${variable.key}}}`}
                      </code>
                      {variable.required && <span className="text-xs text-red-500">*</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{variable.label}</p>
                    <p className="text-xs text-slate-400 italic truncate">
                      eg: {variable.sampleValue}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Country/Language Selector */}
          {selectedTemplate && (
            <div className="border-t border-slate-100 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Template Settings
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Country</span>
                <span className="text-xs font-medium text-slate-700">
                  {COUNTRY_FLAGS[selectedTemplate.country]} {selectedTemplate.country}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Language</span>
                <span className="text-xs font-medium text-slate-700 capitalize">
                  {selectedTemplate.language === 'en' ? 'English' : 'Arabic'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedTemplate.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {selectedTemplate.lastUsed && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Last Used</span>
                  <span className="text-xs text-slate-600">
                    {new Date(selectedTemplate.lastUsed).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && selectedTemplate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Version History</h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {Array.from(
                { length: selectedTemplate.version },
                (_, i) => selectedTemplate.version - i
              ).map((v) => (
                <div
                  key={v}
                  className={`flex items-center justify-between p-3 rounded-xl border ${v === selectedTemplate.version ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">Version {v}</p>
                    <p className="text-xs text-slate-400">
                      {v === selectedTemplate.version
                        ? `Updated ${new Date(selectedTemplate.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : 'Previous version'}
                    </p>
                  </div>
                  {v === selectedTemplate.version ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  ) : (
                    <button className="text-xs text-blue-600 hover:text-blue-700">Restore</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
