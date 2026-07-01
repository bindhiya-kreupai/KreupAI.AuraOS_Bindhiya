'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Calculator,
  Sun,
  Moon,
  Plane,
  Baby,
  Heart,
  GraduationCap,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

// Country configurations (static display metadata)
const COUNTRIES = [
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪', color: 'emerald' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦', color: 'green' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭', color: 'red' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦', color: 'purple' },
  { code: 'OM', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲', color: 'rose' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼', color: 'cyan' },
  { code: 'IN', name: 'India', nameAr: 'الهند', flag: '🇮🇳', color: 'orange' },
];

interface LabourLawConfig {
  countryCode: string;
  countryName: string;
  countryNameAr: string;
  currency: string;
  workingHours: {
    standardPerDay: number;
    standardPerWeek: number;
    ramadanPerDay?: number;
    ramadanPerWeek?: number;
    maxOvertimePerDay?: number;
    maxOvertimePerYear?: number;
  };
  overtimeRates: {
    normal: number;
    night: number;
    holiday: number;
    friday?: number;
    nightShiftStart?: string;
    nightShiftEnd?: string;
  };
  probation: {
    maxDays: number;
    extensionDays?: number;
    noticeDays: number;
  };
  leave: {
    annualFirstYear: number;
    annualAfterYears: number;
    annualThresholdYears: number;
    sickFullPay: number;
    sickHalfPay: number;
    sickUnpaid: number;
    maternity: number;
    maternityFullPay: number;
    maternityHalfPay: number;
    paternity: number;
    bereavementSpouse: number;
    bereavementFamily: number;
    hajj?: number;
    hajjMinServiceYears?: number;
    study?: number;
    marriage?: number;
    iddah?: number;
  };
  eosb: {
    firstPeriodYears: number;
    firstPeriodDaysPerYear: number;
    afterPeriodDaysPerYear: number;
    maxMonths?: number;
    resignationFactor1?: number;
    resignationFactor2?: number;
    minServiceMonths: number;
    calculationBase: string;
  };
  socialInsurance?: {
    employeeRate: number;
    employerRate: number;
    maxWage?: number;
  };
  weekendDays: string[];
  workWeekStartDay: string;
}

// Shared POST helper — returns parsed { success, data } or throws with a bilingual message
async function postLabourLaw(
  countryCode: string,
  action: string,
  params: Record<string, unknown>
): Promise<any> {
  const res = await fetch('/api/compliance/labour-law', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode, action, params }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const msg = json?.error || json?.message || 'Calculation failed';
    const msgAr = json?.errorAr || json?.messageAr || '';
    throw new Error(msgAr ? `${msg} — ${msgAr}` : msg);
  }
  return json.data;
}

// Reusable calculator card wrapper
function CalcCard({
  icon,
  title,
  titleAr,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        <div>
          <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h5>
          <p className="text-xs text-slate-500" dir="rtl">
            {titleAr}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';
const btnCls =
  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60';

// --- Annual Leave calculator ---
function AnnualLeaveCalc({ countryCode }: { countryCode: string }) {
  const [years, setYears] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postLabourLaw(countryCode, 'calculateAnnualLeave', {
        yearsOfService: Number(years),
      });
      setResult(data.annualLeaveDays);
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CalcCard icon={<Plane className="w-4 h-4" />} title="Annual Leave" titleAr="الإجازة السنوية">
      <form onSubmit={submit} className="space-y-2">
        <label className="block text-xs text-slate-500">Years of service</label>
        <input
          type="number"
          min="0"
          step="1"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          className={inputCls}
        />
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Calculate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result !== null && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{result}</div>
          <div className="text-xs text-slate-500">days per year</div>
        </div>
      )}
    </CalcCard>
  );
}

// --- Overtime Rate calculator ---
function OvertimeCalc({ countryCode }: { countryCode: string }) {
  const [hourlyRate, setHourlyRate] = useState('100');
  const [otType, setOtType] = useState<'weekday' | 'weekend' | 'holiday'>('weekday');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ rate: number; amount: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postLabourLaw(countryCode, 'calculateOvertimeRate', {
        overtimeType: otType,
      });
      const rate = Number(data.overtimeRate);
      setResult({ rate, amount: rate * Number(hourlyRate) });
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CalcCard
      icon={<Clock className="w-4 h-4" />}
      title="Overtime Rate"
      titleAr="معدل العمل الإضافي"
    >
      <form onSubmit={submit} className="space-y-2">
        <label className="block text-xs text-slate-500">Hourly rate ({countryCode})</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className={inputCls}
        />
        <label className="block text-xs text-slate-500">Overtime type</label>
        <select
          value={otType}
          onChange={(e) => setOtType(e.target.value as 'weekday' | 'weekend' | 'holiday')}
          className={inputCls}
        >
          <option value="weekday">Weekday (normal)</option>
          <option value="weekend">Weekend (friday)</option>
          <option value="holiday">Holiday</option>
        </select>
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Calculate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Multiplier: <span className="font-bold">{result.rate}×</span> (
            {Math.round(result.rate * 100)}%)
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-1">
            {result.amount.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">/ OT hour</span>
          </div>
        </div>
      )}
    </CalcCard>
  );
}

