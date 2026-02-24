/**
 * @module TaxDocumentViewer
 * @description PDF viewer / preview pane for tax documents (W-2, 1099, Form 16)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  Printer,
  Info,
  Shield,
} from 'lucide-react';
import type { TaxDocument } from './TaxDocumentsList';

// ── Props ──────────────────────────────────────────────────────────────────────

interface TaxDocumentViewerProps {
  document: TaxDocument;
  onClose: () => void;
  onDownload: (doc: TaxDocument) => void;
}

// ── Form Type Descriptions ─────────────────────────────────────────────────────

const FORM_DESCRIPTIONS: Record<string, { title: string; description: string; fields: string[] }> =
  {
    'W-2': {
      title: 'Wage and Tax Statement',
      description: 'Reports wages paid and taxes withheld by your employer during the tax year.',
      fields: [
        'Wages, tips, other compensation',
        'Federal income tax withheld',
        'Social Security wages & tax',
        'Medicare wages & tax',
        'State wages & tax withheld',
      ],
    },
    '1099-NEC': {
      title: 'Nonemployee Compensation',
      description:
        'Reports payments of $600 or more made to non-employees (independent contractors).',
      fields: [
        'Nonemployee compensation',
        'Federal income tax withheld',
        'State tax withheld',
        "State/Payer's state no.",
      ],
    },
    '1099-MISC': {
      title: 'Miscellaneous Income',
      description:
        'Reports miscellaneous income including rents, royalties, prizes, and other payments.',
      fields: [
        'Rents',
        'Royalties',
        'Other income',
        'Fishing boat proceeds',
        'Medical and health care payments',
      ],
    },
    '1099-INT': {
      title: 'Interest Income',
      description:
        'Reports interest income earned from banks, savings institutions, or other payers.',
      fields: [
        'Interest income',
        'Early withdrawal penalty',
        'Interest on U.S. Savings Bonds',
        'Federal income tax withheld',
        'Investment expenses',
      ],
    },
    '1099-DIV': {
      title: 'Dividends and Distributions',
      description: 'Reports dividend income and capital gains distributions from investments.',
      fields: [
        'Total ordinary dividends',
        'Qualified dividends',
        'Total capital gain distributions',
        'Federal income tax withheld',
      ],
    },
    'Form 16': {
      title: 'Certificate of TDS on Salary',
      description:
        'Issued by employer certifying tax deducted at source (TDS) from salary under Section 203 of the Income Tax Act.',
      fields: [
        'Gross salary',
        'Allowances exempt u/s 10',
        'Net salary',
        'Deductions under Chapter VI-A',
        'Total tax payable',
        'Tax deducted at source',
      ],
    },
    'Form 16A': {
      title: 'Certificate of TDS (Non-Salary)',
      description:
        'TDS certificate for income other than salary, issued quarterly by the deductor.',
      fields: [
        'Amount paid/credited',
        'Tax deducted',
        'TDS deposited',
        'Date of payment',
        'TDS certificate number',
      ],
    },
    'Form 26AS': {
      title: 'Annual Tax Statement',
      description:
        'Consolidated annual tax statement showing all taxes paid, TDS deducted, and advance tax credited.',
      fields: [
        'TDS on salary',
        'TDS on non-salary',
        'Self-assessment tax',
        'Advance tax paid',
        'Refunds received',
      ],
    },
  };

// ── Component ──────────────────────────────────────────────────────────────────

export const TaxDocumentViewer: React.FC<TaxDocumentViewerProps> = ({
  document: doc,
  onClose,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const formInfo = FORM_DESCRIPTIONS[doc.formType] || null;

  const handlePrint = () => {
    const printWindow = window.open(doc.fileUrl, '_blank');
    printWindow?.print();
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full'
      }`}
    >
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-ink-black/40 dark:bg-deep-cosmos/60 backdrop-blur-sm -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-celestial-indigo/10 shrink-0">
            <FileText className="w-4 h-4 text-celestial-indigo" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-ink-black dark:text-pearl truncate">
              {doc.formType} — {doc.title}
            </h3>
            <p className="text-[10px] text-silver-mist truncate">
              {doc.issuer} · {doc.taxYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4 text-silver-mist" />
          </button>
          <button
            onClick={() => onDownload(doc)}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-silver-mist" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-silver-mist" />
            ) : (
              <Maximize2 className="w-4 h-4 text-silver-mist" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <X className="w-4 h-4 text-silver-mist" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-cloud/50 dark:border-nebula-purple/20">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
            activeTab === 'preview'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
            activeTab === 'info'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos'
          }`}
        >
          Form Details
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' ? (
          <div className="h-full">
            {doc.fileFormat === 'pdf' ? (
              <iframe
                src={doc.fileUrl}
                title={`${doc.formType} - ${doc.title}`}
                className="w-full h-full border-0"
              />
            ) : (
              /* Fallback for non-PDF or unavailable preview */
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-celestial-indigo/10 flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-celestial-indigo" />
                </div>
                <h4 className="text-lg font-semibold text-ink-black dark:text-pearl mb-1">
                  {doc.formType}
                </h4>
                <p className="text-sm text-silver-mist mb-2">{doc.title}</p>
                <p className="text-xs text-silver-mist mb-6">
                  {doc.issuer} · Tax Year {doc.taxYear}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDownload(doc)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-celestial-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pearl dark:bg-deep-cosmos text-twilight dark:text-silver-mist text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in new tab
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Info Tab */
          <div className="p-4 space-y-5 overflow-y-auto h-full">
            {/* Form Description */}
            {formInfo && (
              <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-celestial-indigo mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
                      {formInfo.title}
                    </h4>
                    <p className="text-xs text-silver-mist leading-relaxed">
                      {formInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Details */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                Document Details
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <DetailItem label="Form Type" value={doc.formType} />
                <DetailItem label="Tax Year" value={doc.taxYear} />
                <DetailItem label="Issuer" value={doc.issuer} />
                <DetailItem
                  label="Issue Date"
                  value={new Date(doc.issueDate).toLocaleDateString()}
                />
                <DetailItem label="Status" value={doc.status} />
                <DetailItem label="File Size" value={formatSize(doc.fileSize)} />
              </div>
            </div>

            {/* Key Fields */}
            {formInfo && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                  Key Information Fields
                </h4>
                <div className="space-y-1.5">
                  {formInfo.fields.map((field, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 bg-pearl/50 dark:bg-deep-cosmos/30 rounded-lg"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo shrink-0" />
                      <span className="text-xs text-ink-black dark:text-pearl">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-sunset-amber mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-sunset-amber">Sensitive Document</p>
                <p className="text-[10px] text-silver-mist mt-0.5">
                  This tax document contains sensitive personal and financial information. Handle
                  with care and do not share with unauthorized parties.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-cloud dark:border-nebula-purple/30 space-y-2">
              <button
                onClick={() => onDownload(doc)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download {doc.formType}
              </button>
              <button
                onClick={() => window.open(doc.fileUrl, '_blank')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-twilight dark:text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Detail Item ────────────────────────────────────────────────────────────────

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="px-2.5 py-2 bg-pearl/50 dark:bg-deep-cosmos/30 rounded-lg">
    <p className="text-[9px] text-silver-mist uppercase">{label}</p>
    <p className="text-xs font-medium text-ink-black dark:text-pearl capitalize">{value}</p>
  </div>
);

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default TaxDocumentViewer;
