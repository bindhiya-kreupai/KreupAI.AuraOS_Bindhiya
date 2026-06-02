// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module LoanApplication
 * @description Loan application form — type selector, eligibility check, amount/tenure
 *              inputs, EMI calculator, impact display, document upload (Sec 17.5)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  Wallet,
  Zap,
  Calculator,
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  X,
  Info,
} from 'lucide-react';
import {
  LoanService,
  LOAN_TYPE_META,
  type LoanType,
  type LoanEligibility,
  type LoanPolicy,
  type ApplyLoanData,
} from '@/services/loanService';

// ── Type Icon Map ──────────────────────────────────────────────────────────────

const LOAN_TYPE_ICONS: Record<LoanType, React.ElementType> = {
  salary_advance: Banknote,
  personal_loan: Wallet,
  emergency_loan: Zap,
};

// ── Component ─────────────────────────────────────────────────────────────────

interface LoanApplicationProps {
  employeeId?: string;
  onSuccess?: (loanId: string) => void;
  onCancel?: () => void;
}

export function LoanApplication({
  employeeId = 'emp-001',
  onSuccess,
  onCancel,
}: LoanApplicationProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loanType, setLoanType] = useState<LoanType | ''>('');
  const [policies, setPolicies] = useState<LoanPolicy[]>([]);
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState(12);
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    LoanService.getLoanPolicies().then(setPolicies);
  }, []);

  useEffect(() => {
    if (!loanType) return;
    setCheckingEligibility(true);
    LoanService.getEligibility(employeeId, loanType as LoanType).then((e) => {
      setEligibility(e);
      setCheckingEligibility(false);
    });
  }, [loanType, employeeId]);

  const policy = policies.find((p) => p.loanType === loanType);
  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const emiCalc = useMemo(() => {
    if (!parsedAmount || !loanType || !policy) return null;
    return LoanService.calculateEMI(parsedAmount, tenure, policy.interestRate);
  }, [parsedAmount, tenure, loanType, policy]);

  const handleTypeSelect = async (type: LoanType) => {
    setLoanType(type);
    setAmount('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!loanType || !parsedAmount || !reason || !termsAccepted) return;
    setSubmitting(true);
    try {
      const data: ApplyLoanData = {
        employeeId,
        type: loanType as LoanType,
        amount: parsedAmount,
        tenure,
        reason,
        documents: files,
      };
      const loan = await LoanService.applyForLoan(data);
      setSubmitted(true);
      onSuccess?.(loan.id);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Application Submitted!</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Your loan application has been submitted for approval.
        </p>
        <button
          onClick={onCancel}
          className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
        >
          Back to Loans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Loan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Step {step} of 3</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s <= step ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Choose Loan Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {policies.map((policy) => {
              const Icon = LOAN_TYPE_ICONS[policy.loanType];
              const typeMeta = LOAN_TYPE_META[policy.loanType];
              return (
                <button
                  key={policy.loanType}
                  onClick={() => handleTypeSelect(policy.loanType)}
                  className="bg-white rounded-2xl p-5 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-indigo-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors`}
                  >
                    <Icon className={`w-6 h-6 ${typeMeta.color}`} />
                  </div>
                  <p className={`font-bold text-base ${typeMeta.color}`}>{typeMeta.label}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{policy.description}</p>
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p>
                      Max:{' '}
                      <span className="font-semibold text-gray-700">
                        ${policy.maxAmountAbsolute.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Up to{' '}
                      <span className="font-semibold text-gray-700">
                        {policy.maxTenureMonths} months
                      </span>
                    </p>
                    <p>
                      Rate:{' '}
                      <span className="font-semibold text-gray-700">
                        {policy.interestRate === 0
                          ? 'Interest-free'
                          : `${policy.interestRate}% p.a.`}
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Amount & Tenure */}
      {step === 2 && loanType && (
        <div className="space-y-5">
          <button
            onClick={() => setStep(1)}
            className="text-sm text-indigo-600 flex items-center gap-1"
          >
            ← Change type
          </button>

          {/* Eligibility */}
          {checkingEligibility ? (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Checking eligibility...</p>
            </div>
          ) : (
            eligibility && (
              <div
                className={`rounded-xl p-4 border ${eligibility.isEligible ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {eligibility.isEligible ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <p
                    className={`font-semibold text-sm ${eligibility.isEligible ? 'text-emerald-700' : 'text-red-700'}`}
                  >
                    {eligibility.isEligible ? 'You are eligible!' : 'Not Eligible'}
                  </p>
                </div>
                {eligibility.isEligible && (
                  <p className="text-xs text-emerald-600">
                    Max eligible: <strong>${eligibility.maxAmount.toLocaleString()}</strong> · EMI
                    capacity: <strong>${eligibility.deductionCapacity.toLocaleString()}/mo</strong>
                  </p>
                )}
                {!eligibility.isEligible &&
                  eligibility.reasons.map((r, i) => (
                    <p key={i} className="text-xs text-red-600 mt-0.5">
                      {r}
                    </p>
                  ))}
              </div>
            )
          )}

          {eligibility?.isEligible && (
            <>
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    max={eligibility.maxAmount}
                    className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <input
                  type="range"
                  min={1000}
                  max={eligibility.maxAmount}
                  step={500}
                  value={parsedAmount || eligibility.maxAmount / 2}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-2 accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>$1,000</span>
                  <span>${eligibility.maxAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Tenure */}
              {policy && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tenure: <span className="text-indigo-600">{tenure} months</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Array.from(
                      {
                        length:
                          Math.floor((policy.maxTenureMonths - policy.minTenureMonths) / 3) + 1,
                      },
                      (_, i) => policy.minTenureMonths + i * 3
                    )
                      .slice(0, 8)
                      .map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTenure(m)}
                          className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                            tenure === m
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* EMI Preview */}
              {emiCalc && parsedAmount > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-indigo-500" />
                    <p className="font-semibold text-indigo-800">EMI Preview</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-indigo-400">Monthly EMI</p>
                      <p className="text-2xl font-bold text-indigo-700">
                        ${emiCalc.emiAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-400">Total Interest</p>
                      <p className="font-bold text-indigo-700">
                        ${emiCalc.totalInterest.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-400">Total Repayable</p>
                      <p className="font-bold text-indigo-700">
                        ${emiCalc.totalRepayable.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-400">Take-home Impact</p>
                      <p className="font-bold text-red-500">
                        -${emiCalc.emiAmount.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!parsedAmount || parsedAmount > (eligibility?.maxAmount ?? 0)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40"
              >
                Continue
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 3: Reason & Submit */}
      {step === 3 && (
        <div className="space-y-5">
          <button onClick={() => setStep(2)} className="text-sm text-indigo-600">
            ← Back
          </button>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason / Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the purpose of this loan..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {/* Document Upload */}
          {policy && policy.requiredDocuments.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supporting Documents
              </label>
              <div className="bg-blue-50 rounded-xl px-3 py-2 mb-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <ul className="text-xs text-blue-700 space-y-0.5">
                    {policy.requiredDocuments.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFiles((prev) => [...prev, `document_${Date.now()}.pdf`])}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 mt-2 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 flex-1">{f}</span>
                  <button onClick={() => setFiles(files.filter((_, fi) => fi !== i))}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-indigo-600"
            />
            <span className="text-sm text-gray-600">
              I acknowledge that EMI repayments will be deducted from my salary and I agree to the
              company loan policy terms.
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!reason || !termsAccepted || submitting}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      )}
    </div>
  );
}

export default LoanApplication;
