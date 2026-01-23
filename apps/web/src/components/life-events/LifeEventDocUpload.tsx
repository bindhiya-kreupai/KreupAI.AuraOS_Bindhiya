"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: "uploaded" | "pending";
  documentType: string;
}

type EventType =
  | "marriage"
  | "birth_adoption"
  | "divorce"
  | "death_dependent"
  | "address_change"
  | "loss_of_coverage";

const requiredDocsByEvent: Record<EventType, RequiredDocument[]> = {
  marriage: [
    { id: "cert", name: "Marriage Certificate", description: "Official marriage certificate or license", required: true },
    { id: "spouse_id", name: "Spouse ID", description: "Government-issued photo ID of spouse", required: true },
    { id: "spouse_ssn", name: "Spouse SSN Card", description: "Social Security card of spouse", required: false },
  ],
  birth_adoption: [
    { id: "birth_cert", name: "Birth Certificate", description: "Official birth certificate of child", required: true },
    { id: "adoption_decree", name: "Adoption Decree", description: "Court-issued adoption decree (if applicable)", required: false },
    { id: "child_ssn", name: "Child SSN Card", description: "Social Security card of child", required: false },
  ],
  divorce: [
    { id: "decree", name: "Divorce Decree", description: "Court-issued divorce decree", required: true },
    { id: "custody", name: "Custody Agreement", description: "Child custody agreement (if applicable)", required: false },
  ],
  death_dependent: [
    { id: "death_cert", name: "Death Certificate", description: "Official death certificate", required: true },
  ],
  address_change: [
    { id: "proof_address", name: "Proof of Address", description: "Utility bill, lease, or mortgage statement", required: true },
    { id: "id_updated", name: "Updated ID", description: "Updated government ID with new address", required: false },
  ],
  loss_of_coverage: [
    { id: "loss_letter", name: "Loss of Coverage Letter", description: "Letter from previous insurer confirming loss of coverage", required: true },
    { id: "cobra_notice", name: "COBRA Notice", description: "COBRA election notice (if applicable)", required: false },
  ],
};

interface LifeEventDocUploadProps {
  eventType?: EventType;
}

export default function LifeEventDocUpload({ eventType = "marriage" }: LifeEventDocUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const requiredDocs = requiredDocsByEvent[eventType] || [];

  const handleSimulateUpload = (docType: string) => {
    const newFile: UploadedFile = {
      id: `file_${ Date.now()}`,
      name: `${ docType.replace(/_/g, " ")}.pdf`,
      size: "1.2 MB",
      status: "uploaded",
      documentType: docType,
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const isDocUploaded = (docId: string) => {
    return uploadedFiles.some((f) => f.documentType === docId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center gap-3 mb-2">
        <Upload className="w-5 h-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
          Required Documents
        </h2>
      </div>
      <p className="text-sm text-silver-mist mb-6">
        Upload the following documents to support your life event claim.
      </p>

      <div className="space-y-4">
        {requiredDocs.map((doc) => {
          const uploaded = isDocUploaded(doc.id);
          return (
            <div
              key={doc.id}
              className={`p-4 rounded-lg border transition-all ${
                uploaded
                  ? "border-green-300 dark:border-green-500/50 bg-green-50 dark:bg-green-900/10"
                  : "border-cloud dark:border-nebula-purple/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-ink-black dark:text-pearl">
                      {doc.name}
                    </p>
                    {doc.required && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium">
                        Required
                      </span>
                    )}
                    {!doc.required && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist font-medium">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-silver-mist mt-1">{doc.description}</p>
                </div>
                {uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <button
                    onClick={() => handleSimulateUpload(doc.id)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-celestial-indigo/30 text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors font-medium"
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-ink-black dark:text-pearl mb-3">
            Uploaded Files
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-celestial-indigo" />
                  <div>
                    <p className="text-sm text-ink-black dark:text-pearl">{file.name}</p>
                    <p className="text-xs text-silver-mist">{file.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-silver-mist hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {requiredDocs.some((d) => d.required && !isDocUploaded(d.id)) && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Please upload all required documents before submitting your life event request.
          </p>
        </div>
      )}
    </div>
  );
}
