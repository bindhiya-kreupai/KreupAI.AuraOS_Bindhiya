"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  Type,
  Hash,
  Regex,
  Code,
  Asterisk,
  CaseSensitive,
} from "lucide-react";

type RuleType = "required" | "minLength" | "maxLength" | "pattern" | "custom";

interface ValidationRule {
  id: string;
  type: RuleType;
  fieldId: string;
  fieldLabel: string;
  value?: string | number;
  errorMessage: string;
  isActive: boolean;
}

interface FormFieldOption {
  id: string;
  label: string;
  type: string;
}

const ruleTypeConfig: Record<
  RuleType,
  { label: string; icon: React.ReactNode; description: string; hasValue: boolean; valueType: string }
> = {
  required: {
    label: "Required",
    icon: <Asterisk className="w-4 h-4" />,
    description: "Field must not be empty",
    hasValue: false,
    valueType: "none",
  },
  minLength: {
    label: "Min Length",
    icon: <Type className="w-4 h-4" />,
    description: "Minimum character count",
    hasValue: true,
    valueType: "number",
  },
  maxLength: {
    label: "Max Length",
    icon: <CaseSensitive className="w-4 h-4" />,
    description: "Maximum character count",
    hasValue: true,
    valueType: "number",
  },
  pattern: {
    label: "Pattern",
    icon: <Regex className="w-4 h-4" />,
    description: "Must match a regex pattern",
    hasValue: true,
    valueType: "text",
  },
  custom: {
    label: "Custom",
    icon: <Code className="w-4 h-4" />,
    description: "Custom validation function",
    hasValue: true,
    valueType: "text",
  },
};

const mockFields: FormFieldOption[] = [
  { id: "field-001", label: "Full Name", type: "text" },
  { id: "field-002", label: "Email Address", type: "email" },
  { id: "field-003", label: "Phone Number", type: "text" },
  { id: "field-004", label: "Department", type: "dropdown" },
  { id: "field-005", label: "Employee ID", type: "text" },
  { id: "field-006", label: "Start Date", type: "date" },
  { id: "field-007", label: "Comments", type: "textarea" },
];

const mockRules: ValidationRule[] = [
  {
    id: "rule-001",
    type: "required",
    fieldId: "field-001",
    fieldLabel: "Full Name",
    errorMessage: "Full name is required",
    isActive: true,
  },
  {
    id: "rule-002",
    type: "minLength",
    fieldId: "field-001",
    fieldLabel: "Full Name",
    value: 2,
    errorMessage: "Name must be at least 2 characters",
    isActive: true,
  },
  {
    id: "rule-003",
    type: "pattern",
    fieldId: "field-002",
    fieldLabel: "Email Address",
    value: "^[\\w.-]+@[\\w.-]+\\.\\w+$",
    errorMessage: "Please enter a valid email address",
    isActive: true,
  },
  {
    id: "rule-004",
    type: "required",
    fieldId: "field-002",
    fieldLabel: "Email Address",
    errorMessage: "Email address is required",
    isActive: true,
  },
  {
    id: "rule-005",
    type: "pattern",
    fieldId: "field-003",
    fieldLabel: "Phone Number",
    value: "^\\+?[0-9\\s-]{7,15}$",
    errorMessage: "Please enter a valid phone number",
    isActive: false,
  },
  {
    id: "rule-006",
    type: "maxLength",
    fieldId: "field-007",
    fieldLabel: "Comments",
    value: 500,
    errorMessage: "Comments cannot exceed 500 characters",
    isActive: true,
  },
  {
    id: "rule-007",
    type: "custom",
    fieldId: "field-005",
    fieldLabel: "Employee ID",
    value: "value.startsWith('EMP-')",
    errorMessage: "Employee ID must start with 'EMP-'",
    isActive: true,
  },
];

