"use client";

import React, { useState } from "react";
import { FileSignature, FileText, Check, X, PenTool } from "lucide-react";

interface DocumentInfo {
  title: string;
  pages: number;
  candidate: string;
  position: string;
  sentDate: string;
}

const mockDocument: DocumentInfo = {
  title: "Employment Offer Letter",
  pages: 3,
  candidate: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  sentDate: "Jan 22, 2026",
};

export default function ESignaturePortal() {
  const [signed, setSigned] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const handleSign = () => {
    setSigned(true);
  };

  const handleDraw = () => {
    setDrawing(true);
    setTimeout(() => {
      setDrawing(false);
      setHasSignature(true);
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileSignature className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">E-Signature Portal</h2>
      </div>

      {/* Document Info */}
      <div className="mb-6 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-celestial-indigo" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">{mockDocument.title}</p>
            <p className="text-xs text-silver-mist">{mockDocument.pages} pages | Sent {mockDocument.sentDate}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-silver-mist">Candidate: </span>
            <span className="text-ink-black dark:text-pearl font-medium">{mockDocument.candidate}</span>
          </div>
          <div>
            <span className="text-silver-mist">Position: </span>
            <span className="text-ink-black dark:text-pearl font-medium">{mockDocument.position}</span>
          </div>
        </div>
      </div>

      {/* Document Preview Placeholder */}
      <div className="mb-6 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-gray-50 dark:bg-gray-900/30 p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-silver-mist mb-3" />
          <p className="text-sm text-silver-mist">Document Preview</p>
          <p className="text-xs text-silver-mist mt-1">Page 1 of {mockDocument.pages}</p>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mx-auto" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mx-auto" />
          </div>
        </div>
      </div>

      {/* Signature Pad Area */}
      {!signed ? (
        <>
          <div className="mb-4">
            <label className="text-sm font-medium text-ink-black dark:text-pearl mb-2 block">
              Your Signature
            </label>
            <div
              onClick={handleDraw}
              className={`h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                hasSignature
                  ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10"
                  : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo"
              }`}
            >
              {drawing ? (
                <div className="flex items-center gap-2 text-celestial-indigo">
                  <PenTool className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Drawing...</span>
                </div>
              ) : hasSignature ? (
                <p className="text-2xl font-script text-ink-black dark:text-pearl italic">Sarah Johnson</p>
              ) : (
                <div className="text-center">
                  <PenTool className="mx-auto h-5 w-5 text-silver-mist mb-1" />
                  <p className="text-xs text-silver-mist">Click to draw your signature</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSign}
              disabled={!hasSignature}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <Check className="h-4 w-4" />
              Sign Document
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <X className="h-4 w-4" />
              Decline
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Document Signed Successfully</p>
          <p className="text-xs text-silver-mist mt-1">Signed on Jan 23, 2026 at 2:45 PM</p>
        </div>
      )}
    </div>
  );
}
