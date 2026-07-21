'use client';

import type { FormEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Clipboard,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react';
type PartStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

interface AutomotivePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice?: number;
  location?: string;
  status?: PartStatus;
}

interface AutomotivePartStockApi {
  id: string;
  part: string;
  category: string;
  stock: number;
  minStock: number;
  location: string;
  status: 'OK' | 'Low' | 'Critical';
}

interface PartsApiResponse {
  stocks?: AutomotivePartStockApi[];
}

interface AddStockForm {
  partNumber: string;
  name: string;
  category: string;
  quantity: string;
  reorderLevel: string;
  unitPrice: string;
  location: string;
}

interface RequisitionForm {
  partId: string;
  quantity: string;
  requestedBy: string;
  reason: string;
}

const emptyStockForm: AddStockForm = {
  partNumber: '',
  name: '',
  category: '',
  quantity: '',
  reorderLevel: '',
  unitPrice: '',
  location: '',
};

const emptyRequisitionForm: RequisitionForm = {
  partId: '',
  quantity: '',
  requestedBy: '',
  reason: '',
};

function getStatus(part: AutomotivePart): PartStatus {
  if (part.currentStock <= 0) {
    return 'Out of Stock';
  }

  if (part.currentStock <= part.reorderLevel) {
    return 'Low Stock';
  }

  return 'In Stock';
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function AutomotivePartsManagementPage() {
  const [parts, setParts] = useState<AutomotivePart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showStockModal, setShowStockModal] = useState(false);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);

  const [stockForm, setStockForm] = useState<AddStockForm>(emptyStockForm);

  const [requisitionForm, setRequisitionForm] = useState<RequisitionForm>(emptyRequisitionForm);

  const loadParts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/industry-automotive/parts', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Unable to load parts (${response.status}).`);
      }

      const result = (await response.json()) as PartsApiResponse;
      const records = result.stocks ?? [];

      const formattedParts: AutomotivePart[] = records.map((stock) => {
        const formattedPart: AutomotivePart = {
          id: stock.id,
          partNumber: stock.id.slice(0, 8).toUpperCase(),
          name: stock.part,
          category: stock.category,
          currentStock: Number(stock.stock ?? 0),
          reorderLevel: Number(stock.minStock ?? 0),
          location: stock.location,
        };

        return {
          ...formattedPart,
          status: getStatus(formattedPart),
        };
      });

      setParts(formattedParts);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to load automotive parts.'
      );

      setParts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadParts();
  }, [loadParts]);

  const filteredParts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return parts;
    }

    return parts.filter((part) => {
      const searchableValues = [
        part.name,
        part.partNumber,
        part.category,
        part.location ?? '',
        getStatus(part),
      ];

      return searchableValues.some((value) => value.toLowerCase().includes(query));
    });
  }, [parts, searchQuery]);

  const summary = useMemo(() => {
    const totalUnits = parts.reduce((total, part) => {
      return total + Number(part.currentStock || 0);
    }, 0);

    const lowStock = parts.filter((part) => getStatus(part) === 'Low Stock').length;

    const outOfStock = parts.filter((part) => getStatus(part) === 'Out of Stock').length;

    return {
      totalParts: parts.length,
      totalUnits,
      lowStock,
      outOfStock,
    };
  }, [parts]);

  const submitPartRequest = async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/industry-automotive/parts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = `Request failed (${response.status}).`;

      try {
        const result = (await response.json()) as {
          message?: string;
          error?: string;
        };

        message = result.message ?? result.error ?? message;
      } catch {
        // Keep fallback error message.
      }

      throw new Error(message);
    }
  };

  const handleAddStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const quantity = Number(stockForm.quantity);
      const reorderLevel = Number(stockForm.reorderLevel);
      const status = quantity <= 0 ? 'Critical' : quantity <= reorderLevel ? 'Low' : 'OK';

      await submitPartRequest({
        type: 'stock',
        part: stockForm.name.trim(),
        category: stockForm.category.trim(),
        stock: quantity,
        minStock: reorderLevel,
        location: stockForm.location.trim() || 'Unassigned',
        status,
      });

      setSuccessMessage('Stock added successfully.');
      setStockForm(emptyStockForm);
      setShowStockModal(false);

      await loadParts();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRequisition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const selectedPart = parts.find((part) => part.id === requisitionForm.partId);

      await submitPartRequest({
        type: 'requisition',
        technician: requisitionForm.requestedBy.trim(),
        bay: 'Unassigned',
        item: `${selectedPart?.name ?? 'Automotive part'} x${Number(
          requisitionForm.quantity
        )} - ${requisitionForm.reason.trim()}`,
        priority: 'Standard',
        status: 'Pending',
      });

      setSuccessMessage('Requisition submitted successfully.');
      setRequisitionForm(emptyRequisitionForm);
      setShowRequisitionModal(false);

      await loadParts();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to submit requisition.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-6rem)] flex-col space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex shrink-0 flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Package className="h-6 w-6 text-indigo-500" />
            Automotive Parts Management
          </h1>

          <p className="text-sm text-slate-500">
            Stock levels, reordering roster, and technician requisitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccessMessage('');
              setShowRequisitionModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            <Clipboard className="h-4 w-4" />
            Add Requisition
          </button>

          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccessMessage('');
              setShowStockModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </button>
        </div>
      </div>

      {(error || successMessage) && (
        <div
          className={`shrink-0 rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
          }`}
        >
          {error || successMessage}
        </div>
      )}

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Parts',
            value: summary.totalParts,
            icon: Package,
          },
          {
            label: 'Units in Stock',
            value: summary.totalUnits,
            icon: Archive,
          },
          {
            label: 'Low Stock',
            value: summary.lowStock,
            icon: AlertTriangle,
          },
          {
            label: 'Out of Stock',
            value: summary.outOfStock,
            icon: ShoppingCart,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>

                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold">Parts Inventory</h2>

            <p className="text-xs text-slate-500">
              Review stock availability and reorder requirements.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search parts, category, location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />

              <p className="text-sm font-medium">Loading automotive parts...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-400 dark:bg-slate-800">
                <Package className="h-8 w-8" />
              </div>

              <h3 className="font-bold">
                {searchQuery ? 'No matching parts found' : 'No parts available'}
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                {searchQuery
                  ? 'Try another part name, number, category, or location.'
                  : 'Use Add Stock to create the first automotive inventory record.'}
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="px-5 py-3 font-semibold">Part</th>

                  <th className="px-5 py-3 font-semibold">Category</th>

                  <th className="px-5 py-3 font-semibold">Stock</th>

                  <th className="px-5 py-3 font-semibold">Reorder Level</th>

                  <th className="px-5 py-3 font-semibold">Location</th>

                  <th className="px-5 py-3 font-semibold">Unit Price</th>

                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredParts.map((part) => {
                  const status = getStatus(part);

                  return (
                    <tr
                      key={part.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">{part.name}</p>

                        <p className="mt-0.5 text-xs text-slate-500">{part.partNumber}</p>
                      </td>

                      <td className="px-5 py-4">{part.category}</td>

                      <td className="px-5 py-4 font-semibold">{part.currentStock}</td>

                      <td className="px-5 py-4">{part.reorderLevel}</td>

                      <td className="px-5 py-4">{part.location || '—'}</td>

                      <td className="px-5 py-4">
                        {typeof part.unitPrice === 'number'
                          ? `₹${part.unitPrice.toLocaleString('en-IN')}`
                          : '—'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : status === 'Low Stock'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showStockModal && (
        <Modal title="Add Stock" onClose={() => setShowStockModal(false)}>
          <form onSubmit={handleAddStock} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Part Number
                <input
                  required
                  value={stockForm.partNumber}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      partNumber: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="e.g. BRK-2041"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Part Name
                <input
                  required
                  value={stockForm.name}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="Brake Pad Set"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Category
                <input
                  required
                  value={stockForm.category}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="Braking System"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Quantity
                <input
                  required
                  min="1"
                  type="number"
                  value={stockForm.quantity}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="0"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Reorder Level
                <input
                  required
                  min="0"
                  type="number"
                  value={stockForm.reorderLevel}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      reorderLevel: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="0"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Unit Price
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={stockForm.unitPrice}
                  onChange={(event) =>
                    setStockForm((current) => ({
                      ...current,
                      unitPrice: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="0.00"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-sm font-medium">
              Storage Location
              <input
                value={stockForm.location}
                onChange={(event) =>
                  setStockForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                placeholder="Warehouse A / Rack 12"
              />
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Stock
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showRequisitionModal && (
        <Modal title="Add Requisition" onClose={() => setShowRequisitionModal(false)}>
          <form onSubmit={handleAddRequisition} className="space-y-4 p-5">
            <label className="block space-y-1.5 text-sm font-medium">
              Select Part
              <select
                required
                value={requisitionForm.partId}
                onChange={(event) =>
                  setRequisitionForm((current) => ({
                    ...current,
                    partId: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
              >
                <option value="">Choose an automotive part</option>

                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} ({part.partNumber}) — {part.currentStock} available
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Quantity
                <input
                  required
                  min="1"
                  type="number"
                  value={requisitionForm.quantity}
                  onChange={(event) =>
                    setRequisitionForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="0"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Requested By
                <input
                  required
                  value={requisitionForm.requestedBy}
                  onChange={(event) =>
                    setRequisitionForm((current) => ({
                      ...current,
                      requestedBy: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                  placeholder="Technician name"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-sm font-medium">
              Reason
              <textarea
                required
                rows={4}
                value={requisitionForm.reason}
                onChange={(event) =>
                  setRequisitionForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40"
                placeholder="Describe the repair, service, or production requirement."
              />
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowRequisitionModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || parts.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Requisition
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
