'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  Save,
  Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CountryCode = 'IN' | 'AE' | 'SA' | 'US';
type ComponentType = 'FIXED' | 'PERCENTAGE' | 'FORMULA';
type ComponentCategory = 'BASIC' | 'ALLOWANCE' | 'BONUS' | 'DEDUCTION' | 'EMPLOYER_CONTRIBUTION';

interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  category: ComponentCategory;
  type: ComponentType;
  value: number;
  calculationBase: string;
  isTaxable: boolean;
  isPartOfCTC: boolean;
  isStatutory: boolean;
  description: string;
}

interface ValidationWarning {
  type: 'error' | 'warning';
  message: string;
}

// ---------------------------------------------------------------------------
// Country Configuration
// ---------------------------------------------------------------------------

const COUNTRY_CONFIG: Record<
  CountryCode,
  {
    label: string;
    currency: string;
    flag: string;
    defaultComponents: SalaryComponent[];
    rules: { label: string; rule: string }[];
  }
> = {
  IN: {
    label: 'India (INR)',
    currency: 'INR',
    flag: '🇮🇳',
    rules: [
      { label: 'Basic', rule: 'Recommended 40-50% of CTC' },
      { label: 'HRA', rule: '50% of Basic (metro), 40% (non-metro)' },
      { label: 'PF', rule: '12% of Basic+DA, wage ceiling Rs 15,000' },
      { label: 'Gratuity', rule: '4.81% of Basic — employer provision' },
    ],
    defaultComponents: [
      {
        id: 'c1',
        name: 'Basic Salary',
        code: 'BASIC',
        category: 'BASIC',
        type: 'PERCENTAGE',
        value: 40,
        calculationBase: 'CTC',
        isTaxable: true,
        isPartOfCTC: true,
        isStatutory: false,
        description: '40% of Annual CTC',
      },
      {
        id: 'c2',
        name: 'HRA',
        code: 'HRA',
        category: 'ALLOWANCE',
        type: 'PERCENTAGE',
        value: 50,
        calculationBase: 'BASIC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: '50% of Basic (Metro)',
      },
      {
        id: 'c3',
        name: 'Medical Allowance',
        code: 'MEDICAL',
        category: 'ALLOWANCE',
        type: 'FIXED',
        value: 15000,
        calculationBase: '',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'Rs 15,000 annual',
      },
      {
        id: 'c4',
        name: 'LTA',
        code: 'LTA',
        category: 'ALLOWANCE',
        type: 'FIXED',
        value: 24000,
        calculationBase: '',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'Leave Travel Allowance',
      },
      {
        id: 'c5',
        name: 'Special Allowance',
        code: 'SPECIAL',
        category: 'ALLOWANCE',
        type: 'FORMULA',
        value: 0,
        calculationBase: '',
        isTaxable: true,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'Balancing component',
      },
      {
        id: 'c6',
        name: 'Employee PF',
        code: 'EE_PF',
        category: 'DEDUCTION',
        type: 'PERCENTAGE',
        value: 12,
        calculationBase: 'BASIC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: true,
        description: '12% of Basic',
      },
      {
        id: 'c7',
        name: 'Employer PF',
        code: 'ER_PF',
        category: 'EMPLOYER_CONTRIBUTION',
        type: 'PERCENTAGE',
        value: 12,
        calculationBase: 'BASIC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: true,
        description: '12% employer PF',
      },
      {
        id: 'c8',
        name: 'Gratuity',
        code: 'GRATUITY',
        category: 'EMPLOYER_CONTRIBUTION',
        type: 'PERCENTAGE',
        value: 4.81,
        calculationBase: 'BASIC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: true,
        description: '4.81% of Basic',
      },
    ],
  },
  AE: {
    label: 'UAE (AED)',
    currency: 'AED',
    flag: '🇦🇪',
    rules: [
      { label: 'Basic', rule: 'Minimum 60% of total package (WPS compliance)' },
      { label: 'Housing', rule: 'Typically 25% of total' },
      { label: 'Transport', rule: 'Typically 10% of total' },
      { label: 'No Income Tax', rule: 'UAE has no personal income tax' },
    ],
    defaultComponents: [
      {
        id: 'u1',
        name: 'Basic Salary',
        code: 'BASIC',
        category: 'BASIC',
        type: 'PERCENTAGE',
        value: 60,
        calculationBase: 'CTC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: '60% of total (WPS minimum)',
      },
      {
        id: 'u2',
        name: 'Housing Allowance',
        code: 'HOUSING',
        category: 'ALLOWANCE',
        type: 'PERCENTAGE',
        value: 25,
        calculationBase: 'CTC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: '25% of total',
      },
      {
        id: 'u3',
        name: 'Transportation Allowance',
        code: 'TRANSPORT',
        category: 'ALLOWANCE',
        type: 'PERCENTAGE',
        value: 10,
        calculationBase: 'CTC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: '10% of total',
      },
      {
        id: 'u4',
        name: 'Phone Allowance',
        code: 'PHONE',
        category: 'ALLOWANCE',
        type: 'FIXED',
        value: 6000,
        calculationBase: '',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'AED 500/month × 12',
      },
      {
        id: 'u5',
        name: 'Other Allowances',
        code: 'OTHER',
        category: 'ALLOWANCE',
        type: 'FORMULA',
        value: 0,
        calculationBase: '',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'Balance of package',
      },
    ],
  },
  SA: {
    label: 'KSA (SAR)',
    currency: 'SAR',
    flag: '🇸🇦',
    rules: [
      { label: 'Basic', rule: 'Minimum 50% of total package (Saudi Labour Law)' },
      { label: 'Housing', rule: 'Typically 25% of Basic — standard in KSA' },
      { label: 'Transport', rule: 'SAR 1,000/month typical fixed amount' },
      { label: 'GOSI', rule: 'Saudis: 10.5% EE + 12.5% ER; Non-Saudis: 2% each' },
    ],
    defaultComponents: [
      {
        id: 'k1',
        name: 'Basic Salary',
        code: 'BASIC',
        category: 'BASIC',
        type: 'PERCENTAGE',
        value: 60,
        calculationBase: 'CTC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: '60% of total',
      },
      {
        id: 'k2',
        name: 'Housing Allowance',
        code: 'HOUSING',
        category: 'ALLOWANCE',
        type: 'PERCENTAGE',
        value: 25,
        calculationBase: 'BASIC',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: '25% of Basic',
      },
      {
        id: 'k3',
        name: 'Transportation',
        code: 'TRANSPORT',
        category: 'ALLOWANCE',
        type: 'FIXED',
        value: 12000,
        calculationBase: '',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'SAR 1,000/month × 12',
      },
      {
        id: 'k4',
        name: 'Other Allowances',
        code: 'OTHER',
        category: 'ALLOWANCE',
        type: 'FORMULA',
        value: 0,
        calculationBase: '',
        isTaxable: false,
        isPartOfCTC: true,
        isStatutory: false,
        description: 'Balance',
      },
    ],
  },
  US: {
    label: 'United States (USD)',
    currency: 'USD',
    flag: '🇺🇸',
    rules: [
      { label: 'Base Salary', rule: 'Typically 80% of total comp' },
      { label: 'Bonus', rule: 'Annual target bonus 10-20% of base' },
      { label: 'Equity', rule: 'RSU/stock options vesting over 4 years' },
      { label: 'FICA', rule: 'SS 6.2% (cap $168,600) + Medicare 1.45%' },
    ],
    defaultComponents: [
      {
        id: 'us1',
        name: 'Base Salary',
        code: 'BASE',
        category: 'BASIC',
        type: 'PERCENTAGE',
        value: 80,
        calculationBase: 'CTC',
        isTaxable: true,
        isPartOfCTC: true,
        isStatutory: false,
        description: '80% of total comp',
      },
      {
        id: 'us2',
        name: 'Annual Bonus Target',
        code: 'BONUS',
        category: 'BONUS',
        type: 'PERCENTAGE',
        value: 10,
        calculationBase: 'BASE',
        isTaxable: true,
        isPartOfCTC: true,
        isStatutory: false,
        description: '10% of base',
      },
      {
        id: 'us3',
        name: 'Equity (RSU)',
        code: 'EQUITY',
        category: 'BONUS',
        type: 'PERCENTAGE',
        value: 10,
        calculationBase: 'CTC',
        isTaxable: true,
        isPartOfCTC: true,
        isStatutory: false,
        description: '10% equity annualized',
      },
    ],
  },
};

