"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  errorMessage?: string;
}

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const DEFAULT_ACCEPTED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DocumentUploader({
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: DocumentUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (fileId: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: 100, status: "complete" } : f
            )
          );
        } else {
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: Math.min(progress, 99), status: "uploading" } : f
            )
          );
        }
      }, 300);
    },
    []
  );

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File exceeds maximum size of ${formatFileSize(maxFileSize)}`;
    }
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(ext)) {
      return `File type ${ext} is not supported`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles: UploadFile[] = Array.from(files).map((file) => {
        const error = validateFile(file);
        return {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: file.size,
          progress: error ? 0 : 0,
          status: error ? "error" : "pending",
          errorMessage: error || undefined,
        };
      });

      setUploadFiles((prev) => [...prev, ...newFiles]);

      // Start uploading valid files
      newFiles
        .filter((f) => f.status !== "error")
        .forEach((f) => {
          setTimeout(() => simulateUpload(f.id), 500);
        });
    },
    [simulateUpload, maxFileSize, acceptedTypes]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const allComplete =
    uploadFiles.length > 0 &&
    uploadFiles.every((f) => f.status === "complete" || f.status === "error");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-celestial-indigo bg-celestial-indigo/5"
            : "border-cloud hover:border-celestial-indigo/50 hover:bg-celestial-indigo/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <Upload
          className={`h-10 w-10 mx-auto mb-3 ${
            isDragOver ? "text-celestial-indigo" : "text-silver-mist"
          }`}
        />
        <p className="text-sm font-medium text-ink-black dark:text-pearl mb-1">
          {isDragOver ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-silver-mist mb-2">
          or click to browse from your computer
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-silver-mist">
          <span>Max size: {formatFileSize(maxFileSize)}</span>
          <span>&middot;</span>
          <span>Accepted: {acceptedTypes.join(", ")}</span>
        </div>
      </div>

      {/* Upload Progress List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          {uploadFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-cloud bg-white dark:bg-stellar-blue"
            >
              <FileText className="h-4 w-4 text-silver-mist flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink-black dark:text-pearl truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-silver-mist ml-2 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                {file.status === "error" ? (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">{file.errorMessage}</span>
                  </div>
                ) : (
                  <div className="w-full bg-cloud rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        file.status === "complete"
                          ? "bg-green-500"
                          : "bg-celestial-indigo"
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {file.status === "complete" ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-silver-mist hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {allComplete && onUploadComplete && (
            <button
              onClick={onUploadComplete}
              className="w-full py-2 text-sm font-medium text-celestial-indigo hover:bg-celestial-indigo/5 rounded-md transition-colors"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
