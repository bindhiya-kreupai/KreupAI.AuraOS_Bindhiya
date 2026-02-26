'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  Info,
  Send,
  RefreshCw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportType =
  | 'INDIA_PF_ECR'
  | 'INDIA_ESI_RETURN'
  | 'INDIA_FORM_16'
  | 'INDIA_FORM_24Q'
  | 'INDIA_PT_RETURN'
  | 'UAE_WPS_SUMMARY'
  | 'UAE_GRATUITY_LIABILITY'
  | 'KSA_GOSI_RETURN'
  | 'KSA_SADAD_FILE';

type GenerationState = 'IDLE' | 'PREVIEWING' | 'GENERATING' | 'DONE' | 'ERROR';

interface ReportConfig {
  id: ReportType;
  label: string;
  country: string;
  flag: string;
  frequency: string;
  fileFormat: string;
  description: string;
  periodType: 'monthly' | 'quarterly' | 'half-yearly' | 'annual';
  requiredFields: string[];
}

interface GeneratedReport {
  reportType: ReportType;
  period: string;
  fileName: string;
  generatedAt: string;
  recordCount: number;
  totalAmount: number;
  currency: string;
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  notes: string[];
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPORT_CONFIGS: ReportConfig[] = [
  // India
  {
    id: 'INDIA_PF_ECR',
    label: 'PF ECR (EPFO Monthly Return)',
    country: 'India',
    flag: '🇮🇳',
    frequency: 'Monthly (by 15th)',
    fileFormat: 'TXT',
    description: 'Electronic Challan cum Return for EPFO — includes UAN, EE/ER contributions, EPS.',
    periodType: 'monthly',
    requiredFields: ['period', 'entity'],
  },
  {
    id: 'INDIA_ESI_RETURN',
    label: 'ESI Half-Yearly Return (ESIC)',
    country: 'India',
    flag: '🇮🇳',
    frequency: 'Half-Yearly (Nov 11 / May 11)',
    fileFormat: 'PDF/Excel',
    description: 'ESIC contribution return for employees with gross ≤ Rs 21,000/month.',
    periodType: 'half-yearly',
    requiredFields: ['period', 'entity'],
  },
  {
    id: 'INDIA_FORM_24Q',
    label: 'Form 24Q (Quarterly TDS Return)',
    country: 'India',
    flag: '🇮🇳',
    frequency: 'Quarterly (Jul/Oct/Jan/May)',
    fileFormat: 'ZIP (FVU file)',
    description: 'TDS return for salaries u/s 192 — filed on TRACES portal.',
    periodType: 'quarterly',
    requiredFields: ['period', 'entity', 'fiscalYear'],
  },
  {
    id: 'INDIA_FORM_16',
    label: 'Form 16 (Annual TDS Certificate)',
    country: 'India',
    flag: '🇮🇳',
    frequency: 'Annual (by June 15)',
    fileFormat: 'PDF',
    description: 'Individual TDS certificate for each employee — Part A from TRACES + Part B.',
    periodType: 'annual',
    requiredFields: ['fiscalYear', 'entity', 'employeeId'],
  },
  {
    id: 'INDIA_PT_RETURN',
    label: 'Professional Tax Return',
    country: 'India',
    flag: '🇮🇳',
    frequency: 'Monthly (by 20th)',
    fileFormat: 'PDF',
    description: 'State-wise professional tax return. State required.',
    periodType: 'monthly',
    requiredFields: ['period', 'entity', 'state'],
  },
  // UAE
  {
    id: 'UAE_WPS_SUMMARY',
    label: 'WPS Submission Summary (MoHRE)',
    country: 'UAE',
    flag: '🇦🇪',
    frequency: 'Monthly (by 14th)',
    fileFormat: 'PDF + SIF',
    description: 'Wage Protection System monthly summary report — MOL reference and status.',
    periodType: 'monthly',
    requiredFields: ['period', 'entity'],
  },
  {
    id: 'UAE_GRATUITY_LIABILITY',
    label: 'EOSB Liability Report',
    country: 'UAE',
    flag: '🇦🇪',
    frequency: 'Annual',
    fileFormat: 'PDF',
    description: 'End of Service Benefit provision report for auditors and finance.',
    periodType: 'annual',
    requiredFields: ['entity'],
  },
  // KSA
  {
    id: 'KSA_GOSI_RETURN',
    label: 'GOSI Monthly Return',
    country: 'KSA',
    flag: '🇸🇦',
    frequency: 'Monthly (by 10th)',
    fileFormat: 'XML',
    description: 'General Organization for Social Insurance monthly contribution return.',
    periodType: 'monthly',
    requiredFields: ['period', 'entity'],
  },
  {
    id: 'KSA_SADAD_FILE',
    label: 'SADAD Payment File',
    country: 'KSA',
    flag: '🇸🇦',
    frequency: 'Monthly (with GOSI)',
    fileFormat: 'TXT',
    description: 'SADAD online payment reference file for GOSI contributions.',
    periodType: 'monthly',
    requiredFields: ['period', 'entity'],
  },
];

const MOCK_ENTITIES = [
  { id: 'entity-001', name: 'KreupAI Technologies Pvt Ltd (India)' },
  { id: 'entity-002', name: 'KreupAI Technologies LLC (UAE)' },
  { id: 'entity-003', name: 'KreupAI Arabia Co. (KSA)' },
];

const INDIA_STATES = ['KA', 'MH', 'DL', 'TN', 'AP', 'GJ', 'RJ', 'WB', 'HR'];

const QUARTERS = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];

