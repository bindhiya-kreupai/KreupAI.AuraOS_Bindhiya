"use client";

import React, { useState } from 'react';
import { Receipt, Upload, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

interface ExpenseClaim {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt: boolean;
}

const mockClaims: ExpenseClaim[] = [
  { id: '1', title: 'Client Dinner - Acme Corp', amount: 245.50, category: 'Meals', date: '2025-01-15', status: 'approved', receipt: true },
  { id: '2', title: 'Uber to Airport', amount: 68.00, category: 'Transport', date: '2025-01-14', status: 'pending', receipt: true },
  { id: '3', title: 'Conference Registration', amount: 599.00, category: 'Training', date: '2025-01-10', status: 'pending', receipt: true },
  { id: '4', title: 'Office Supplies', amount: 42.30, category: 'Supplies', date: '2025-01-08', status: 'rejected', receipt: false },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-sunset-amber', bg: 'bg-sunset-amber/10', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-coral-alert', bg: 'bg-coral-alert/10', label: 'Rejected' },
};

export function ExpenseReimbursement() {
  const [showForm, setShowForm] = useState(false);
  const totalPending = mockClaims.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-ink-black dark:text-pearl">Expense Claims</h3>
          <p className="text-xs text-silver-mist mt-0.5">
            Pending reimbursement: <span className="font-semibold text-sunset-amber">${totalPending.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-celestial-indigo rounded-lg hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Claim
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-celestial-indigo/30 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">Submit Expense</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Expense title" className="px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none" />
            <input type="number" placeholder="Amount" className="px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none" />
            <select className="px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none">
              <option>Meals</option>
              <option>Transport</option>
              <option>Training</option>
              <option>Supplies</option>
              <option>Other</option>
            </select>
            <input type="date" className="px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none" />
          </div>
          <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-lg p-3 text-center cursor-pointer hover:border-celestial-indigo/50 transition-colors">
            <Upload className="w-4 h-4 mx-auto text-silver-mist mb-1" />
            <p className="text-xs text-silver-mist">Upload receipt (PDF, JPG, PNG)</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-medium text-white bg-celestial-indigo rounded-lg">Submit</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {mockClaims.map((claim) => {
          const status = statusConfig[claim.status];
          const StatusIcon = status.icon;
          return (
            <div key={claim.id} className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-celestial-indigo" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{claim.title}</p>
                  <p className="text-xs text-silver-mist">{claim.category} &middot; {claim.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink-black dark:text-pearl">${claim.amount.toFixed(2)}</span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
