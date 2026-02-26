'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  FileText,
  Loader2,
  Shield,
  Clock,
  IndianRupee,
  Users,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BankFormat =
  | 'INDIA_NEFT'
  | 'INDIA_IMPS'
  | 'INDIA_UPI'
  | 'UAE_SIF'
  | 'UAE_DIRECT_CREDIT'
  | 'KSA_SARIE'
  | 'SWIFT_MT103';

interface BankFileRecord {
  id: string;
  period: string;
  bankFormat: BankFormat;
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  totalAmount: number;
  currency: string;
  generatedAt: string;
  downloadCount: number;
}

interface EmployeeValidation {
  employeeCode: string;
  employeeName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  amount: number;
  status: 'VALID' | 'INVALID';
  error: string | null;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const BANK_FORMAT_OPTIONS: {
  value: BankFormat;
  label: string;
  country: string;
  ext: string;
  flag: string;
}[] = [
  { value: 'INDIA_NEFT', label: 'NEFT Batch', country: 'India', ext: '.txt', flag: '🇮🇳' },
  { value: 'INDIA_IMPS', label: 'IMPS Batch', country: 'India', ext: '.txt', flag: '🇮🇳' },
  { value: 'INDIA_UPI', label: 'UPI Batch', country: 'India', ext: '.txt', flag: '🇮🇳' },
  { value: 'UAE_SIF', label: 'WPS SIF File', country: 'UAE', ext: '.sif', flag: '🇦🇪' },
  { value: 'UAE_DIRECT_CREDIT', label: 'Direct Credit', country: 'UAE', ext: '.txt', flag: '🇦🇪' },
  { value: 'KSA_SARIE', label: 'SARIE Format', country: 'KSA', ext: '.txt', flag: '🇸🇦' },
  { value: 'SWIFT_MT103', label: 'SWIFT MT103', country: 'International', ext: '.txt', flag: '🌐' },
];

const MOCK_HISTORY: BankFileRecord[] = [
  {
    id: 'bf-001',
    period: '2026-01',
    bankFormat: 'INDIA_NEFT',
    fileName: 'NEFT_ENTITY001_2026-01.txt',
    totalRecords: 243,
    validRecords: 241,
    invalidRecords: 2,
    totalAmount: 15037500,
    currency: 'INR',
    generatedAt: '2026-01-31T10:00:00Z',
    downloadCount: 3,
  },
  {
    id: 'bf-002',
    period: '2025-12',
    bankFormat: 'INDIA_NEFT',
    fileName: 'NEFT_ENTITY001_2025-12.txt',
    totalRecords: 239,
    validRecords: 239,
    invalidRecords: 0,
    totalAmount: 14726250,
    currency: 'INR',
    generatedAt: '2025-12-31T11:00:00Z',
    downloadCount: 2,
  },
  {
    id: 'bf-003',
    period: '2025-11',
    bankFormat: 'INDIA_NEFT',
    fileName: 'NEFT_ENTITY001_2025-11.txt',
    totalRecords: 236,
    validRecords: 236,
    invalidRecords: 0,
    totalAmount: 14425000,
    currency: 'INR',
    generatedAt: '2025-11-30T09:30:00Z',
    downloadCount: 1,
  },
];

const MOCK_VALIDATIONS: EmployeeValidation[] = [
  {
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    bankName: 'HDFC Bank',
    accountNumber: '50100012345678',
    ifsc: 'HDFC0001234',
    amount: 97309,
    status: 'VALID',
    error: null,
  },
  {
    employeeCode: 'EMP002',
    employeeName: 'Rahul Mehta',
    bankName: 'ICICI Bank',
    accountNumber: '003501234567',
    ifsc: 'ICIC0000035',
    amount: 158430,
    status: 'VALID',
    error: null,
  },
  {
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    bankName: 'Axis Bank',
    accountNumber: '',
    ifsc: 'UTIB0001234',
    amount: 142000,
    status: 'INVALID',
    error: 'Account number is missing',
  },
  {
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    bankName: 'SBI',
    accountNumber: '12345678901',
    ifsc: 'INVALID_IFSC',
    amount: 46250,
    status: 'INVALID',
    error: 'IFSC code format is invalid',
  },
  {
    employeeCode: 'EMP005',
    employeeName: 'Kavita Singh',
    bankName: 'Kotak Mahindra',
    accountNumber: '9876543210',
    ifsc: 'KKBK0001234',
    amount: 88750,
    status: 'VALID',
    error: null,
  },
];

function fmt(n: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: n > 999999 ? 'compact' : 'standard',
  }).format(n);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BankFileManager() {
  const [selectedFormat, setSelectedFormat] = useState<BankFormat>('INDIA_NEFT');
  const [_selectedRun] = useState('run-2026-02');
  const [generating, setGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<BankFileRecord | null>(null);
  const [validating, setValidating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [_showPreview, _setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  const selectedFormatConfig = BANK_FORMAT_OPTIONS.find((f) => f.value === selectedFormat)!;
  const validCount = MOCK_VALIDATIONS.filter((v) => v.status === 'VALID').length;
  const invalidCount = MOCK_VALIDATIONS.filter((v) => v.status === 'INVALID').length;

  const handleValidate = async () => {
    setValidating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setValidating(false);
    setShowValidation(true);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    const period = '2026-02';
    setGeneratedFile({
      id: `bf-new-${Date.now()}`,
      period,
      bankFormat: selectedFormat,
      fileName: `${selectedFormat.replace('_', '-')}_ENTITY001_${period}_${Date.now()}${selectedFormatConfig.ext}`,
      totalRecords: MOCK_VALIDATIONS.length,
      validRecords: validCount,
      invalidRecords: invalidCount,
      totalAmount: MOCK_VALIDATIONS.filter((v) => v.status === 'VALID').reduce(
        (s, v) => s + v.amount,
        0
      ),
      currency:
        selectedFormatConfig.country === 'UAE'
          ? 'AED'
          : selectedFormatConfig.country === 'KSA'
            ? 'SAR'
            : 'INR',
      generatedAt: new Date().toISOString(),
      downloadCount: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bank File Manager</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate and manage bank transfer files for salary disbursement
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === 'generate' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600'}`}
            >
              Generate File
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === 'history' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600'}`}
            >
              File History
            </button>
          </div>
        </div>

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Configuration */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">File Configuration</h2>

                {/* Format Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Bank File Format
                  </label>
                  <div className="space-y-2">
                    {BANK_FORMAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedFormat(opt.value)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${
                          selectedFormat === opt.value
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className="text-base">{opt.flag}</span>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{opt.label}</span>
                          <span className="text-xs text-gray-500 ml-2">({opt.country})</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{opt.ext}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium hover:border-gray-300 disabled:opacity-60 transition-colors"
                  >
                    {validating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 text-gray-500" />
                    )}
                    {validating ? 'Validating...' : 'Validate Bank Details'}
                  </button>

                  {showValidation && (
                    <div
                      className={`p-3 rounded-lg border text-sm ${invalidCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}
                    >
                      <p
                        className={`font-medium ${invalidCount > 0 ? 'text-yellow-700' : 'text-green-700'}`}
                      >
                        {validCount} valid, {invalidCount} invalid employee records
                      </p>
                      {invalidCount > 0 && (
                        <p className="text-xs text-yellow-600 mt-0.5">
                          Fix invalid records before generating to include all employees
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {generating ? 'Generating...' : 'Generate Bank File'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Validation & Output */}
            <div className="lg:col-span-2 space-y-4">
              {/* Validation Details */}
              {showValidation && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Bank Detail Validation
                      </h3>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {validCount} valid
                      </span>
                      {invalidCount > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {invalidCount} invalid
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                            Employee
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                            Bank / IFSC
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">
                            Amount
                          </th>
                          <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_VALIDATIONS.map((v) => (
                          <tr
                            key={v.employeeCode}
                            className={`border-b border-gray-50 ${v.status === 'INVALID' ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-gray-800 text-xs">{v.employeeName}</p>
                              <p className="text-xs text-gray-400">{v.employeeCode}</p>
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="text-xs text-gray-700">{v.bankName}</p>
                              <p className="text-xs font-mono text-gray-500">
                                {v.accountNumber || <span className="text-red-500">Missing</span>} ·{' '}
                                {v.ifsc}
                              </p>
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-800">
                              {new Intl.NumberFormat('en-IN').format(v.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {v.status === 'VALID' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                              ) : (
                                <div title={v.error ?? ''}>
                                  <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                  {v.error && (
                                    <p className="text-xs text-red-500 mt-0.5">{v.error}</p>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Generated File */}
              {generatedFile && (
                <div className="bg-white border border-green-200 rounded-xl shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">File Generated Successfully</p>
                      <p className="text-sm text-gray-500 mt-0.5 font-mono truncate">
                        {generatedFile.fileName}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          {generatedFile.validRecords} employees
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {fmt(generatedFile.totalAmount, generatedFile.currency)}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(generatedFile.generatedAt).toLocaleString()}
                        </span>
                      </div>
                      {generatedFile.invalidRecords > 0 && (
                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {generatedFile.invalidRecords} employees excluded due to invalid bank
                          details
                        </p>
                      )}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex-shrink-0">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              )}

              {/* Generating state */}
              {generating && (
                <div className="flex items-center justify-center h-32 bg-white border border-gray-200 rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Generating {selectedFormatConfig.label}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800">Bank File History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {MOCK_HISTORY.map((file) => {
                const fmtConf = BANK_FORMAT_OPTIONS.find((f) => f.value === file.bankFormat)!;
                return (
                  <div key={file.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                      {fmtConf.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{file.fileName}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <span>{file.period}</span>
                        <span>{fmtConf.label}</span>
                        <span>{file.validRecords} employees</span>
                        {file.invalidRecords > 0 && (
                          <span className="text-yellow-600">{file.invalidRecords} excluded</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {fmt(file.totalAmount, file.currency)}
                      </p>
                      <p className="text-xs text-gray-500">{file.downloadCount} downloads</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Re-generate"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
