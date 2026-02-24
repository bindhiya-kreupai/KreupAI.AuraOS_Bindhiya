"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  FileText,
} from "lucide-react";
import CSVMapper from "./CSVMapper";
import ImportValidation from "./ImportValidation";
import ImportProgress from "./ImportProgress";

const STEPS = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Map Columns", icon: FileSpreadsheet },
  { id: 3, label: "Validate", icon: CheckCircle2 },
  { id: 4, label: "Import", icon: Loader2 },
];

interface DataImportWizardProps {
  onComplete?: (result: { importedRows: number; failedRows: number }) => void;
}

export default function DataImportWizard({ onComplete }: DataImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [importProgress, setImportProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === 3) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            onComplete?.({ importedRows: 495, failedRows: 5 });
          }
          setImportProgress(Math.min(100, Math.round(progress)));
        }, 300);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-celestial-indigo" />
            Data Import Wizard
          </h2>
          <p className="text-silver-mist text-sm">Import employee data from CSV or Excel files.</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === step.id
                      ? "bg-celestial-indigo text-white"
                      : currentStep > step.id
                      ? "bg-aurora-green text-white"
                      : "bg-gray-100 dark:bg-deep-cosmos text-silver-mist"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${currentStep === step.id ? "text-celestial-indigo" : "text-silver-mist"}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${currentStep > step.id ? "bg-aurora-green" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 min-h-[320px]">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Upload File</h3>
            <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-xl p-12 text-center hover:border-celestial-indigo/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-silver-mist mx-auto mb-4" />
              <p className="text-ink-black dark:text-pearl font-medium">Drag and drop your file here</p>
              <p className="text-silver-mist text-sm mt-1">or click to browse files</p>
              <button
                onClick={() => setFileName("employees_import.csv")}
                className="mt-4 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium"
              >
                Choose File
              </button>
              {fileName && (
                <p className="mt-2 text-sm text-aurora-green font-medium">{fileName}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-silver-mist">
              <FileText className="w-3.5 h-3.5" />
              <span>Supported formats: CSV, XLSX, XLS (Max 10MB, 10,000 rows)</span>
            </div>
          </div>
        )}
        {currentStep === 2 && <CSVMapper />}
        {currentStep === 3 && <ImportValidation />}
        {currentStep === 4 && <ImportProgress progress={importProgress} totalRows={500} validRows={495} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-ink-black dark:text-pearl flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === 4}
          className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {currentStep === 3 ? "Start Import" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
