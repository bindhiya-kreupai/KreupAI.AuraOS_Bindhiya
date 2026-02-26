'use client';

/**
 * @module BulkImportWizard
 * @description 5-step wizard orchestrating the full bulk import flow:
 *   1. Upload  2. Column Mapping  3. Validation  4. Preview  5. Execute
 */

import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Eye,
  Play,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import FileUploadStep from './FileUploadStep';
import ColumnMappingStep from './ColumnMappingStep';
import ValidationStep from './ValidationStep';
import ImportPreview from './ImportPreview';
import ImportProgress from './ImportProgress';
import type {
  ParsedFile,
  ImportEntityType,
  ColumnMappingEntry,
  ValidationReport,
  ImportJobResult,
} from '@/services/bulkImportService';

// ── Step definitions ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Upload', icon: Upload },
  { id: 2, label: 'Map Columns', icon: FileSpreadsheet },
  { id: 3, label: 'Validate', icon: AlertCircle },
  { id: 4, label: 'Preview', icon: Eye },
  { id: 5, label: 'Execute', icon: Play },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ── Props ──────────────────────────────────────────────────────────────────────

interface BulkImportWizardProps {
  onComplete?: (result: ImportJobResult) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function BulkImportWizard({ onComplete }: BulkImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // State bubbled up from each step
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [entityType, setEntityType] = useState<ImportEntityType>('employees');
  const [columnMappings, setColumnMappings] = useState<ColumnMappingEntry[]>([]);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 1:
        return parsedFile !== null;
      case 2:
        // At least one mapping must be set
        return columnMappings.some((m) => m.targetField !== null);
      case 3:
        // Allow advancing even if there are errors — we'll import only valid rows
        return validationReport !== null && validationReport.validRows > 0;
      case 4:
        return validationReport !== null && validationReport.validRows > 0;
      case 5:
        return false; // last step, no next
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canAdvance() && currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as StepId);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepId);
    }
  };

  // ── Step content ─────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUploadStep
            onFileParsed={(file, type) => {
              setParsedFile(file);
              setEntityType(type);
              // Reset downstream state when file changes
              setColumnMappings([]);
              setValidationReport(null);
            }}
          />
        );

      case 2:
        if (!parsedFile) return null;
        return (
          <ColumnMappingStep
            parsedFile={parsedFile}
            entityType={entityType}
            onMappingsConfirmed={(mappings) => {
              setColumnMappings(mappings);
              // Reset validation when mappings change
              setValidationReport(null);
            }}
          />
        );

      case 3:
        if (!parsedFile) return null;
        return (
          <ValidationStep
            parsedFile={parsedFile}
            entityType={entityType}
            columnMappings={columnMappings}
            onValidationComplete={(report) => setValidationReport(report)}
          />
        );

      case 4:
        if (!validationReport) return null;
        return <ImportPreview validationReport={validationReport} entityType={entityType} />;

      case 5:
        if (!validationReport) return null;
        return (
          <ImportProgress
            validationReport={validationReport}
            entityType={entityType}
            onComplete={(result) => {
              onComplete?.(result);
            }}
          />
        );

      default:
        return null;
    }
  };

  // ── Next button label ────────────────────────────────────────────────────────

  const nextLabel = () => {
    switch (currentStep) {
      case 3:
        return 'Preview';
      case 4:
        return 'Execute Import';
      default:
        return 'Next';
    }
  };

  const nextButtonClass =
    currentStep === 4
      ? 'bg-aurora-green hover:bg-aurora-green/90 text-white'
      : 'bg-celestial-indigo hover:bg-celestial-indigo/90 text-white';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-celestial-indigo" />
          Bulk Import Wizard
        </h2>
        <p className="text-silver-mist text-sm mt-0.5">
          Import employee data, departments, positions, or attendance records at scale.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-celestial-indigo text-white'
                        : isDone
                          ? 'bg-aurora-green text-white'
                          : 'bg-gray-100 dark:bg-deep-cosmos text-silver-mist'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block whitespace-nowrap ${
                      isActive
                        ? 'text-celestial-indigo'
                        : isDone
                          ? 'text-aurora-green'
                          : 'text-silver-mist'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-aurora-green' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30 min-h-[360px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-ink-black dark:text-pearl flex items-center gap-2 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2 text-xs text-silver-mist">
            Step {currentStep} of {STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors ${nextButtonClass}`}
          >
            {nextLabel()}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Re-import button on final step */}
      {currentStep === 5 && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setCurrentStep(1);
              setParsedFile(null);
              setColumnMappings([]);
              setValidationReport(null);
            }}
            className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-ink-black dark:text-pearl hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors"
          >
            Start New Import
          </button>
        </div>
      )}
    </div>
  );
}
