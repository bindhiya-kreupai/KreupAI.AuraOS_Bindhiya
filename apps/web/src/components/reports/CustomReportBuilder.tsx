"use client";

import React, { useState } from "react";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Save,
  Play,
  CheckCircle2,
} from "lucide-react";
import { DataSourceSelector } from "./DataSourceSelector";
import { ColumnPicker } from "./ColumnPicker";
import { FilterBuilder } from "./FilterBuilder";
import { ChartSelector } from "./ChartSelector";
import { ReportPreview } from "./ReportPreview";

type Step = "source" | "columns" | "filters" | "visualization" | "preview";

interface StepConfig {
  id: Step;
  label: string;
  number: number;
}

const steps: StepConfig[] = [
  { id: "source", label: "Data Source", number: 1 },
  { id: "columns", label: "Columns", number: 2 },
  { id: "filters", label: "Filters", number: 3 },
  { id: "visualization", label: "Visualization", number: 4 },
  { id: "preview", label: "Preview", number: 5 },
];

export function CustomReportBuilder() {
  const [currentStep, setCurrentStep] = useState<Step>("source");
  const [reportName, setReportName] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [chartType, setChartType] = useState<string>("table");

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "source":
        return dataSource !== "";
      case "columns":
        return selectedColumns.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Custom Report Builder
            </h2>
            <p className="text-sm text-silver-mist">
              Create a custom report from your HR data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-sm font-medium text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
            <Play className="w-4 h-4" /> Run Report
          </button>
        </div>
      </div>

      {/* Report Name */}
      <div>
        <label className="text-xs font-medium text-silver-mist block mb-1.5">
          Report Name
        </label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Enter a name for your report..."
          className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
        />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.id
                  ? "bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/30"
                  : idx < currentStepIndex
                  ? "text-aurora-green"
                  : "text-silver-mist"
              }`}
            >
              {idx < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    currentStep === step.id
                      ? "bg-celestial-indigo text-white"
                      : "bg-cloud dark:bg-nebula-purple/30 text-silver-mist"
                  }`}
                >
                  {step.number}
                </span>
              )}
              <span className="hidden md:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-silver-mist flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
        {currentStep === "source" && (
          <DataSourceSelector
            selectedSource={dataSource}
            onSelect={(id) => setDataSource(id)}
          />
        )}
        {currentStep === "columns" && (
          <ColumnPicker
            dataSource={dataSource}
            selectedColumns={selectedColumns}
            onChange={setSelectedColumns}
          />
        )}
        {currentStep === "filters" && (
          <FilterBuilder dataSource={dataSource} />
        )}
        {currentStep === "visualization" && (
          <ChartSelector
            selectedChart={chartType as "table" | "bar" | "line" | "pie" | "area" | "scatter"}
            onChange={(chart) => setChartType(chart)}
          />
        )}
        {currentStep === "preview" && (
          <ReportPreview chartType={chartType} columns={selectedColumns} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStepIndex === 0
              ? "text-silver-mist cursor-not-allowed"
              : "text-ink-black dark:text-pearl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs text-silver-mist">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              canProceed()
                ? "bg-celestial-indigo text-white hover:bg-celestial-indigo/90"
                : "bg-cloud dark:bg-nebula-purple/30 text-silver-mist cursor-not-allowed"
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
            <Play className="w-4 h-4" /> Generate Report
          </button>
        )}
      </div>
    </div>
  );
}
