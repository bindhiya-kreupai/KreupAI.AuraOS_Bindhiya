"use client";

import React, { useState } from "react";
import {
  Heart,
  FileText,
  Upload,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface WizardStep {
  label: string;
  icon: React.ElementType;
}

const steps: WizardStep[] = [
  { label: "Event Type", icon: Heart },
  { label: "Event Details", icon: FileText },
  { label: "Document Upload", icon: Upload },
  { label: "Review & Submit", icon: CheckSquare },
];

const eventTypes = [
  "Marriage",
  "Birth / Adoption",
  "Divorce",
  "Death of Dependent",
  "Address Change",
  "Loss of Coverage",
];

export default function LifeEventWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const simulateUpload = () => {
    setUploadedFiles((prev) => [...prev, `document_${ prev.length + 1}.pdf`]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Select Event Type
            </h3>
            <div className="grid gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setEventType(type)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    eventType === type
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
                  } bg-white dark:bg-stellar-blue`}
                >
                  <p className="font-medium text-ink-black dark:text-pearl">{type}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Event Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Event Type
                </label>
                <input
                  type="text"
                  value={eventType}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-gray-50 dark:bg-nebula-purple/10 text-ink-black dark:text-pearl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Date of Event
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Additional Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide any additional information about this event..."
                  className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm placeholder:text-silver-mist resize-none"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Upload Documents
            </h3>
            <p className="text-sm text-silver-mist">
              Upload supporting documentation for your life event (e.g., marriage certificate, birth certificate).
            </p>
            <button
              onClick={simulateUpload}
              className="w-full p-8 rounded-lg border-2 border-dashed border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50 transition-colors flex flex-col items-center gap-3"
            >
              <Upload className="w-10 h-10 text-silver-mist" />
              <div className="text-center">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-silver-mist mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </button>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue"
                  >
                    <FileText className="w-4 h-4 text-celestial-indigo" />
                    <span className="text-sm text-ink-black dark:text-pearl">{file}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Review & Submit
            </h3>
            <div className="p-5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-silver-mist">Event Type</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {eventType || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-silver-mist">Date</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {eventDate || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-silver-mist">Documents</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {uploadedFiles.length} file(s)
                </span>
              </div>
              {description && (
                <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50">
                  <p className="text-sm text-silver-mist mb-1">Details</p>
                  <p className="text-sm text-ink-black dark:text-pearl">{description}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    index <= currentStep
                      ? "bg-celestial-indigo text-white"
                      : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-1 whitespace-nowrap ${
                    index <= currentStep
                      ? "text-celestial-indigo font-medium"
                      : "text-silver-mist"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 mt-[-12px] ${
                    index < currentStep
                      ? "bg-celestial-indigo"
                      : "bg-gray-200 dark:bg-nebula-purple/30"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-cloud dark:border-nebula-purple/50">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 disabled:opacity-50 transition-colors"
        >
          {currentStep === steps.length - 1 ? "Submit" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
