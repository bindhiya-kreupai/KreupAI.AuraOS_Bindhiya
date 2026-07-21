'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Package, AlertTriangle, Search, Truck, Plus, X } from 'lucide-react';

type Part = {
  id: string;
  part: string;
  sku: string;
  stock: number;
  minStock: number;
  status: string;
  supplier?: string | null;
};

export default function PartsInventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    part: '',
    sku: '',
    stock: '',
    minStock: '',
    status: 'Healthy',
    supplier: '',
  });

  const loadParts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-automotive/parts-inventory');
      const data = await res.json();
      setParts(data.parts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const filteredParts = useMemo(() => {
    return parts.filter((item) => {
      const value = `${item.part} ${item.sku}`.toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [parts, search]);

  const reorderCount = parts.filter((item) => item.stock < item.minStock).length;

  const savePart = async () => {
    if (!form.part || !form.sku || !form.stock || !form.minStock || !form.status) {
      alert('Please fill all required fields.');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/industry-automotive/parts-inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        part: form.part,
        sku: form.sku,
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        status: form.status,
        supplier: form.supplier,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert('Failed to save part.');
      return;
    }

    setShowModal(false);
    setForm({
      part: '',
      sku: '',
      stock: '',
      minStock: '',
      status: 'Healthy',
      supplier: '',
    });

    await loadParts();
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            Parts Inventory
          </h1>
          <p className="text-slate-500 text-sm">Monitor stock levels and reorder alerts.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search part number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Part
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Stock Overview</h3>

          <div className="space-y-4">
            {loading && <div className="text-sm text-slate-500">Loading parts inventory...</div>}

            {!loading && filteredParts.length === 0 && (
              <div className="text-center text-slate-500 py-8">No parts found.</div>
            )}

            {!loading &&
              filteredParts.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.part}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">SKU: {item.sku}</div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase">Stock</div>
                      <div className="font-bold">
                        {item.stock} / {item.minStock}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-xs font-bold w-24 text-center ${
                        item.status === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-600'
                          : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-amber-800 dark:text-amber-200">Reorder Required</h3>
            </div>

            <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
              {reorderCount} items are below minimum stock levels.
            </p>

            <button className="w-full py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">
              Create PO
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Incoming Deliveries</h3>
              <Truck className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {parts.length === 0 && (
                <div className="text-sm text-slate-500">No incoming deliveries found.</div>
              )}

              {parts.slice(0, 2).map((item) => (
                <div key={item.id} className="text-sm">
                  <div className="font-bold">
                    {item.sku} - {item.supplier || 'Supplier'}
                  </div>
                  <div className="text-slate-500">Inventory record from backend</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Part</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Part name"
                value={form.part}
                onChange={(e) => setForm({ ...form, part: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Minimum stock"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Healthy">Healthy</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Cancel
              </button>
              <button
                onClick={savePart}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Part'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
