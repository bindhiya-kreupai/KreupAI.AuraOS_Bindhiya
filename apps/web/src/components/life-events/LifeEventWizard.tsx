/**
 * @module LifeEventWizard
 * @description Multi-step life event form wizard with event-specific flows
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldOff,
  Heart,
  Baby,
  UserMinus,
  FileCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { LifeEventTypeConfig, LifeEventType } from './LifeEventManager';
import { LifeEventDocUpload, type UploadedDocument } from './LifeEventDocUpload';

// ── Types ──────────────────────────────────────────────────────────────────────

type WizardStep = 'details' | 'benefit_changes' | 'documents' | 'review';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'details', label: 'Event Details' },
  { key: 'benefit_changes', label: 'Benefit Changes' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review & Submit' },
];

// Event-specific form field types
interface MarriageDivorceData {
  subType: 'marriage' | 'divorce';
  eventDate: string;
  spouseFirstName: string;
  spouseLastName: string;
  spouseDob: string;
  spouseSsn: string;
  spouseGender: 'male' | 'female' | 'other';
  addSpouseToBenefits: boolean;
}

interface BirthAdoptionData {
  subType: 'birth' | 'adoption';
  eventDate: string;
  childFirstName: string;
  childLastName: string;
  childDob: string;
  childGender: 'male' | 'female' | 'other';
  addChildToBenefits: boolean;
  adoptionAgency?: string;
}

interface DeathOfDependentData {
  eventDate: string;
  deceasedName: string;
  relationship: 'spouse' | 'child' | 'domestic_partner';
  removefromBenefits: boolean;
  updateBeneficiary: boolean;
}

interface AddressChangeData {
  eventDate: string;
  newStreet: string;
  newCity: string;
  newState: string;
  newZip: string;
  newCountry: string;
  previousState: string;
  movingOutOfServiceArea: boolean;
}

interface LossOfCoverageData {
  eventDate: string;
  previousInsurer: string;
  coverageEndDate: string;
  reason: 'spouse_job_loss' | 'divorce' | 'aging_out' | 'plan_termination' | 'other';
  affectedMembers: string[];
  enrollInEmployerPlan: boolean;
}

type _EventFormData =
  | MarriageDivorceData
  | BirthAdoptionData
  | DeathOfDependentData
  | AddressChangeData
  | LossOfCoverageData;

// Benefit change selections
interface BenefitChange {
  category: string;
  action:
    | 'add_dependent'
    | 'remove_dependent'
    | 'change_coverage'
    | 'enroll'
    | 'update_beneficiary'
    | 'no_change';
  details: string;
}

interface LifeEventWizardProps {
  eventConfig: LifeEventTypeConfig;
  onClose: () => void;
  onSubmitted: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const LifeEventWizard: React.FC<LifeEventWizardProps> = ({
  eventConfig,
  onClose,
  onSubmitted,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  // Form data — initialize based on event type
  const [formData, setFormData] = useState<Record<string, string | boolean | string[]>>(() =>
    getDefaultFormData(eventConfig.type)
  );

  // Benefit changes
  const [benefitChanges, setBenefitChanges] = useState<BenefitChange[]>(() =>
    getDefaultBenefitChanges(eventConfig.type)
  );

  // Documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const updateField = useCallback((field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const goNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].key);
  }, [currentStep]);

  const goBack = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].key);
  }, [currentStep]);

  const handleUpload = useCallback((files: File[]) => {
    const newDocs: UploadedDocument[] = files.map((f) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      status: 'uploading' as const,
      progress: 0,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);

    // Simulate upload progress
    newDocs.forEach((doc) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20 + Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setDocuments((prev) =>
            prev.map((d) => (d.id === doc.id ? { ...d, status: 'complete', progress: 100 } : d))
          );
        } else {
          setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, progress } : d)));
        }
      }, 400);
    });
  }, []);

  const handleRemoveDoc = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleBenefitChange = useCallback((index: number, action: BenefitChange['action']) => {
    setBenefitChanges((prev) => prev.map((bc, i) => (i === index ? { ...bc, action } : bc)));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConfirmationId(`LE-${Date.now()}`);
    setSubmitted(true);
    setSubmitting(false);
  }, []);

  const Icon = eventConfig.icon;

  // ── Success State ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="space-y-5">
        <button
          onClick={onSubmitted}
          className="flex items-center gap-1.5 text-xs text-silver-mist hover:text-twilight dark:hover:text-pearl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Life Events
        </button>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-neural-mint/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-neural-mint" />
          </div>
          <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">
            Life Event Reported
          </h3>
          <p className="text-sm text-silver-mist mb-2">
            Your {eventConfig.label.toLowerCase()} event has been submitted for review.
          </p>
          <p className="text-xs text-silver-mist/70 mb-6">
            Reference:{' '}
            <span className="font-mono font-semibold text-celestial-indigo">{confirmationId}</span>
          </p>

          <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-4 max-w-md">
            <div className="flex items-start gap-2">
              <FileCheck className="w-4 h-4 text-celestial-indigo mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-ink-black dark:text-pearl">Next Steps</p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-silver-mist">
                  <li>HR will review your submission within 2-3 business days.</li>
                  <li>You will receive an email notification once verified.</li>
                  <li>Benefit changes will take effect after verification.</li>
                  <li>
                    Your special enrollment window of {eventConfig.enrollmentWindow} starts now.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-xs text-silver-mist hover:text-twilight dark:hover:text-pearl transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Life Events
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${eventConfig.bgColor}`}>
          <Icon className={`w-5 h-5 ${eventConfig.color}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl">{eventConfig.label}</h2>
          <p className="text-xs text-silver-mist">{eventConfig.description}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-3">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-full ${
                  i <= stepIndex ? 'bg-celestial-indigo' : 'bg-cloud dark:bg-nebula-purple/30'
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shrink-0 ${
                currentStep === step.key
                  ? 'bg-celestial-indigo text-white'
                  : i < stepIndex
                    ? 'text-celestial-indigo'
                    : 'text-silver-mist'
              }`}
            >
              {i < stepIndex ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}.</span>}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-5 min-h-[350px]">
        {currentStep === 'details' && (
          <EventDetailsStep
            eventType={eventConfig.type}
            formData={formData}
            updateField={updateField}
          />
        )}
        {currentStep === 'benefit_changes' && (
          <BenefitChangesStep
            eventConfig={eventConfig}
            formData={formData}
            benefitChanges={benefitChanges}
            onToggle={toggleBenefitChange}
          />
        )}
        {currentStep === 'documents' && (
          <LifeEventDocUpload
            requiredDocs={eventConfig.requiredDocs}
            documents={documents}
            onUpload={handleUpload}
            onRemove={handleRemoveDoc}
          />
        )}
        {currentStep === 'review' && (
          <ReviewStep
            eventConfig={eventConfig}
            formData={formData}
            benefitChanges={benefitChanges}
            documents={documents}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'review' && (
        <div className="flex items-center justify-between">
          <button
            onClick={stepIndex > 0 ? goBack : onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {stepIndex > 0 ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 transition-all"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Step 1: Event Details ─────────────────────────────────────────────────────

const EventDetailsStep: React.FC<{
  eventType: LifeEventType;
  formData: Record<string, string | boolean | string[]>;
  updateField: (field: string, value: string | boolean | string[]) => void;
}> = ({ eventType, formData, updateField }) => {
  switch (eventType) {
    case 'marriage_divorce':
      return <MarriageDivorceForm formData={formData} updateField={updateField} />;
    case 'birth_adoption':
      return <BirthAdoptionForm formData={formData} updateField={updateField} />;
    case 'death_of_dependent':
      return <DeathOfDependentForm formData={formData} updateField={updateField} />;
    case 'address_change':
      return <AddressChangeForm formData={formData} updateField={updateField} />;
    case 'loss_of_coverage':
      return <LossOfCoverageForm formData={formData} updateField={updateField} />;
    default:
      return null;
  }
};

// ── Marriage / Divorce Form ───────────────────────────────────────────────────

const MarriageDivorceForm: React.FC<{
  formData: Record<string, string | boolean | string[]>;
  updateField: (field: string, value: string | boolean | string[]) => void;
}> = ({ formData, updateField }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
      <Heart className="w-4 h-4 text-quantum-rose" />
      Marriage / Divorce Details
    </h4>

    {/* Sub-type selector */}
    <div className="flex gap-3">
      {(['marriage', 'divorce'] as const).map((sub) => (
        <button
          key={sub}
          onClick={() => updateField('subType', sub)}
          className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
            formData.subType === sub
              ? 'border-celestial-indigo bg-celestial-indigo/5 text-celestial-indigo'
              : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
          }`}
        >
          {sub === 'marriage' ? 'Marriage' : 'Divorce'}
        </button>
      ))}
    </div>

    <FormField
      label="Event Date"
      type="date"
      value={formData.eventDate as string}
      onChange={(v) => updateField('eventDate', v)}
    />

    <div className="grid grid-cols-2 gap-3">
      <FormField
        label="Spouse First Name"
        value={formData.spouseFirstName as string}
        onChange={(v) => updateField('spouseFirstName', v)}
        placeholder="First name"
      />
      <FormField
        label="Spouse Last Name"
        value={formData.spouseLastName as string}
        onChange={(v) => updateField('spouseLastName', v)}
        placeholder="Last name"
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <FormField
        label="Spouse Date of Birth"
        type="date"
        value={formData.spouseDob as string}
        onChange={(v) => updateField('spouseDob', v)}
      />
      <div>
        <label className="text-[10px] text-silver-mist font-medium">Gender</label>
        <select
          value={(formData.spouseGender as string) || 'female'}
          onChange={(e) => updateField('spouseGender', e.target.value)}
          className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    <FormField
      label="Spouse SSN (optional)"
      value={formData.spouseSsn as string}
      onChange={(v) => updateField('spouseSsn', v)}
      placeholder="XXX-XX-XXXX"
    />

    <CheckboxField
      label={
        formData.subType === 'divorce'
          ? 'Remove spouse from my benefits'
          : 'Add spouse to my benefits'
      }
      checked={formData.addSpouseToBenefits as boolean}
      onChange={(v) => updateField('addSpouseToBenefits', v)}
    />
  </div>
);

// ── Birth / Adoption Form ─────────────────────────────────────────────────────

const BirthAdoptionForm: React.FC<{
  formData: Record<string, string | boolean | string[]>;
  updateField: (field: string, value: string | boolean | string[]) => void;
}> = ({ formData, updateField }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
      <Baby className="w-4 h-4 text-neural-mint" />
      Birth / Adoption Details
    </h4>

    <div className="flex gap-3">
      {(['birth', 'adoption'] as const).map((sub) => (
        <button
          key={sub}
          onClick={() => updateField('subType', sub)}
          className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
            formData.subType === sub
              ? 'border-celestial-indigo bg-celestial-indigo/5 text-celestial-indigo'
              : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
          }`}
        >
          {sub === 'birth' ? 'Birth' : 'Adoption'}
        </button>
      ))}
    </div>

    <FormField
      label={formData.subType === 'adoption' ? 'Adoption Date' : 'Date of Birth'}
      type="date"
      value={formData.eventDate as string}
      onChange={(v) => updateField('eventDate', v)}
    />

    <div className="grid grid-cols-2 gap-3">
      <FormField
        label="Child First Name"
        value={formData.childFirstName as string}
        onChange={(v) => updateField('childFirstName', v)}
        placeholder="First name"
      />
      <FormField
        label="Child Last Name"
        value={formData.childLastName as string}
        onChange={(v) => updateField('childLastName', v)}
        placeholder="Last name"
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <FormField
        label="Child Date of Birth"
        type="date"
        value={formData.childDob as string}
        onChange={(v) => updateField('childDob', v)}
      />
      <div>
        <label className="text-[10px] text-silver-mist font-medium">Gender</label>
        <select
          value={(formData.childGender as string) || 'male'}
          onChange={(e) => updateField('childGender', e.target.value)}
          className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    {formData.subType === 'adoption' && (
      <FormField
        label="Adoption Agency (optional)"
        value={formData.adoptionAgency as string}
        onChange={(v) => updateField('adoptionAgency', v)}
        placeholder="Agency name"
      />
    )}

    <CheckboxField
      label="Add child to my health, dental, and vision benefits"
      checked={formData.addChildToBenefits as boolean}
      onChange={(v) => updateField('addChildToBenefits', v)}
    />
  </div>
);

