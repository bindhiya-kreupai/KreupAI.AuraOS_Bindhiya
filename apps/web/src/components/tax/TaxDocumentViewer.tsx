"use client";

import React, { useState } from "react";
import { FileText, Download, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import type { TaxDocument } from "./TaxDocumentsList";

interface TaxDocumentViewerProps {
  document: TaxDocument | null;
  onClose: () => void;
  onDownload?: (doc: TaxDocument) => void;
}

export default function TaxDocumentViewer({ document, onClose, onDownload }: TaxDocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2; // Mock page count

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cloud dark:border-nebula-purple/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{document.name}</p>
              <p className="text-xs text-silver-mist">{document.type} - Tax Year {document.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload?.(document)}
              className="p-2 rounded-lg hover:bg-celestial-indigo/10 text-silver-mist hover:text-celestial-indigo transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-deep-cosmos text-silver-mist transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-4 px-5 py-2 border-b border-cloud dark:border-nebula-purple/30 bg-gray-50 dark:bg-deep-cosmos">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-stellar-blue text-silver-mist"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-ink-black dark:text-pearl w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-stellar-blue text-silver-mist"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs text-silver-mist mx-2">|</span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-stellar-blue text-silver-mist disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-ink-black dark:text-pearl">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-stellar-blue text-silver-mist disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* PDF Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-deep-cosmos flex items-center justify-center p-6">
          <div
            className="bg-white shadow-lg rounded border border-gray-200 flex flex-col items-center justify-center"
            style={{ width: `${(595 * zoom) / 100}px`, height: `${(842 * zoom) / 100}px` }}
          >
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-sm font-medium text-gray-500">{document.name}</p>
            <p className="text-xs text-gray-400 mt-1">Page {currentPage} of {totalPages}</p>
            <p className="text-xs text-gray-400 mt-4 italic">PDF preview placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
