'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Printer, Check, Loader2 } from 'lucide-react';
import { IDCardService } from '../services';

export default function IDCardsPage() {
  const [printing, setPrinting] = useState(false);
  const [idCards, setIdCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printedCards, setPrintedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIDCards();
  }, []);

  const fetchIDCards = async () => {
    try {
      const data = await IDCardService.getAllIDCards();
      setIdCards(data);
    } catch (error: any) {
      console.error('Error:', error);
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
      </div>

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
                      <div
                        className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1
                                                ${isPrinted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}
                                            `}
                      >
                        {isPrinted ? <Check className="w-3 h-3" /> : ''}
                        {isPrinted ? 'Printed' : 'Ready to Print'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
