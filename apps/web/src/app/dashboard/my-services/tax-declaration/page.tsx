'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { TaxService } from '../services';

function currentFinancialYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
}

interface DeclarationForm {
  ppf: string;
  elss: string;
  lifeInsurance: string;
  homeLoanPrincipal: string;
  medicalSelf: string;
  medicalParents: string;
  rentPaid: string;
}

const EMPTY_FORM: DeclarationForm = {
  ppf: '',
  elss: '',
  lifeInsurance: '',
  homeLoanPrincipal: '',
  medicalSelf: '',
  medicalParents: '',
  rentPaid: '',
};

export default function TaxDeclarationPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<DeclarationForm>(EMPTY_FORM);
  const [existing, setExisting] = useState<any | null>(null);

  const financialYear = currentFinancialYear();

  const loadDeclaration = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setError(null);
    try {
      const res = await TaxService.getDeclarations({
        employeeId: user.employeeId,
        financialYear,
      });
      const rows: any[] = Array.isArray(res?.data) ? res.data : [];
      const decl = rows[0] ?? null;
      setExisting(decl);
      if (decl) {
        setForm({
          ppf: decl.ppf != null ? String(decl.ppf) : '',
          elss: decl.elss != null ? String(decl.elss) : '',
          lifeInsurance: decl.lifeInsurance != null ? String(decl.lifeInsurance) : '',
          homeLoanPrincipal: decl.homeLoanPrincipal != null ? String(decl.homeLoanPrincipal) : '',
          medicalSelf: decl.medicalSelf != null ? String(decl.medicalSelf) : '',
          medicalParents: decl.medicalParents != null ? String(decl.medicalParents) : '',
          rentPaid: decl.rentPaid != null ? String(decl.rentPaid) : '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch tax declaration:', err);
      setError('Unable to load your declaration. Please refresh.');
    } finally {
      setFetching(false);
    }
  }, [user, financialYear]);

  useEffect(() => {
    if (authLoading || !user) return;
    void loadDeclaration();
  }, [authLoading, user, loadDeclaration]);

  const setField = (key: keyof DeclarationForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setSuccess(false);
  };

  const total =
    Object.values(form).reduce((sum, v) => sum + (parseFloat(v) || 0), 0) -
    (parseFloat(form.rentPaid) || 0);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        employeeId: user.employeeId,
        financialYear,
        taxRegime: 'OLD',
        ppf: parseFloat(form.ppf) || 0,
        elss: parseFloat(form.elss) || 0,
        lifeInsurance: parseFloat(form.lifeInsurance) || 0,
        homeLoanPrincipal: parseFloat(form.homeLoanPrincipal) || 0,
        medicalSelf: parseFloat(form.medicalSelf) || 0,
        medicalParents: parseFloat(form.medicalParents) || 0,
        rentPaid: parseFloat(form.rentPaid) || 0,
      };
      const res = await TaxService.submitDeclaration(payload);
      if (res?.success) {
        setSuccess(true);
        await loadDeclaration();
      } else {
        setError(res?.error || 'Failed to submit declaration. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit declaration:', err);
      setError('Failed to submit declaration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof DeclarationForm; label: string; section: string }[] = [
    { key: 'lifeInsurance', label: 'Life Insurance Premium (LIC)', section: '80C' },
    { key: 'ppf', label: 'Public Provident Fund (PPF)', section: '80C' },
    { key: 'elss', label: 'ELSS Mutual Funds', section: '80C' },
    { key: 'homeLoanPrincipal', label: 'Home Loan Principal', section: '80C' },
    { key: 'medicalSelf', label: 'Medical Insurance — Self', section: '80D' },
    { key: 'medicalParents', label: 'Medical Insurance — Parents', section: '80D' },
    { key: 'rentPaid', label: 'Rent Paid (HRA)', section: 'HRA' },
  ];

  if (authLoading || fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col overflow-y-auto text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Tax Declarations
          </h1>
          <p className="text-slate-500 text-sm">
            Declare your investments for tax exemptions (FY {financialYear}).
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-center">
          <div className="text-xs font-bold text-indigo-500 uppercase">Status</div>
          <div className="font-bold text-indigo-700 dark:text-indigo-300">
            {existing ? (existing.status ?? 'Submitted') : 'Not Submitted'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Investment Declarations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {f.label} <span className="text-slate-400">({f.section})</span>
              </label>
              <input
                type="number"
                min="0"
                value={form[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="0.00"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
          <span className="text-sm font-bold text-slate-500">Total Declared Deductions</span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300 font-mono">
            {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-500/30 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/30 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Declaration saved successfully.
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Declaration
          </button>
        </div>
      </div>
    </div>
  );
}