// ── Death of Dependent Form ───────────────────────────────────────────────────

const DeathOfDependentForm: React.FC<{
  formData: Record<string, string | boolean | string[]>;
  updateField: (field: string, value: string | boolean | string[]) => void;
}> = ({ formData, updateField }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
      <UserMinus className="w-4 h-4 text-silver-mist" />
      Death of Dependent
    </h4>

    <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3 flex items-start gap-2">
      <Info className="w-3.5 h-3.5 text-sunset-amber mt-0.5 shrink-0" />
      <p className="text-[10px] text-silver-mist">
        We understand this is a difficult time. This information is needed to update your benefits
        and records. Please take your time.
      </p>
    </div>

    <FormField
      label="Date of Passing"
      type="date"
      value={formData.eventDate as string}
      onChange={(v) => updateField('eventDate', v)}
    />
    <FormField
      label="Name of Deceased"
      value={formData.deceasedName as string}
      onChange={(v) => updateField('deceasedName', v)}
      placeholder="Full name"
    />

    <div>
      <label className="text-[10px] text-silver-mist font-medium">Relationship</label>
      <select
        value={(formData.relationship as string) || 'spouse'}
        onChange={(e) => updateField('relationship', e.target.value)}
        className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
      >
        <option value="spouse">Spouse</option>
        <option value="child">Child</option>
        <option value="domestic_partner">Domestic Partner</option>
      </select>
    </div>

    <CheckboxField
      label="Remove deceased from my benefit plans"
      checked={formData.removefromBenefits as boolean}
      onChange={(v) => updateField('removefromBenefits', v)}
    />
    <CheckboxField
      label="I need to update my life insurance beneficiary"
      checked={formData.updateBeneficiary as boolean}
      onChange={(v) => updateField('updateBeneficiary', v)}
    />
  </div>
);