const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  BASIC: 'bg-blue-100 text-blue-800',
  ALLOWANCE: 'bg-green-100 text-green-800',
  BONUS: 'bg-purple-100 text-purple-800',
  DEDUCTION: 'bg-red-100 text-red-800',
  EMPLOYER_CONTRIBUTION: 'bg-orange-100 text-orange-800',
};

const PIE_COLORS = [
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6366F1',
];

// ---------------------------------------------------------------------------
// Calculation Helpers
// ---------------------------------------------------------------------------

function calculateBreakdown(
  components: SalaryComponent[],
  annualCTC: number
): Record<string, number> {
  const resolved: Record<string, number> = { CTC: annualCTC };

  const sorted = [...components].filter((c) => c.type !== 'FORMULA');
  for (const comp of sorted) {
    if (comp.type === 'FIXED') {
      resolved[comp.code] = comp.value;
    } else if (comp.type === 'PERCENTAGE') {
      const base = resolved[comp.calculationBase] ?? annualCTC;
      resolved[comp.code] = Math.round(((base * comp.value) / 100) * 100) / 100;
    }
  }

  // FORMULA = balancing
  const formulaComp = components.find((c) => c.type === 'FORMULA');
  if (formulaComp) {
    const ctcComps = components.filter((c) => c.isPartOfCTC && c.type !== 'FORMULA');
    const allocated = ctcComps.reduce((s, c) => s + (resolved[c.code] ?? 0), 0);
    resolved[formulaComp.code] = Math.max(0, Math.round((annualCTC - allocated) * 100) / 100);
  }

  return resolved;
}

