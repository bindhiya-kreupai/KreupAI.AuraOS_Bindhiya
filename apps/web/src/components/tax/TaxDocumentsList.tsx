"use client";

import React from "react";
import { FileText, Download, Eye, Calendar } from "lucide-react";

export interface TaxDocument {
  id: string;
  name: string;
  type: "W-2" | "1099" | "Form 16";
  year: number;
  generatedAt: string;
  size: string;
}

interface TaxDocumentsListProps {
  documents: TaxDocument[];
  onPreview?: (doc: TaxDocument) => void;
  onDownload?: (doc: TaxDocument) => void;
}

export default function TaxDocumentsList({ documents, onPreview, onDownload }: TaxDocumentsListProps) {
  if (documents.length === 0) {
    return (
      <div className="p-12 text-center">
        <FileText className="w-12 h-12 text-silver-mist mx-auto mb-3" />
        <p className="text-sm text-silver-mist">No tax documents available for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors group">
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{doc.name}</p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-silver-mist">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {doc.generatedAt}
                </span>
                <span>{doc.size}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px] font-medium">
                  {doc.type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onPreview?.(doc)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDownload?.(doc)}
                className="p-2 rounded-lg hover:bg-celestial-indigo/10 text-silver-mist hover:text-celestial-indigo transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
