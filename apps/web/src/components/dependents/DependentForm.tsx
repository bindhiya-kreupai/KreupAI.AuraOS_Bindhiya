/**
 * @module DependentForm
 * @description Add/edit dependent form with relationship selector, SSN input, and validation
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  X,
  Save,
  UserPlus,
  Heart,
  Baby,
  Users,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  GraduationCap,
  Accessibility,
  Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DependentInfo, DependentRelationship } from './DependentCard';

// ── Props ──────────────────────────────────────────────────────────────────────

interface DependentFormProps {
  dependent?: DependentInfo | null;
  onSave: (data: Omit<DependentInfo, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

// ── Relationship options ──────────────────────────────────────────────────────

interface RelOption {
  value: DependentRelationship;
  label: string;
  icon: LucideIcon;
  description: string;
}

const RELATIONSHIP_OPTIONS: RelOption[] = [
  { value: 'spouse', label: 'Spouse', icon: Heart, description: 'Legally married partner' },
  {
    value: 'domestic_partner',
    label: 'Domestic Partner',
    icon: Users,
    description: 'Registered domestic partner',
  },
  { value: 'child', label: 'Child', icon: Baby, description: 'Biological child' },
  { value: 'stepchild', label: 'Stepchild', icon: Baby, description: 'Child of your spouse' },
  {
    value: 'adopted_child',
    label: 'Adopted Child',
    icon: Baby,
    description: 'Legally adopted child',
  },
  {
    value: 'foster_child',
    label: 'Foster Child',
    icon: Baby,
    description: 'Child placed in foster care',
  },
  {
    value: 'legal_guardian',
    label: 'Legal Guardian',
    icon: UserCheck,
    description: 'Court-appointed guardianship',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const DependentForm: React.FC<DependentFormProps> = ({ dependent, onSave, onCancel }) => {
  const isEditing = !!dependent;

  const [formData, setFormData] = useState({
    firstName: dependent?.firstName || '',
    lastName: dependent?.lastName || '',
    middleName: dependent?.middleName || '',
    dateOfBirth: dependent?.dateOfBirth || '',
    gender: dependent?.gender || ('male' as DependentInfo['gender']),
    ssn: dependent?.ssn || '',
    relationship: dependent?.relationship || ('child' as DependentRelationship),
    phone: dependent?.phone || '',
    email: dependent?.email || '',
    isStudent: dependent?.isStudent || false,
    isDisabled: dependent?.isDisabled || false,
  });

  const [showSSN, setShowSSN] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const formatSSN = useCallback((raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';

    // SSN validation (optional but if provided must be valid)
    if (formData.ssn) {
      const digits = formData.ssn.replace(/\D/g, '');
      if (digits.length !== 9) newErrors.ssn = 'SSN must be 9 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleName: formData.middleName.trim() || undefined,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      ssn: formData.ssn || undefined,
      relationship: formData.relationship,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      isStudent: formData.isStudent,
      isDisabled: formData.isDisabled,
      status: dependent?.status || 'pending_verification',
      enrolledPlans: dependent?.enrolledPlans || [],
      eligibleForBenefits: true,
      verifiedDate: dependent?.verifiedDate,
    });
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cloud dark:border-nebula-purple/30">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-celestial-indigo" />
          {isEditing ? 'Edit Dependent' : 'Add New Dependent'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          <X className="w-4 h-4 text-silver-mist" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Relationship Type Selector */}
        <div>
          <label className="text-[10px] text-silver-mist font-semibold uppercase tracking-wider mb-2 block">
            Relationship Type
          </label>
          {errors.relationship && (
            <p className="text-[10px] text-coral-alert mb-1">{errors.relationship}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {RELATIONSHIP_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = formData.relationship === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateField('relationship', opt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    isActive
                      ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                      : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                  />
                  <span
                    className={`text-[10px] font-semibold ${isActive ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[9px] text-silver-mist leading-tight">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="First Name *"
            value={formData.firstName}
            onChange={(v) => updateField('firstName', v)}
            error={errors.firstName}
            placeholder="First name"
          />
          <FormInput
            label="Middle Name"
            value={formData.middleName}
            onChange={(v) => updateField('middleName', v)}
            placeholder="Middle"
          />
          <FormInput
            label="Last Name *"
            value={formData.lastName}
            onChange={(v) => updateField('lastName', v)}
            error={errors.lastName}
            placeholder="Last name"
          />
        </div>

        {/* DOB + Gender */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Date of Birth *"
            type="date"
            value={formData.dateOfBirth}
            onChange={(v) => updateField('dateOfBirth', v)}
            error={errors.dateOfBirth}
          />
          <div>
            <label className="text-[10px] text-silver-mist font-medium">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* SSN with masking */}
        <div>
          <label className="text-[10px] text-silver-mist font-medium flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Social Security Number (optional)
          </label>
          {errors.ssn && <p className="text-[10px] text-coral-alert mt-0.5">{errors.ssn}</p>}
          <div className="relative mt-0.5">
            <input
              type={showSSN ? 'text' : 'password'}
              value={formData.ssn}
              onChange={(e) => updateField('ssn', formatSSN(e.target.value))}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className={`w-full px-3 py-2 pr-10 rounded-lg border bg-white dark:bg-stellar-blue text-xs font-mono text-ink-black dark:text-pearl outline-none transition-colors ${
                errors.ssn
                  ? 'border-coral-alert'
                  : 'border-cloud dark:border-nebula-purple/30 focus:border-celestial-indigo'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowSSN(!showSSN)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showSSN ? (
                <EyeOff className="w-3.5 h-3.5 text-silver-mist" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-silver-mist" />
              )}
            </button>
          </div>
          <p className="text-[9px] text-silver-mist/70 mt-1 flex items-center gap-1">
            <Info className="w-2.5 h-2.5" />
            SSN is encrypted and only the last 4 digits are displayed after saving.
          </p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Phone (optional)"
            value={formData.phone}
            onChange={(v) => updateField('phone', v)}
            placeholder="(555) 123-4567"
          />
          <FormInput
            label="Email (optional)"
            type="email"
            value={formData.email}
            onChange={(v) => updateField('email', v)}
            placeholder="email@example.com"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-3">
          <ToggleChip
            icon={GraduationCap}
            label="Full-time Student"
            active={formData.isStudent}
            onChange={(v) => updateField('isStudent', v)}
          />
          <ToggleChip
            icon={Accessibility}
            label="Disability"
            active={formData.isDisabled}
            onChange={(v) => updateField('isDisabled', v)}
          />
        </div>

        {/* Age-based eligibility note for children */}
        {['child', 'stepchild', 'adopted_child', 'foster_child'].includes(
          formData.relationship
        ) && (
          <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-celestial-indigo mt-0.5 shrink-0" />
            <p className="text-[10px] text-silver-mist">
              Children are eligible for benefits until age 26 under the ACA. Full-time student
              status or disability may extend eligibility beyond age 26 under certain plans.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-cloud dark:border-nebula-purple/30 bg-pearl/20 dark:bg-deep-cosmos/10">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-medium text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
        >
          <Save className="w-3.5 h-3.5" />
          {isEditing ? 'Save Changes' : 'Add Dependent'}
        </button>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FormInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, error }) => (
  <div>
    <label className="text-[10px] text-silver-mist font-medium">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`mt-0.5 w-full px-3 py-2 rounded-lg border bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none transition-colors ${
        error
          ? 'border-coral-alert'
          : 'border-cloud dark:border-nebula-purple/30 focus:border-celestial-indigo'
      }`}
    />
    {error && <p className="text-[10px] text-coral-alert mt-0.5">{error}</p>}
  </div>
);

const ToggleChip: React.FC<{
  icon: LucideIcon;
  label: string;
  active: boolean;
  onChange: (value: boolean) => void;
}> = ({ icon: Icon, label, active, onChange }) => (
  <button
    onClick={() => onChange(!active)}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
      active
        ? 'border-celestial-indigo bg-celestial-indigo/5 text-celestial-indigo'
        : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

export default DependentForm;
