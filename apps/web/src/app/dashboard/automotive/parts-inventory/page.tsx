'use client';

import React, { useState, useMemo } from 'react';
import { Package, AlertTriangle, Truck, Download, Plus, Search } from 'lucide-react';
import { useAutomotive } from '../hooks/useAutomotive';
import { PartModal } from '../components/PartModal';
import { LoadingOverlay } from '../../agriculture/components/LoadingSpinner'; // reuse spinner
import { ToastContainer } from '../../agriculture/components/Toast'; // reuse toast
import type { Part } from '../types';

export default function PartsInventoryPage() {
  const {
    parts,
    purchaseOrders,
    loading,
    createPart,
    updatePart,
    // The hook might not expose deletePart, so we mock delete if needed.
  } = useAutomotive();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const [localToasts, setLocalToasts] = useState<any[]>([]);
  const [mockDeletedIds, setMockDeletedIds] = useState<Set<string>>(new Set());

  const addToast = (toast: { type: string; message: string }) => {
    setLocalToasts((prev) => [...prev, { ...toast, id: Date.now().toString() }]);
  };
  const removeToast = (id: string) => {
    setLocalToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const visibleParts = useMemo(() => {
    let filtered = parts.filter((p) => !mockDeletedIds.has(p.partId));
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.partName.toLowerCase().includes(lowerQuery) ||
          p.partNumber.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [parts, searchQuery, mockDeletedIds]);

  const lowStockParts = visibleParts.filter((p) => p.quantityOnHand <= p.minStockLevel);

  const handleExportCSV = () => {
    if (visibleParts.length === 0) {
      addToast({ type: 'warning', message: 'No parts to export' });
      return;
    }

    const headers = [
      'Part ID',
      'Part Number',
      'Part Name',
      'Category',
      'Manufacturer',
      'Cost',
      'Retail Price',
      'Stock',
      'Min Stock',
      'Status',
    ];
    const csvRows = [headers.join(',')];

    for (const part of visibleParts) {
      const row = [
        part.partId,
        `"${part.partNumber}"`,
        `"${part.partName}"`,
        `"${part.category}"`,
        `"${part.manufacturer}"`,
        part.cost,
        part.retailPrice,
        part.quantityOnHand,
        part.minStockLevel,
        part.status,
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parts_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Exported parts successfully' });
  };

  const handleSavePart = async (data: Partial<Part>) => {
    if (editingPart) {
      await updatePart(editingPart.partId, data);
      addToast({ type: 'success', message: 'Part updated successfully' });
    } else {
      await createPart({
        ...data,
        applicableVehicles: [],
        quantityOnOrder: 0,
        quantityReserved: 0,
        quantityAvailable: data.quantityOnHand || 0,
        reorderPoint: data.minStockLevel || 5,
        reorderQuantity: 20,
        leadTimeDays: 7,
        binLocation: 'A-1-1',
        isSerialized: false,
        isCore: false,
        supplier: {
          supplierId: 'SUP-001',
          supplierName: 'AutoParts Direct',
          leadTimeDays: 5,
          preferredSupplier: true,
        },
        createdDate: new Date(),
        updatedDate: new Date(),
      });
      addToast({ type: 'success', message: 'Part created successfully' });
    }
  };

  const openAddModal = () => {
    setEditingPart(null);
    setIsModalOpen(true);
  };

  const openEditModal = (part: Part) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      setMockDeletedIds((prev) => new Set(prev).add(id));
      addToast({ type: 'success', message: 'Part deleted' });
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading inventory data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            Parts Inventory
          </h1>
          <p className="text-slate-500 text-sm">Monitor stock levels and reorder alerts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Part
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search part name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full overflow-y-auto pb-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Stock Overview</h3>
            <div className="space-y-4">
              {visibleParts.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">No parts found.</div>
              ) : (
                visibleParts.map((item) => (
                  <div
                    key={item.partId}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {item.partName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        SKU: {item.partNumber} • {item.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                      <div className="text-right mr-2">
                        <div className="text-xs font-bold text-slate-400 uppercase">Stock</div>
                        <div className="font-bold">
                          {item.quantityOnHand} / {item.minStockLevel}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold w-20 text-center uppercase ${
                          item.quantityOnHand > item.minStockLevel
                            ? 'bg-emerald-100 text-emerald-600'
                            : item.quantityOnHand > 0
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {item.quantityOnHand > item.minStockLevel
                          ? 'Healthy'
                          : item.quantityOnHand > 0
                            ? 'Low Stock'
                            : 'Critical'}
                      </span>
                      <div className="flex gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-xs font-bold text-indigo-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.partId)}
                          className="text-xs font-bold text-rose-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {lowStockParts.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-amber-800 dark:text-amber-200">Reorder Required</h3>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                {lowStockParts.length} items are at or below minimum stock levels. Immediate action
                recommended.
              </p>
              <button className="w-full py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">
                Create PO
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Incoming Deliveries</h3>
              <Truck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {purchaseOrders.length === 0 ? (
                <div className="text-sm text-slate-500">No incoming deliveries.</div>
              ) : (
                purchaseOrders.slice(0, 3).map((po) => (
                  <div
                    key={po.purchaseOrderId}
                    className="text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="font-bold">
                      {po.poNumber} - {po.supplierName}
                    </div>
                    <div className="text-slate-500 mt-1">
                      Arriving {new Date(po.expectedDeliveryDate).toLocaleDateString()} •{' '}
                      {po.items.length} Items
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <PartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePart}
        part={editingPart}
      />

      <ToastContainer toasts={localToasts} onClose={removeToast} />
    </div>
  );
}
