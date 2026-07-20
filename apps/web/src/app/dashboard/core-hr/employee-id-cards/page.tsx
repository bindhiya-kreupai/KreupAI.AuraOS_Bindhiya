'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Printer, Check, Loader2, Plus, Ban, X } from 'lucide-react';
import { IDCardService, EmployeeService } from '../services';

export default function IDCardsPage() {
  const [printing, setPrinting] = useState(false);
  const [idCards, setIdCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printedCards, setPrintedCards] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  // Issue-card modal
  const [showIssue, setShowIssue] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [issueForm, setIssueForm] = useState({ employeeId: '', cardType: 'employee' });
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchIDCards();
  }, []);

  const fetchIDCards = async () => {
    try {
      setLoading(true);
      const data = await IDCardService.getAllIDCards();
      setIdCards(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load ID cards.');
    } finally {
      setLoading(false);
    }
  };

  const readyCount = idCards.filter((c) => !printedCards.has(c.cardId)).length;

  const handlePrintAll = () => {
    setPrinting(true);
    window.print();
    setPrintedCards(new Set(idCards.map((c) => c.cardId)));
    setPrinting(false);
  };

  const openIssue = async () => {
    setError('');
    setIssueForm({ employeeId: '', cardType: 'employee' });
    setShowIssue(true);
    if (employees.length === 0) {
      const list = await EmployeeService.getAllEmployees();
      setEmployees(list);
    }
  };

  const handleIssueCard = async () => {
    if (!issueForm.employeeId) {
      setError('Please select an employee.');
      return;
    }
    try {
      setIssuing(true);
      setError('');
      await IDCardService.generateCard(issueForm.employeeId, issueForm.cardType as any);
      setShowIssue(false);
      await fetchIDCards();
    } catch (err: any) {
      console.error('Issue failed:', err);
      setError(err?.message || 'Failed to issue ID card.');
    } finally {
      setIssuing(false);
    }
  };

  const handleRevoke = async (cardId: string) => {
    if (!confirm('Revoke this ID card? It will no longer be valid.')) return;
    try {
      setRevoking(cardId);
      setError('');
      await IDCardService.deactivateCard(cardId);
      await fetchIDCards();
    } catch (err: any) {
      console.error('Revoke failed:', err);
      setError('Failed to revoke the ID card.');
    } finally {
      setRevoking(null);
    }
  };

  const employeeLabel = (emp: any) =>
    `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
    emp.employeeName ||
    emp.employeeCode ||
    emp.id;

  const previewCard = idCards.length > 0 ? idCards[0] : null;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Employee ID Cards
          </h1>
          <p className="text-slate-500 text-sm">Design, generate, and print physical ID cards.</p>
        </div>
        <button
          onClick={openIssue}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Issue Card
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-2 text-sm text-rose-700 dark:text-rose-300 shrink-0">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Preview */}
        <div className="lg:col-span-1 flex justify-center lg:justify-start sticky top-0">
          {loading && (
            <div className="w-[300px] h-[480px] bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          )}
          {!loading && !previewCard && (
            <div className="w-[300px] h-[480px] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <CreditCard className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No ID cards</p>
              <p className="text-sm text-center px-4">
                Cards will appear here once they are generated.
              </p>
            </div>
          )}
          {!loading && previewCard && (
            <div className="w-[300px] h-[480px] bg-white rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden flex flex-col group transition-transform hover:scale-[1.02] duration-300">
              <div className="h-32 bg-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
              </div>
              <div className="flex flex-col items-center -mt-16 relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg bg-slate-100">
                  <img
                    src={
                      previewCard.photo || `https://i.pravatar.cc/300?u=${previewCard.employeeName}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold mt-4 text-slate-900">
                  {previewCard.employeeName}
                </h2>
                <div className="text-indigo-600 font-bold text-sm">
                  {previewCard.cardType
                    ? previewCard.cardType.charAt(0).toUpperCase() + previewCard.cardType.slice(1)
                    : 'Employee'}
                </div>

                <div className="mt-8 space-y-2 text-center text-slate-600 text-sm">
                  <div>
                    <span className="font-bold text-slate-400 text-xs block uppercase tracking-wider">
                      ID Number
                    </span>{' '}
                    {previewCard.cardNumber}
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 text-xs block uppercase tracking-wider">
                      Access Level
                    </span>{' '}
                    {previewCard.accessLevel}
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 text-xs block uppercase tracking-wider">
                      Expiry
                    </span>{' '}
                    {new Date(previewCard.expiryDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="mt-auto mb-8 w-full px-8">
                  <div className="h-12 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-mono tracking-widest opacity-80">
                    |||| ||| || |||||
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Print Queue</h3>
              <button
                onClick={handlePrintAll}
                disabled={printing || loading || idCards.length === 0 || readyCount === 0}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {printing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                {printing ? 'Printing...' : `Print All (${readyCount})`}
              </button>
            </div>
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {!loading && idCards.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <CreditCard className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No ID cards found</p>
                <p className="text-sm">ID cards will appear here once records are added.</p>
              </div>
            )}
            {!loading && idCards.length > 0 && (
              <div className="space-y-3">
                {idCards.map((card) => {
                  const isPrinted = printedCards.has(card.cardId);
                  return (
                    <div
                      key={card.cardId}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                          <img
                            src={card.photo || `https://i.pravatar.cc/150?u=${card.employeeName}`}
                            alt={card.employeeName}
                          />
                        </div>
                        <div className="font-bold text-sm">{card.employeeName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1
                                                ${isPrinted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}
                                            `}
                        >
                          {isPrinted ? <Check className="w-3 h-3" /> : ''}
                          {isPrinted ? 'Printed' : 'Ready to Print'}
                        </div>
                        {card.isActive !== false && (
                          <button
                            onClick={() => handleRevoke(card.cardId)}
                            disabled={revoking === card.cardId}
                            className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                            title="Revoke card"
                          >
                            <Ban className="w-3 h-3" />
                            {revoking === card.cardId ? 'Revoking…' : 'Revoke'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issue Card Modal */}
      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Issue Employee ID Card</h2>
              <button
                onClick={() => setShowIssue(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employee</label>
                <select
                  value={issueForm.employeeId}
                  onChange={(e) => setIssueForm((p) => ({ ...p, employeeId: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {employeeLabel(emp)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Card Type</label>
                <select
                  value={issueForm.cardType}
                  onChange={(e) => setIssueForm((p) => ({ ...p, cardType: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="employee">Employee</option>
                  <option value="contractor">Contractor</option>
                  <option value="visitor">Visitor</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowIssue(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueCard}
                disabled={issuing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-60"
              >
                {issuing ? 'Issuing…' : 'Issue Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
