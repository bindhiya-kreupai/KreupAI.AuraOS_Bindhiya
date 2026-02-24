/**
 * @module DependentCard
 * @description Individual dependent card with SSN masking, eligibility indicator, and coverage display
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Users,
  Heart,
  Baby,
  UserCheck,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  GraduationCap,
  Accessibility,
  MoreVertical,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type DependentRelationship =
  | 'spouse'
  | 'domestic_partner'
  | 'child'
  | 'stepchild'
  | 'adopted_child'
  | 'foster_child'
  | 'legal_guardian';

export type DependentStatus =
  | 'active'
  | 'pending_verification'
  | 'verified'
  | 'inactive'
  | 'aged_out';

export interface DependentInfo {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  ssn?: string;
  relationship: DependentRelationship;
  status: DependentStatus;
  isStudent: boolean;
  isDisabled: boolean;
  enrolledPlans: string[];
  phone?: string;
  email?: string;
  eligibleForBenefits: boolean;
  eligibilityReason?: string;
  verifiedDate?: string;
  createdAt: string;
}

interface DependentCardProps {
  dependent: DependentInfo;
  onEdit: (dep: DependentInfo) => void;
  onDelete: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RELATIONSHIP_META: Record<
  DependentRelationship,
  { label: string; icon: LucideIcon; color: string }
> = {
  spouse: { label: 'Spouse', icon: Heart, color: 'text-quantum-rose bg-quantum-rose/10' },
  domestic_partner: {
    label: 'Domestic Partner',
    icon: Users,
    color: 'text-nebula-purple bg-nebula-purple/10',
  },
  child: { label: 'Child', icon: Baby, color: 'text-neural-mint bg-neural-mint/10' },
  stepchild: {
    label: 'Stepchild',
    icon: Baby,
    color: 'text-celestial-indigo bg-celestial-indigo/10',
  },
  adopted_child: {
    label: 'Adopted Child',
    icon: Baby,
    color: 'text-sunset-amber bg-sunset-amber/10',
  },
  foster_child: { label: 'Foster Child', icon: Baby, color: 'text-twilight bg-twilight/10' },
  legal_guardian: {
    label: 'Legal Guardian',
    icon: UserCheck,
    color: 'text-silver-mist bg-silver-mist/10',
  },
};

const STATUS_META: Record<DependentStatus, { label: string; icon: LucideIcon; color: string }> = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-neural-mint bg-neural-mint/10' },
  pending_verification: {
    label: 'Pending',
    icon: Clock,
    color: 'text-sunset-amber bg-sunset-amber/10',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    color: 'text-celestial-indigo bg-celestial-indigo/10',
  },
  inactive: { label: 'Inactive', icon: XCircle, color: 'text-silver-mist bg-silver-mist/10' },
  aged_out: { label: 'Aged Out', icon: AlertTriangle, color: 'text-coral-alert bg-coral-alert/10' },
};

/** Mask SSN showing only last 4 digits */
export function maskSSN(ssn?: string): string {
  if (!ssn) return '—';
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) return '***-**-****';
  const last4 = digits.slice(-4);
  return `***-**-${last4}`;
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DependentCard: React.FC<DependentCardProps> = ({
  dependent: dep,
  onEdit,
  onDelete,
}) => {
  const [showSSN, setShowSSN] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const relMeta = RELATIONSHIP_META[dep.relationship];
  const statusMeta = STATUS_META[dep.status];
  const RelIcon = relMeta.icon;
  const StatusIcon = statusMeta.icon;
  const age = calculateAge(dep.dateOfBirth);

  return (
    <div className="relative bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4 hover:shadow-sm transition-shadow">
      {/* Eligibility indicator */}
      <div
        className={`absolute top-0 left-6 right-6 h-1 rounded-b-full ${
          dep.eligibleForBenefits ? 'bg-neural-mint' : 'bg-coral-alert'
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 pt-1">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-pearl dark:bg-deep-cosmos flex items-center justify-center">
            <span className="text-sm font-bold text-twilight dark:text-silver-mist">
              {dep.firstName[0]}
              {dep.lastName[0]}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink-black dark:text-pearl">
              {dep.firstName} {dep.middleName ? `${dep.middleName.charAt(0)}. ` : ''}
              {dep.lastName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${relMeta.color}`}
              >
                <RelIcon className="w-2.5 h-2.5" />
                {relMeta.label}
              </span>
              <span className="text-[10px] text-silver-mist">· Age {age}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-silver-mist" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-lg py-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(dep);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink-black dark:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(dep.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-coral-alert hover:bg-coral-alert/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* DOB */}
        <div className="px-2.5 py-2 bg-pearl/50 dark:bg-deep-cosmos/20 rounded-lg">
          <div className="flex items-center gap-1 mb-0.5">
            <Calendar className="w-2.5 h-2.5 text-silver-mist" />
            <span className="text-[9px] text-silver-mist uppercase">Date of Birth</span>
          </div>
          <p className="text-xs font-medium text-ink-black dark:text-pearl">
            {new Date(dep.dateOfBirth).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* SSN */}
        <div className="px-2.5 py-2 bg-pearl/50 dark:bg-deep-cosmos/20 rounded-lg">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-silver-mist" />
              <span className="text-[9px] text-silver-mist uppercase">SSN</span>
            </div>
            {dep.ssn && (
              <button
                onClick={() => setShowSSN(!showSSN)}
                className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
              >
                {showSSN ? (
                  <EyeOff className="w-3 h-3 text-silver-mist" />
                ) : (
                  <Eye className="w-3 h-3 text-silver-mist" />
                )}
              </button>
            )}
          </div>
          <p className="text-xs font-mono font-medium text-ink-black dark:text-pearl">
            {showSSN && dep.ssn ? dep.ssn : maskSSN(dep.ssn)}
          </p>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {/* Status */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusMeta.color}`}
        >
          <StatusIcon className="w-2.5 h-2.5" />
          {statusMeta.label}
        </span>

        {/* Eligibility */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
            dep.eligibleForBenefits
              ? 'text-neural-mint bg-neural-mint/10'
              : 'text-coral-alert bg-coral-alert/10'
          }`}
        >
          {dep.eligibleForBenefits ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" /> Eligible
            </>
          ) : (
            <>
              <AlertTriangle className="w-2.5 h-2.5" /> {dep.eligibilityReason || 'Ineligible'}
            </>
          )}
        </span>

        {/* Student */}
        {dep.isStudent && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-celestial-indigo bg-celestial-indigo/10">
            <GraduationCap className="w-2.5 h-2.5" />
            Student
          </span>
        )}

        {/* Disabled */}
        {dep.isDisabled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-nebula-purple bg-nebula-purple/10">
            <Accessibility className="w-2.5 h-2.5" />
            Disability
          </span>
        )}
      </div>

      {/* Enrolled Plans */}
      {dep.enrolledPlans.length > 0 && (
        <div>
          <p className="text-[9px] text-silver-mist uppercase tracking-wider font-semibold mb-1.5">
            Covered Under
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dep.enrolledPlans.map((plan) => (
              <span
                key={plan}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/20"
              >
                {plan}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DependentCard;