// ── Address Change Form ───────────────────────────────────────────────────────

const AddressChangeForm: React.FC<{
  formData: Record<string, string | boolean | string[]>;
  updateField: (field: string, value: string | boolean | string[]) => void;
}> = ({ formData, updateField }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
      <MapPin className="w-4 h-4 text-celestial-indigo" />
      Address Change
    </h4>

    <FormField
      label="Effective Date"
      type="date"
      value={formData.eventDate as string}
      onChange={(v) => updateField('eventDate', v)}
    />

    <FormField
      label="Street Address"
      value={formData.newStreet as string}
      onChange={(v) => updateField('newStreet', v)}
      placeholder="123 Main St, Apt 4B"
    />

    <div className="grid grid-cols-3 gap-3">
      <FormField
        label="City"
        value={formData.newCity as string}
        onChange={(v) => updateField('newCity', v)}
        placeholder="City"
      />
      <FormField
        label="State"
        value={formData.newState as string}
        onChange={(v) => updateField('newState', v)}
        placeholder="CA"
      />
      <FormField
        label="ZIP Code"
        value={formData.newZip as string}
        onChange={(v) => updateField('newZip', v)}
        placeholder="90210"
      />
    </div>

    <FormField
      label="Country"
      value={formData.newCountry as string}
      onChange={(v) => updateField('newCountry', v)}
      placeholder="United States"
    />

    <FormField
      label="Previous State (for tax purposes)"
      value={formData.previousState as string}
      onChange={(v) => updateField('previousState', v)}
      placeholder="TX"
    />

    <CheckboxField
      label="I am moving out of my current health plan service area"
      checked={formData.movingOutOfServiceArea as boolean}
      onChange={(v) => updateField('movingOutOfServiceArea', v)}
    />

    {formData.movingOutOfServiceArea && (
      <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-sunset-amber mt-0.5 shrink-0" />
        <p className="text-[10px] text-silver-mist">
          Moving out of your service area qualifies you for a 60-day special enrollment period. You
          may need to switch to a plan available in your new area.
        </p>
      </div>
    )}
  </div>
);

