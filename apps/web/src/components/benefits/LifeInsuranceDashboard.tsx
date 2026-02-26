'use client';

/**
 * @component LifeInsuranceDashboard
 * @description Life insurance dashboard — coverage summary, beneficiary management,
 *   premium calculator, plan comparison, coverage multiples selector.
 * @project AURA HCM Platform
 * @section 18.4 — Life Insurance Management
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Save,
} from 'lucide-react';
import type {
  LifeInsurancePlan,
  LifeInsuranceEnrollment,
  Beneficiary,
  BeneficiaryRelationship,
  EligibilityRules,
  PremiumCalculation,
} from '@/services/lifeInsuranceService';
import { LifeInsuranceService } from '@/services/lifeInsuranceService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtCurrencyFull(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

const RELATIONSHIP_LABELS: Record<BeneficiaryRelationship, string> = {
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  sibling: 'Sibling',
  domestic_partner: 'Domestic Partner',
  other: 'Other',
};

const PLAN_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  basic_life: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  supplemental_life: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  add: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  dependent_life: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

// ── Beneficiary Form ───────────────────────────────────────────────────────────

interface BeneficiaryFormData {
  id?: string;
  name: string;
  relationship: BeneficiaryRelationship;
  allocationPercent: number;
  isPrimary: boolean;
  email?: string;
  phone?: string;
}

function BeneficiaryRow({
  beneficiary,
  onEdit,
  onDelete,
}: {
  beneficiary: Beneficiary;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {beneficiary.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{beneficiary.name}</p>
        <p className="text-xs text-slate-500">
          {RELATIONSHIP_LABELS[beneficiary.relationship]} ·{' '}
          {beneficiary.isPrimary ? 'Primary' : 'Contingent'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-800">{beneficiary.allocationPercent}%</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-100 text-slate-500 hover:text-red-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LifeInsuranceDashboard() {
  const [plans, setPlans] = useState<LifeInsurancePlan[]>([]);
  const [enrollments, setEnrollments] = useState<LifeInsuranceEnrollment[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'coverage' | 'beneficiaries' | 'calculator' | 'compare'
  >('coverage');

  // Calculator state
  const [calcAge, setCalcAge] = useState(35);
  const [calcMultiple, setCalcMultiple] = useState(2);
  const [calcSmoker, setCalcSmoker] = useState(false);
  const [calcResult, setCalcResult] = useState<PremiumCalculation | null>(null);
  const [annualSalary] = useState(140000); // Mock

  // Beneficiary state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBen, setEditingBen] = useState<Beneficiary | null>(null);
  const [benForm, setBenForm] = useState<BeneficiaryFormData>({
    name: '',
    relationship: 'spouse',
    allocationPercent: 50,
    isPrimary: true,
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    Promise.all([
      LifeInsuranceService.getLifeInsurancePlans(),
      LifeInsuranceService.getEnrollment('emp-0445'),
    ]).then(([p, e]) => {
      setPlans(p);
      setEnrollments(e);
      if (e.length > 0) setBeneficiaries(e[0].beneficiaries);
      setEligibility(LifeInsuranceService.getEligibilityRules());
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'calculator') {
      const coverageAmount = annualSalary * calcMultiple;
      const result = LifeInsuranceService.calculatePremium(
        calcAge,
        coverageAmount,
        calcSmoker,
        'li-002'
      );
      setCalcResult(result);
    }
  }, [calcAge, calcMultiple, calcSmoker, activeTab, annualSalary]);

  const totalAllocation = beneficiaries.reduce((s, b) => s + b.allocationPercent, 0);
  const allocationOk = Math.abs(totalAllocation - 100) < 0.01;
  const totalMonthlyPremium = enrollments.reduce((s, e) => s + e.employeePremium, 0);

  async function saveBeneficiaries() {
    setSaving(true);
    try {
      await LifeInsuranceService.updateBeneficiaries('emp-0445', beneficiaries);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function addOrUpdateBeneficiary() {
    if (!benForm.name || benForm.allocationPercent <= 0) return;
    if (editingBen) {
      setBeneficiaries((prev) =>
        prev.map((b) => (b.id === editingBen.id ? { ...editingBen, ...benForm } : b))
      );
      setEditingBen(null);
    } else {
      const newBen: Beneficiary = { id: `ben-${Date.now()}`, ...benForm };
      setBeneficiaries((prev) => [...prev, newBen]);
    }
    setBenForm({ name: '', relationship: 'spouse', allocationPercent: 50, isPrimary: true });
    setShowAddForm(false);
  }

  const tabs = [
    { id: 'coverage' as const, label: 'Coverage' },
    { id: 'beneficiaries' as const, label: 'Beneficiaries' },
    { id: 'calculator' as const, label: 'Calculator' },
    { id: 'compare' as const, label: 'Plans' },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Life Insurance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your life insurance coverage and beneficiaries
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Total Coverage</p>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {fmtCurrency(enrollments.reduce((s, e) => s + e.coverageAmount, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {enrollments.length} active plan{enrollments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">My Monthly Cost</p>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {fmtCurrencyFull(totalMonthlyPremium)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {fmtCurrencyFull(totalMonthlyPremium * 12)} annual
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Beneficiaries</p>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{beneficiaries.length}</p>
          <p className={`text-xs mt-0.5 ${allocationOk ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalAllocation}% allocated {allocationOk ? '✓' : '— must sum to 100%'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Coverage Tab */}
          {activeTab === 'coverage' && (
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const plan = plans.find((p) => p.id === enrollment.planId);
                const typeStyle = PLAN_TYPE_STYLES[plan?.type ?? 'basic_life'];
                return (
                  <div
                    key={enrollment.planId}
                    className={`rounded-xl border p-4 ${typeStyle.border} ${typeStyle.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`font-bold text-sm ${typeStyle.text}`}>
                          {enrollment.planName}
                        </p>
                        <p className="text-xs text-slate-500">{plan?.carrier ?? ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">
                          {fmtCurrency(enrollment.coverageAmount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {enrollment.coverageMultiple}x annual salary
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: 'My Premium',
                          value: enrollment.isEmployerPaid
                            ? 'Employer Paid'
                            : fmtCurrencyFull(enrollment.employeePremium) + '/mo',
                        },
                        {
                          label: 'Employer Pays',
                          value: fmtCurrencyFull(enrollment.employerPremium) + '/mo',
                        },
                        {
                          label: 'Effective Date',
                          value: new Date(
                            enrollment.effectiveDate + 'T00:00:00'
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }),
                        },
                        {
                          label: 'EOI Required',
                          value: enrollment.requiresEOI
                            ? (enrollment.eoiStatus ?? 'Pending')
                            : 'Not Required',
                        },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/60 rounded-lg p-2.5">
                          <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                          <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {plan && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Features</p>
                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Beneficiaries Tab */}
          {activeTab === 'beneficiaries' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-700">Beneficiary Designations</p>
                  <p className="text-xs text-slate-500">Allocations must sum to exactly 100%</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-bold px-3 py-1 rounded-full ${allocationOk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {totalAllocation}% total
                  </div>
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setEditingBen(null);
                      setBenForm({
                        name: '',
                        relationship: 'spouse',
                        allocationPercent: Math.max(0, 100 - totalAllocation),
                        isPrimary: true,
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Beneficiary
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {beneficiaries.map((b) => (
                  <BeneficiaryRow
                    key={b.id}
                    beneficiary={b}
                    onEdit={() => {
                      setEditingBen(b);
                      setBenForm({
                        id: b.id,
                        name: b.name,
                        relationship: b.relationship,
                        allocationPercent: b.allocationPercent,
                        isPrimary: b.isPrimary,
                        email: b.email,
                        phone: b.phone,
                      });
                      setShowAddForm(true);
                    }}
                    onDelete={() =>
                      setBeneficiaries((prev) => prev.filter((ben) => ben.id !== b.id))
                    }
                  />
                ))}
                {beneficiaries.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">
                    No beneficiaries added. Add at least one beneficiary to protect your coverage.
                  </p>
                )}
              </div>

              {/* Add/Edit Form */}
              {showAddForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="font-medium text-blue-800 text-sm mb-3">
                    {editingBen ? 'Edit Beneficiary' : 'Add Beneficiary'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={benForm.name}
                        onChange={(e) => setBenForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Beneficiary full name"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">
                        Relationship *
                      </label>
                      <select
                        value={benForm.relationship}
                        onChange={(e) =>
                          setBenForm((p) => ({
                            ...p,
                            relationship: e.target.value as BeneficiaryRelationship,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                      >
                        {(
                          Object.entries(RELATIONSHIP_LABELS) as [BeneficiaryRelationship, string][]
                        ).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">
                        Allocation % *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={benForm.allocationPercent}
                        onChange={(e) =>
                          setBenForm((p) => ({ ...p, allocationPercent: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                      <select
                        value={benForm.isPrimary ? 'primary' : 'contingent'}
                        onChange={(e) =>
                          setBenForm((p) => ({ ...p, isPrimary: e.target.value === 'primary' }))
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="primary">Primary</option>
                        <option value="contingent">Contingent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={addOrUpdateBeneficiary}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingBen ? 'Update' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingBen(null);
                      }}
                      className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!allocationOk && beneficiaries.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Beneficiary allocations total {totalAllocation}% — they must sum to exactly 100%
                  before saving.
                </div>
              )}

              <button
                onClick={saveBeneficiaries}
                disabled={saving || !allocationOk}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl font-medium ${savedMsg ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40'}`}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : savedMsg ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savedMsg ? 'Beneficiaries Saved!' : 'Save Beneficiaries'}
              </button>
            </div>
          )}

          {/* Premium Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="max-w-xl">
              <p className="text-sm text-slate-600 font-medium mb-4">
                Supplemental Life Insurance Premium Calculator
              </p>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Your Age: <span className="text-blue-600 font-bold">{calcAge}</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="70"
                    value={calcAge}
                    onChange={(e) => setCalcAge(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>18</span>
                    <span>70</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Coverage Multiple:{' '}
                    <span className="text-blue-600 font-bold">{calcMultiple}x</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">
                      = {fmtCurrency(annualSalary * calcMultiple)} coverage
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={calcMultiple}
                    onChange={(e) => setCalcMultiple(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                    <span>4x</span>
                    <span>5x</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="smoker"
                    checked={calcSmoker}
                    onChange={(e) => setCalcSmoker(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="smoker" className="text-sm text-slate-700 cursor-pointer">
                    Tobacco user (1.5x premium)
                  </label>
                </div>

                {calcResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-blue-800">Premium Estimate</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Coverage Amount', value: fmtCurrency(calcResult.coverageAmount) },
                        {
                          label: 'Rate per $1,000',
                          value: `$${calcResult.ratePerThousand.toFixed(3)}`,
                        },
                        {
                          label: 'Monthly Premium',
                          value: fmtCurrencyFull(calcResult.monthlyPremium),
                        },
                        {
                          label: 'Annual Premium',
                          value: fmtCurrencyFull(calcResult.annualPremium),
                        },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/80 rounded-lg p-2.5">
                          <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                          <p className="text-sm font-bold text-slate-800">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {calcResult.coverageAmount > 500000 && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        Coverage above $500,000 requires Evidence of Insurability (EOI) — medical
                        underwriting required.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plan Comparison Tab */}
          {activeTab === 'compare' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Feature</th>
                    {plans.map((p) => (
                      <th key={p.id} className="text-center py-2 px-2 text-slate-700 font-semibold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: 'Carrier', key: (p: LifeInsurancePlan) => p.carrier },
                    {
                      label: 'Employer Paid',
                      key: (p: LifeInsurancePlan) => (p.isEmployerPaid ? 'Yes' : 'No'),
                    },
                    {
                      label: 'Max Coverage',
                      key: (p: LifeInsurancePlan) => fmtCurrency(p.maxCoverageAmount),
                    },
                    {
                      label: 'EOI Threshold',
                      key: (p: LifeInsurancePlan) =>
                        p.evidenceOfInsurabilityThreshold === 0
                          ? 'Not Required'
                          : fmtCurrency(p.evidenceOfInsurabilityThreshold),
                    },
                    {
                      label: 'Coverage Multiples',
                      key: (p: LifeInsurancePlan) =>
                        p.coverageMultiples.map((m) => `${m}x`).join(', '),
                    },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 text-slate-500 font-medium">{row.label}</td>
                      {plans.map((p) => (
                        <td key={p.id} className="text-center py-2.5 px-2 text-slate-700">
                          {row.key(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 pr-4 text-slate-500 font-medium align-top">
                      Key Features
                    </td>
                    {plans.map((p) => (
                      <td key={p.id} className="py-2.5 px-2 align-top">
                        <ul className="space-y-1">
                          {p.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Eligibility Info */}
      {eligibility && (
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-700">Eligibility & Enrollment Rules</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-500">Open Enrollment</p>
              <p className="font-medium text-slate-700">{eligibility.openEnrollmentPeriod}</p>
            </div>
            <div>
              <p className="text-slate-500">Waiting Period</p>
              <p className="font-medium text-slate-700">
                {eligibility.waitingPeriodDays} days for new hires
              </p>
            </div>
            <div>
              <p className="text-slate-500">Min Hours/Week</p>
              <p className="font-medium text-slate-700">{eligibility.minHoursPerWeek} hours</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