function getMonthOptions(): string[] {
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

// ---------------------------------------------------------------------------
// Mock Preview Data
// ---------------------------------------------------------------------------

const MOCK_PREVIEW: Record<ReportType, { rows: string[][]; columns: string[]; summary: string }> = {
  INDIA_PF_ECR: {
    columns: [
      'UAN',
      'Employee Name',
      'Gross PF Wages',
      'EE Contribution',
      'ER Contribution',
      'EPS',
    ],
    rows: [
      ['100987654321', 'Priya Sharma', '48,000', '5,760', '4,404', '1,250'],
      ['100987654322', 'Rahul Mehta', '60,000', '7,200', '5,550', '1,250'],
      ['100987654323', 'Anita Nair', '52,000', '6,240', '4,806', '1,250'],
    ],
    summary: '243 employees · Total EE: ₹13,68,000 · Total ER: ₹13,68,000 · Total EPS: ₹3,03,750',
  },
  INDIA_ESI_RETURN: {
    columns: ['ESI No.', 'Employee Name', 'Gross Wages', 'EE ESI', 'ER ESI'],
    rows: [
      ['41-00-123456-000-0001', 'Shiva Kumar', '18,500', '138', '601'],
      ['41-00-123456-000-0002', 'Ananya Das', '21,000', '157', '682'],
    ],
    summary: '18 employees (gross ≤ Rs 21,000) · Total ESI: ₹1,45,800',
  },
  INDIA_FORM_24Q: {
    columns: ['TAN', 'Quarter', 'Deductee Count', 'Total TDS', 'Challan No.'],
    rows: [['MUMB12345A', 'Q3 Oct-Dec 2025', '247', '2,96,61,600', 'CHN-2025-Q3-001']],
    summary: '247 employees · Total TDS Q3: ₹2.97 Cr',
  },
  INDIA_FORM_16: {
    columns: ['Employee', 'PAN', 'Gross Income', 'Standard Dedn', 'Taxable Income', 'Tax'],
    rows: [['Priya Sharma', 'ABCDE1234F', '14,40,000', '75,000', '12,95,880', '1,60,343']],
    summary: 'Form 16 for FY 2025-26 — all components per CBDT format',
  },
  INDIA_PT_RETURN: {
    columns: ['State', 'Slab', 'Employee Count', 'PT Amount'],
    rows: [
      ['KA', '>₹25,000/month', '182', '36,400'],
      ['KA', '₹15,001-₹25,000', '49', '9,800'],
      ['KA', '<₹15,000', '12', '1,200'],
    ],
    summary: 'Karnataka PT Return — 243 employees · Total: ₹48,600',
  },
  UAE_WPS_SUMMARY: {
    columns: ['MOL Ref No.', 'Period', 'Employees', 'Total Amount (AED)', 'Status'],
    rows: [['MOL1740297600001', 'Feb 2026', '249', '4,92,000', 'ACCEPTED']],
    summary: '249 employees · AED 4,92,000 accepted by MoHRE',
  },
  UAE_GRATUITY_LIABILITY: {
    columns: ['Department', 'Employees', 'Avg Service (yrs)', 'EOSB Provision (AED)'],
    rows: [
      ['Engineering', '82', '3.2', '8,45,000'],
      ['Sales', '55', '2.8', '4,12,000'],
      ['Finance', '22', '4.1', '2,05,000'],
    ],
    summary: '249 employees · Total EOSB Provision: AED 1.73 Cr (FY 2025)',
  },
  KSA_GOSI_RETURN: {
    columns: ['GOSI No.', 'Employee Name', 'Nationality', 'Basic+Housing', 'EE GOSI', 'ER GOSI'],
    rows: [
      ['70123456', 'Ahmed Al-Rashid', 'Saudi', '18,000', '1,890', '2,250'],
      ['70234567', 'Mohammed Khalid', 'Saudi', '15,000', '1,575', '1,875'],
      ['80345678', 'Rajesh Kumar', 'Non-Saudi', '12,000', '240', '240'],
    ],
    summary: '185 employees · Saudi: 82 · Non-Saudi: 103 · Total GOSI: SAR 12,45,000',
  },
  KSA_SADAD_FILE: {
    columns: ['SADAD Reference', 'Amount (SAR)', 'Due Date'],
    rows: [[`GOSI-entity-003-2026-02`, '1,245,000', '2026-02-10']],
    summary: 'SADAD payment reference for GOSI Feb 2026',
  },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function StatutoryReportGenerator() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('INDIA_PF_ECR');
  const [selectedEntity, setSelectedEntity] = useState(MOCK_ENTITIES[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(getMonthOptions()[1]);
  const [selectedQuarter, setSelectedQuarter] = useState(QUARTERS[2]);
  const [selectedState, setSelectedState] = useState('KA');
  const [fiscalYear, setFiscalYear] = useState('2025-26');
  const [generationState, setGenerationState] = useState<GenerationState>('IDLE');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const config = REPORT_CONFIGS.find((r) => r.id === selectedReport)!;
  const preview = MOCK_PREVIEW[selectedReport];

  const handlePreview = () => {
    setGenerationState('PREVIEWING');
    setTimeout(() => {
      setShowPreview(true);
      setGenerationState('IDLE');
    }, 600);
  };

  const handleGenerate = async () => {
    setGenerationState('GENERATING');
    await new Promise((r) => setTimeout(r, 2000));
    setGeneratedReport({
      reportType: selectedReport,
      period: selectedPeriod,
      fileName: `${selectedReport}_ENTITY_${selectedPeriod}_${Date.now()}.${config.fileFormat.split('/')[0].toLowerCase()}`,
      generatedAt: new Date().toISOString(),
      recordCount: 243,
      totalAmount: 3337800,
      currency: config.country === 'UAE' ? 'AED' : config.country === 'KSA' ? 'SAR' : 'INR',
      status: 'SUCCESS',
      notes: [
        'All records validated successfully',
        'File ready for submission to statutory portal',
      ],
    });
    setGenerationState('DONE');
  };

  // Group reports by country for the selector
  const countries = Array.from(new Set(REPORT_CONFIGS.map((r) => r.country)));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statutory Report Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate compliance reports and e-filing documents for all jurisdictions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Report Selector & Config */}
          <div className="space-y-4">
            {/* Report Type Selector */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Report Type</h3>
              <div className="space-y-4">
                {countries.map((country) => {
                  const reports = REPORT_CONFIGS.filter((r) => r.country === country);
                  return (
                    <div key={country}>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                        {reports[0].flag} {country}
                      </p>
                      <div className="space-y-1">
                        {reports.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setSelectedReport(r.id);
                              setShowPreview(false);
                              setGenerationState('IDLE');
                              setGeneratedReport(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedReport === r.id
                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {r.label}
                            <span className="ml-1 text-xs text-gray-400">({r.fileFormat})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Report Parameters */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Parameters</h3>

              {/* Entity */}
              {config.requiredFields.includes('entity') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Entity / Branch
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {MOCK_ENTITIES.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Period */}
              {config.periodType === 'monthly' && config.requiredFields.includes('period') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {getMonthOptions().map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quarter */}
              {config.periodType === 'quarterly' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quarter</label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {QUARTERS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fiscal Year */}
              {config.requiredFields.includes('fiscalYear') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fiscal Year
                  </label>
                  <select
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {['2025-26', '2024-25', '2023-24'].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* State (for PT) */}
              {config.requiredFields.includes('state') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handlePreview}
                  disabled={generationState !== 'IDLE'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium hover:border-gray-300 disabled:opacity-60 transition-colors"
                >
                  {generationState === 'PREVIEWING' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                  Preview Data
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generationState !== 'IDLE' && generationState !== 'DONE'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {generationState === 'GENERATING' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : generationState === 'DONE' ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {generationState === 'GENERATING'
                    ? 'Generating...'
                    : generationState === 'DONE'
                      ? 'Re-generate'
                      : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Info + Preview + Output */}
          <div className="lg:col-span-2 space-y-4">
            {/* Report Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    {config.flag} {config.label}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">{config.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-700">
                    <span>
                      <strong>Frequency:</strong> {config.frequency}
                    </span>
                    <span>
                      <strong>Format:</strong> {config.fileFormat}
                    </span>
                    <span>
                      <strong>Period type:</strong> {config.periodType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            {showPreview && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    Data Preview (first 3 rows)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {preview.columns.map((col) => (
                          <th
                            key={col}
                            className="text-left px-4 py-2 font-medium text-gray-500 whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-2.5 bg-indigo-50 border-t border-indigo-100">
                  <p className="text-xs text-indigo-700">{preview.summary}</p>
                </div>
              </div>
            )}

            {/* Generated Report Output */}
            {generatedReport && (
              <div className="bg-white border border-green-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Report Generated Successfully</p>
                    <p className="text-xs text-gray-500">
                      {new Date(generatedReport.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 font-mono text-xs text-gray-700 truncate">
                  {generatedReport.fileName}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Records</p>
                    <p className="text-lg font-bold text-gray-800 mt-0.5">
                      {generatedReport.recordCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-gray-800 mt-0.5">
                      {new Intl.NumberFormat('en-IN', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(generatedReport.totalAmount)}{' '}
                      {generatedReport.currency}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-bold text-green-600 mt-0.5">
                      {generatedReport.status}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {generatedReport.notes.map((note) => (
                    <div key={note} className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {note}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <Download className="w-4 h-4" /> Download {config.fileFormat}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">
                    <Send className="w-4 h-4 text-gray-500" /> Mark as Filed
                  </button>
                </div>
              </div>
            )}

            {generationState === 'GENERATING' && (
              <div className="flex items-center justify-center h-40 bg-white border border-gray-200 rounded-xl">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Generating {config.label}...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Processing employee data and validating records
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