// ── Loss of Coverage Form ─────────────────────────────────────────────────────

const LossOfCoverageForm: React.FC<{
  formData: Record<string, string | boolean | string[]>;
  updateField: (field: string, value: string | boolean | string[]) => void;
}> = ({ formData, updateField }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
      <ShieldOff className="w-4 h-4 text-sunset-amber" />
      Loss of Coverage
    </h4>

    <FormField
      label="Coverage End Date"
      type="date"
      value={formData.coverageEndDate as string}
      onChange={(v) => updateField('coverageEndDate', v)}
    />
    <FormField
      label="Date You Became Aware"
      type="date"
      value={formData.eventDate as string}
      onChange={(v) => updateField('eventDate', v)}
    />
    <FormField
      label="Previous Insurance Provider"
      value={formData.previousInsurer as string}
      onChange={(v) => updateField('previousInsurer', v)}
      placeholder="Insurer name"
    />

    <div>
      <label className="text-[10px] text-silver-mist font-medium">
        Reason for Loss of Coverage
      </label>
      <select
        value={(formData.reason as string) || 'spouse_job_loss'}
        onChange={(e) => updateField('reason', e.target.value)}
        className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
      >
        <option value="spouse_job_loss">Spouse&apos;s job loss / layoff</option>
        <option value="divorce">Divorce / legal separation</option>
        <option value="aging_out">Dependent aging out of plan</option>
        <option value="plan_termination">Plan termination by insurer</option>
        <option value="other">Other</option>
      </select>
    </div>

    <CheckboxField
      label="I want to enroll in my employer's health plan"
      checked={formData.enrollInEmployerPlan as boolean}
      onChange={(v) => updateField('enrollInEmployerPlan', v)}
    />
  </div>
);

