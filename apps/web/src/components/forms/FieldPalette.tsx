"use client";

import React from "react";
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
  Calculator,
  GripVertical,
} from "lucide-react";

interface FieldType {
  type: string;
  label: string;
  icon: React.ReactNode;
}

interface FieldCategory {
  name: string;
  fields: FieldType[];
}

const fieldCategories: FieldCategory[] = [
  {
    name: "Basic",
    fields: [
      { type: "text", label: "Text Input", icon: <Type className="w-4 h-4" /> },
      { type: "number", label: "Number", icon: <Hash className="w-4 h-4" /> },
      { type: "email", label: "Email", icon: <AtSign className="w-4 h-4" /> },
      { type: "date", label: "Date Picker", icon: <Calendar className="w-4 h-4" /> },
    ],
  },
  {
    name: "Selection",
    fields: [
      { type: "dropdown", label: "Dropdown", icon: <ChevronDown className="w-4 h-4" /> },
      { type: "radio", label: "Radio Group", icon: <Circle className="w-4 h-4" /> },
      { type: "checkbox", label: "Checkbox Group", icon: <CheckSquare className="w-4 h-4" /> },
    ],
  },
  {
    name: "Advanced",
    fields: [
      { type: "file", label: "File Upload", icon: <Upload className="w-4 h-4" /> },
      { type: "signature", label: "Signature", icon: <PenTool className="w-4 h-4" /> },
      { type: "calculated", label: "Calculated", icon: <Calculator className="w-4 h-4" /> },
    ],
  },
];

interface FieldPaletteProps {
  onFieldSelect?: (type: string) => void;
  onDragStart?: (type: string) => void;
}

export default function FieldPalette({ onFieldSelect, onDragStart }: FieldPaletteProps) {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("fieldType", type);
    e.dataTransfer.effectAllowed = "copy";
    onDragStart?.(type);
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
        Field Palette
      </h3>
      <p className="text-xs text-silver-mist mb-4">
        Drag fields onto the form canvas
      </p>

      {fieldCategories.map((category) => (
        <div key={category.name} className="mb-4">
          <p className="text-[10px] font-bold text-silver-mist uppercase tracking-wider mb-2">
            {category.name}
          </p>
          <div className="space-y-1.5">
            {category.fields.map((field) => (
              <div
                key={field.type}
                draggable
                onDragStart={(e) => handleDragStart(e, field.type)}
                onClick={() => onFieldSelect?.(field.type)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 hover:bg-celestial-indigo/5 cursor-grab active:cursor-grabbing transition-all group"
              >
                <GripVertical className="w-3 h-3 text-gray-300 dark:text-nebula-purple/40 group-hover:text-silver-mist transition-colors" />
                <div className="p-1.5 rounded-lg bg-celestial-indigo/10 text-celestial-indigo">
                  {field.icon}
                </div>
                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                  {field.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-4 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
        <p className="text-xs text-celestial-indigo font-medium mb-1">
          How to use
        </p>
        <p className="text-xs text-silver-mist">
          Drag a field type from this palette and drop it onto the form canvas.
          Click to add at the end of the form.
        </p>
      </div>
    </div>
  );
}
