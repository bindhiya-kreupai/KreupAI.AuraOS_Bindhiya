"use client";

import React, { useState } from "react";
import { UserPlus, Save, X } from "lucide-react";

interface DependentFormData {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  ssn: string;
  gender: string;
}

interface DependentFormProps {
  initialData?: Partial<DependentFormData>;
  onSubmit?: (data: DependentFormData) => void;
  onCancel?: () => void;
  mode?: "add" | "edit";
}

const relationshipTypes = [
  "Spouse",
  "Child",
  "Domestic Partner",
  "Stepchild",
  "Foster Child",
  "Legal Ward",
];

const genderOptions = ["Male", "Female", "Non-Binary", "Prefer not to say"];

export default function DependentForm({
  initialData,
  onSubmit,
  onCancel,
  mode = "add",
}: DependentFormProps) {
  const [formData, setFormData] = useState<DependentFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    relationship: initialData?.relationship || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    ssn: initialData?.ssn || "",
    gender: initialData?.gender || "",
  });

  const [ssnVisible, setSsnVisible] = useState(false);

  const handleChange = (field: keyof DependentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const maskSSN = (ssn: string) => {
    if (!ssn) return "";
    if (ssnVisible) return ssn;
    return "***-**-" + ssn.slice(-4);
  };

  const formatSSNInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${ digits.slice(0, 3)}-${ digits.slice(3)}`;
    return `${ digits.slice(0, 3)}-${ digits.slice(3, 5)}-${ digits.slice(5)}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-5 h-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
          {mode === "add" ? "Add Dependent" : "Edit Dependent"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter first name"
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Enter last name"
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
            required
          />
        </div>

        {/* Relationship Type */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
            Relationship <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.relationship}
            onChange={(e) => handleChange("relationship", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm focus:outline-none focus:border-celestial-indigo"
            required
          >
            <option value="" disabled>
              Select relationship
            </option>
            {relationshipTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm focus:outline-none focus:border-celestial-indigo"
            required
          />
        </div>

        {/* SSN */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
            SSN
          </label>
          <div className="relative">
            <input
              type={ssnVisible ? "text" : "password"}
              value={ssnVisible ? formData.ssn : maskSSN(formData.ssn)}
              onChange={(e) => handleChange("ssn", formatSSNInput(e.target.value))}
              placeholder="XXX-XX-XXXX"
              className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm placeholder:text-silver-mist focus:outline-none focus:border-celestial-indigo"
            />
            <button
              type="button"
              onClick={() => setSsnVisible(!ssnVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-celestial-indigo font-medium"
            >
              {ssnVisible ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-sm focus:outline-none focus:border-celestial-indigo"
          >
            <option value="" disabled>
              Select gender
            </option>
            {genderOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cloud dark:border-nebula-purple/50">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            {mode === "add" ? "Add Dependent" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
