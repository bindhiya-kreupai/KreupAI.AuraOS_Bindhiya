'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Download, CreditCard, PlusCircle, Trash2 } from 'lucide-react';

export default function UtilityBillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    accountId: '',
    billingMonth: 'January 2024',
    amount: 500,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
  });

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/energy/utility-billing/bills');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBills(data);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/energy/utility-billing/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({
        accountId: '',
        billingMonth: 'January 2024',
        amount: 500,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
      });
      fetchBills();
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      await fetch(`/api/energy/utility-billing/bills/${billId}`, {
        method: 'DELETE',
      });
      fetchBills();
    } catch (error) {
      console.error('Failed to delete bill:', error);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-500" />
            Utility Billing
          </h1>
          <p className="text-slate-500 text-sm">
            View invoices, track payments, and analyze costs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Bill
          </button>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Make Payment
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg">Add Utility Bill</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddBill} className="p-4 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Account ID
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                    placeholder="e.g. ACC-1234"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Billing Month
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.billingMonth}
                    onChange={(e) => setFormData({ ...formData, billingMonth: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                    placeholder="e.g. March 2024"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Total Amount ($)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Due Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Current Due</h3>
          {bills.length > 0 ? (
            (() => {
              const latest = bills[0];
              return (
                <>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center mb-4">
                    <div className="text-sm text-slate-500 mb-1">Total Outstanding</div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white">
                      {formatCurrency(latest.total?.amount || 0)}
                    </div>
                    <div className="text-xs text-rose-500 font-bold mt-2">
                      Status: {latest.status}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex justify-between">
                      <span>Electricity</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(latest.charges?.electricity || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(latest.charges?.water || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(latest.charges?.gas || 0)}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="p-6 text-center text-slate-500">No bills generated yet.</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col min-h-0">
          <h3 className="font-bold text-lg mb-4 shrink-0">Billing History</h3>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase sticky top-0">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Loading bills...
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No bills found. Click "Add Bill".
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                    >
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {bill.billId.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {bill.billingCycle?.month || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {formatCurrency(bill.total?.amount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            bill.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-600'
                              : bill.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2">
                        <button className="text-indigo-600 hover:text-indigo-800 p-1">
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBill(bill.billId)}
                          className="text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