export function ValidationRules() {
  const [rules, setRules] = useState<ValidationRule[]>(mockRules);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRuleType, setNewRuleType] = useState<RuleType>("required");
  const [newRuleField, setNewRuleField] = useState<string>(mockFields[0].id);
  const [newRuleValue, setNewRuleValue] = useState<string>("");
  const [newRuleError, setNewRuleError] = useState<string>("");
  const [filterField, setFilterField] = useState<string>("all");

  const handleAddRule = () => {
    const selectedField = mockFields.find((f) => f.id === newRuleField);
    if (!selectedField) return;

    const config = ruleTypeConfig[newRuleType];
    const defaultError =
      newRuleError ||
      `${selectedField.label} - ${config.label} validation failed`;

    const newRule: ValidationRule = {
      id: `rule-${Date.now()}`,
      type: newRuleType,
      fieldId: newRuleField,
      fieldLabel: selectedField.label,
      value: config.hasValue
        ? config.valueType === "number"
          ? parseInt(newRuleValue) || 0
          : newRuleValue
        : undefined,
      errorMessage: defaultError,
      isActive: true,
    };

    setRules([...rules, newRule]);
    setShowAddForm(false);
    setNewRuleValue("");
    setNewRuleError("");
  };

  const removeRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      )
    );
  };

  const updateErrorMessage = (ruleId: string, message: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId ? { ...r, errorMessage: message } : r
      )
    );
  };

  const filteredRules =
    filterField === "all"
      ? rules
      : rules.filter((r) => r.fieldId === filterField);

  const rulesByField = filteredRules.reduce(
    (acc, rule) => {
      if (!acc[rule.fieldId]) {
        acc[rule.fieldId] = [];
      }
      acc[rule.fieldId].push(rule);
      return acc;
    },
    {} as Record<string, ValidationRule[]>
  );

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Validation Rules
            </h2>
            <p className="text-sm text-silver-mist">
              Configure validation rules for form fields
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Add Rule Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-celestial-indigo/20 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
            New Validation Rule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule Type */}
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Rule Type
              </label>
              <div className="relative">
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as RuleType)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl appearance-none"
                >
                  {Object.entries(ruleTypeConfig).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.label} - {config.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
              </div>
            </div>

            {/* Apply to Field */}
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Apply to Field
              </label>
              <div className="relative">
                <select
                  value={newRuleField}
                  onChange={(e) => setNewRuleField(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl appearance-none"
                >
                  {mockFields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label} ({field.type})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
              </div>
            </div>

            {/* Value */}
            {ruleTypeConfig[newRuleType].hasValue && (
              <div>
                <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                  Value
                  <span className="text-silver-mist ml-1">
                    ({ruleTypeConfig[newRuleType].valueType === "number"
                      ? "number"
                      : "expression"})
                  </span>
                </label>
                <input
                  type={
                    ruleTypeConfig[newRuleType].valueType === "number"
                      ? "number"
                      : "text"
                  }
                  value={newRuleValue}
                  onChange={(e) => setNewRuleValue(e.target.value)}
                  placeholder={
                    newRuleType === "pattern"
                      ? "^[a-zA-Z]+$"
                      : newRuleType === "custom"
                        ? "value.length > 0"
                        : "Enter value"
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl font-mono"
                />
              </div>
            )}

            {/* Error Message */}
            <div className={ruleTypeConfig[newRuleType].hasValue ? "" : "md:col-span-2"}>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Error Message
              </label>
              <input
                type="text"
                value={newRuleError}
                onChange={(e) => setNewRuleError(e.target.value)}
                placeholder="Custom error message shown on validation failure"
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRule}
              className="px-4 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors"
            >
              Add Rule
            </button>
          </div>
        </div>
      )}

      {/* Filter by Field */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-medium text-silver-mist">
          Filter by field:
        </label>
        <div className="relative">
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl appearance-none pr-8"
          >
            <option value="all">All Fields</option>
            {mockFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist pointer-events-none" />
        </div>
        <span className="text-xs text-silver-mist">
          {filteredRules.length} rule{filteredRules.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Rules List Grouped by Field */}
      <div className="space-y-4">
        {Object.entries(rulesByField).map(([fieldId, fieldRules]) => {
          const field = mockFields.find((f) => f.id === fieldId);
          return (
            <div
              key={fieldId}
              className="border border-cloud dark:border-nebula-purple/50 rounded-lg overflow-hidden"
            >
              {/* Field Header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/50">
                <Hash className="w-3.5 h-3.5 text-celestial-indigo" />
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {field?.label || fieldId}
                </span>
                <span className="text-xs text-silver-mist">
                  ({field?.type})
                </span>
                <span className="ml-auto text-xs text-silver-mist">
                  {fieldRules.length} rule{fieldRules.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Rules for this field */}
              <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
                {fieldRules.map((rule) => {
                  const config = ruleTypeConfig[rule.type];
                  return (
                    <div
                      key={rule.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        rule.isActive
                          ? ""
                          : "opacity-50"
                      }`}
                    >
                      {/* Rule Type Icon */}
                      <div className="p-1.5 rounded bg-celestial-indigo/10 text-celestial-indigo mt-0.5">
                        {config.icon}
                      </div>

                      {/* Rule Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-ink-black dark:text-pearl">
                            {config.label}
                          </span>
                          {rule.value !== undefined && (
                            <code className="text-xs px-1.5 py-0.5 bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo rounded font-mono">
                              {String(rule.value)}
                            </code>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-coral-alert flex-shrink-0" />
                          <input
                            type="text"
                            value={rule.errorMessage}
                            onChange={(e) =>
                              updateErrorMessage(rule.id, e.target.value)
                            }
                            className="flex-1 text-xs text-silver-mist bg-transparent border-none outline-none focus:text-ink-black dark:focus:text-pearl"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`w-8 h-4.5 rounded-full relative transition-colors ${
                            rule.isActive
                              ? "bg-aurora-green"
                              : "bg-gray-300 dark:bg-nebula-purple/50"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                              rule.isActive ? "left-[14px]" : "left-0.5"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="p-1 text-silver-mist hover:text-coral-alert rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredRules.length === 0 && (
          <div className="text-center py-10 border border-dashed border-cloud dark:border-nebula-purple/50 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-silver-mist mx-auto mb-2" />
            <p className="text-sm text-silver-mist">
              No validation rules configured
            </p>
            <p className="text-xs text-silver-mist mt-1">
              Click &quot;Add Rule&quot; to create your first validation rule
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
