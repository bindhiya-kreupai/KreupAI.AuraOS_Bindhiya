/**
 * @module EmployeeProfileEditor
 * @description Enhanced ESS Employee Profile — all fields, skills, completeness, photo upload
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  GraduationCap,
  Award,
  Heart,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProfileData {
  // Personal
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  profilePhoto: string;

  // Contact
  personalEmail: string;
  mobilePhone: string;
  homePhone: string;

  // Address
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;

  // Employment (read-only)
  employeeId: string;
  jobTitle: string;
  department: string;
  location: string;
  manager: string;
  hireDate: string;
  workEmail: string;

  // Emergency
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  emergencyEmail: string;

  // Bank
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';

  // Skills & Certifications
  skills: SkillEntry[];
  certifications: CertEntry[];
}

interface SkillEntry {
  id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

interface CertEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_PROFILE: ProfileData = {
  firstName: 'John',
  middleName: '',
  lastName: 'Doe',
  preferredName: 'Johnny',
  dateOfBirth: '1992-03-15',
  gender: 'male',
  maritalStatus: 'married',
  nationality: 'American',
  profilePhoto: '',
  personalEmail: 'john.doe@personal.com',
  mobilePhone: '(555) 123-4567',
  homePhone: '',
  street: '1234 Oak Avenue, Apt 5B',
  city: 'Denver',
  state: 'CO',
  zip: '80202',
  country: 'United States',
  employeeId: 'EMP-2024-0042',
  jobTitle: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'Denver, CO',
  manager: 'Sarah Chen',
  hireDate: '2022-06-15',
  workEmail: 'john.doe@company.com',
  emergencyName: 'Jane Doe',
  emergencyRelation: 'Spouse',
  emergencyPhone: '(555) 234-5678',
  emergencyEmail: 'jane.doe@email.com',
  bankName: 'Chase Bank',
  accountNumber: '****4567',
  routingNumber: '****8901',
  accountType: 'checking',
  skills: [
    { id: 's1', name: 'TypeScript', proficiency: 'expert', yearsOfExperience: 5 },
    { id: 's2', name: 'React', proficiency: 'expert', yearsOfExperience: 6 },
    { id: 's3', name: 'Node.js', proficiency: 'advanced', yearsOfExperience: 4 },
    { id: 's4', name: 'AWS', proficiency: 'intermediate', yearsOfExperience: 3 },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'AWS Solutions Architect Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2024-03-10',
      expiryDate: '2027-03-10',
      credentialId: 'AWS-SAA-42195',
    },
  ],
};

// ── Profile Completeness Calculator ───────────────────────────────────────────

function calculateCompleteness(profile: ProfileData): { percentage: number; missing: string[] } {
  const checks: { field: string; label: string; filled: boolean }[] = [
    { field: 'firstName', label: 'First Name', filled: !!profile.firstName },
    { field: 'lastName', label: 'Last Name', filled: !!profile.lastName },
    { field: 'dateOfBirth', label: 'Date of Birth', filled: !!profile.dateOfBirth },
    { field: 'profilePhoto', label: 'Profile Photo', filled: !!profile.profilePhoto },
    { field: 'personalEmail', label: 'Personal Email', filled: !!profile.personalEmail },
    { field: 'mobilePhone', label: 'Mobile Phone', filled: !!profile.mobilePhone },
    { field: 'street', label: 'Address', filled: !!profile.street },
    { field: 'city', label: 'City', filled: !!profile.city },
    { field: 'state', label: 'State', filled: !!profile.state },
    { field: 'emergencyName', label: 'Emergency Contact', filled: !!profile.emergencyName },
    { field: 'emergencyPhone', label: 'Emergency Phone', filled: !!profile.emergencyPhone },
    { field: 'bankName', label: 'Bank Details', filled: !!profile.bankName },
    { field: 'skills', label: 'Skills', filled: profile.skills.length > 0 },
    { field: 'certifications', label: 'Certifications', filled: profile.certifications.length > 0 },
  ];

  const filled = checks.filter((c) => c.filled).length;
  const missing = checks.filter((c) => !c.filled).map((c) => c.label);
  return { percentage: Math.round((filled / checks.length) * 100), missing };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const EmployeeProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['personal', 'contact', 'employment'])
  );
  const [_saved, setSaved] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const completeness = useMemo(() => calculateCompleteness(profile), [profile]);

  const updateField = useCallback((field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    setEditingSection(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // Skills management
  const addSkill = useCallback(() => {
    const newSkill: SkillEntry = {
      id: `s-${Date.now()}`,
      name: '',
      proficiency: 'intermediate',
      yearsOfExperience: 1,
    };
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
  }, []);

  const updateSkill = useCallback((id: string, field: keyof SkillEntry, value: string | number) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
    setSaved(false);
  }, []);

  const removeSkill = useCallback((id: string) => {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
  }, []);

  // Certifications management
  const addCertification = useCallback(() => {
    const newCert: CertEntry = {
      id: `c-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
    };
    setProfile((prev) => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  }, []);

  const updateCert = useCallback((id: string, field: keyof CertEntry, value: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
    setSaved(false);
  }, []);

  const removeCert = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  }, []);

  // Photo upload handler
  const handlePhotoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfile((prev) => ({ ...prev, profilePhoto: e.target?.result as string }));
      setShowPhotoUpload(false);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="space-y-5">
      {/* Profile Completeness Bar */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-ink-black dark:text-pearl">Profile Completeness</h4>
          <span
            className={`text-sm font-bold ${
              completeness.percentage >= 80
                ? 'text-neural-mint'
                : completeness.percentage >= 50
                  ? 'text-sunset-amber'
                  : 'text-coral-alert'
            }`}
          >
            {completeness.percentage}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-pearl dark:bg-deep-cosmos overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completeness.percentage >= 80
                ? 'bg-neural-mint'
                : completeness.percentage >= 50
                  ? 'bg-sunset-amber'
                  : 'bg-coral-alert'
            }`}
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>
        {completeness.missing.length > 0 && (
          <p className="text-[10px] text-silver-mist mt-2">
            Missing: {completeness.missing.join(', ')}
          </p>
        )}
      </div>

      {/* Profile Photo + Name Card */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-5">
        <div className="flex items-center gap-5">
          {/* Photo */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-pearl dark:bg-deep-cosmos overflow-hidden flex items-center justify-center">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-silver-mist">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPhotoUpload(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-celestial-indigo text-white shadow-md hover:opacity-90 transition-opacity"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
              {profile.firstName} {profile.lastName}
              {profile.preferredName && (
                <span className="text-sm font-normal text-silver-mist ml-1.5">
                  ({profile.preferredName})
                </span>
              )}
            </h2>
            <p className="text-xs text-silver-mist">
              {profile.jobTitle} · {profile.department}
            </p>
            <p className="text-[10px] text-silver-mist/70 mt-0.5">
              {profile.employeeId} · {profile.location}
            </p>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUploadModal
          currentPhoto={profile.profilePhoto}
          onUpload={handlePhotoUpload}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}

      {/* Sections */}
      <ProfileSection
        title="Personal Information"
        icon={User}
        color="text-celestial-indigo"
        expanded={expandedSections.has('personal')}
        onToggle={() => toggleSection('personal')}
        editing={editingSection === 'personal'}
        onEdit={() => setEditingSection('personal')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'personal' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <EditField
              label="First Name"
              value={profile.firstName}
              onChange={(v) => updateField('firstName', v)}
            />
            <EditField
              label="Middle Name"
              value={profile.middleName}
              onChange={(v) => updateField('middleName', v)}
            />
            <EditField
              label="Last Name"
              value={profile.lastName}
              onChange={(v) => updateField('lastName', v)}
            />
            <EditField
              label="Preferred Name"
              value={profile.preferredName}
              onChange={(v) => updateField('preferredName', v)}
            />
            <EditField
              label="Date of Birth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(v) => updateField('dateOfBirth', v)}
            />
            <SelectField
              label="Gender"
              value={profile.gender}
              onChange={(v) => updateField('gender', v)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'non_binary', label: 'Non-Binary' },
                { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
              ]}
            />
            <SelectField
              label="Marital Status"
              value={profile.maritalStatus}
              onChange={(v) => updateField('maritalStatus', v)}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ]}
            />
            <EditField
              label="Nationality"
              value={profile.nationality}
              onChange={(v) => updateField('nationality', v)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DisplayField
              label="Full Name"
              value={`${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}`}
            />
            <DisplayField label="Preferred Name" value={profile.preferredName || '—'} />
            <DisplayField
              label="Date of Birth"
              value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}
            />
            <DisplayField label="Gender" value={profile.gender.replace(/_/g, ' ')} />
            <DisplayField label="Marital Status" value={profile.maritalStatus} />
            <DisplayField label="Nationality" value={profile.nationality || '—'} />
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Contact Information"
        icon={Mail}
        color="text-neural-mint"
        expanded={expandedSections.has('contact')}
        onToggle={() => toggleSection('contact')}
        editing={editingSection === 'contact'}
        onEdit={() => setEditingSection('contact')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'contact' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <EditField
              label="Personal Email"
              type="email"
              value={profile.personalEmail}
              onChange={(v) => updateField('personalEmail', v)}
            />
            <EditField
              label="Mobile Phone"
              value={profile.mobilePhone}
              onChange={(v) => updateField('mobilePhone', v)}
            />
            <EditField
              label="Home Phone"
              value={profile.homePhone}
              onChange={(v) => updateField('homePhone', v)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DisplayField label="Personal Email" value={profile.personalEmail || '—'} />
            <DisplayField label="Mobile Phone" value={profile.mobilePhone || '—'} />
            <DisplayField label="Home Phone" value={profile.homePhone || '—'} />
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Address"
        icon={MapPin}
        color="text-sunset-amber"
        expanded={expandedSections.has('address')}
        onToggle={() => toggleSection('address')}
        editing={editingSection === 'address'}
        onEdit={() => setEditingSection('address')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'address' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-3">
              <EditField
                label="Street Address"
                value={profile.street}
                onChange={(v) => updateField('street', v)}
              />
            </div>
            <EditField label="City" value={profile.city} onChange={(v) => updateField('city', v)} />
            <EditField
              label="State"
              value={profile.state}
              onChange={(v) => updateField('state', v)}
            />
            <EditField
              label="ZIP Code"
              value={profile.zip}
              onChange={(v) => updateField('zip', v)}
            />
            <EditField
              label="Country"
              value={profile.country}
              onChange={(v) => updateField('country', v)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <DisplayField label="Street" value={profile.street || '—'} />
            <DisplayField
              label="City / State"
              value={profile.city ? `${profile.city}, ${profile.state} ${profile.zip}` : '—'}
            />
            <DisplayField label="Country" value={profile.country || '—'} />
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Employment Details"
        icon={Briefcase}
        color="text-nebula-purple"
        expanded={expandedSections.has('employment')}
        onToggle={() => toggleSection('employment')}
        readonly
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DisplayField label="Employee ID" value={profile.employeeId} />
          <DisplayField label="Job Title" value={profile.jobTitle} />
          <DisplayField label="Department" value={profile.department} />
          <DisplayField label="Location" value={profile.location} />
          <DisplayField label="Manager" value={profile.manager} />
          <DisplayField label="Hire Date" value={new Date(profile.hireDate).toLocaleDateString()} />
          <DisplayField label="Work Email" value={profile.workEmail} />
        </div>
      </ProfileSection>

      <ProfileSection
        title="Emergency Contact"
        icon={Heart}
        color="text-quantum-rose"
        expanded={expandedSections.has('emergency')}
        onToggle={() => toggleSection('emergency')}
        editing={editingSection === 'emergency'}
        onEdit={() => setEditingSection('emergency')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'emergency' ? (
          <div className="grid grid-cols-2 gap-3">
            <EditField
              label="Contact Name"
              value={profile.emergencyName}
              onChange={(v) => updateField('emergencyName', v)}
            />
            <EditField
              label="Relationship"
              value={profile.emergencyRelation}
              onChange={(v) => updateField('emergencyRelation', v)}
            />
            <EditField
              label="Phone"
              value={profile.emergencyPhone}
              onChange={(v) => updateField('emergencyPhone', v)}
            />
            <EditField
              label="Email"
              type="email"
              value={profile.emergencyEmail}
              onChange={(v) => updateField('emergencyEmail', v)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <DisplayField label="Contact Name" value={profile.emergencyName || '—'} />
            <DisplayField label="Relationship" value={profile.emergencyRelation || '—'} />
            <DisplayField label="Phone" value={profile.emergencyPhone || '—'} />
            <DisplayField label="Email" value={profile.emergencyEmail || '—'} />
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Bank Details"
        icon={CreditCard}
        color="text-twilight"
        expanded={expandedSections.has('bank')}
        onToggle={() => toggleSection('bank')}
        editing={editingSection === 'bank'}
        onEdit={() => setEditingSection('bank')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'bank' ? (
          <div className="grid grid-cols-2 gap-3">
            <EditField
              label="Bank Name"
              value={profile.bankName}
              onChange={(v) => updateField('bankName', v)}
            />
            <SelectField
              label="Account Type"
              value={profile.accountType}
              onChange={(v) => updateField('accountType', v)}
              options={[
                { value: 'checking', label: 'Checking' },
                { value: 'savings', label: 'Savings' },
              ]}
            />
            <EditField
              label="Account Number"
              value={profile.accountNumber}
              onChange={(v) => updateField('accountNumber', v)}
            />
            <EditField
              label="Routing Number"
              value={profile.routingNumber}
              onChange={(v) => updateField('routingNumber', v)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <DisplayField label="Bank Name" value={profile.bankName || '—'} />
            <DisplayField label="Account Type" value={profile.accountType} />
            <DisplayField label="Account Number" value={profile.accountNumber || '—'} />
            <DisplayField label="Routing Number" value={profile.routingNumber || '—'} />
          </div>
        )}
      </ProfileSection>

      {/* Skills & Certifications */}
      <ProfileSection
        title="Skills"
        icon={GraduationCap}
        color="text-celestial-indigo"
        expanded={expandedSections.has('skills')}
        onToggle={() => toggleSection('skills')}
        editing={editingSection === 'skills'}
        onEdit={() => setEditingSection('skills')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        <div className="space-y-2">
          {profile.skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20"
            >
              {editingSection === 'skills' ? (
                <>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                    placeholder="Skill name"
                    className="flex-1 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  />
                  <select
                    value={skill.proficiency}
                    onChange={(e) => updateSkill(skill.id, 'proficiency', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <input
                    type="number"
                    value={skill.yearsOfExperience}
                    onChange={(e) =>
                      updateSkill(skill.id, 'yearsOfExperience', parseInt(e.target.value) || 0)
                    }
                    className="w-14 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none text-center"
                    min={0}
                  />
                  <span className="text-[9px] text-silver-mist">yrs</span>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 rounded hover:bg-coral-alert/10 text-silver-mist hover:text-coral-alert transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-ink-black dark:text-pearl flex-1">
                    {skill.name}
                  </span>
                  <ProficiencyBadge level={skill.proficiency} />
                  <span className="text-[10px] text-silver-mist">
                    {skill.yearsOfExperience} yr{skill.yearsOfExperience !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          ))}
          {editingSection === 'skills' && (
            <button
              onClick={addSkill}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-semibold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Skill
            </button>
          )}
        </div>
      </ProfileSection>

      <ProfileSection
        title="Certifications"
        icon={Award}
        color="text-sunset-amber"
        expanded={expandedSections.has('certifications')}
        onToggle={() => toggleSection('certifications')}
        editing={editingSection === 'certifications'}
        onEdit={() => setEditingSection('certifications')}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      >
        <div className="space-y-2">
          {profile.certifications.map((cert) => (
            <div key={cert.id} className="p-3 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20">
              {editingSection === 'certifications' ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCert(cert.id, 'name', e.target.value)}
                    placeholder="Certification name"
                    className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)}
                    placeholder="Issuer"
                    className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  />
                  <input
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => updateCert(cert.id, 'issueDate', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  />
                  <input
                    type="date"
                    value={cert.expiryDate}
                    onChange={(e) => updateCert(cert.id, 'expiryDate', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  />
                  <input
                    type="text"
                    value={cert.credentialId}
                    onChange={(e) => updateCert(cert.id, 'credentialId', e.target.value)}
                    placeholder="Credential ID"
                    className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
                  />
                  <button
                    onClick={() => removeCert(cert.id)}
                    className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] text-coral-alert hover:bg-coral-alert/5 transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                      {cert.name}
                    </p>
                    <p className="text-[10px] text-silver-mist">
                      {cert.issuer} · ID: {cert.credentialId}
                    </p>
                    <p className="text-[10px] text-silver-mist">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()} · Expires:{' '}
                      {new Date(cert.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  {new Date(cert.expiryDate) < new Date() ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-coral-alert bg-coral-alert/10">
                      Expired
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-neural-mint bg-neural-mint/10">
                      Active
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          {editingSection === 'certifications' && (
            <button
              onClick={addCertification}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-semibold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Certification
            </button>
          )}
        </div>
      </ProfileSection>
    </div>
  );
};

// ── Profile Section ───────────────────────────────────────────────────────────

const ProfileSection: React.FC<{
  title: string;
  icon: LucideIcon;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  editing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  readonly?: boolean;
  children: React.ReactNode;
}> = ({
  title,
  icon: Icon,
  color,
  expanded,
  onToggle,
  editing,
  onEdit,
  onSave,
  onCancel,
  readonly,
  children,
}) => (
  <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-bold text-ink-black dark:text-pearl">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {!readonly && !editing && expanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
          >
            <Edit3 className="w-3 h-3 inline mr-1" />
            Edit
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onCancel}
              className="px-2 py-1 rounded-lg text-[10px] text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
            >
              <Save className="w-3 h-3 inline mr-1" /> Save
            </button>
          </div>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-silver-mist" />
        ) : (
          <ChevronDown className="w-4 h-4 text-silver-mist" />
        )}
      </div>
    </button>
    {expanded && <div className="px-4 pb-4">{children}</div>}
  </div>
);

// ── Sub-components ────────────────────────────────────────────────────────────

const DisplayField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="px-2.5 py-2 bg-pearl/50 dark:bg-deep-cosmos/20 rounded-lg">
    <p className="text-[9px] text-silver-mist uppercase">{label}</p>
    <p className="text-xs font-medium text-ink-black dark:text-pearl capitalize">{value}</p>
  </div>
);

const EditField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="text-[10px] text-silver-mist font-medium">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[10px] text-silver-mist font-medium">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const ProficiencyBadge: React.FC<{ level: SkillEntry['proficiency'] }> = ({ level }) => {
  const config: Record<string, string> = {
    beginner: 'text-silver-mist bg-silver-mist/10',
    intermediate: 'text-sunset-amber bg-sunset-amber/10',
    advanced: 'text-celestial-indigo bg-celestial-indigo/10',
    expert: 'text-neural-mint bg-neural-mint/10',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize ${config[level] || ''}`}
    >
      {level}
    </span>
  );
};

