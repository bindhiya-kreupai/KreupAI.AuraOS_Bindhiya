/**
 * @module TaxDocumentsList
 * @description Tax documents list grouped by year with W-2, 1099, Form 16 support
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Landmark,
  Receipt,
  Filter,
} from 'lucide-react';
import type { TaxRegion } from './TaxYearSelector';

// ── Types ──────────────────────────────────────────────────────────────────────

export type TaxFormType =
  | 'W-2'
  | '1099-NEC'
  | '1099-MISC'
  | '1099-INT'
  | '1099-DIV'
  | 'Form 16'
  | 'Form 16A'
  | 'Form 26AS';

export type TaxDocumentStatus = 'available' | 'pending' | 'corrected' | 'amended';

export interface TaxDocument {
  id: string;
  formType: TaxFormType;
  title: string;
  taxYear: string;
  issuer: string;
  issuerType: 'employer' | 'bank' | 'broker' | 'government' | 'other';
  issueDate: string;
  fileUrl: string;
  fileFormat: 'pdf';
  fileSize: number;
  status: TaxDocumentStatus;
  isNew: boolean;
  corrections?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_US_DOCUMENTS: TaxDocument[] = [
  // 2025
  {
    id: 'tx-001',
    formType: 'W-2',
    title: 'Wage and Tax Statement',
    taxYear: '2025',
    issuer: 'AuraOS Inc.',
    issuerType: 'employer',
    issueDate: '2026-01-28',
    fileUrl: '/tax-docs/w2-2025.pdf',
    fileFormat: 'pdf',
    fileSize: 245760,
    status: 'available',
    isNew: true,
  },
  {
    id: 'tx-002',
    formType: '1099-INT',
    title: 'Interest Income',
    taxYear: '2025',
    issuer: 'Chase Bank',
    issuerType: 'bank',
    issueDate: '2026-01-31',
    fileUrl: '/tax-docs/1099int-2025.pdf',
    fileFormat: 'pdf',
    fileSize: 122880,
    status: 'available',
    isNew: true,
  },
  {
    id: 'tx-003',
    formType: '1099-DIV',
    title: 'Dividend Income',
    taxYear: '2025',
    issuer: 'Vanguard',
    issuerType: 'broker',
    issueDate: '2026-02-10',
    fileUrl: '/tax-docs/1099div-2025.pdf',
    fileFormat: 'pdf',
    fileSize: 184320,
    status: 'available',
    isNew: false,
  },
  {
    id: 'tx-004',
    formType: '1099-NEC',
    title: 'Freelance Consulting',
    taxYear: '2025',
    issuer: 'TechCorp LLC',
    issuerType: 'other',
    issueDate: '2026-01-25',
    fileUrl: '/tax-docs/1099nec-2025.pdf',
    fileFormat: 'pdf',
    fileSize: 102400,
    status: 'available',
    isNew: false,
  },
  // 2024
  {
    id: 'tx-005',
    formType: 'W-2',
    title: 'Wage and Tax Statement',
    taxYear: '2024',
    issuer: 'AuraOS Inc.',
    issuerType: 'employer',
    issueDate: '2025-01-27',
    fileUrl: '/tax-docs/w2-2024.pdf',
    fileFormat: 'pdf',
    fileSize: 235520,
    status: 'available',
    isNew: false,
  },
  {
    id: 'tx-006',
    formType: 'W-2',
    title: 'Wage and Tax Statement (Corrected)',
    taxYear: '2024',
    issuer: 'AuraOS Inc.',
    issuerType: 'employer',
    issueDate: '2025-03-15',
    fileUrl: '/tax-docs/w2c-2024.pdf',
    fileFormat: 'pdf',
    fileSize: 240640,
    status: 'corrected',
    isNew: false,
    corrections: 'Social Security wages corrected',
  },
  {
    id: 'tx-007',
    formType: '1099-INT',
    title: 'Interest Income',
    taxYear: '2024',
    issuer: 'Chase Bank',
    issuerType: 'bank',
    issueDate: '2025-01-30',
    fileUrl: '/tax-docs/1099int-2024.pdf',
    fileFormat: 'pdf',
    fileSize: 118784,
    status: 'available',
    isNew: false,
  },
  {
    id: 'tx-008',
    formType: '1099-MISC',
    title: 'Miscellaneous Income',
    taxYear: '2024',
    issuer: 'Acme Corp',
    issuerType: 'other',
    issueDate: '2025-02-05',
    fileUrl: '/tax-docs/1099misc-2024.pdf',
    fileFormat: 'pdf',
    fileSize: 133120,
    status: 'available',
    isNew: false,
  },
  // 2023
  {
    id: 'tx-009',
    formType: 'W-2',
    title: 'Wage and Tax Statement',
    taxYear: '2023',
    issuer: 'AuraOS Inc.',
    issuerType: 'employer',
    issueDate: '2024-01-29',
    fileUrl: '/tax-docs/w2-2023.pdf',
    fileFormat: 'pdf',
    fileSize: 228352,
    status: 'available',
    isNew: false,
  },
  {
    id: 'tx-010',
    formType: '1099-INT',
    title: 'Interest Income',
    taxYear: '2023',
    issuer: 'Wells Fargo',
    issuerType: 'bank',
    issueDate: '2024-01-31',
    fileUrl: '/tax-docs/1099int-2023.pdf',
    fileFormat: 'pdf',
    fileSize: 110592,
    status: 'available',
    isNew: false,
  },
];

const MOCK_INDIA_DOCUMENTS: TaxDocument[] = [
  // FY 2025-26
  {
    id: 'in-001',
    formType: 'Form 16',
    title: 'TDS Certificate on Salary',
    taxYear: '2025-26',
    issuer: 'AuraOS India Pvt Ltd',
    issuerType: 'employer',
    issueDate: '2026-06-15',
    fileUrl: '/tax-docs/form16-2025-26.pdf',
    fileFormat: 'pdf',
    fileSize: 512000,
    status: 'pending',
    isNew: false,
  },
  // FY 2024-25
  {
    id: 'in-002',
    formType: 'Form 16',
    title: 'TDS Certificate on Salary',
    taxYear: '2024-25',
    issuer: 'AuraOS India Pvt Ltd',
    issuerType: 'employer',
    issueDate: '2025-06-12',
    fileUrl: '/tax-docs/form16-2024-25.pdf',
    fileFormat: 'pdf',
    fileSize: 496640,
    status: 'available',
    isNew: true,
  },
  {
    id: 'in-003',
    formType: 'Form 16A',
    title: 'TDS on Fixed Deposit Interest',
    taxYear: '2024-25',
    issuer: 'HDFC Bank',
    issuerType: 'bank',
    issueDate: '2025-05-30',
    fileUrl: '/tax-docs/form16a-fd-2024-25.pdf',
    fileFormat: 'pdf',
    fileSize: 204800,
    status: 'available',
    isNew: true,
  },
  {
    id: 'in-004',
    formType: 'Form 26AS',
    title: 'Annual Tax Statement',
    taxYear: '2024-25',
    issuer: 'Income Tax Department',
    issuerType: 'government',
    issueDate: '2025-07-01',
    fileUrl: '/tax-docs/form26as-2024-25.pdf',
    fileFormat: 'pdf',
    fileSize: 716800,
    status: 'available',
    isNew: false,
  },
  // FY 2023-24
  {
    id: 'in-005',
    formType: 'Form 16',
    title: 'TDS Certificate on Salary',
    taxYear: '2023-24',
    issuer: 'AuraOS India Pvt Ltd',
    issuerType: 'employer',
    issueDate: '2024-06-10',
    fileUrl: '/tax-docs/form16-2023-24.pdf',
    fileFormat: 'pdf',
    fileSize: 481280,
    status: 'available',
    isNew: false,
  },
  {
    id: 'in-006',
    formType: 'Form 26AS',
    title: 'Annual Tax Statement',
    taxYear: '2023-24',
    issuer: 'Income Tax Department',
    issuerType: 'government',
    issueDate: '2024-07-05',
    fileUrl: '/tax-docs/form26as-2023-24.pdf',
    fileFormat: 'pdf',
    fileSize: 696320,
    status: 'available',
    isNew: false,
  },
  {
    id: 'in-007',
    formType: 'Form 16A',
    title: 'TDS on Rent',
    taxYear: '2023-24',
    issuer: 'ABC Realty',
    issuerType: 'other',
    issueDate: '2024-05-25',
    fileUrl: '/tax-docs/form16a-rent-2023-24.pdf',
    fileFormat: 'pdf',
    fileSize: 184320,
    status: 'available',
    isNew: false,
  },
];

// ── Issuer Icon ────────────────────────────────────────────────────────────────

function getIssuerIcon(type: TaxDocument['issuerType']) {
  switch (type) {
    case 'employer':
      return Building2;
    case 'bank':
      return Landmark;
    case 'government':
      return Receipt;
    default:
      return FileText;
  }
}

// ── Status Badge ───────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: TaxDocumentStatus }> = ({ status }) => {
  const config: Record<
    TaxDocumentStatus,
    { icon: typeof CheckCircle2; color: string; label: string }
  > = {
    available: {
      icon: CheckCircle2,
      color: 'text-neural-mint bg-neural-mint/10',
      label: 'Available',
    },
    pending: { icon: Clock, color: 'text-sunset-amber bg-sunset-amber/10', label: 'Pending' },
    corrected: {
      icon: AlertTriangle,
      color: 'text-quantum-rose bg-quantum-rose/10',
      label: 'Corrected',
    },
    amended: {
      icon: AlertTriangle,
      color: 'text-celestial-indigo bg-celestial-indigo/10',
      label: 'Amended',
    },
  };
  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.color}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
};

// ── Form Type Badge ────────────────────────────────────────────────────────────

const FormBadge: React.FC<{ formType: TaxFormType }> = ({ formType }) => {
  const colorMap: Record<string, string> = {
    'W-2': 'bg-celestial-indigo/10 text-celestial-indigo border-celestial-indigo/20',
    1099: 'bg-quantum-rose/10 text-quantum-rose border-quantum-rose/20',
    'Form 16': 'bg-neural-mint/10 text-neural-mint border-neural-mint/20',
    'Form 16A': 'bg-sunset-amber/10 text-sunset-amber border-sunset-amber/20',
    'Form 26AS': 'bg-nebula-purple/10 text-nebula-purple border-nebula-purple/20',
  };
  const key = formType.startsWith('1099') ? '1099' : formType;
  const color = colorMap[key] || 'bg-pearl text-silver-mist border-cloud';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${color}`}
    >
      {formType}
    </span>
  );
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface TaxDocumentsListProps {
  selectedYear: string;
  region: TaxRegion;
  onSelectDocument: (doc: TaxDocument) => void;
  onDownload: (doc: TaxDocument) => void;
  selectedDocumentId?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const TaxDocumentsList: React.FC<TaxDocumentsListProps> = ({
  selectedYear,
  region,
  onSelectDocument,
  onDownload,
  selectedDocumentId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const allDocuments = region === 'india' ? MOCK_INDIA_DOCUMENTS : MOCK_US_DOCUMENTS;

  // Filter by year
  const yearDocuments = useMemo(() => {
    let docs = allDocuments.filter((d) => d.taxYear === selectedYear);

    if (formTypeFilter !== 'all') {
      docs = docs.filter((d) => d.formType === formTypeFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.issuer.toLowerCase().includes(q) ||
          d.formType.toLowerCase().includes(q)
      );
    }

    return docs;
  }, [allDocuments, selectedYear, formTypeFilter, searchQuery]);

  // Available form types for filter
  const availableFormTypes = useMemo(() => {
    const yearDocs = allDocuments.filter((d) => d.taxYear === selectedYear);
    const types = new Set(yearDocs.map((d) => d.formType));
    return Array.from(types);
  }, [allDocuments, selectedYear]);

  // Group by form type
  const groupedDocs = useMemo(() => {
    const groups: Record<string, TaxDocument[]> = {};
    for (const doc of yearDocuments) {
      const key = doc.formType.startsWith('1099') ? '1099 Forms' : doc.formType;
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    }
    return groups;
  }, [yearDocuments]);

  const _formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tax documents..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-pearl dark:bg-stellar-blue rounded-xl border border-transparent hover:border-celestial-indigo/30 focus:border-celestial-indigo focus:outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl border transition-colors ${
            formTypeFilter !== 'all'
              ? 'bg-celestial-indigo/10 border-celestial-indigo/30 text-celestial-indigo'
              : 'bg-pearl dark:bg-stellar-blue border-transparent text-silver-mist'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Form Type Filter */}
      {showFilters && availableFormTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFormTypeFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors ${
              formTypeFilter === 'all'
                ? 'bg-celestial-indigo text-white'
                : 'bg-pearl dark:bg-deep-cosmos text-silver-mist hover:text-twilight'
            }`}
          >
            All
          </button>
          {availableFormTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFormTypeFilter(type)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                formTypeFilter === type
                  ? 'bg-celestial-indigo text-white'
                  : 'bg-pearl dark:bg-deep-cosmos text-silver-mist hover:text-twilight'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Document List */}
      {yearDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-silver-mist/20 mb-3" />
          <p className="text-sm text-silver-mist font-medium">
            No tax documents for {selectedYear}
          </p>
          <p className="text-[10px] text-silver-mist/60 mt-1">
            Documents will appear here when issued by your employer or financial institutions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedDocs).map(([group, docs]) => (
            <div key={group}>
              <h3 className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-2 px-1">
                {group} ({docs.length})
              </h3>
              <div className="space-y-2">
                {docs.map((doc) => {
                  const IssuerIcon = getIssuerIcon(doc.issuerType);
                  const isSelected = selectedDocumentId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group ${
                        isSelected
                          ? 'bg-celestial-indigo/5 dark:bg-celestial-indigo/10 border-celestial-indigo/30'
                          : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/20 hover:shadow-sm'
                      }`}
                    >
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-pearl dark:bg-deep-cosmos shrink-0">
                        <IssuerIcon className="w-4 h-4 text-celestial-indigo" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <FormBadge formType={doc.formType} />
                          {doc.isNew && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-quantum-rose text-white rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                          {doc.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-silver-mist truncate">{doc.issuer}</p>
                          <span className="text-[10px] text-silver-mist">·</span>
                          <p className="text-[10px] text-silver-mist">
                            {new Date(doc.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                        {doc.corrections && (
                          <p className="text-[10px] text-quantum-rose mt-0.5">
                            Correction: {doc.corrections}
                          </p>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={doc.status} />
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDocument(doc);
                            }}
                            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-silver-mist" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(doc);
                            }}
                            className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5 text-silver-mist" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {yearDocuments.length > 0 && (
        <div className="flex items-center justify-between px-1 pt-2 border-t border-cloud/50 dark:border-nebula-purple/20">
          <p className="text-[10px] text-silver-mist">
            {yearDocuments.length} document{yearDocuments.length !== 1 ? 's' : ''} for{' '}
            {selectedYear}
          </p>
          <button
            onClick={() => yearDocuments.forEach((doc) => onDownload(doc))}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-celestial-indigo hover:underline"
          >
            <Download className="w-3 h-3" />
            Download all
          </button>
        </div>
      )}
    </div>
  );
};

export default TaxDocumentsList;
