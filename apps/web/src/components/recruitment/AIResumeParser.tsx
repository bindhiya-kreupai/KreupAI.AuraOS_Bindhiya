"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

type ParseStatus = "idle" | "uploading" | "parsing" | "success" | "error";

export default function AIResumeParser() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
      setFile({ name: droppedFile.name, size: droppedFile.size, type: droppedFile.type });
      setStatus("idle");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile({ name: selectedFile.name, size: selectedFile.size, type: selectedFile.type });
      setStatus("idle");
    }
  };

  const handleParse = () => {
    if (!file) return;
    setStatus("uploading");
    setTimeout(() => {
      setStatus("parsing");
      setTimeout(() => {
        setStatus("success");
      }, 2000);
    }, 1000);
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <h2 className="text-lg font-semibold text-ink-black dark:text-pearl mb-4">
        AI Resume Parser
      </h2>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-celestial-indigo bg-celestial-indigo/5"
            : "border-cloud dark:border-nebula-purple/50"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-silver-mist mb-3" />
        <p className="text-ink-black dark:text-pearl font-medium mb-1">
          Drag & drop resume here
        </p>
        <p className="text-silver-mist text-sm mb-3">Supports PDF and DOCX files</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
          <FileText className="h-4 w-4" />
          Browse Files
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Selected File */}
      {file && (
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-celestial-indigo" />
            <div>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{file.name}</p>
              <p className="text-xs text-silver-mist">{formatSize(file.size)}</p>
            </div>
          </div>
          <button onClick={clearFile} className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status */}
      {status !== "idle" && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {status === "uploading" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-celestial-indigo" />
              <span className="text-ink-black dark:text-pearl">Uploading resume...</span>
            </>
          )}
          {status === "parsing" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-celestial-indigo" />
              <span className="text-ink-black dark:text-pearl">AI is parsing resume data...</span>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Resume parsed successfully!</span>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">Failed to parse resume. Please try again.</span>
            </>
          )}
        </div>
      )}

      {/* Parse Button */}
      <button
        onClick={handleParse}
        disabled={!file || status === "uploading" || status === "parsing"}
        className="mt-4 w-full py-2.5 rounded-lg bg-celestial-indigo text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {status === "uploading" || status === "parsing" ? "Processing..." : "Parse Resume with AI"}
      </button>
    </div>
  );
}