// ── Photo Upload Modal ────────────────────────────────────────────────────────

const PhotoUploadModal: React.FC<{
  currentPhoto: string;
  onUpload: (file: File) => void;
  onClose: () => void;
}> = ({ currentPhoto, onUpload, onClose }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentPhoto);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/40 dark:bg-deep-cosmos/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-5 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Camera className="w-4 h-4 text-celestial-indigo" />
            Profile Photo
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos"
          >
            <X className="w-4 h-4 text-silver-mist" />
          </button>
        </div>

        {/* Preview */}
        <div className="w-48 h-48 mx-auto rounded-2xl bg-pearl dark:bg-deep-cosmos overflow-hidden mb-4 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <Camera className="w-12 h-12 text-silver-mist/30" />
          )}
        </div>

        {/* Zoom controls */}
        {preview && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1.5 rounded-lg bg-pearl dark:bg-deep-cosmos"
            >
              <ZoomOut className="w-4 h-4 text-silver-mist" />
            </button>
            <span className="text-[10px] text-silver-mist w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-1.5 rounded-lg bg-pearl dark:bg-deep-cosmos"
            >
              <ZoomIn className="w-4 h-4 text-silver-mist" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg bg-pearl dark:bg-deep-cosmos"
            >
              <RotateCw className="w-4 h-4 text-silver-mist" />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-pearl dark:bg-deep-cosmos text-twilight dark:text-silver-mist hover:opacity-80 transition-opacity"
          >
            Choose Photo
          </button>
          {selectedFile && (
            <button
              onClick={() => onUpload(selectedFile)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
            >
              Upload & Save
            </button>
          )}
        </div>
        <p className="text-[9px] text-silver-mist text-center mt-2">
          JPG, PNG, or GIF. Max 5MB. Square photos work best.
        </p>
      </div>
    </div>
  );
};

export default EmployeeProfileEditor;
