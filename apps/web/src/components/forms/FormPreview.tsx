"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Type,
  Hash,
  Calendar,
  AtSign,
  ChevronDown,
  Upload,
  PenTool,
} from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "number" | "date" | "email" | "dropdown" | "radio" | "checkbox" | "file" | "signature" | "select" | "textarea";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface ApiFormDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
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
  [key: string]: unknown;
}

interface FormPreviewProps {
  fields?: FormField[];
  formTitle?: string;
  formDefinition?: ApiFormDefinition | null;
}

function mapApiFieldType(type: string): FormField["type"] {
  const typeMap: Record<string, FormField["type"]> = {
    "select": "dropdown",
    "textarea": "text",
  };
  return (typeMap[type] || type) as FormField["type"];
}

export default function FormPreview({ fields: propFields, formTitle, formDefinition }: FormPreviewProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propFields) {
      setFields(propFields);
      return;
    }

    if (formDefinition?.fields && formDefinition.fields.length > 0) {
      const mapped = formDefinition.fields
        .sort((a, b) => a.order - b.order)
        .map((f) => ({
          id: f.id,
          type: mapApiFieldType(f.type),
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          options: f.options?.map((o) => (typeof o === "string" ? o : o.label)),
        }));
      setFields(mapped);
      return;
    }

    // Fallback: fetch from API if nothing provided
    if (!formDefinition) {
      setLoading(true);
      fetch("/api/v1/admin/forms")
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data && result.data.length > 0) {
            // Fetch the first form's details
            return fetch(`/api/v1/admin/forms/${result.data[0].id}`);
          }
          return null;
        })
        .then((res) => res?.json())
        .then((result) => {
          if (result?.success && result.data?.fields) {
            const mapped = result.data.fields
              .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
              .map((f: { id: string; name: string; label: string; type: string; required: boolean; placeholder?: string; options?: Array<{ value: string; label: string }> }) => ({
                id: f.id,
                type: mapApiFieldType(f.type),
                label: f.label,
                placeholder: f.placeholder,
                required: f.required,
                options: f.options?.map((o: { label: string }) => o.label),
              }));
            setFields(mapped);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [propFields, formDefinition]);

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "textarea":
        return (
          <input
            type={field.type === "textarea" ? "text" : field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist"
            readOnly
          />
        );
      case "date":
        return (
          <input
            type="date"
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
            readOnly
          />
        );
      case "dropdown":
      case "select":
        return (
          <div className="relative">
            <select className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl appearance-none">
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-cloud dark:border-nebula-purple/50" />
                <span className="text-sm text-ink-black dark:text-pearl">{opt}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-4 h-4 rounded border-2 border-cloud dark:border-nebula-purple/50" />
                <span className="text-sm text-ink-black dark:text-pearl">{opt}</span>
              </label>
            ))}
          </div>
        );
      case "file":
        return (
          <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/50 rounded-lg p-6 text-center">
            <Upload className="w-6 h-6 text-silver-mist mx-auto mb-2" />
            <p className="text-sm text-silver-mist">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-silver-mist mt-1">
              PDF, DOC, DOCX up to 10MB
            </p>
          </div>
        );
      case "signature":
        return (
          <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-4 bg-gray-50 dark:bg-stellar-blue/30">
            <div className="h-24 flex items-center justify-center">
              <div className="flex items-center gap-2 text-silver-mist">
                <PenTool className="w-5 h-5" />
                <span className="text-sm">Sign here</span>
              </div>
            </div>
            <div className="border-t border-cloud dark:border-nebula-purple/50 mt-2 pt-2 flex justify-end">
              <button className="text-xs text-celestial-indigo hover:underline">
                Clear
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="max-w-lg mx-auto space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const displayTitle = formTitle || formDefinition?.name || "Form Preview";
  const displayDescription = formDefinition?.description || "Please fill in all required fields marked with *";

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-celestial-indigo/10 rounded-lg">
          <Eye className="w-5 h-5 text-celestial-indigo" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
            {displayTitle}
          </h2>
          <p className="text-sm text-silver-mist">
            Live preview of the form as end users will see it
          </p>
        </div>
      </div>

      {/* Preview Container */}
      <div className="max-w-lg mx-auto border border-cloud dark:border-nebula-purple/50 rounded-xl p-6 bg-gray-50 dark:bg-stellar-blue/30">
        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl mb-1">
          {formDefinition?.name || "Employee Onboarding Form"}
        </h3>
        <p className="text-sm text-silver-mist mb-6">
          {displayDescription}
        </p>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-silver-mist">
            <p>No fields to preview. Add fields in the Form Builder.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  {field.label}
                  {field.required && (
                    <span className="text-coral-alert ml-0.5">*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button Preview */}
        <div className="mt-8 flex gap-3">
          <button className="flex-1 px-4 py-2.5 bg-celestial-indigo text-white text-sm font-medium rounded-lg hover:bg-celestial-indigo/90 transition-colors">
            Submit Form
          </button>
          <button className="px-4 py-2.5 border border-cloud dark:border-nebula-purple/50 text-sm font-medium text-ink-black dark:text-pearl rounded-lg hover:bg-gray-50 dark:hover:bg-nebula-purple/10 transition-colors">
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
