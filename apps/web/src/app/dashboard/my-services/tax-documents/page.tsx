"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { TaxService } from '../services';

interface TaxDocument {
  id: string;
  name: string;
  type: string;
  year: number;
  generatedAt: string;
  size: string;
}

const years = [2025, 2024, 2023, 2022, 2021];

export default function TaxDocumentsPage() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [fetching, setFetching] = useState(true);
  const [taxDocs, setTaxDocs] = useState<TaxDocument[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await TaxService.getTaxDocuments({ category: 'TAX_DOCUMENT' });
        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map((doc: any) => ({
            id: doc.id,
            name: doc.name || doc.fileName || doc.title || 'Tax Document',
            type: doc.documentType || doc.type || 'W-2',
            year: doc.year || (doc.createdAt ? new Date(doc.createdAt).getFullYear() : 2025),
            generatedAt: doc.generatedAt || doc.createdAt ? new Date(doc.generatedAt || doc.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
            size: doc.size || doc.fileSize || 'N/A',
          }));
          setTaxDocs(mapped);
        }
      } catch (err: any) {
        console.error('Failed to fetch tax documents:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchDocs();
  }, []);

  const filteredDocs = taxDocs.filter((doc) => doc.year === selectedYear);

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Tax Documents</h1>
          <p className="text-sm text-silver-mist mt-1">Access your W-2, 1099, and Form 16 documents</p>
        </div>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-ink-black dark:text-pearl cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year}>Tax Year {year}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        {filteredDocs.length > 0 ? (
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors group">
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-silver-mist">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {doc.generatedAt}</span>
                    <span>{doc.size}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px] font-medium">{doc.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-celestial-indigo/10 text-silver-mist hover:text-celestial-indigo transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-silver-mist mx-auto mb-3" />
            <p className="text-sm text-silver-mist">No tax documents available for {selectedYear}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">About Tax Documents</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
            W-2 forms are typically available by January 31 each year. Form 16 is generated after the fiscal year ends.
            Contact HR if your documents are missing.
          </p>
        </div>
      </div>
    </div>
  );
}

