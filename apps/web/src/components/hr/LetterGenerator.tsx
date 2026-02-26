'use client';

/**
 * @component LetterGenerator
 * @description HR letter generation tool — template selector, employee selector, variable override,
 *   preview with letterhead, PDF download, email send, bulk generation, digital signature.
 * @project AURA HCM Platform
 * @section 10.7 — Letter Engine
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  User,
  Eye,
  Download,
  Mail,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  X,
  Printer,
  PenLine,
  History,
} from 'lucide-react';
import type {
  LetterTemplate,
  GeneratedLetter,
  LetterCategory,
  SupportedCountry,
} from '@/services/letterEngineService';
import { LetterEngineService, ALL_TEMPLATE_VARIABLES } from '@/services/letterEngineService';

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

const STATUS_STYLES: Record<GeneratedLetter['status'], { bg: string; label: string }> = {
  draft: { bg: 'bg-slate-100 text-slate-600', label: 'Draft' },
  final: { bg: 'bg-blue-100 text-blue-700', label: 'Final' },
  sent: { bg: 'bg-amber-100 text-amber-700', label: 'Sent' },
  signed: { bg: 'bg-emerald-100 text-emerald-700', label: 'Signed' },
};

// ── Mock Employees ─────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  {
    id: 'emp-0201',
    name: 'Ahmed Al-Mansouri',
    title: 'Senior Software Engineer',
    department: 'Technology',
    entity: 'KreupAI HQ',
    nationality: 'UAE National',
    passportNo: 'A12345678',
    email: 'ahmed@kreupai.com',
    joiningDate: '01 March 2023',
    salary: { basic: '15,000', hra: '5,000', transport: '2,000', gross: '22,000', currency: 'AED' },
  },
  {
    id: 'emp-0312',
    name: 'Rajesh Nair',
    title: 'Data Scientist',
    department: 'AI & Analytics',
    entity: 'KreupAI India',
    nationality: 'Indian',
    passportNo: 'P98765432',
    email: 'rajesh@kreupai.com',
    joiningDate: '15 June 2021',
    salary: {
      basic: '1,400,000',
      hra: '280,000',
      transport: '120,000',
      gross: '1,800,000',
      currency: 'INR',
    },
  },
  {
    id: 'emp-0089',
    name: "Liam O'Brien",
    title: 'Product Manager',
    department: 'Product',
    entity: 'KreupAI UK',
    nationality: 'British',
    passportNo: 'GB1234567',
    email: 'liam@kreupai.com',
    joiningDate: '01 September 2022',
    salary: {
      basic: '55,000',
      hra: '15,000',
      transport: '5,000',
      gross: '75,000',
      currency: 'GBP',
    },
  },
  {
    id: 'emp-0445',
    name: 'Sara Mitchell',
    title: 'Solutions Architect',
    department: 'Technology',
    entity: 'KreupAI US',
    nationality: 'American',
    passportNo: 'US9876543',
    email: 'sara@kreupai.com',
    joiningDate: '10 January 2023',
    salary: {
      basic: '110,000',
      hra: '20,000',
      transport: '10,000',
      gross: '140,000',
      currency: 'USD',
    },
  },
  {
    id: 'emp-0102',
    name: 'Khalid Al-Otaibi',
    title: 'Business Development Manager',
    department: 'Sales',
    entity: 'KreupAI KSA',
    nationality: 'Saudi National',
    passportNo: 'SA6543210',
    email: 'khalid@kreupai.com',
    joiningDate: '20 February 2022',
    salary: { basic: '14,000', hra: '5,000', transport: '3,000', gross: '22,000', currency: 'SAR' },
  },
];

type Step = 'template' | 'employee' | 'variables' | 'preview';

const STEPS: { id: Step; label: string }[] = [
  { id: 'template', label: 'Template' },
  { id: 'employee', label: 'Employee' },
  { id: 'variables', label: 'Variables' },
  { id: 'preview', label: 'Preview & Send' },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LetterGenerator() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<(typeof MOCK_EMPLOYEES)[0] | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LetterCategory | 'all'>('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  useEffect(() => {
    Promise.all([
      LetterEngineService.getLetterTemplates(),
      LetterEngineService.getAllGeneratedLetters(),
    ]).then(([tmpl, generated]) => {
      setTemplates(tmpl);
      setGeneratedLetters(generated);
      setLoading(false);
    });
  }, []);

  function prefillFromEmployee(emp: (typeof MOCK_EMPLOYEES)[0]) {
    setVariables({
      'employee.name': emp.name,
      'employee.firstName': emp.name.split(' ')[0],
      'employee.employeeId': emp.id.toUpperCase(),
      'employee.designation': emp.title,
      'employee.department': emp.department,
      'employee.nationality': emp.nationality,
      'employee.passportNumber': emp.passportNo,
      'employee.email': emp.email,
      'company.name': 'KreupAI Technologies LLC',
      'company.address': 'Dubai Internet City, Building 17, Dubai, UAE',
      'company.tradeNo': 'UAE-LLC-2018-04512',
      'company.hrSignatory': 'Fatima Al-Rashidi',
      'company.hrTitle': 'Head of Human Resources',
      'compensation.basicSalary': emp.salary.basic,
      'compensation.hra': emp.salary.hra,
      'compensation.transportAllowance': emp.salary.transport,
      'compensation.grossSalary': emp.salary.gross,
      'compensation.currency': emp.salary.currency,
      'dates.joiningDate': emp.joiningDate,
      'dates.issueDate': new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    });
  }

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  function goTo(step: Step) {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx <= stepIndex || canProceed()) setCurrentStep(step);
  }

  function canProceed(): boolean {
    if (currentStep === 'template') return !!selectedTemplate;
    if (currentStep === 'employee') return !!selectedEmployee;
    if (currentStep === 'variables') return true;
    return false;
  }

  function next() {
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next.id);
  }

  async function handleGenerate() {
    if (!selectedTemplate || !selectedEmployee) return;
    setGenerating(true);
    try {
      const letter = await LetterEngineService.generateLetter(
        selectedTemplate.id,
        selectedEmployee.id,
        variables
      );
      setGeneratedLetter(letter);
      setGeneratedLetters((prev) => [letter, ...prev]);
      setCurrentStep('preview');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!generatedLetter) return;
    setSending(true);
    try {
      await LetterEngineService.markAsSent(generatedLetter.id);
      setSent(true);
      setGeneratedLetters((prev) =>
        prev.map((l) =>
          l.id === generatedLetter.id
            ? { ...l, status: 'sent' as const, sentAt: new Date().toISOString() }
            : l
        )
      );
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  function handlePrint() {
    if (!generatedLetter) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html><head><title>${generatedLetter.templateName}</title>
        <style>body { font-family: Arial, sans-serif; } @media print { body { margin: 0; } }</style>
        </head><body>${generatedLetter.htmlContent}</body></html>
      `);
      win.document.close();
      win.print();
    }
  }

  function handleReset() {
    setCurrentStep('template');
    setSelectedTemplate(null);
    setSelectedEmployee(null);
    setVariables({});
    setGeneratedLetter(null);
    setSent(false);
  }

  const requiredVars = selectedTemplate?.requiredVariables ?? [];
  const allVarsForTemplate = ALL_TEMPLATE_VARIABLES.filter((v) =>
    selectedTemplate?.htmlContent.includes(`{{${v.key}}}`)
  );
  const missingRequired = requiredVars.filter((k) => !variables[k] || variables[k].trim() === '');

  const filteredTemplates = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchCat && t.isActive;
  });

  const filteredEmployees = MOCK_EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.title.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Letter Generator</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate HR letters from templates with dynamic employee data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
            {(['generate', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
              >
                {tab === 'history' ? `History (${generatedLetters.length})` : 'Generate'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* Letter History */
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <p className="font-semibold text-slate-700 text-sm">Generated Letters</p>
            <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {generatedLetters.map((letter) => {
              const s = STATUS_STYLES[letter.status];
              return (
                <div key={letter.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm truncate">
                      {letter.templateName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {letter.employeeName} · Generated{' '}
                      {new Date(letter.generatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg}`}>
                    {s.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {generatedLetters.length === 0 && (
              <div className="text-center p-10 text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No letters generated yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Steps + Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step Indicator */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                {STEPS.map((step, idx) => {
                  const isActive = step.id === currentStep;
                  const isDone = idx < stepIndex;
                  return (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => goTo(step.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : isDone
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-slate-400'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : isDone
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        {step.label}
                      </button>
                      {idx < STEPS.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              {/* Step 1: Template Selection */}
              {currentStep === 'template' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Select Letter Template
                  </h2>
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as LetterCategory | 'all')}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none text-slate-600"
                    >
                      <option value="all">All Categories</option>
                      {(Object.keys(CATEGORY_LABELS) as LetterCategory[]).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {loading ? (
                      <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Loading templates...
                      </div>
                    ) : (
                      filteredTemplates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplate(t)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedTemplate?.id === t.id
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                                {selectedTemplate?.id === t.id && (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mb-2">{t.description}</p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_LABELS[t.category].bg} ${CATEGORY_LABELS[t.category].color}`}
                                >
                                  {CATEGORY_LABELS[t.category].label}
                                </span>
                                <span className="text-sm">{COUNTRY_FLAGS[t.country]}</span>
                                <span className="text-xs text-slate-400">v{t.version}</span>
                                {t.legalClause && (
                                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    Legal
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Employee Selection */}
              {currentStep === 'employee' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Select Employee</h2>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulkMode}
                        onChange={(e) => setBulkMode(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-slate-600">Bulk Generate</span>
                    </label>
                  </div>
                  {bulkMode && (
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700">
                      Bulk mode: Select multiple employees to generate the same letter for all.
                    </div>
                  )}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    {filteredEmployees.map((emp) => {
                      const isSelected = bulkMode
                        ? bulkSelected.includes(emp.id)
                        : selectedEmployee?.id === emp.id;
                      return (
                        <button
                          key={emp.id}
                          onClick={() => {
                            if (bulkMode) {
                              setBulkSelected((prev) =>
                                prev.includes(emp.id)
                                  ? prev.filter((id) => id !== emp.id)
                                  : [...prev, emp.id]
                              );
                            } else {
                              setSelectedEmployee(emp);
                              prefillFromEmployee(emp);
                            }
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {emp.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-slate-800 text-sm">{emp.name}</p>
                            <p className="text-xs text-slate-500">
                              {emp.title} · {emp.entity}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Variable Override */}
              {currentStep === 'variables' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-1">
                    Review & Override Variables
                  </h2>
                  <p className="text-sm text-slate-500 mb-4">
                    Variables have been auto-filled from the employee record. Override any values as
                    needed.
                  </p>

                  {missingRequired.length > 0 && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-700">
                      Required variables missing: {missingRequired.join(', ')}
                    </div>
                  )}

                  <div className="space-y-3">
                    {allVarsForTemplate.map((v) => (
                      <div key={v.key}>
                        <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                          <code className="bg-slate-100 px-1 rounded text-xs">{`{{${v.key}}}`}</code>
                          {v.label}
                          {v.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={variables[v.key] ?? ''}
                          onChange={(e) =>
                            setVariables((prev) => ({ ...prev, [v.key]: e.target.value }))
                          }
                          placeholder={v.sampleValue}
                          className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                            v.required && !variables[v.key]
                              ? 'border-red-300 bg-red-50'
                              : 'border-slate-200'
                          }`}
                        />
                      </div>
                    ))}
                    {allVarsForTemplate.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-6">
                        No additional variables needed for this template.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Preview & Send */}
              {currentStep === 'preview' && generatedLetter && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Letter Preview</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={sending || sent}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium ${
                          sent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {sending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : sent ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        {sent ? 'Sent!' : 'Send to Employee'}
                      </button>
                    </div>
                  </div>

                  {/* Digital Signature Placeholder */}
                  <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-purple-600 shrink-0" />
                    <p className="text-xs text-purple-700">
                      Digital signature integration available. Click &quot;Send&quot; to request
                      employee e-signature via DocuSign/AdobeSign.
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-500 ml-2">{generatedLetter.templateName}</p>
                    </div>
                    <div
                      className="bg-white p-4 overflow-y-auto max-h-[500px]"
                      dangerouslySetInnerHTML={{ __html: generatedLetter.htmlContent }}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleReset}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Generate Another Letter
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {currentStep !== 'preview' && (
                <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentStep(STEPS[stepIndex - 1]?.id ?? 'template')}
                    disabled={stepIndex === 0}
                    className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-40"
                  >
                    Back
                  </button>
                  {currentStep === 'variables' ? (
                    <button
                      onClick={handleGenerate}
                      disabled={generating || missingRequired.length > 0}
                      className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center gap-2 disabled:opacity-40"
                    >
                      {generating && <RefreshCw className="w-4 h-4 animate-spin" />}
                      Generate Letter
                    </button>
                  ) : (
                    <button
                      onClick={next}
                      disabled={!canProceed()}
                      className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-40"
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Panel */}
          <div className="space-y-4">
            {/* Selected Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Selection Summary
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTemplate ? 'bg-blue-100' : 'bg-slate-100'}`}
                  >
                    <FileText
                      className={`w-4 h-4 ${selectedTemplate ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Template</p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedTemplate?.name ?? 'Not selected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedEmployee ? 'bg-emerald-100' : 'bg-slate-100'}`}
                  >
                    <User
                      className={`w-4 h-4 ${selectedEmployee ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Employee</p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedEmployee?.name ??
                        (bulkMode && bulkSelected.length > 0
                          ? `${bulkSelected.length} selected`
                          : 'Not selected')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Details */}
            {selectedTemplate && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Template Details
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_LABELS[selectedTemplate.category].bg} ${CATEGORY_LABELS[selectedTemplate.category].color}`}
                    >
                      {CATEGORY_LABELS[selectedTemplate.category].label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Country</span>
                    <span className="font-medium text-slate-700">
                      {COUNTRY_FLAGS[selectedTemplate.country]} {selectedTemplate.country}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Version</span>
                    <span className="font-medium text-slate-700">v{selectedTemplate.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required Variables</span>
                    <span className="font-medium text-slate-700">
                      {selectedTemplate.requiredVariables.length}
                    </span>
                  </div>
                  {selectedTemplate.legalClause && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-500 mb-1">Legal Reference</p>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedTemplate.legalClause}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bulk Mode Panel */}
            {bulkMode && bulkSelected.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Bulk Selection
                  </p>
                  <button
                    onClick={() => setBulkSelected([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-1">
                  {MOCK_EMPLOYEES.filter((e) => bulkSelected.includes(e.id)).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{e.name}</span>
                      <button
                        onClick={() => setBulkSelected((prev) => prev.filter((id) => id !== e.id))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Generate for All ({bulkSelected.length})
                </button>
              </div>
            )}

            {/* Recent Letters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Recent Letters
              </p>
              <div className="space-y-2">
                {generatedLetters.slice(0, 4).map((l) => {
                  const s = STATUS_STYLES[l.status];
                  return (
                    <div key={l.id} className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">
                          {l.templateName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{l.employeeName}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${s.bg}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
