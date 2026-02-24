/**
 * @module ESignaturePortal
 * @description E-Signature portal with DocuSign-style embedded signing,
 *              signature status tracking, audit trail, and envelope management
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FileSignature,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Eye,
  Download,
  RefreshCw,
  User,
  Calendar,
  Shield,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pen,
  Stamp,
  Hash,
  MapPin,
  ArrowRight,
  Bell,
  Trash2,
} from 'lucide-react';
import { OfferLetterPreview } from './OfferLetterPreview';
import type { OfferLetterData } from './OfferLetterPreview';

// ── Types ────────────────────────────────────────────────────────────────────────

export type SignatureStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'voided';
export type SignerRole = 'candidate' | 'hiring_manager' | 'hr_director' | 'ceo' | 'witness';

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: SignerRole;
  order: number;
  status: SignatureStatus;
  signedAt?: string;
  viewedAt?: string;
  declineReason?: string;
  ipAddress?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  ipAddress?: string;
}

export interface SignatureEnvelope {
  id: string;
  envelopeId: string; // DocuSign-style envelope ID
  documentName: string;
  candidateName: string;
  jobTitle: string;
  status: SignatureStatus;
  signers: Signer[];
  auditTrail: AuditEntry[];
  provider: 'docusign' | 'aura_sign';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedAt?: string;
  documentUrl?: string;
  offerLetter?: OfferLetterData;
}

interface ESignaturePortalProps {
  envelopes?: SignatureEnvelope[];
  onSendEnvelope?: (envelopeId: string) => void;
  onVoidEnvelope?: (envelopeId: string) => void;
  onResendEnvelope?: (envelopeId: string) => void;
  onDownload?: (envelopeId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_CONFIG: Record<
  SignatureStatus,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  draft: { label: 'Draft', icon: FileText, color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  sent: { label: 'Sent', icon: Send, color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10' },
  viewed: { label: 'Viewed', icon: Eye, color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  signed: {
    label: 'Signed',
    icon: CheckCircle2,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10',
  },
  expired: { label: 'Expired', icon: Clock, color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  voided: { label: 'Voided', icon: XCircle, color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
};

const SIGNER_ROLE_LABELS: Record<SignerRole, string> = {
  candidate: 'Candidate',
  hiring_manager: 'Hiring Manager',
  hr_director: 'HR Director',
  ceo: 'CEO',
  witness: 'Witness',
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_OFFER_LETTER: OfferLetterData = {
  id: 'ol-001',
  offerNumber: 'OFFER-2026-0047',
  candidateName: 'James Wilson',
  candidateEmail: 'james.wilson@email.com',
  jobTitle: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'San Francisco, CA',
  employmentType: 'Full-Time',
  reportingTo: 'Sarah Chen, VP Engineering',
  startDate: '2026-04-01',
  salary: { base: 185000, currency: 'USD', frequency: 'annual' },
  bonus: { amount: 25000, type: 'signing' },
  equity: '5,000 RSUs vesting over 4 years',
  benefits: [
    { name: 'Health Insurance', description: 'Premium medical, dental & vision' },
    { name: '401(k) Match', description: '6% employer match' },
    { name: 'PTO', description: '25 days + 10 holidays' },
    { name: 'Learning Budget', description: '$3,000 annual allowance' },
    { name: 'Remote Flexibility', description: 'Hybrid 3 days in-office' },
    { name: 'Wellness', description: '$1,200 annual stipend' },
  ],
  probationPeriod: 3,
  noticePeriod: 30,
  workSchedule: 'Monday–Friday, flexible hours (core 10 AM – 4 PM)',
  expiryDate: '2026-03-10',
  companyName: 'AURA Technologies Inc.',
  companyAddress: '100 Innovation Way, San Francisco, CA 94107',
  signatoryName: 'Sarah Chen',
  signatoryTitle: 'VP of Engineering',
  generatedDate: '2026-02-20',
};

const MOCK_ENVELOPES: SignatureEnvelope[] = [
  {
    id: 'env-001',
    envelopeId: 'ENV-2026-A1B2C3',
    documentName: 'Offer Letter — Senior Software Engineer',
    candidateName: 'James Wilson',
    jobTitle: 'Senior Software Engineer',
    status: 'viewed',
    provider: 'docusign',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-22T14:30:00Z',
    expiresAt: '2026-03-10T23:59:59Z',
    offerLetter: MOCK_OFFER_LETTER,
    signers: [
      {
        id: 's1',
        name: 'Sarah Chen',
        email: 'sarah.chen@aura.io',
        role: 'hiring_manager',
        order: 1,
        status: 'signed',
        signedAt: '2026-02-20T10:30:00Z',
        ipAddress: '10.0.1.45',
      },
      {
        id: 's2',
        name: 'Priya Patel',
        email: 'priya.patel@aura.io',
        role: 'hr_director',
        order: 2,
        status: 'signed',
        signedAt: '2026-02-20T14:15:00Z',
        ipAddress: '10.0.1.72',
      },
      {
        id: 's3',
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        role: 'candidate',
        order: 3,
        status: 'viewed',
        viewedAt: '2026-02-22T14:30:00Z',
      },
    ],
    auditTrail: [
      {
        id: 'a1',
        timestamp: '2026-02-20T10:00:00Z',
        action: 'Envelope Created',
        actor: 'System',
        details: 'Offer letter generated from template',
      },
      {
        id: 'a2',
        timestamp: '2026-02-20T10:05:00Z',
        action: 'Sent for Signing',
        actor: 'System',
        details: 'Sent to Sarah Chen (Hiring Manager)',
      },
      {
        id: 'a3',
        timestamp: '2026-02-20T10:28:00Z',
        action: 'Document Viewed',
        actor: 'Sarah Chen',
        details: 'Viewed from 10.0.1.45',
        ipAddress: '10.0.1.45',
      },
      {
        id: 'a4',
        timestamp: '2026-02-20T10:30:00Z',
        action: 'Document Signed',
        actor: 'Sarah Chen',
        details: 'Signed as Hiring Manager',
        ipAddress: '10.0.1.45',
      },
      {
        id: 'a5',
        timestamp: '2026-02-20T14:10:00Z',
        action: 'Document Viewed',
        actor: 'Priya Patel',
        details: 'Viewed from 10.0.1.72',
        ipAddress: '10.0.1.72',
      },
      {
        id: 'a6',
        timestamp: '2026-02-20T14:15:00Z',
        action: 'Document Signed',
        actor: 'Priya Patel',
        details: 'Signed as HR Director',
        ipAddress: '10.0.1.72',
      },
      {
        id: 'a7',
        timestamp: '2026-02-22T14:30:00Z',
        action: 'Document Viewed',
        actor: 'James Wilson',
        details: 'Candidate viewed the offer letter',
      },
    ],
  },
  {
    id: 'env-002',
    envelopeId: 'ENV-2026-D4E5F6',
    documentName: 'Offer Letter — Product Manager',
    candidateName: 'Emily Martinez',
    jobTitle: 'Product Manager',
    status: 'signed',
    provider: 'docusign',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-18T11:45:00Z',
    expiresAt: '2026-03-05T23:59:59Z',
    completedAt: '2026-02-18T11:45:00Z',
    signers: [
      {
        id: 's4',
        name: 'Michael Brown',
        email: 'michael.brown@aura.io',
        role: 'hiring_manager',
        order: 1,
        status: 'signed',
        signedAt: '2026-02-15T10:00:00Z',
      },
      {
        id: 's5',
        name: 'Priya Patel',
        email: 'priya.patel@aura.io',
        role: 'hr_director',
        order: 2,
        status: 'signed',
        signedAt: '2026-02-16T09:30:00Z',
      },
      {
        id: 's6',
        name: 'Emily Martinez',
        email: 'emily.martinez@email.com',
        role: 'candidate',
        order: 3,
        status: 'signed',
        signedAt: '2026-02-18T11:45:00Z',
      },
    ],
    auditTrail: [
      {
        id: 'a8',
        timestamp: '2026-02-15T09:00:00Z',
        action: 'Envelope Created',
        actor: 'System',
        details: 'Offer letter generated',
      },
      {
        id: 'a9',
        timestamp: '2026-02-18T11:45:00Z',
        action: 'Completed',
        actor: 'System',
        details: 'All parties have signed',
      },
    ],
  },
  {
    id: 'env-003',
    envelopeId: 'ENV-2026-G7H8I9',
    documentName: 'Offer Letter — UX Designer',
    candidateName: 'Alex Kim',
    jobTitle: 'UX Designer',
    status: 'declined',
    provider: 'aura_sign',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-14T16:20:00Z',
    expiresAt: '2026-02-28T23:59:59Z',
    signers: [
      {
        id: 's7',
        name: 'Lisa Wong',
        email: 'lisa.wong@aura.io',
        role: 'hiring_manager',
        order: 1,
        status: 'signed',
        signedAt: '2026-02-10T09:00:00Z',
      },
      {
        id: 's8',
        name: 'Alex Kim',
        email: 'alex.kim@email.com',
        role: 'candidate',
        order: 2,
        status: 'declined',
        viewedAt: '2026-02-14T16:00:00Z',
        declineReason: 'Accepted another offer',
      },
    ],
    auditTrail: [
      {
        id: 'a10',
        timestamp: '2026-02-10T08:00:00Z',
        action: 'Envelope Created',
        actor: 'System',
        details: 'Offer letter generated',
      },
      {
        id: 'a11',
        timestamp: '2026-02-14T16:20:00Z',
        action: 'Declined',
        actor: 'Alex Kim',
        details: 'Reason: Accepted another offer',
      },
    ],
  },
  {
    id: 'env-004',
    envelopeId: 'ENV-2026-J0K1L2',
    documentName: 'Offer Letter — Data Analyst',
    candidateName: 'Ryan Cooper',
    jobTitle: 'Data Analyst',
    status: 'sent',
    provider: 'docusign',
    createdAt: '2026-02-23T11:00:00Z',
    updatedAt: '2026-02-23T11:05:00Z',
    expiresAt: '2026-03-15T23:59:59Z',
    signers: [
      {
        id: 's9',
        name: 'David Lee',
        email: 'david.lee@aura.io',
        role: 'hiring_manager',
        order: 1,
        status: 'sent',
      },
      {
        id: 's10',
        name: 'Ryan Cooper',
        email: 'ryan.cooper@email.com',
        role: 'candidate',
        order: 2,
        status: 'draft',
      },
    ],
    auditTrail: [
      {
        id: 'a12',
        timestamp: '2026-02-23T11:00:00Z',
        action: 'Envelope Created',
        actor: 'System',
        details: 'Offer letter generated',
      },
      {
        id: 'a13',
        timestamp: '2026-02-23T11:05:00Z',
        action: 'Sent for Signing',
        actor: 'System',
        details: 'Sent to David Lee',
      },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const ESignaturePortal: React.FC<ESignaturePortalProps> = ({
  envelopes = MOCK_ENVELOPES,
  onSendEnvelope,
  onVoidEnvelope,
  onResendEnvelope,
  onDownload,
}) => {
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'detail' | 'signing' | 'letter'>('list');
  const [statusFilter, setStatusFilter] = useState<SignatureStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAudit, setExpandedAudit] = useState(false);

  const filtered = useMemo(() => {
    let result = envelopes;
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.candidateName.toLowerCase().includes(q) ||
          e.jobTitle.toLowerCase().includes(q) ||
          e.envelopeId.toLowerCase().includes(q)
      );
    }
    return result;
  }, [envelopes, statusFilter, searchQuery]);

  const selectedEnvelope = useMemo(
    () => envelopes.find((e) => e.id === selectedEnvelopeId) || null,
    [envelopes, selectedEnvelopeId]
  );

  const stats = useMemo(
    () => ({
      total: envelopes.length,
      signed: envelopes.filter((e) => e.status === 'signed').length,
      pending: envelopes.filter((e) => e.status === 'sent' || e.status === 'viewed').length,
      declined: envelopes.filter((e) => e.status === 'declined').length,
    }),
    [envelopes]
  );

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedEnvelopeId(id);
    setActiveView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setActiveView('list');
    setSelectedEnvelopeId(null);
    setExpandedAudit(false);
  }, []);

  // ── List View ──────────────────────────────────────────────────────────────

  if (activeView === 'list') {
    return (
      <div className="space-y-4">
        {/* Header + Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            label="Total Envelopes"
            value={stats.total}
            icon={FileSignature}
            color="text-celestial-indigo"
          />
          <StatCard
            label="Completed"
            value={stats.signed}
            icon={CheckCircle2}
            color="text-neural-mint"
          />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-sunset-amber" />
          <StatCard
            label="Declined"
            value={stats.declined}
            icon={XCircle}
            color="text-coral-alert"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, position, or envelope ID..."
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'sent', 'viewed', 'signed', 'declined'] as const).map((s) => {
              const cfg = s === 'all' ? null : STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-colors ${
                    statusFilter === s
                      ? 'bg-celestial-indigo/10 text-celestial-indigo'
                      : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                  }`}
                >
                  {s === 'all' ? 'All' : cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Envelope List */}
        <div className="space-y-2">
          {filtered.map((env) => {
            const statusCfg = STATUS_CONFIG[env.status];
            const StatusIcon = statusCfg.icon;
            const signedCount = env.signers.filter((s) => s.status === 'signed').length;

            return (
              <div
                key={env.id}
                onClick={() => handleOpenDetail(env.id)}
                className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3 hover:border-celestial-indigo/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg ${statusCfg.bg} flex items-center justify-center shrink-0`}
                  >
                    <StatusIcon className={`w-4 h-4 ${statusCfg.color}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[11px] font-bold text-ink-black dark:text-pearl truncate">
                        {env.documentName}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-silver-mist">
                      <span className="flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5" /> {env.candidateName}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" /> {env.envelopeId}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" /> {formatDate(env.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Signer Progress */}
                  <div className="text-center shrink-0">
                    <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                      {signedCount}/{env.signers.length}
                    </p>
                    <p className="text-[8px] text-silver-mist">signed</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-16 shrink-0">
                    <div className="h-1.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          env.status === 'signed'
                            ? 'bg-neural-mint'
                            : env.status === 'declined'
                              ? 'bg-coral-alert'
                              : 'bg-celestial-indigo'
                        }`}
                        style={{
                          width: `${env.signers.length > 0 ? (signedCount / env.signers.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Provider Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${
                      env.provider === 'docusign'
                        ? 'bg-celestial-indigo/10 text-celestial-indigo'
                        : 'bg-neural-mint/10 text-neural-mint'
                    }`}
                  >
                    {env.provider === 'docusign' ? 'DocuSign' : 'AURA Sign'}
                  </span>

                  <ArrowRight className="w-3.5 h-3.5 text-silver-mist/40" />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <FileSignature className="w-6 h-6 text-silver-mist/20 mx-auto mb-2" />
              <p className="text-[10px] text-silver-mist">No envelopes match your search</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Letter Preview View ────────────────────────────────────────────────────

  if (activeView === 'letter' && selectedEnvelope?.offerLetter) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveView('detail')}
          className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-90" /> Back to Envelope
        </button>
        <OfferLetterPreview
          letter={selectedEnvelope.offerLetter}
          onSendForSignature={() => onSendEnvelope?.(selectedEnvelope.id)}
        />
      </div>
    );
  }

  // ── Signing Simulation View ────────────────────────────────────────────────

  if (activeView === 'signing' && selectedEnvelope) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveView('detail')}
          className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-90" /> Back to Envelope
        </button>

        {/* Embedded Signing UI */}
        <div className="rounded-xl border-2 border-celestial-indigo/30 bg-white dark:bg-stellar-blue overflow-hidden">
          {/* DocuSign-style header */}
          <div className="flex items-center justify-between px-4 py-3 bg-celestial-indigo text-white">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold">Electronic Signature</p>
                <p className="text-[9px] opacity-70">
                  Powered by {selectedEnvelope.provider === 'docusign' ? 'DocuSign' : 'AURA Sign'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 opacity-70" />
              <span className="text-[9px] opacity-70">Encrypted & Secure</span>
            </div>
          </div>

          {/* Document Content Area */}
          <div className="p-6 bg-pearl/20 dark:bg-deep-cosmos/10 min-h-[300px]">
            <div className="max-w-2xl mx-auto bg-white dark:bg-stellar-blue rounded-xl shadow-sm border border-cloud dark:border-nebula-purple/20 p-6">
              <div className="text-center mb-4">
                <p className="text-sm font-bold text-ink-black dark:text-pearl">
                  {selectedEnvelope.documentName}
                </p>
                <p className="text-[10px] text-silver-mist">
                  Please review and sign the document below
                </p>
              </div>

              {/* Signature Fields */}
              <div className="space-y-4 mt-6">
                {/* Signature Pad */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1">
                    <Pen className="w-3 h-3 text-celestial-indigo" /> Signature
                  </p>
                  <div className="h-20 rounded-lg border-2 border-dashed border-celestial-indigo/30 bg-celestial-indigo/5 flex items-center justify-center cursor-pointer hover:bg-celestial-indigo/10 transition-colors">
                    <div className="text-center">
                      <Pen className="w-5 h-5 text-celestial-indigo/40 mx-auto mb-1" />
                      <p className="text-[10px] text-celestial-indigo/60">
                        Click to sign or draw your signature
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded-lg text-[9px] font-semibold bg-celestial-indigo/10 text-celestial-indigo">
                      Draw
                    </button>
                    <button className="px-3 py-1 rounded-lg text-[9px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                      Type
                    </button>
                    <button className="px-3 py-1 rounded-lg text-[9px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                      Upload
                    </button>
                  </div>
                </div>

                {/* Initials */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1">
                    <Stamp className="w-3 h-3 text-celestial-indigo" /> Initials
                  </p>
                  <div className="h-12 w-24 rounded-lg border-2 border-dashed border-celestial-indigo/30 bg-celestial-indigo/5 flex items-center justify-center cursor-pointer hover:bg-celestial-indigo/10 transition-colors">
                    <p className="text-[9px] text-celestial-indigo/60">Initials</p>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-celestial-indigo" /> Date Signed
                  </p>
                  <p className="text-[10px] text-silver-mist">
                    {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>

              {/* Legal Agreement */}
              <div className="mt-6 p-3 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 border border-cloud dark:border-nebula-purple/20">
                <p className="text-[9px] text-silver-mist leading-relaxed">
                  By signing this document, I agree to the terms and conditions outlined herein. I
                  understand that this electronic signature is legally binding and has the same
                  effect as a handwritten signature under the ESIGN Act and UETA.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Finish Signing
                </button>
                <button
                  onClick={() => setActiveView('detail')}
                  className="px-3 py-2 rounded-lg text-[11px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Detail View ────────────────────────────────────────────────────────────

  if (activeView === 'detail' && selectedEnvelope) {
    const statusCfg = STATUS_CONFIG[selectedEnvelope.status];
    const StatusIcon = statusCfg.icon;

    return (
      <div className="space-y-4">
        {/* Back + Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            <ChevronDown className="w-3 h-3 rotate-90" /> Back to Envelopes
          </button>
          <div className="flex items-center gap-1.5">
            {selectedEnvelope.offerLetter && (
              <button
                onClick={() => setActiveView('letter')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
              >
                <Eye className="w-3 h-3" /> View Letter
              </button>
            )}
            {(selectedEnvelope.status === 'sent' || selectedEnvelope.status === 'viewed') && (
              <button
                onClick={() => setActiveView('signing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                <Pen className="w-3 h-3" /> Sign Now
              </button>
            )}
            {selectedEnvelope.status === 'signed' && (
              <button
                onClick={() => onDownload?.(selectedEnvelope.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-neural-mint/10 text-neural-mint hover:bg-neural-mint/20 transition-colors"
              >
                <Download className="w-3 h-3" /> Download Signed
              </button>
            )}
          </div>
        </div>

        {/* Envelope Header */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${statusCfg.bg} flex items-center justify-center`}
            >
              <StatusIcon className={`w-5 h-5 ${statusCfg.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                {selectedEnvelope.documentName}
              </p>
              <div className="flex items-center gap-3 text-[9px] text-silver-mist mt-0.5">
                <span>{selectedEnvelope.envelopeId}</span>
                <span>Created {formatDate(selectedEnvelope.createdAt)}</span>
                <span>Expires {formatDate(selectedEnvelope.expiresAt)}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${
                    selectedEnvelope.provider === 'docusign'
                      ? 'bg-celestial-indigo/10 text-celestial-indigo'
                      : 'bg-neural-mint/10 text-neural-mint'
                  }`}
                >
                  {selectedEnvelope.provider === 'docusign' ? 'DocuSign' : 'AURA Sign'}
                </span>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Signing Workflow */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-celestial-indigo" />
            Signing Workflow
          </p>

          <div className="space-y-1">
            {selectedEnvelope.signers.map((signer, idx) => {
              const signerStatus = STATUS_CONFIG[signer.status];
              const SignerIcon = signerStatus.icon;
              const isLast = idx === selectedEnvelope.signers.length - 1;

              return (
                <div key={signer.id} className="relative">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10 transition-colors">
                    {/* Step number + connector */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          signer.status === 'signed'
                            ? 'bg-neural-mint text-white'
                            : signer.status === 'declined'
                              ? 'bg-coral-alert text-white'
                              : signer.status === 'viewed'
                                ? 'bg-sunset-amber text-white'
                                : 'bg-pearl dark:bg-deep-cosmos/30 text-silver-mist'
                        }`}
                      >
                        {signer.status === 'signed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : signer.status === 'declined' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          signer.order
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-4 ${
                            signer.status === 'signed'
                              ? 'bg-neural-mint/30'
                              : 'bg-cloud dark:bg-nebula-purple/20'
                          }`}
                        />
                      )}
                    </div>

                    {/* Signer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                          {signer.name}
                        </span>
                        <span className="text-[8px] text-silver-mist px-1.5 py-0.5 rounded bg-pearl/50 dark:bg-deep-cosmos/20">
                          {SIGNER_ROLE_LABELS[signer.role]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-silver-mist mt-0.5">
                        <span>{signer.email}</span>
                        {signer.signedAt && <span>· Signed {formatDateTime(signer.signedAt)}</span>}
                        {signer.viewedAt && !signer.signedAt && (
                          <span>· Viewed {formatDateTime(signer.viewedAt)}</span>
                        )}
                        {signer.declineReason && (
                          <span className="text-coral-alert">· {signer.declineReason}</span>
                        )}
                      </div>
                    </div>

                    {/* Signer Status */}
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${signerStatus.bg} ${signerStatus.color}`}
                    >
                      <SignerIcon className="w-3 h-3" />
                      {signerStatus.label}
                    </span>

                    {/* Resend */}
                    {(signer.status === 'sent' || signer.status === 'viewed') && (
                      <button
                        onClick={() => onResendEnvelope?.(selectedEnvelope.id)}
                        className="p-1 text-silver-mist hover:text-celestial-indigo transition-colors"
                        title="Resend reminder"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
          <button
            onClick={() => setExpandedAudit(!expandedAudit)}
            className="w-full flex items-center justify-between"
          >
            <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Shield className="w-4 h-4 text-celestial-indigo" />
              Audit Trail
              <span className="text-[9px] font-normal text-silver-mist">
                ({selectedEnvelope.auditTrail.length} events)
              </span>
            </p>
            {expandedAudit ? (
              <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
            )}
          </button>

          {expandedAudit && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {selectedEnvelope.auditTrail.map((entry, _idx) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo/30 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-ink-black dark:text-pearl">
                        {entry.action}
                      </span>
                      <span className="text-[8px] text-silver-mist">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-[9px] text-silver-mist">
                      {entry.actor} — {entry.details}
                    </p>
                    {entry.ipAddress && (
                      <p className="text-[8px] text-silver-mist/60 flex items-center gap-0.5">
                        <MapPin className="w-2 h-2" /> IP: {entry.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Envelope Actions */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-3">
            <MoreVertical className="w-4 h-4 text-celestial-indigo" />
            Actions
          </p>
          <div className="flex items-center gap-2">
            {(selectedEnvelope.status === 'sent' || selectedEnvelope.status === 'viewed') && (
              <>
                <button
                  onClick={() => onResendEnvelope?.(selectedEnvelope.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-celestial-indigo border border-celestial-indigo/20 hover:bg-celestial-indigo/5 transition-colors"
                >
                  <Bell className="w-3 h-3" /> Send Reminder
                </button>
                <button
                  onClick={() => onVoidEnvelope?.(selectedEnvelope.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-coral-alert border border-coral-alert/20 hover:bg-coral-alert/5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Void Envelope
                </button>
              </>
            )}
            <button
              onClick={() => onDownload?.(selectedEnvelope.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to list
  return null;
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: LucideIcon; color: string }> = ({
  label,
  value,
  icon: Icon,
  color,
}) => (
  <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
    <div className="flex items-center justify-between mb-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-lg font-bold text-ink-black dark:text-pearl">{value}</span>
    </div>
    <p className="text-[9px] text-silver-mist">{label}</p>
  </div>
);

export default ESignaturePortal;
