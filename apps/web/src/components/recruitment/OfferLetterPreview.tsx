/**
 * @module OfferLetterPreview
 * @description Offer letter preview with formatted document, dynamic fields,
 *              salary breakdown, benefits summary, and print/download actions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  Calendar,
  DollarSign,
  Briefcase,
  MapPin,
  Clock,
  Gift,
  Shield,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit3,
  Mail,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface OfferLetterData {
  id: string;
  offerNumber: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  location: string;
  employmentType: string;
  reportingTo: string;
  startDate: string;
  salary: {
    base: number;
    currency: string;
    frequency: 'annual' | 'monthly';
  };
  bonus?: {
    amount: number;
    type: 'signing' | 'performance' | 'retention';
  };
  equity?: string;
  benefits: { name: string; description: string }[];
  probationPeriod?: number; // months
  noticePeriod?: number; // days
  workSchedule: string;
  expiryDate: string;
  companyName: string;
  companyAddress: string;
  signatoryName: string;
  signatoryTitle: string;
  generatedDate: string;
}

interface OfferLetterPreviewProps {
  letter: OfferLetterData;
  onEdit?: () => void;
  onDownload?: () => void;
  onSendForSignature?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount
  );

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// ── Component ────────────────────────────────────────────────────────────────────

export const OfferLetterPreview: React.FC<OfferLetterPreviewProps> = ({
  letter,
  onEdit,
  onDownload,
  onSendForSignature,
}) => {
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  const monthlySalary = useMemo(() => {
    if (letter.salary.frequency === 'annual') return letter.salary.base / 12;
    return letter.salary.base;
  }, [letter.salary]);

  const annualSalary = useMemo(() => {
    if (letter.salary.frequency === 'monthly') return letter.salary.base * 12;
    return letter.salary.base;
  }, [letter.salary]);

  const totalCompensation = useMemo(() => {
    let total = annualSalary;
    if (letter.bonus) total += letter.bonus.amount;
    return total;
  }, [annualSalary, letter.bonus]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Offer Letter - ${letter.offerNumber} for ${letter.candidateName}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-celestial-indigo" />
          <p className="text-sm font-bold text-ink-black dark:text-pearl">Offer Letter Preview</p>
          <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-celestial-indigo/10 text-celestial-indigo">
            {letter.offerNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3 text-neural-mint" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
            >
              <Download className="w-3 h-3" /> PDF
            </button>
          )}
          {onSendForSignature && (
            <button
              onClick={onSendForSignature}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
            >
              <Mail className="w-3 h-3" /> Send for Signature
            </button>
          )}
        </div>
      </div>

      {/* Compensation Summary Card */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between"
        >
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-neural-mint" />
            Compensation Summary
          </p>
          {showDetails ? (
            <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
          )}
        </button>

        {showDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <CompCard
                label="Base Salary"
                value={formatCurrency(annualSalary, letter.salary.currency)}
                sub="per year"
                icon={DollarSign}
              />
              <CompCard
                label="Monthly"
                value={formatCurrency(monthlySalary, letter.salary.currency)}
                sub="per month"
                icon={Calendar}
              />
              {letter.bonus && (
                <CompCard
                  label={`${letter.bonus.type.charAt(0).toUpperCase() + letter.bonus.type.slice(1)} Bonus`}
                  value={formatCurrency(letter.bonus.amount, letter.salary.currency)}
                  sub="one-time"
                  icon={Gift}
                />
              )}
              <CompCard
                label="Total Comp"
                value={formatCurrency(totalCompensation, letter.salary.currency)}
                sub="first year"
                icon={DollarSign}
                highlight
              />
            </div>

            {letter.equity && (
              <div className="px-3 py-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
                <p className="text-[9px] text-silver-mist">Equity</p>
                <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                  {letter.equity}
                </p>
              </div>
            )}

            {/* Benefits */}
            {letter.benefits.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
                  Benefits Package
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {letter.benefits.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10"
                    >
                      <CheckCircle2 className="w-3 h-3 text-neural-mint shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-semibold text-ink-black dark:text-pearl">
                          {b.name}
                        </p>
                        <p className="text-[8px] text-silver-mist">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Letter Document */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {/* Document Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-pearl/50 dark:bg-deep-cosmos/20 border-b border-cloud dark:border-nebula-purple/20">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-silver-mist" />
            <span className="text-[10px] font-semibold text-silver-mist">Document Preview</span>
          </div>
          <button className="flex items-center gap-1 text-[9px] text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors">
            <Printer className="w-3 h-3" /> Print
          </button>
        </div>

        {/* Letter Content */}
        <div className="p-6 sm:p-8 max-h-[600px] overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Company Header */}
            <div className="text-center border-b border-cloud dark:border-nebula-purple/20 pb-4">
              <p className="text-lg font-bold text-celestial-indigo">{letter.companyName}</p>
              <p className="text-[10px] text-silver-mist mt-1">{letter.companyAddress}</p>
            </div>

            {/* Date & Reference */}
            <div className="flex items-center justify-between text-[10px] text-silver-mist">
              <span>Date: {formatDate(letter.generatedDate)}</span>
              <span>Ref: {letter.offerNumber}</span>
            </div>

            {/* Recipient */}
            <div className="text-[11px] text-ink-black dark:text-pearl space-y-1">
              <p className="font-semibold">{letter.candidateName}</p>
              <p className="text-silver-mist">{letter.candidateEmail}</p>
            </div>

            {/* Subject */}
            <div>
              <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                Subject: Offer of Employment — {letter.jobTitle}
              </p>
            </div>

            {/* Body */}
            <div className="text-[10px] text-ink-black/80 dark:text-pearl/80 leading-relaxed space-y-3">
              <p>Dear {letter.candidateName},</p>

              <p>
                We are pleased to extend an offer of employment for the position of{' '}
                <strong>{letter.jobTitle}</strong> in the <strong>{letter.department}</strong>{' '}
                department at <strong>{letter.companyName}</strong>. After careful consideration of
                your qualifications and experience, we believe you will be a valuable addition to
                our team.
              </p>

              <p className="font-bold text-ink-black dark:text-pearl">Position Details:</p>
              <ul className="list-none space-y-1 pl-3">
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Job Title:</strong> {letter.jobTitle}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Department:</strong> {letter.department}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Location:</strong> {letter.location}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Employment Type:</strong> {letter.employmentType}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Reporting To:</strong> {letter.reportingTo}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Start Date:</strong> {formatDate(letter.startDate)}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Work Schedule:</strong> {letter.workSchedule}
                  </span>
                </li>
              </ul>

              <p className="font-bold text-ink-black dark:text-pearl">Compensation:</p>
              <ul className="list-none space-y-1 pl-3">
                <li className="flex items-start gap-2">
                  <span className="text-celestial-indigo mt-0.5">•</span>
                  <span>
                    <strong>Annual Base Salary:</strong>{' '}
                    {formatCurrency(annualSalary, letter.salary.currency)}
                  </span>
                </li>
                {letter.bonus && (
                  <li className="flex items-start gap-2">
                    <span className="text-celestial-indigo mt-0.5">•</span>
                    <span>
                      <strong>
                        {letter.bonus.type.charAt(0).toUpperCase() + letter.bonus.type.slice(1)}{' '}
                        Bonus:
                      </strong>{' '}
                      {formatCurrency(letter.bonus.amount, letter.salary.currency)}
                    </span>
                  </li>
                )}
                {letter.equity && (
                  <li className="flex items-start gap-2">
                    <span className="text-celestial-indigo mt-0.5">•</span>
                    <span>
                      <strong>Equity:</strong> {letter.equity}
                    </span>
                  </li>
                )}
              </ul>

              {letter.benefits.length > 0 && (
                <>
                  <p className="font-bold text-ink-black dark:text-pearl">Benefits:</p>
                  <p>
                    As a full-time employee, you will be eligible for our comprehensive benefits
                    package including: {letter.benefits.map((b) => b.name).join(', ')}.
                  </p>
                </>
              )}

              {letter.probationPeriod && (
                <p>
                  Please note that this offer is subject to a{' '}
                  <strong>{letter.probationPeriod}-month probation period</strong> during which
                  either party may terminate the employment with the applicable notice period.
                </p>
              )}

              {letter.noticePeriod && (
                <p>
                  After the probation period, a notice period of{' '}
                  <strong>{letter.noticePeriod} days</strong> will apply for resignation or
                  termination.
                </p>
              )}

              <p>
                This offer is contingent upon the successful completion of background verification
                and any other pre-employment requirements. This offer is valid until{' '}
                <strong>{formatDate(letter.expiryDate)}</strong>.
              </p>

              <p>
                To accept this offer, please sign below and return this letter. We look forward to
                welcoming you to the team.
              </p>

              <p>Sincerely,</p>
            </div>

            {/* Signature Block */}
            <div className="space-y-6 pt-4">
              {/* Company Signatory */}
              <div className="space-y-1">
                <div className="w-40 border-b border-cloud dark:border-nebula-purple/30 pb-1">
                  <p className="text-[10px] italic text-celestial-indigo">
                    — Signed electronically —
                  </p>
                </div>
                <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                  {letter.signatoryName}
                </p>
                <p className="text-[9px] text-silver-mist">{letter.signatoryTitle}</p>
                <p className="text-[9px] text-silver-mist">{letter.companyName}</p>
              </div>

              {/* Candidate Acceptance */}
              <div className="space-y-1 p-3 rounded-lg border-2 border-dashed border-celestial-indigo/30 bg-celestial-indigo/5">
                <p className="text-[10px] font-bold text-celestial-indigo">Candidate Acceptance</p>
                <p className="text-[9px] text-silver-mist">
                  I accept the terms and conditions as stated in this offer letter.
                </p>
                <div className="flex items-end gap-6 mt-3">
                  <div className="flex-1">
                    <p className="text-[8px] text-silver-mist mb-1">Signature</p>
                    <div className="h-8 border-b border-celestial-indigo/30" />
                  </div>
                  <div className="w-28">
                    <p className="text-[8px] text-silver-mist mb-1">Date</p>
                    <div className="h-8 border-b border-celestial-indigo/30" />
                  </div>
                </div>
                <p className="text-[9px] font-semibold text-ink-black dark:text-pearl mt-2">
                  {letter.candidateName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Details Summary */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-2">
          Quick Reference
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <DetailCell icon={User} label="Candidate" value={letter.candidateName} />
          <DetailCell icon={Briefcase} label="Position" value={letter.jobTitle} />
          <DetailCell icon={Building2} label="Department" value={letter.department} />
          <DetailCell icon={MapPin} label="Location" value={letter.location} />
          <DetailCell icon={Calendar} label="Start Date" value={formatDate(letter.startDate)} />
          <DetailCell icon={Clock} label="Expires" value={formatDate(letter.expiryDate)} />
          <DetailCell
            icon={DollarSign}
            label="Salary"
            value={formatCurrency(annualSalary, letter.salary.currency)}
          />
          <DetailCell
            icon={Shield}
            label="Probation"
            value={letter.probationPeriod ? `${letter.probationPeriod} months` : 'None'}
          />
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const CompCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  highlight?: boolean;
}> = ({ label, value, sub, icon: Icon, highlight }) => (
  <div
    className={`px-3 py-2 rounded-lg border ${
      highlight
        ? 'border-neural-mint/30 bg-neural-mint/5'
        : 'border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/10'
    }`}
  >
    <p className="text-[8px] text-silver-mist flex items-center gap-0.5 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p
      className={`text-[12px] font-bold ${highlight ? 'text-neural-mint' : 'text-ink-black dark:text-pearl'}`}
    >
      {value}
    </p>
    <p className="text-[8px] text-silver-mist">{sub}</p>
  </div>
);

const DetailCell: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
    <p className="text-[8px] text-silver-mist flex items-center gap-0.5 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p className="text-[10px] font-semibold text-ink-black dark:text-pearl truncate">{value}</p>
  </div>
);

export default OfferLetterPreview;
