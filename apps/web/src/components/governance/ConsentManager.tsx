/**
 * @module ConsentManager
 * @description Employee consent management: toggle matrix per purpose,
 *              consent history timeline, and bulk consent collection.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  Info,
  Loader2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  History,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import {
  DataGovernanceService,
  CONSENT_PURPOSE_META,
  type ConsentRecord,
  type ConsentPurpose,
} from '@/services/dataGovernanceService';

// ── Consent row ───────────────────────────────────────────────────────────────

interface ConsentRowProps {
  consent: ConsentRecord;
  onToggle: (purpose: ConsentPurpose, granted: boolean) => void;
  isUpdating: boolean;
}

function ConsentRow({ consent, onToggle, isUpdating }: ConsentRowProps) {
  const meta = CONSENT_PURPOSE_META[consent.purpose];

  return (
    <div
      className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
        consent.granted
          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10'
          : 'border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-black dark:text-pearl">
            {meta?.label ?? consent.purposeLabel}
          </p>
          {meta?.required && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Lock className="w-2.5 h-2.5" />
              Required
            </span>
          )}
        </div>
        <p className="text-xs text-silver-mist mt-0.5">{meta?.description ?? ''}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {consent.legalBasis && (
            <span className="text-[10px] text-silver-mist">
              Legal basis:{' '}
              <span className="capitalize">{consent.legalBasis.replace(/_/g, ' ')}</span>
            </span>
          )}
          {consent.granted && consent.grantedAt && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600">
              <Check className="w-2.5 h-2.5" />
              Granted {new Date(consent.grantedAt).toLocaleDateString()}
            </span>
          )}
          {!consent.granted && consent.revokedAt && (
            <span className="flex items-center gap-1 text-[10px] text-silver-mist">
              <X className="w-2.5 h-2.5" />
              Revoked {new Date(consent.revokedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex-shrink-0">
        {isUpdating ? (
          <Loader2 className="w-5 h-5 text-celestial-indigo animate-spin" />
        ) : meta?.required ? (
          <div className="flex items-center gap-1.5">
            <ToggleRight className="w-8 h-4 text-blue-500" />
            <span className="text-[10px] text-blue-500 font-medium">Always on</span>
          </div>
        ) : (
          <button
            onClick={() => onToggle(consent.purpose, !consent.granted)}
            className="flex items-center gap-1.5 transition-colors"
            aria-label={`${consent.granted ? 'Revoke' : 'Grant'} consent for ${consent.purposeLabel}`}
          >
            {consent.granted ? (
              <ToggleRight className="w-8 h-4 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-8 h-4 text-silver-mist" />
            )}
            <span
              className={`text-[10px] font-medium ${
                consent.granted ? 'text-emerald-600' : 'text-silver-mist'
              }`}
            >
              {consent.granted ? 'Granted' : 'Revoked'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── History item ──────────────────────────────────────────────────────────────

interface HistoryItemProps {
  consent: ConsentRecord;
}

function HistoryItem({ consent }: HistoryItemProps) {
  const meta = CONSENT_PURPOSE_META[consent.purpose];
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-0">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          consent.granted
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
        }`}
      >
        {consent.granted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink-black dark:text-pearl">
          {consent.granted ? 'Granted' : 'Revoked'}{' '}
          <span className="font-semibold">{meta?.label ?? consent.purposeLabel}</span>
        </p>
        <p className="text-[10px] text-silver-mist mt-0.5">
          via {consent.channel} · Legal basis: {consent.legalBasis.replace(/_/g, ' ')}
        </p>
      </div>
      <span className="text-[10px] text-silver-mist flex-shrink-0">
        {new Date(consent.updatedAt).toLocaleDateString()}
      </span>
    </div>
  );
}

// ── Bulk Consent Modal ────────────────────────────────────────────────────────

interface BulkConsentPanelProps {
  onClose: () => void;
  onSubmit: (purposes: ConsentPurpose[], granted: boolean) => void;
  isSubmitting: boolean;
}

function BulkConsentPanel({ onClose, onSubmit, isSubmitting }: BulkConsentPanelProps) {
  const [selectedPurposes, setSelectedPurposes] = useState<ConsentPurpose[]>([]);
  const [action, setAction] = useState<'grant' | 'revoke'>('grant');

  const ALL_OPTIONAL = Object.entries(CONSENT_PURPOSE_META)
    .filter(([, meta]) => !meta.required)
    .map(([key]) => key as ConsentPurpose);

  const togglePurpose = (purpose: ConsentPurpose) => {
    setSelectedPurposes((prev) =>
      prev.includes(purpose) ? prev.filter((p) => p !== purpose) : [...prev, purpose]
    );
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-celestial-indigo/30 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Users className="w-4 h-4 text-silver-mist" />
          Bulk Consent Collection
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-pearl dark:hover:bg-deep-cosmos rounded text-silver-mist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-silver-mist">
        Update consent for multiple purposes at once. This will apply to the current employee.
      </p>

      {/* Action selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAction('grant')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            action === 'grant'
              ? 'bg-emerald-500 text-white'
              : 'border border-cloud dark:border-nebula-purple/40 text-silver-mist hover:border-emerald-400'
          }`}
        >
          Grant Selected
        </button>
        <button
          onClick={() => setAction('revoke')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            action === 'revoke'
              ? 'bg-red-500 text-white'
              : 'border border-cloud dark:border-nebula-purple/40 text-silver-mist hover:border-red-400'
          }`}
        >
          Revoke Selected
        </button>
      </div>

      {/* Purpose checkboxes */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {ALL_OPTIONAL.map((purpose) => {
          const meta = CONSENT_PURPOSE_META[purpose];
          return (
            <label key={purpose} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPurposes.includes(purpose)}
                onChange={() => togglePurpose(purpose)}
                className="rounded border-cloud dark:border-nebula-purple/40 text-celestial-indigo"
              />
              <span className="text-xs text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">
                {meta.label}
              </span>
            </label>
          );
        })}
      </div>

      <button
        onClick={() => onSubmit(selectedPurposes, action === 'grant')}
        disabled={selectedPurposes.length === 0 || isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : action === 'grant' ? (
          <ShieldCheck className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" />
        )}
        {action === 'grant' ? 'Grant' : 'Revoke'} {selectedPurposes.length} purpose
        {selectedPurposes.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ConsentManagerProps {
  employeeId: string;
  className?: string;
}

export function ConsentManager({ employeeId, className = '' }: ConsentManagerProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingPurpose, setUpdatingPurpose] = useState<ConsentPurpose | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const loadConsents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DataGovernanceService.getConsentRecords(employeeId);
      setConsents(data);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const handleToggle = async (purpose: ConsentPurpose, granted: boolean) => {
    setUpdatingPurpose(purpose);
    try {
      const updated = await DataGovernanceService.updateConsent(employeeId, purpose, granted);
      setConsents((prev) => prev.map((c) => (c.purpose === purpose ? updated : c)));
    } finally {
      setUpdatingPurpose(null);
    }
  };

  const handleBulkConsent = async (purposes: ConsentPurpose[], granted: boolean) => {
    setIsBulkSubmitting(true);
    try {
      const updates = await Promise.all(
        purposes.map((p) => DataGovernanceService.updateConsent(employeeId, p, granted))
      );
      setConsents((prev) => {
        const map = new Map(updates.map((u) => [u.purpose, u]));
        return prev.map((c) => map.get(c.purpose) ?? c);
      });
      setShowBulkPanel(false);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const grantedCount = consents.filter((c) => c.granted).length;
  const totalCount = consents.length;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-celestial-indigo" />
            Consent Management
          </h3>
          <p className="text-xs text-silver-mist mt-0.5">
            {grantedCount} of {totalCount} purposes consented
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/40 text-xs text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            History
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setShowBulkPanel(!showBulkPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/40 text-xs text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Bulk
          </button>
          <button
            onClick={loadConsents}
            className="p-1.5 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk panel */}
      {showBulkPanel && (
        <BulkConsentPanel
          onClose={() => setShowBulkPanel(false)}
          onSubmit={handleBulkConsent}
          isSubmitting={isBulkSubmitting}
        />
      )}

      {/* Legal notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Required purposes are necessary to fulfil your employment contract and cannot be revoked.
          Optional purposes can be changed at any time.
        </p>
      </div>

      {/* Consent grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
        </div>
      ) : consents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <ShieldCheck className="w-10 h-10 text-silver-mist/20 mb-3" />
          <p className="text-sm text-silver-mist">No consent records found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Required first */}
          {consents
            .sort((a) => (CONSENT_PURPOSE_META[a.purpose]?.required ? -1 : 1))
            .map((consent) => (
              <ConsentRow
                key={consent.id}
                consent={consent}
                onToggle={handleToggle}
                isUpdating={updatingPurpose === consent.purpose}
              />
            ))}
        </div>
      )}

      {/* History timeline */}
      {showHistory && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4">
          <h4 className="text-xs font-semibold text-silver-mist uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Consent History
          </h4>
          {consents.length === 0 ? (
            <p className="text-xs text-silver-mist text-center py-4">No history available</p>
          ) : (
            consents
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((consent) => <HistoryItem key={consent.id} consent={consent} />)
          )}
        </div>
      )}

      {/* Warning for non-granted required purposes */}
      {consents.some((c) => CONSENT_PURPOSE_META[c.purpose]?.required && !c.granted) && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Some required purposes have not been consented to. This may affect the employee&apos;s
            ability to use certain features.
          </p>
        </div>
      )}
    </div>
  );
}

export default ConsentManager;
