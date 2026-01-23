"use client";

import React from "react";
import {
  X,
  Download,
  Trash2,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Calendar,
  HardDrive,
  Tag,
  GitBranch,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  category: string;
  size: string;
  sizeBytes: number;
  uploadedDate: string;
  version: number;
  description?: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onDelete: (docId: string) => void;
}

const typeLabels: Record<Document["type"], string> = {
  pdf: "PDF Document",
  image: "Image File",
  spreadsheet: "Spreadsheet",
  document: "Document",
};

const typeIcons: Record<Document["type"], React.ReactNode> = {
  pdf: <FileText className="h-12 w-12 text-red-500" />,
  image: <FileImage className="h-12 w-12 text-green-500" />,
  spreadsheet: <FileSpreadsheet className="h-12 w-12 text-emerald-600" />,
  document: <File className="h-12 w-12 text-celestial-indigo" />,
};

export default function DocumentViewer({
  document,
  onClose,
  onDelete,
}: DocumentViewerProps) {
  const handleDownload = () => {
    // Placeholder: In production, this would trigger an actual file download
    console.log("Downloading:", document.name);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      onDelete(document.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stellar-blue">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cloud">
        <h2 className="text-sm font-semibold text-ink-black dark:text-pearl">
          Document Details
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-cloud/50 transition-colors"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Preview Area */}
      <div className="p-6 flex flex-col items-center border-b border-cloud">
        <div className="w-20 h-20 rounded-lg bg-celestial-indigo/5 flex items-center justify-center mb-4">
          {typeIcons[document.type]}
        </div>
        <h3 className="text-sm font-medium text-ink-black dark:text-pearl text-center break-words max-w-full px-2">
          {document.name}
        </h3>
        {document.description && (
          <p className="text-xs text-silver-mist text-center mt-2 px-2">
            {document.description}
          </p>
        )}
      </div>

      {/* Document Metadata */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-celestial-indigo/5 flex items-center justify-center flex-shrink-0">
              <Tag className="h-4 w-4 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-xs text-silver-mist">Type</p>
              <p className="text-sm text-ink-black dark:text-pearl">
                {typeLabels[document.type]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-celestial-indigo/5 flex items-center justify-center flex-shrink-0">
              <HardDrive className="h-4 w-4 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-xs text-silver-mist">Size</p>
              <p className="text-sm text-ink-black dark:text-pearl">
                {document.size}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-celestial-indigo/5 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-xs text-silver-mist">Uploaded</p>
              <p className="text-sm text-ink-black dark:text-pearl">
                {new Date(document.uploadedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-celestial-indigo/5 flex items-center justify-center flex-shrink-0">
              <GitBranch className="h-4 w-4 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-xs text-silver-mist">Version</p>
              <p className="text-sm text-ink-black dark:text-pearl">
                v{document.version}.0
              </p>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div className="pt-2">
          <p className="text-xs text-silver-mist mb-1.5">Category</p>
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-celestial-indigo/10 text-celestial-indigo">
            {document.category}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-cloud space-y-2">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-md hover:bg-celestial-indigo/90 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