// --- Working Hours validator ---
function WorkingHoursValidator({ countryCode }: { countryCode: string }) {
  const [daily, setDaily] = useState('8');
  const [weekly, setWeekly] = useState('48');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ isValid: boolean; violations?: string[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postLabourLaw(countryCode, 'validateWorkingHours', {
        hoursPerDay: Number(daily),
        hoursPerWeek: Number(weekly),
      });
      setResult({ isValid: !!(data.valid ?? data.isValid), violations: data.violations });
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CalcCard
      icon={<Sun className="w-4 h-4" />}
      title="Working Hours Check"
      titleAr="فحص ساعات العمل"
    >
      <form onSubmit={submit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-500">Hours / day</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">Hours / week</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={weekly}
              onChange={(e) => setWeekly(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Validate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div
          className={`mt-3 p-3 rounded-lg ${
            result.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {result.isValid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700 dark:text-green-400">Compliant</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 dark:text-red-400">Non-compliant</span>
              </>
            )}
          </div>
          {result.violations && result.violations.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
              {result.violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </CalcCard>
  );
}

// --- Probation validator ---
function ProbationValidator({ countryCode }: { countryCode: string }) {
  const [months, setMonths] = useState('6');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ isValid: boolean; maxDays?: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postLabourLaw(countryCode, 'validateProbation', {
        probationDays: Math.round(Number(months) * 30),
      });
      setResult({
        isValid: !!(data.valid ?? data.isValid),
        maxDays: data.maxDays ?? data.maxAllowedDays,
      });
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CalcCard
      icon={<Briefcase className="w-4 h-4" />}
      title="Probation Check"
      titleAr="فحص فترة الاختبار"
    >
      <form onSubmit={submit} className="space-y-2">
        <label className="block text-xs text-slate-500">Probation (months)</label>
        <input
          type="number"
          min="0"
          step="1"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          className={inputCls}
        />
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Validate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div
          className={`mt-3 p-3 rounded-lg ${
            result.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {result.isValid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700 dark:text-green-400">Valid</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 dark:text-red-400">Exceeds legal maximum</span>
              </>
            )}
          </div>
          {result.maxDays !== undefined && (
            <div className="text-xs text-slate-500 mt-1">
              Legal maximum: {result.maxDays} days ({Math.round(result.maxDays / 30)} months)
            </div>
          )}
        </div>
      )}
    </CalcCard>
  );
}

// --- Hajj Leave eligibility ---
function HajjEligibilityCalc({ countryCode }: { countryCode: string }) {
  const [years, setYears] = useState('2');
  const [isMuslim, setIsMuslim] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ eligible: boolean; days?: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postLabourLaw(countryCode, 'isEligibleForHajjLeave', {
        yearsOfService: Number(years),
        isMuslim,
      });
      setResult({ eligible: !!data.isEligible, days: data.days });
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CalcCard
      icon={<GraduationCap className="w-4 h-4" />}
      title="Hajj Leave Eligibility"
      titleAr="أهلية إجازة الحج"
    >
      <form onSubmit={submit} className="space-y-2">
        <label className="block text-xs text-slate-500">Years of service</label>
        <input
          type="number"
          min="0"
          step="1"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          className={inputCls}
        />
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
          <input
            type="checkbox"
            checked={isMuslim}
            onChange={(e) => setIsMuslim(e.target.checked)}
            className="rounded border-slate-300"
          />
          Employee is Muslim
        </label>
        <button type="submit" disabled={loading} className={`${btnCls} mt-1`}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Check
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div
          className={`mt-3 p-3 rounded-lg ${
            result.eligible ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {result.eligible ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700 dark:text-green-400">Eligible</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">Not eligible</span>
              </>
            )}
          </div>
          {result.eligible && result.days !== undefined && (
            <div className="text-xs text-slate-500 mt-1">
              {result.days} days (once during employment)
            </div>
          )}
        </div>
      )}
    </CalcCard>
  );
}

export default function LabourLawPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('AE');
  const [expandedSection, setExpandedSection] = useState<string | null>('working-hours');

  // API data: Map of countryCode -> LabourLawConfig
  const [lawConfigs, setLawConfigs] = useState<Record<string, LabourLawConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const country = COUNTRIES.find((c) => c.code === selectedCountry)!;
  const law = lawConfigs[selectedCountry];

  // Fetch labour law config for a country
  const fetchCountryConfig = async (countryCode: string): Promise<LabourLawConfig | null> => {
    try {
      const res = await fetch(`/api/compliance/labour-law?countryCode=${countryCode}`);
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Fetch all country configs on mount
  useEffect(() => {
    const fetchAllConfigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const configs: Record<string, LabourLawConfig> = {};
        const promises = COUNTRIES.map(async (c) => {
          const config = await fetchCountryConfig(c.code);
          if (config) {
            configs[c.code] = config;
          }
        });
        await Promise.all(promises);

        if (Object.keys(configs).length === 0) {
          setError('Failed to load labour law configurations');
        } else {
          setLawConfigs(configs);
        }
      } catch {
        setError('Failed to connect to labour law service');
      } finally {
        setLoading(false);
      }
    };
    fetchAllConfigs();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading labour law configurations...</p>
          <p className="text-sm text-slate-400 mt-1" dir="rtl">
            جاري تحميل إعدادات قانون العمل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/payroll-compliance"
            className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Scale className="w-7 h-7 text-indigo-500" />
            Labour Law Compliance
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
              امتثال قانون العمل
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Country-specific labour regulations and compliance rules
            <span className="mx-2">*</span>
            <span dir="rtl">اللوائح الخاصة بكل دولة وقواعد الامتثال</span>
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4 text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* Country Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Select Country | <span dir="rtl">اختر الدولة</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                selectedCountry === c.code
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-xl">{c.flag}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-sm" dir="rtl">
                {c.nameAr}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!law ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            Labour law configuration not available for {country.name}
          </p>
          <p className="text-sm text-slate-400 mt-1" dir="rtl">
            إعدادات قانون العمل غير متاحة لهذه الدولة
          </p>
        </div>
      ) : (
        <>
          {/* Selected Country Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{country.flag}</div>
              <div>
                <h2 className="text-2xl font-bold">{law.countryName} Labour Law</h2>
                <p className="text-indigo-200" dir="rtl">
                  قانون العمل في {law.countryNameAr}
                </p>
                <p className="text-sm text-indigo-200 mt-1">Currency: {law.currency}</p>
              </div>
            </div>
          </div>

          {/* Labour Law Sections */}
          <div className="space-y-4">
            {/* Working Hours Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('working-hours')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Working Hours & Overtime
                    </h3>
                    <p className="text-sm text-slate-500" dir="rtl">
                      ساعات العمل والعمل الإضافي
                    </p>
                  </div>
                </div>
                {expandedSection === 'working-hours' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'working-hours' && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                        <Sun className="w-4 h-4" />
                        <span className="text-sm font-medium">Standard Hours</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {law.workingHours.standardPerDay} hrs/day
                      </div>
                      <div className="text-sm text-slate-500">
                        {law.workingHours.standardPerWeek} hrs/week
                      </div>
                      <div className="text-sm text-slate-500" dir="rtl">
                        {law.workingHours.standardPerDay} ساعات / يوم
                      </div>
                    </div>
                    {law.workingHours.ramadanPerDay && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                          <Moon className="w-4 h-4" />
                          <span className="text-sm font-medium">Ramadan Hours</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {law.workingHours.ramadanPerDay} hrs/day
                        </div>
                        {law.workingHours.ramadanPerWeek && (
                          <div className="text-sm text-slate-500">
                            {law.workingHours.ramadanPerWeek} hrs/week
                          </div>
                        )}
                        <div className="text-sm text-slate-500" dir="rtl">
                          {law.workingHours.ramadanPerDay} ساعات / يوم
                        </div>
                      </div>
                    )}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Max Overtime</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {law.workingHours.maxOvertimePerYear
                          ? `${law.workingHours.maxOvertimePerYear} hrs/year`
                          : `${law.workingHours.maxOvertimePerDay || 2} hrs/day`}
                      </div>
                      <div className="text-sm text-slate-500" dir="rtl">
                        الحد الأقصى للعمل الإضافي
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mt-6 mb-3">
                    Overtime Rates | <span dir="rtl">معدلات العمل الإضافي</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-500">Normal Overtime</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(law.overtimeRates.normal * 100)}%
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-500">Night Overtime</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(law.overtimeRates.night * 100)}%
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-500">Holiday Overtime</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(law.overtimeRates.holiday * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Leave Entitlements Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('leave')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Leave Entitlements
                    </h3>
                    <p className="text-sm text-slate-500" dir="rtl">
                      استحقاقات الإجازات
                    </p>
                  </div>
                </div>
                {expandedSection === 'leave' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'leave' && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Annual Leave */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                        <Plane className="w-4 h-4" />
                        <span className="text-sm font-medium">Annual Leave</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {law.leave.annualFirstYear === law.leave.annualAfterYears
                          ? `${law.leave.annualAfterYears} days`
                          : `${law.leave.annualFirstYear} → ${law.leave.annualAfterYears} days`}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {law.leave.annualThresholdYears > 1 &&
                          `After ${law.leave.annualThresholdYears} years service`}
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        إجازة سنوية
                      </div>
                    </div>

                    {/* Sick Leave */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Sick Leave</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-semibold">{law.leave.sickFullPay}</span> days @ 100%
                        </div>
                        {law.leave.sickHalfPay > 0 && (
                          <div className="text-sm">
                            <span className="font-semibold">{law.leave.sickHalfPay}</span> days @
                            50-75%
                          </div>
                        )}
                        {law.leave.sickUnpaid > 0 && (
                          <div className="text-sm text-slate-400">
                            <span className="font-semibold">{law.leave.sickUnpaid}</span> days
                            unpaid
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        إجازة مرضية
                      </div>
                    </div>

                    {/* Maternity Leave */}
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                      <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
                        <Baby className="w-4 h-4" />
                        <span className="text-sm font-medium">Maternity Leave</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {law.leave.maternity} days
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {law.leave.maternityFullPay} days at full pay
                      </div>
                      {law.leave.maternityHalfPay > 0 && (
                        <div className="text-xs text-slate-500">
                          {law.leave.maternityHalfPay} days at half pay
                        </div>
                      )}
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        إجازة أمومة
                      </div>
                    </div>

                    {/* Paternity Leave */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Paternity Leave</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {law.leave.paternity} days
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        إجازة أبوة
                      </div>
                    </div>

                    {/* Bereavement Leave */}
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Bereavement Leave</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Spouse:{' '}
                          <span className="font-semibold">{law.leave.bereavementSpouse}</span> days
                        </div>
                        <div className="text-sm">
                          Family:{' '}
                          <span className="font-semibold">{law.leave.bereavementFamily}</span> days
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        إجازة عزاء
                      </div>
                    </div>

                    {/* Hajj Leave */}
                    {law.leave.hajj && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-sm font-medium">Hajj Leave</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {law.leave.hajj} days
                        </div>
                        {law.leave.hajjMinServiceYears && (
                          <div className="text-xs text-slate-500 mt-1">
                            After {law.leave.hajjMinServiceYears} years service
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          Once during employment (unpaid)
                        </div>
                        <div className="text-sm text-slate-500 mt-1" dir="rtl">
                          إجازة حج
                        </div>
                      </div>
                    )}

                    {/* Marriage Leave */}
                    {law.leave.marriage && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">Marriage Leave</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {law.leave.marriage} days
                        </div>
                        <div className="text-sm text-slate-500 mt-1" dir="rtl">
                          إجازة زواج
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Probation Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('probation')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Probation Period
                    </h3>
                    <p className="text-sm text-slate-500" dir="rtl">
                      فترة الاختبار
                    </p>
                  </div>
                </div>
                {expandedSection === 'probation' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'probation' && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">
                        Maximum Probation Period
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {law.probation.maxDays} days
                      </div>
                      <div className="text-sm text-slate-500">
                        {Math.round(law.probation.maxDays / 30)} months
                      </div>
                      {law.probation.extensionDays && (
                        <div className="text-xs text-amber-500 mt-1">
                          Can extend by {law.probation.extensionDays} days
                        </div>
                      )}
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        الحد الأقصى لفترة الاختبار
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">
                        Notice Period (During Probation)
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {law.probation.noticeDays} days
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        فترة الإشعار
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EOSB Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('eosb')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      End of Service Benefits (EOSB)
                    </h3>
                    <p className="text-sm text-slate-500" dir="rtl">
                      مكافأة نهاية الخدمة
                    </p>
                  </div>
                </div>
                {expandedSection === 'eosb' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'eosb' && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                        {law.eosb.firstPeriodYears > 0
                          ? `First ${law.eosb.firstPeriodYears} Years`
                          : 'Rate per Year'}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {law.eosb.firstPeriodDaysPerYear} days
                      </div>
                      <div className="text-sm text-slate-500">per year of service</div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        يوم لكل سنة خدمة
                      </div>
                    </div>
                    {law.eosb.firstPeriodYears > 0 &&
                      law.eosb.afterPeriodDaysPerYear !== law.eosb.firstPeriodDaysPerYear && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                          <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                            After {law.eosb.firstPeriodYears} Years
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {law.eosb.afterPeriodDaysPerYear} days
                          </div>
                          <div className="text-sm text-slate-500">per year of service</div>
                          <div className="text-sm text-slate-500 mt-1" dir="rtl">
                            يوم لكل سنة خدمة
                          </div>
                        </div>
                      )}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">Minimum Service Required</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {law.eosb.minServiceMonths} months
                      </div>
                      <div className="text-sm text-slate-500">
                        {Math.round(law.eosb.minServiceMonths / 12)} year
                        {law.eosb.minServiceMonths >= 24 ? 's' : ''}
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        الحد الأدنى للخدمة
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          EOSB is calculated on the{' '}
                          <strong>
                            {law.eosb.calculationBase === 'BASIC'
                              ? 'last basic salary'
                              : 'total salary'}
                          </strong>{' '}
                          only (excluding allowances in most GCC countries). Resignation before
                          completing minimum service may result in reduced or no gratuity.
                        </p>
                        <p className="text-xs text-amber-600 mt-1" dir="rtl">
                          تحسب المكافأة على الراتب الأساسي الأخير فقط. الاستقالة قبل إكمال الحد
                          الأدنى من الخدمة قد تؤدي إلى تخفيض أو عدم استحقاق المكافأة.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weekend Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('weekend')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Weekend & Work Week
                    </h3>
                    <p className="text-sm text-slate-500" dir="rtl">
                      عطلة نهاية الأسبوع
                    </p>
                  </div>
                </div>
                {expandedSection === 'weekend' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'weekend' && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                      <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-2">
                        Official Weekend
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {law.weekendDays.join(' & ')}
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        عطلة نهاية الأسبوع الرسمية
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="text-sm text-slate-500 mb-2">Work Week Starts</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {law.workWeekStartDay}
                      </div>
                      <div className="text-sm text-slate-500 mt-1" dir="rtl">
                        يبدأ أسبوع العمل
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Compliance Calculators Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('calculators')}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Compliance Calculators
                    </h3>
                    <p className="text-sm text-slate-500" dir="rtl">
                      حاسبات الامتثال
                    </p>
                  </div>
                </div>
                {expandedSection === 'calculators' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'calculators' && (
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-sm text-slate-500 mb-4">
                    Live calculations for{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {law.countryName}
                    </span>{' '}
                    ({selectedCountry}) labour law.
                    <span className="mx-2">|</span>
                    <span dir="rtl">حسابات مباشرة لقانون العمل</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnnualLeaveCalc countryCode={selectedCountry} />
                    <OvertimeCalc countryCode={selectedCountry} />
                    <WorkingHoursValidator countryCode={selectedCountry} />
                    <ProbationValidator countryCode={selectedCountry} />
                    <HajjEligibilityCalc countryCode={selectedCountry} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Quick View */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Quick Comparison | <span dir="rtl">مقارنة سريعة</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="pb-3 font-medium">Country</th>
                    <th className="pb-3 font-medium text-center">Working Hours</th>
                    <th className="pb-3 font-medium text-center">Annual Leave</th>
                    <th className="pb-3 font-medium text-center">Maternity</th>
                    <th className="pb-3 font-medium text-center">EOSB Rate</th>
                    <th className="pb-3 font-medium text-center">Probation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {COUNTRIES.map((c) => {
                    const l = lawConfigs[c.code];
                    if (!l) return null;
                    return (
                      <tr
                        key={c.code}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedCountry === c.code ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                      >
                        <td className="py-3">
                          <span className="mr-2">{c.flag}</span>
                          {c.name}
                        </td>
                        <td className="py-3 text-center">{l.workingHours.standardPerDay} hrs</td>
                        <td className="py-3 text-center">{l.leave.annualAfterYears} days</td>
                        <td className="py-3 text-center">{l.leave.maternity} days</td>
                        <td className="py-3 text-center">
                          {l.eosb.afterPeriodDaysPerYear} days/yr
                        </td>
                        <td className="py-3 text-center">{l.probation.maxDays} days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