// ── Step 2: Benefit Changes ───────────────────────────────────────────────────

const BenefitChangesStep: React.FC<{
  eventConfig: LifeEventTypeConfig;
  formData: Record<string, string | boolean | string[]>;
  benefitChanges: BenefitChange[];
  onToggle: (index: number, action: BenefitChange['action']) => void;
}> = ({ eventConfig, benefitChanges, onToggle }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl">Requested Benefit Changes</h4>
    <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-3 flex items-start gap-2">
      <Info className="w-3.5 h-3.5 text-celestial-indigo mt-0.5 shrink-0" />
      <p className="text-[10px] text-silver-mist">{eventConfig.benefitImpact}</p>
    </div>

    <div className="space-y-3">
      {benefitChanges.map((bc, i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10"
        >
          <p className="text-xs font-semibold text-ink-black dark:text-pearl mb-2">{bc.category}</p>
          <div className="flex flex-wrap gap-2">
            {getAvailableActions(bc.category).map((act) => (
              <button
                key={act.value}
                onClick={() => onToggle(i, act.value)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                  bc.action === act.value
                    ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                    : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>
          {bc.action !== 'no_change' && (
            <p className="text-[10px] text-silver-mist mt-2 italic">{bc.details}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ── Step 4: Review ────────────────────────────────────────────────────────────

const ReviewStep: React.FC<{
  eventConfig: LifeEventTypeConfig;
  formData: Record<string, string | boolean | string[]>;
  benefitChanges: BenefitChange[];
  documents: UploadedDocument[];
  submitting: boolean;
  onSubmit: () => void;
}> = ({ eventConfig, formData, benefitChanges, documents, submitting, onSubmit }) => {
  const completeDocs = documents.filter((d) => d.status === 'complete');
  const activeChanges = benefitChanges.filter((bc) => bc.action !== 'no_change');
  const Icon = eventConfig.icon;

  return (
    <div className="space-y-4">
      <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-sunset-amber mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">Please Review</p>
          <p className="text-[10px] text-silver-mist mt-0.5">
            Verify all information before submitting. HR will review and verify your documentation.
          </p>
        </div>
      </div>

      {/* Event Summary */}
      <div className="p-3 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20 space-y-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${eventConfig.color}`} />
          <p className="text-xs font-bold text-ink-black dark:text-pearl">{eventConfig.label}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {formData.eventDate && (
            <ReviewItem
              label="Event Date"
              value={new Date(formData.eventDate as string).toLocaleDateString()}
            />
          )}
          {formData.subType && <ReviewItem label="Type" value={String(formData.subType)} />}
          {formData.spouseFirstName && (
            <ReviewItem
              label="Spouse"
              value={`${formData.spouseFirstName} ${formData.spouseLastName}`}
            />
          )}
          {formData.childFirstName && (
            <ReviewItem
              label="Child"
              value={`${formData.childFirstName} ${formData.childLastName}`}
            />
          )}
          {formData.deceasedName && (
            <ReviewItem label="Deceased" value={formData.deceasedName as string} />
          )}
          {formData.newCity && (
            <ReviewItem
              label="New Address"
              value={`${formData.newCity}, ${formData.newState} ${formData.newZip}`}
            />
          )}
          {formData.previousInsurer && (
            <ReviewItem label="Previous Insurer" value={formData.previousInsurer as string} />
          )}
        </div>
      </div>

      {/* Benefit Changes */}
      {activeChanges.length > 0 && (
        <div className="p-3 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20">
          <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-2">
            Benefit Changes
          </p>
          {activeChanges.map((bc, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-xs text-ink-black dark:text-pearl">{bc.category}</span>
              <span className="text-[10px] text-celestial-indigo font-medium capitalize">
                {bc.action.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Documents */}
      <div className="p-3 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/20">
        <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-2">
          Documents ({completeDocs.length})
        </p>
        {completeDocs.length === 0 ? (
          <p className="text-[10px] text-sunset-amber">
            No documents uploaded — you may be asked to provide these later.
          </p>
        ) : (
          completeDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 py-1">
              <CheckCircle2 className="w-3 h-3 text-neural-mint shrink-0" />
              <span className="text-xs text-ink-black dark:text-pearl">{doc.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submit Life Event
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Shared Form Components ────────────────────────────────────────────────────

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
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

const CheckboxField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer">
    <div
      onClick={() => onChange(!checked)}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
        checked
          ? 'border-celestial-indigo bg-celestial-indigo'
          : 'border-cloud dark:border-nebula-purple/30'
      }`}
    >
      {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
    </div>
    <span className="text-xs text-ink-black dark:text-pearl">{label}</span>
  </label>
);

const ReviewItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-silver-mist">{label}: </span>
    <span className="font-medium text-ink-black dark:text-pearl capitalize">{value}</span>
  </div>
);

// ── Default Data Generators ───────────────────────────────────────────────────

function getDefaultFormData(type: LifeEventType): Record<string, string | boolean | string[]> {
  switch (type) {
    case 'marriage_divorce':
      return {
        subType: 'marriage',
        eventDate: '',
        spouseFirstName: '',
        spouseLastName: '',
        spouseDob: '',
        spouseSsn: '',
        spouseGender: 'female',
        addSpouseToBenefits: true,
      };
    case 'birth_adoption':
      return {
        subType: 'birth',
        eventDate: '',
        childFirstName: '',
        childLastName: '',
        childDob: '',
        childGender: 'male',
        addChildToBenefits: true,
        adoptionAgency: '',
      };
    case 'death_of_dependent':
      return {
        eventDate: '',
        deceasedName: '',
        relationship: 'spouse',
        removefromBenefits: true,
        updateBeneficiary: true,
      };
    case 'address_change':
      return {
        eventDate: '',
        newStreet: '',
        newCity: '',
        newState: '',
        newZip: '',
        newCountry: 'United States',
        previousState: '',
        movingOutOfServiceArea: false,
      };
    case 'loss_of_coverage':
      return {
        eventDate: '',
        previousInsurer: '',
        coverageEndDate: '',
        reason: 'spouse_job_loss',
        affectedMembers: [],
        enrollInEmployerPlan: true,
      };
    default:
      return { eventDate: '' };
  }
}

function getDefaultBenefitChanges(type: LifeEventType): BenefitChange[] {
  switch (type) {
    case 'marriage_divorce':
      return [
        {
          category: 'Medical Insurance',
          action: 'add_dependent',
          details: 'Add or remove spouse from health coverage',
        },
        {
          category: 'Dental Care',
          action: 'add_dependent',
          details: 'Add or remove spouse from dental plan',
        },
        {
          category: 'Vision Coverage',
          action: 'add_dependent',
          details: 'Add or remove spouse from vision plan',
        },
        {
          category: 'Life Insurance',
          action: 'update_beneficiary',
          details: 'Update beneficiary designation',
        },
        {
          category: 'Tax Withholding',
          action: 'change_coverage',
          details: 'Update filing status and withholdings',
        },
      ];
    case 'birth_adoption':
      return [
        {
          category: 'Medical Insurance',
          action: 'add_dependent',
          details: 'Add child to health coverage',
        },
        { category: 'Dental Care', action: 'add_dependent', details: 'Add child to dental plan' },
        {
          category: 'Vision Coverage',
          action: 'add_dependent',
          details: 'Add child to vision plan',
        },
        {
          category: 'Life Insurance',
          action: 'update_beneficiary',
          details: 'Add child as beneficiary',
        },
        {
          category: 'FSA / HSA',
          action: 'change_coverage',
          details: 'Adjust dependent care FSA contributions',
        },
      ];
    case 'death_of_dependent':
      return [
        {
          category: 'Medical Insurance',
          action: 'remove_dependent',
          details: 'Remove dependent from health coverage',
        },
        {
          category: 'Dental Care',
          action: 'remove_dependent',
          details: 'Remove dependent from dental plan',
        },
        {
          category: 'Vision Coverage',
          action: 'remove_dependent',
          details: 'Remove dependent from vision plan',
        },
        {
          category: 'Life Insurance',
          action: 'update_beneficiary',
          details: 'Update beneficiary designation',
        },
      ];
    case 'address_change':
      return [
        {
          category: 'Medical Insurance',
          action: 'no_change',
          details: 'May need to switch plans if moving out of service area',
        },
        {
          category: 'Tax Withholding',
          action: 'change_coverage',
          details: 'Update state tax withholding',
        },
      ];
    case 'loss_of_coverage':
      return [
        {
          category: 'Medical Insurance',
          action: 'enroll',
          details: 'Enroll in employer health plan',
        },
        { category: 'Dental Care', action: 'enroll', details: 'Enroll in employer dental plan' },
        {
          category: 'Vision Coverage',
          action: 'enroll',
          details: 'Enroll in employer vision plan',
        },
      ];
    default:
      return [];
  }
}

function getAvailableActions(
  category: string
): { value: BenefitChange['action']; label: string }[] {
  if (category === 'Tax Withholding') {
    return [
      { value: 'change_coverage', label: 'Update' },
      { value: 'no_change', label: 'No Change' },
    ];
  }
  return [
    { value: 'add_dependent', label: 'Add Dependent' },
    { value: 'remove_dependent', label: 'Remove Dependent' },
    { value: 'change_coverage', label: 'Change Coverage' },
    { value: 'enroll', label: 'Enroll' },
    { value: 'update_beneficiary', label: 'Update Beneficiary' },
    { value: 'no_change', label: 'No Change' },
  ];
}

export default LifeEventWizard;
