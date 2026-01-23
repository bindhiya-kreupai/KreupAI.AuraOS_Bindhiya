"use client";

import React, { useState } from "react";
import {
  Type,
  Hash,
  Calendar,
  AtSign,
  ChevronDown,
  Circle,
  CheckSquare,
  Upload,
  PenTool,
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
} from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "number" | "date" | "email" | "dropdown" | "radio" | "checkbox" | "file" | "signature";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FieldTypeInfo {
  type: FormField["type"];
  label: string;
  icon: React.ReactNode;
  category: string;
}

const fieldTypes: FieldTypeInfo[] = [
  { type: "text", label: "Text", icon: <Type className="w-4 h-4" />, category: "Basic" },
  { type: "number", label: "Number", icon: <Hash className="w-4 h-4" />, category: "Basic" },
  { type: "email", label: "Email", icon: <AtSign className="w-4 h-4" />, category: "Basic" },
  { type: "date", label: "Date", icon: <Calendar className="w-4 h-4" />, category: "Basic" },
  { type: "dropdown", label: "Dropdown", icon: <ChevronDown className="w-4 h-4" />, category: "Selection" },
  { type: "radio", label: "Radio", icon: <Circle className="w-4 h-4" />, category: "Selection" },
  { type: "checkbox", label: "Checkbox", icon: <CheckSquare className="w-4 h-4" />, category: "Selection" },
  { type: "file", label: "File Upload", icon: <Upload className="w-4 h-4" />, category: "Advanced" },
  { type: "signature", label: "Signature", icon: <PenTool className="w-4 h-4" />, category: "Advanced" },
];

const mockFields: FormField[] = [
  { id: "f-001", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
  { id: "f-002", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
  { id: "f-003", type: "dropdown", label: "Department", required: true, options: ["Engineering", "Sales", "HR", "Marketing"] },
  { id: "f-004", type: "date", label: "Start Date", required: false },
  { id: "f-005", type: "checkbox", label: "Skills", required: false, options: ["JavaScript", "Python", "React", "Node.js"] },
  { id: "f-006", type: "file", label: "Resume Upload", required: false },
];

export default function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>(mockFields);
  const [selectedField, setSelectedField] = useState<string | null>("f-001");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: `f-${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      options: ["dropdown", "radio", "checkbox"].includes(type) ? ["Option 1", "Option 2"] : undefined,
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const getFieldIcon = (type: FormField["type"]) => {
    return fieldTypes.find((ft) => ft.type === type)?.icon;
  };

  const categories = [...new Set(fieldTypes.map((ft) => ft.category))];

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Settings className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Form Builder
            </h2>
            <p className="text-sm text-silver-mist">
              Design custom forms with drag-and-drop fields
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors">
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      <div className="flex gap-6">
        {/* Field Palette */}
        <div className="w-52 flex-shrink-0">
          <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-3">
            Field Types
          </h3>
          {categories.map((category) => (
            <div key={category} className="mb-4">
              <p className="text-[10px] font-semibold text-silver-mist uppercase mb-2">
                {category}
              </p>
              <div className="space-y-1.5">
                {fieldTypes
                  .filter((ft) => ft.category === category)
                  .map((ft) => (
                    <button
                      key={ft.type}
                      onClick={() => addField(ft.type)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 hover:bg-celestial-indigo/5 transition-colors text-left"
                    >
                      <div className="text-celestial-indigo">{ft.icon}</div>
                      <span className="text-xs font-medium text-ink-black dark:text-pearl">
                        {ft.label}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-[400px] border border-dashed border-cloud dark:border-nebula-purple/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Form Canvas
            </h3>
            <span className="text-xs text-silver-mist">
              {fields.length} fields
            </span>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedField === field.id
                    ? "border-celestial-indigo bg-celestial-indigo/5"
                    : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30"
                } ${dragOverIndex === index ? "border-t-2 border-t-celestial-indigo" : ""}`}
                onClick={() => setSelectedField(field.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => setDragOverIndex(null)}
                draggable
              >
                <GripVertical className="w-4 h-4 text-silver-mist cursor-grab" />
                <div className="text-celestial-indigo">
                  {getFieldIcon(field.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {field.label}
                  </p>
                  <p className="text-xs text-silver-mist capitalize">
                    {field.type} {field.required && "· Required"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="p-1 text-silver-mist hover:text-coral-alert rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-12">
                <Plus className="w-8 h-8 text-gray-300 dark:text-nebula-purple/30 mx-auto mb-2" />
                <p className="text-sm text-silver-mist">
                  Add fields from the palette or drag them here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedField && (
          <div className="w-56 flex-shrink-0 border border-cloud dark:border-nebula-purple/50 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-3">
              Field Properties
            </h3>
            {(() => {
              const field = fields.find((f) => f.id === selectedField);
              if (!field) return null;
              return (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-silver-mist block mb-1">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        setFields(fields.map((f) =>
                          f.id === field.id ? { ...f, label: e.target.value } : f
                        ))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-silver-mist block mb-1">Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        setFields(fields.map((f) =>
                          f.id === field.id ? { ...f, placeholder: e.target.value } : f
                        ))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-ink-black dark:text-pearl">Required</label>
                    <button
                      onClick={() =>
                        setFields(fields.map((f) =>
                          f.id === field.id ? { ...f, required: !f.required } : f
                        ))
                      }
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        field.required ? "bg-aurora-green" : "bg-gray-300 dark:bg-nebula-purple/50"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          field.required ? "left-4" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
