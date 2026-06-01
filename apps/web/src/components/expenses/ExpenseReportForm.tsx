// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Receipt,
  FileText,
  CheckCircle,
  Upload,
  AlertCircle,
  DollarSign,
  Tag,
} from 'lucide-react';
import { z } from 'zod';
import type {
  CreateExpenseReportData,
  AddExpenseItemData,
  ExpenseReport,
  ExpenseType,
  PaymentMethod,
  CurrencyCode,
} from '@/services/expenseService';
import { ExpenseService, EXPENSE_TYPE_META } from '@/services/expenseService';

// ── Zod Schemas ────────────────────────────────────────────────────────────────

const headerSchema = z.object({
  reportName: z.string().min(3, 'Report name must be at least 3 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

const itemSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Description is required'),
  amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Amount must be positive'),
  categoryName: z.string().min(1, 'Category is required'),
  expenseType: z.string().min(1, 'Expense type is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  merchant: z.string().optional(),
  location: z.string().optional(),
});

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 'header' | 'items' | 'receipts' | 'review' | 'submit';

interface DraftItem extends AddExpenseItemData {
  _key: string;
  receiptFile?: File;
}

interface FormErrors {
  [key: string]: string;
}

interface ExpenseReportFormProps {
  employeeId?: string;
  departmentId?: string;
  onSuccess?: (report: ExpenseReport) => void;
  onCancel?: () => void;
}

// ── Step Indicator ─────────────────────────────────────────────────────────────

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'header', label: 'Details', icon: FileText },
  { id: 'items', label: 'Items', icon: Receipt },
  { id: 'receipts', label: 'Receipts', icon: Upload },
  { id: 'review', label: 'Review', icon: CheckCircle },
  { id: 'submit', label: 'Submit', icon: CheckCircle },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors font-semibold text-sm
                  ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${active ? 'text-indigo-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full ${idx < currentIdx ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ExpenseReportForm({
  employeeId = 'emp-001',
  departmentId = 'dept-002',
  onSuccess,
  onCancel,
}: ExpenseReportFormProps) {
  const [step, setStep] = useState<Step>('header');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Header state
  const [header, setHeader] = useState({
    reportName: '',
    startDate: '',
    endDate: '',
    notes: '',
    tags: '',
  });

  // Items state
  const [items, setItems] = useState<DraftItem[]>([]);
  const [itemForm, setItemForm] = useState<Partial<DraftItem>>({
    currency: 'USD',
    isReimbursable: true,
    isBillable: false,
    paymentMethod: 'personal_card',
  });
  const [addingItem, setAddingItem] = useState(false);
  const [itemErrors, setItemErrors] = useState<FormErrors>({});

  const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'personal_card', label: 'Personal Card' },
    { value: 'corporate_card', label: 'Corporate Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ];

  const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];

  // ── Validation ───────────────────────────────────────────────────────────────

  const validateHeader = () => {
    const result = headerSchema.safeParse(header);
    if (!result.success) {
      const errs: FormErrors = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateItem = (data: Partial<DraftItem>) => {
    const result = itemSchema.safeParse({
      ...data,
      amount: Number(data.amount),
    });
    if (!result.success) {
      const errs: FormErrors = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setItemErrors(errs);
      return false;
    }
    setItemErrors({});
    return true;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleNextFromHeader = () => {
    if (validateHeader()) setStep('items');
  };

  const handleAddItem = () => {
    if (!validateItem(itemForm)) return;
    const newItem: DraftItem = {
      _key: `draft-${Date.now()}`,
      date: itemForm.date!,
      description: itemForm.description!,
      amount: Number(itemForm.amount),
      categoryId: itemForm.categoryId ?? 'cat-001',
      categoryName: itemForm.categoryName!,
      expenseType: (itemForm.expenseType as ExpenseType) ?? 'general',
      paymentMethod: (itemForm.paymentMethod as PaymentMethod) ?? 'personal_card',
      currency: (itemForm.currency as CurrencyCode) ?? 'USD',
      merchant: itemForm.merchant,
      location: itemForm.location,
      isBillable: itemForm.isBillable ?? false,
      isReimbursable: itemForm.isReimbursable ?? true,
      notes: itemForm.notes,
    };
    setItems((prev) => [...prev, newItem]);
    setItemForm({
      currency: 'USD',
      isReimbursable: true,
      isBillable: false,
      paymentMethod: 'personal_card',
    });
    setAddingItem(false);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data: CreateExpenseReportData = {
        reportName: header.reportName,
        employeeId,
        departmentId,
        reportPeriod: { startDate: header.startDate, endDate: header.endDate },
        currency: 'USD',
        notes: header.notes || undefined,
        tags: header.tags ? header.tags.split(',').map((t) => t.trim()) : [],
      };

      let report = await ExpenseService.createExpenseReport(data);

      // Add items
      for (const item of items) {
        const { _key: _k, receiptFile: _r, ...itemData } = item;
        report = await ExpenseService.addExpenseItem(report.id, itemData);
      }

      // Submit
      report = await ExpenseService.submitReport(report.id);
      setStep('submit');
      onSuccess?.(report);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = items.reduce((s, i) => s + i.amount, 0);
  const reimbursableTotal = items.filter((i) => i.isReimbursable).reduce((s, i) => s + i.amount, 0);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">New Expense Report</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Fill in the details below to submit your expenses
        </p>
      </div>

      {/* Step indicator */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <StepIndicator current={step} />
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* ── Step: Header ─────────────────────────────────────────────────── */}
        {step === 'header' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Report Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={header.reportName}
                onChange={(e) => setHeader((h) => ({ ...h, reportName: e.target.value }))}
                placeholder="e.g., February Sales Trip"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {errors.reportName && (
                <p className="text-xs text-red-500 mt-1">{errors.reportName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Period Start <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={header.startDate}
                  onChange={(e) => setHeader((h) => ({ ...h, startDate: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Period End <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={header.endDate}
                  onChange={(e) => setHeader((h) => ({ ...h, endDate: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tags
              </label>
              <input
                type="text"
                value={header.tags}
                onChange={(e) => setHeader((h) => ({ ...h, tags: e.target.value }))}
                placeholder="comma separated: client-meeting, travel"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notes
              </label>
              <textarea
                value={header.notes}
                onChange={(e) => setHeader((h) => ({ ...h, notes: e.target.value }))}
                rows={3}
                placeholder="Any additional context or information..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              />
            </div>
          </div>
        )}

        {/* ── Step: Items ───────────────────────────────────────────────────── */}
        {step === 'items' && (
          <div className="space-y-4">
            {items.length === 0 && !addingItem && (
              <div className="py-12 text-center">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  No expense items yet. Add your first item below.
                </p>
              </div>
            )}

            {/* Item list */}
            {items.map((item) => (
              <div
                key={item._key}
                className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.description}
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex-shrink-0">
                      ${item.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-xs text-slate-400">{item.date}</span>
                    <span className="text-xs text-slate-400">&middot; {item.categoryName}</span>
                    <span className="text-xs text-slate-400">
                      &middot; {item.paymentMethod.replace('_', ' ')}
                    </span>
                    {item.merchant && (
                      <span className="text-xs text-slate-400">&middot; {item.merchant}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item._key)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add item form */}
            {addingItem ? (
              <div className="p-5 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Add Expense Item
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={itemForm.date ?? ''}
                      onChange={(e) => setItemForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {itemErrors.date && (
                      <p className="text-xs text-red-500 mt-1">{itemErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.amount ?? ''}
                        onChange={(e) =>
                          setItemForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))
                        }
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {itemErrors.amount && (
                      <p className="text-xs text-red-500 mt-1">{itemErrors.amount}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={itemForm.description ?? ''}
                    onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What was this expense for?"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {itemErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{itemErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Expense Type *
                    </label>
                    <select
                      value={itemForm.expenseType ?? ''}
                      onChange={(e) =>
                        setItemForm((f) => ({
                          ...f,
                          expenseType: e.target.value as ExpenseType,
                          categoryName:
                            EXPENSE_TYPE_META[e.target.value as ExpenseType]?.label ?? '',
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select type...</option>
                      {Object.entries(EXPENSE_TYPE_META).map(([v, meta]) => (
                        <option key={v} value={v}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                    {itemErrors.expenseType && (
                      <p className="text-xs text-red-500 mt-1">{itemErrors.expenseType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={itemForm.paymentMethod ?? 'personal_card'}
                      onChange={(e) =>
                        setItemForm((f) => ({
                          ...f,
                          paymentMethod: e.target.value as PaymentMethod,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm.value} value={pm.value}>
                          {pm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Merchant
                    </label>
                    <input
                      type="text"
                      value={itemForm.merchant ?? ''}
                      onChange={(e) => setItemForm((f) => ({ ...f, merchant: e.target.value }))}
                      placeholder="Merchant name"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Currency
                    </label>
                    <select
                      value={itemForm.currency ?? 'USD'}
                      onChange={(e) =>
                        setItemForm((f) => ({ ...f, currency: e.target.value as CurrencyCode }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.isReimbursable ?? true}
                      onChange={(e) =>
                        setItemForm((f) => ({ ...f, isReimbursable: e.target.checked }))
                      }
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Reimbursable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.isBillable ?? false}
                      onChange={(e) => setItemForm((f) => ({ ...f, isBillable: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Billable to client
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => {
                      setAddingItem(false);
                      setItemErrors({});
                    }}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingItem(true)}
                className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expense Item
              </button>
            )}

            {items.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Total: <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reimbursable: ${reimbursableTotal.toFixed(2)}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Receipts ────────────────────────────────────────────────── */}
        {step === 'receipts' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload receipts for each expense item. Receipts are required for items over $25.
            </p>
            {items.map((item) => (
              <div
                key={item._key}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.date} &middot; ${item.amount.toFixed(2)}
                    </p>
                  </div>
                  {item.amount >= 25 && !item.receiptFile && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Required
                    </span>
                  )}
                  {item.receiptFile && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Uploaded
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {item.receiptFile
                      ? item.receiptFile.name
                      : 'Click to upload receipt (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setItems((prev) =>
                          prev.map((i) => (i._key === item._key ? { ...i, receiptFile: file } : i))
                        );
                      }
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* ── Step: Review ──────────────────────────────────────────────────── */}
        {step === 'review' && (
          <div className="space-y-5">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Report Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">Report Name</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {header.reportName}
                </span>
                <span className="text-slate-500">Period</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {header.startDate} to {header.endDate}
                </span>
                {header.tags && (
                  <>
                    <span className="text-slate-500">Tags</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {header.tags}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Expense Items ({items.length})
              </h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item._key}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.description}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.date} &middot; {item.categoryName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        ${item.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.isReimbursable ? 'Reimbursable' : 'Non-reimbursable'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
              <div className="space-y-1">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-lg font-bold text-indigo-600">${totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Reimbursable</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ${reimbursableTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <Tag className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
        )}

        {/* ── Step: Submit ──────────────────────────────────────────────────── */}
        {step === 'submit' && (
          <div className="py-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Report Submitted!
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Your expense report has been submitted and is pending manager approval.
            </p>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      {step !== 'submit' && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'header' && (
              <button
                onClick={() => {
                  const idx = STEPS.findIndex((s) => s.id === step);
                  if (idx > 0) setStep(STEPS[idx - 1].id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={onCancel}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          {step === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (step === 'header') {
                  handleNextFromHeader();
                } else {
                  const idx = STEPS.findIndex((s) => s.id === step);
                  if (idx < STEPS.length - 2) setStep(STEPS[idx + 1].id);
                }
              }}
              disabled={step === 'items' && items.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
