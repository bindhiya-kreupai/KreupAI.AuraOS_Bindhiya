"use client";

import React, { useState } from "react";
import FormBuilder from "@/components/forms/FormBuilder";
import FieldPalette from "@/components/forms/FieldPalette";
import FormPreview from "@/components/forms/FormPreview";
import { ValidationRules } from "@/components/forms/ValidationRules";

export default function FormBuilderPage() {
  const [activeView, setActiveView] = useState<"builder" | "palette" | "preview" | "validation">("builder");

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* View Tabs */}
        <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50">
          {[
            { key: "builder", label: "Form Builder" },
            { key: "palette", label: "Field Palette" },
            { key: "preview", label: "Form Preview" },
            { key: "validation", label: "Validation Rules" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as typeof activeView)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === tab.key
                  ? "border-celestial-indigo text-celestial-indigo"
                  : "border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === "builder" && <FormBuilder />}
        {activeView === "palette" && (
          <div className="max-w-sm">
            <FieldPalette />
          </div>
        )}
        {activeView === "preview" && <FormPreview />}
        {activeView === "validation" && <ValidationRules />}
      </div>
    </div>
  );
}