function validateStructure(
  components: SalaryComponent[],
  countryCode: CountryCode
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const basicComp = components.find((c) => c.category === 'BASIC');

  if (!basicComp) {
    warnings.push({ type: 'error', message: 'Missing Basic/Base salary component.' });
    return warnings;
  }

  if (basicComp.type === 'PERCENTAGE' && basicComp.calculationBase === 'CTC') {
    const ratio = basicComp.value / 100;
    if (countryCode === 'AE' && ratio < 0.6) {
      warnings.push({
        type: 'error',
        message: `UAE WPS: Basic must be ≥60% of total (current: ${basicComp.value}%)`,
      });
    }
    if (countryCode === 'SA' && ratio < 0.5) {
      warnings.push({
        type: 'error',
        message: `KSA Labour Law: Basic must be ≥50% of total (current: ${basicComp.value}%)`,
      });
    }
    if (countryCode === 'IN' && ratio < 0.4) {
      warnings.push({
        type: 'warning',
        message: `India: Basic below recommended 40% (current: ${basicComp.value}%). May affect PF and HRA calculations.`,
      });
    }
    if (countryCode === 'IN' && ratio > 0.5) {
      warnings.push({
        type: 'warning',
        message: `India: Basic above 50% of CTC (current: ${basicComp.value}%). Higher PF contributions will apply.`,
      });
    }
  }

  const ctcPctComps = components.filter(
    (c) => c.type === 'PERCENTAGE' && c.calculationBase === 'CTC' && c.isPartOfCTC
  );
  const totalPct = ctcPctComps.reduce((s, c) => s + c.value, 0);
  if (totalPct > 100) {
    warnings.push({
      type: 'error',
      message: `Components as % of CTC sum to ${totalPct.toFixed(1)}%, exceeding 100%.`,
    });
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Component: Pie Chart (CSS-based)
// ---------------------------------------------------------------------------

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  total: number;
}

function PieChart({ data, total }: PieChartProps) {
  let cumulativePct = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const pct = (d.value / total) * 100;
      const start = cumulativePct;
      cumulativePct += pct;
      return { ...d, pct, start };
    });

  const gradientParts = segments.map((s) => {
    const startDeg = (s.start / 100) * 360;
    const endDeg = ((s.start + s.pct) / 100) * 360;
    return `${s.color} ${startDeg}deg ${endDeg}deg`;
  });

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-32 h-32 rounded-full flex-shrink-0"
        style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
      />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {segments.slice(0, 8).map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600 truncate">{s.label}</span>
            <span className="text-xs font-medium text-gray-800 ml-auto flex-shrink-0">
              {s.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SalaryStructureBuilder() {
  const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [structureName, setStructureName] = useState('India Standard CTC');
  const [annualCTC, setAnnualCTC] = useState(1200000);
  const [components, setComponents] = useState<SalaryComponent[]>(
    COUNTRY_CONFIG['IN'].defaultComponents
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(true);
  const [saved, setSaved] = useState(false);

  const config = COUNTRY_CONFIG[countryCode];
  const breakdown = calculateBreakdown(components, annualCTC);
  const validationWarnings = validateStructure(components, countryCode);
  const hasErrors = validationWarnings.some((w) => w.type === 'error');

  const handleCountryChange = (code: CountryCode) => {
    setCountryCode(code);
    setComponents(COUNTRY_CONFIG[code].defaultComponents);
    setStructureName(`${COUNTRY_CONFIG[code].label.split(' ')[0]} Standard Structure`);
  };

  const updateComponent = (id: string, field: keyof SalaryComponent, value: unknown) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const addComponent = () => {
    const newComp: SalaryComponent = {
      id: `new-${Date.now()}`,
      name: 'New Allowance',
      code: `ALLOW_${Date.now()}`,
      category: 'ALLOWANCE',
      type: 'FIXED',
      value: 0,
      calculationBase: '',
      isTaxable: true,
      isPartOfCTC: true,
      isStatutory: false,
      description: '',
    };
    setComponents((prev) => [...prev, newComp]);
    setExpandedId(newComp.id);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Build pie chart data
  const pieData = components
    .filter((c) => c.isPartOfCTC && breakdown[c.code] > 0)
    .map((c, i) => ({
      label: c.name,
      value: breakdown[c.code] ?? 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));

  const formattedCTC = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(annualCTC);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salary Structure Builder</h1>
            <p className="text-sm text-gray-500 mt-1">
              Design and validate multi-component salary structures by jurisdiction
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Template'}
            </button>
          </div>
        </div>

        {/* Top Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Country selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline mr-1" /> Country / Jurisdiction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(COUNTRY_CONFIG) as CountryCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => handleCountryChange(code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      countryCode === code
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{COUNTRY_CONFIG[code].flag}</span>
                    <span className="truncate">{code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structure name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Structure Name</label>
              <input
                type="text"
                value={structureName}
                onChange={(e) => setStructureName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This template name will appear in employee records
              </p>
            </div>

            {/* Annual CTC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual CTC (Preview)
              </label>
              <input
                type="number"
                value={annualCTC}
                onChange={(e) => setAnnualCTC(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for real-time breakdown preview only
              </p>
            </div>
          </div>
        </div>

        {/* Country Rules */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <button
            className="flex items-center gap-2 w-full text-left"
            onClick={() => setShowRules((r) => !r)}
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {config.label} — Compliance Rules
            </span>
            {showRules ? (
              <ChevronUp className="w-4 h-4 text-blue-600 ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600 ml-auto" />
            )}
          </button>
          {showRules && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.rules.map((r) => (
                <div key={r.label} className="flex gap-2 text-sm">
                  <span className="font-medium text-blue-700 min-w-[80px]">{r.label}:</span>
                  <span className="text-blue-600">{r.rule}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="space-y-2">
            {validationWarnings.map((w, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  w.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    w.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                <p className={`text-sm ${w.type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {w.message}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Components Editor */}
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Salary Components</h2>
              <button
                onClick={addComponent}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Component
              </button>
            </div>

            {components.map((comp) => {
              const isExpanded = expandedId === comp.id;
              const amount = breakdown[comp.code] ?? 0;
              const monthlyAmount = Math.round(amount / 12);
              const pct = annualCTC > 0 ? ((amount / annualCTC) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={comp.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Component Row Header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800 text-sm">{comp.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[comp.category]}`}
                        >
                          {comp.category}
                        </span>
                        {comp.isStatutory && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Statutory
                          </span>
                        )}
                        {!comp.isTaxable && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Tax-exempt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {comp.description || 'No description'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
                          monthlyAmount
                        )}
                        <span className="text-xs text-gray-500">/mo</span>
                      </p>
                      <p className="text-xs text-gray-500">{pct}% of CTC</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Component Name
                        </label>
                        <input
                          value={comp.name}
                          onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Code (unique identifier)
                        </label>
                        <input
                          value={comp.code}
                          onChange={(e) =>
                            updateComponent(comp.id, 'code', e.target.value.toUpperCase())
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Category
                        </label>
                        <select
                          value={comp.category}
                          onChange={(e) => updateComponent(comp.id, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {(
                            [
                              'BASIC',
                              'ALLOWANCE',
                              'BONUS',
                              'DEDUCTION',
                              'EMPLOYER_CONTRIBUTION',
                            ] as ComponentCategory[]
                          ).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select
                          value={comp.type}
                          onChange={(e) => updateComponent(comp.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="FIXED">Fixed Amount (annual)</option>
                          <option value="PERCENTAGE">Percentage of Base</option>
                          <option value="FORMULA">Formula (auto-balance)</option>
                        </select>
                      </div>
                      {comp.type === 'PERCENTAGE' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Base for Calculation
                          </label>
                          <select
                            value={comp.calculationBase}
                            onChange={(e) =>
                              updateComponent(comp.id, 'calculationBase', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="CTC">CTC (Total Package)</option>
                            {components
                              .filter((c) => c.code !== comp.code)
                              .map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.name} ({c.code})
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                      {comp.type !== 'FORMULA' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {comp.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Annual Amount'}
                          </label>
                          <input
                            type="number"
                            value={comp.value}
                            onChange={(e) =>
                              updateComponent(comp.id, 'value', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          value={comp.description}
                          onChange={(e) => updateComponent(comp.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex gap-4 items-center col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={comp.isTaxable}
                            onChange={(e) =>
                              updateComponent(comp.id, 'isTaxable', e.target.checked)
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs text-gray-600">Taxable</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={comp.isPartOfCTC}
                            onChange={(e) =>
                              updateComponent(comp.id, 'isPartOfCTC', e.target.checked)
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs text-gray-600">Part of CTC</span>
                        </label>
                        <button
                          onClick={() => removeComponent(comp.id)}
                          className="ml-auto flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Panel — Preview */}
          <div className="space-y-4">
            {/* CTC Breakdown Preview */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-800">CTC Breakdown Preview</h3>
              </div>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-gray-900">{formattedCTC}</p>
                <p className="text-xs text-gray-500">Annual CTC</p>
              </div>
              <PieChart data={pieData} total={annualCTC} />
            </div>

            {/* Monthly breakdown table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Monthly Breakdown</h3>
              <div className="space-y-1">
                {components
                  .filter((c) => breakdown[c.code] > 0)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0"
                    >
                      <span
                        className={`flex-1 truncate ${c.category === 'DEDUCTION' ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        {c.category === 'DEDUCTION' ? '- ' : ''}
                        {c.name}
                      </span>
                      <span
                        className={`font-medium ${c.category === 'DEDUCTION' ? 'text-red-600' : c.category === 'EMPLOYER_CONTRIBUTION' ? 'text-orange-600' : 'text-gray-800'}`}
                      >
                        {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
                          Math.round((breakdown[c.code] ?? 0) / 12)
                        )}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-700">Net Monthly Pay (est.)</span>
                  <span className="text-indigo-700">
                    {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
                      Math.round(
                        components
                          .filter(
                            (c) =>
                              c.category !== 'DEDUCTION' &&
                              c.category !== 'EMPLOYER_CONTRIBUTION' &&
                              c.isPartOfCTC
                          )
                          .reduce((s, c) => s + Math.round((breakdown[c.code] ?? 0) / 12), 0) -
                          components
                            .filter((c) => c.category === 'DEDUCTION')
                            .reduce((s, c) => s + Math.round((breakdown[c.code] ?? 0) / 12), 0)
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation status */}
            <div
              className={`border rounded-xl p-4 ${hasErrors ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
            >
              <div className="flex items-center gap-2">
                {hasErrors ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <p
                  className={`text-sm font-medium ${hasErrors ? 'text-red-700' : 'text-green-700'}`}
                >
                  {hasErrors ? 'Compliance Issues Found' : 'Structure Validated'}
                </p>
              </div>
              {!hasErrors && (
                <p className="text-xs text-green-600 mt-1">
                  This structure meets all {countryCode} jurisdiction requirements.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
