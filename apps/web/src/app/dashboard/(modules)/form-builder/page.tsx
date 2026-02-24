"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import FormBuilder from "@/components/forms/FormBuilder";
import FieldPalette from "@/components/forms/FieldPalette";
import FormPreview from "@/components/forms/FormPreview";
import { ValidationRules } from "@/components/forms/ValidationRules";

interface FormDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  fieldsCount: number;
  submissions: number;
  lastSubmission: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  fields?: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    options?: Array<{ value: string; label: string }>;
    validation?: Record<string, unknown>;
    placeholder?: string;
  }>;
}

export default function FormBuilderPage() {
  const [activeView, setActiveView] = useState<"builder" | "palette" | "preview" | "validation">("builder");
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch all forms on mount
  useEffect(() => {
    fetch("/api/v1/admin/forms")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setForms(result.data || []);
          if (result.data && result.data.length > 0) {
            setSelectedFormId(result.data[0].id);
          }
        } else {
          setError("Failed to load forms");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch forms:", err);
        setError("Failed to load forms. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch the selected form details when form is selected
  useEffect(() => {
    if (!selectedFormId) return;

    fetch(`/api/v1/admin/forms/${selectedFormId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setSelectedForm(result.data);
        }
      })
      .catch(console.error);
  }, [selectedFormId]);

  // Save form handler
  const handleSaveForm = async (formData: { name: string; description: string; fields: unknown[] }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setForms((prev) => [...prev, result.data]);
        setSelectedFormId(result.data.id);
      }
    } catch (err) {
      console.error("Failed to save form:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
          <div className="flex gap-3 border-b border-cloud dark:border-nebula-purple/50 pb-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            ))}
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-lg font-bold text-ink-black dark:text-pearl">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-celestial-indigo text-white rounded-lg font-medium text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Form Selector */}
        {forms.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-ink-black dark:text-pearl">Form:</label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="px-4 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
            >
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name} ({form.status})
                </option>
              ))}
            </select>
            <span className="text-xs text-silver-mist">
              {forms.length} forms total | {forms.filter((f) => f.status === "published").length} published
            </span>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex gap-3 border-b border-cloud dark:border-nebula-purple/50">
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
        {activeView === "builder" && (
          <FormBuilder
            formDefinition={selectedForm}
            onSave={handleSaveForm}
            saving={saving}
          />
        )}
        {activeView === "palette" && (
          <div className="max-w-sm">
            <FieldPalette />
          </div>
        )}
        {activeView === "preview" && <FormPreview formDefinition={selectedForm} />}
        {activeView === "validation" && <ValidationRules formDefinition={selectedForm} />}
      </div>
    </div>
  );
}

