/**
 * @module ReportBuilder
 * @description Report builder with template selector, parameter form, preview, and generation.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Star,
  StarOff,
  Download,
  Mail,
  Eye,
  Loader2,
  CheckCircle,
  FileText,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  ShieldCheck,
  Filter,
  Calendar,
} from 'lucide-react';
import {
  ReportGenerationService,
  CATEGORY_META,
  type ReportTemplate,
  type ReportCategory,
  type ReportFormat,
  type GeneratedReport,
  type ReportPreviewData,
} from '@/services/reportGenerationService';

// ── Icons ─────────────────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: ReportCategory }) {
  switch (category) {
    case 'hr':
      return <Users className="w-4 h-4" />;
    case 'payroll':
      return <DollarSign className="w-4 h-4" />;
    case 'attendance':
      return <Clock className="w-4 h-4" />;
    case 'compliance':
      return <ShieldCheck className="w-4 h-4" />;
    case 'analytics':
      return <BarChart3 className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

// ── Template Card ─────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: ReportTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

function TemplateCard({ template, isSelected, onSelect, onToggleFavorite }: TemplateCardProps) {
  const meta = CATEGORY_META[template.category];
  return (
    <div
      className={`relative rounded-xl border p-3.5 cursor-pointer transition-all ${
        isSelected
          ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10 shadow-sm'
          : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40 hover:shadow-sm bg-white dark:bg-stellar-blue'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg ${meta.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
        >
          <span className={meta.color}>
            <CategoryIcon category={template.category} />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-black dark:text-pearl leading-snug">
            {template.name}
          </p>
          <p className="text-[11px] text-silver-mist mt-0.5 line-clamp-2">{template.description}</p>
          {template.lastGenerated && (
            <p className="text-[10px] text-silver-mist/60 mt-1">
              Last: {new Date(template.lastGenerated).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-1 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          aria-label={template.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {template.isFavorite ? (
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          ) : (
            <StarOff className="w-3.5 h-3.5 text-silver-mist" />
          )}
        </button>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-4 h-4 text-celestial-indigo" />
        </div>
      )}
    </div>
  );
}

// ── Preview Table ─────────────────────────────────────────────────────────────

function PreviewTable({ preview }: { preview: ReportPreviewData }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-cloud dark:border-nebula-purple/30">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-pearl dark:bg-deep-cosmos/60">
              {preview.columns.map((col) => (
                <th
                  key={col.field}
                  className="px-3 py-2 text-left font-semibold text-silver-mist uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-cloud/50 dark:border-nebula-purple/20 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30"
              >
                {preview.columns.map((col) => (
                  <td key={col.field} className="px-3 py-2 text-ink-black dark:text-pearl">
                    {col.type === 'currency'
                      ? `$${Number(row[col.field]).toLocaleString()}`
                      : String(row[col.field] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview.sampleNote && (
        <p className="text-[11px] text-silver-mist mt-2 italic">{preview.sampleNote}</p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ReportBuilderProps {
  onReportGenerated?: (report: GeneratedReport) => void;
}

const CATEGORIES: { value: ReportCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Reports' },
  { value: 'hr', label: 'HR' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'analytics', label: 'Analytics' },
];

export function ReportBuilder({ onReportGenerated }: ReportBuilderProps) {
  const [step, setStep] = useState<'select' | 'configure' | 'preview' | 'success'>('select');
  const [activeCategory, setActiveCategory] = useState<ReportCategory | 'all'>('all');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [preview, setPreview] = useState<ReportPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  // Form state
  const [dateStart, setDateStart] = useState('2026-01-01');
  const [dateEnd, setDateEnd] = useState('2026-01-31');
  const [format, setFormat] = useState<ReportFormat>('excel');
  const [title, setTitle] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  // Load templates
  useEffect(() => {
    setIsLoading(true);
    ReportGenerationService.getAvailableReports()
      .then(setTemplates)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTemplates =
    activeCategory === 'all' ? templates : templates.filter((t) => t.category === activeCategory);

  const favoriteTemplates = templates.filter((t) => t.isFavorite);

  const handleSelectTemplate = async (tpl: ReportTemplate) => {
    setSelectedTemplate(tpl);
    setFormat(tpl.defaultFormat);
    setTitle('');
    setStep('configure');

    // Load preview
    const previewData = await ReportGenerationService.getReportPreview(tpl.id);
    setPreview(previewData);
  };

  const handleToggleFavorite = async (tpl: ReportTemplate) => {
    await ReportGenerationService.toggleFavorite(tpl.id);
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const report = await ReportGenerationService.generateReport({
        templateId: selectedTemplate.id,
        dateRange: selectedTemplate.supportsDateRange
          ? { start: dateStart, end: dateEnd }
          : undefined,
        format,
        title: title || undefined,
      });
      setGeneratedReport(report);
      setStep('success');
      onReportGenerated?.(report);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-silver-mist">
        {(['select', 'configure', 'preview'] as const).map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => s !== step && step !== 'success' && setStep(s)}
              className={`font-medium capitalize ${
                step === s
                  ? 'text-celestial-indigo'
                  : i < ['select', 'configure', 'preview'].indexOf(step)
                    ? 'text-emerald-500'
                    : 'text-silver-mist'
              }`}
            >
              {i + 1}.{' '}
              {s === 'select'
                ? 'Choose Template'
                : s === 'configure'
                  ? 'Configure'
                  : 'Preview & Generate'}
            </button>
            {i < 2 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {step === 'select' && (
        <div className="space-y-5">
          {/* Favorites */}
          {favoriteTemplates.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Favorites
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favoriteTemplates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    isSelected={selectedTemplate?.id === tpl.id}
                    onSelect={() => handleSelectTemplate(tpl)}
                    onToggleFavorite={() => handleToggleFavorite(tpl)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div>
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeCategory === cat.value
                      ? 'bg-celestial-indigo text-white'
                      : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos hover:text-ink-black dark:hover:text-pearl'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTemplates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    isSelected={selectedTemplate?.id === tpl.id}
                    onSelect={() => handleSelectTemplate(tpl)}
                    onToggleFavorite={() => handleToggleFavorite(tpl)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && selectedTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parameters form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-5">
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
                Report Parameters
              </h3>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-silver-mist mb-1.5">
                  Report Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${selectedTemplate.name} — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 focus:border-celestial-indigo"
                />
              </div>

              {/* Date Range */}
              {selectedTemplate.supportsDateRange && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-silver-mist mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-silver-mist mb-1">From</label>
                      <input
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 focus:border-celestial-indigo"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-silver-mist mb-1">To</label>
                      <input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 focus:border-celestial-indigo"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Format */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-silver-mist mb-1.5 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Output Format
                </label>
                <div className="flex items-center gap-2">
                  {selectedTemplate.availableFormats.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        format === fmt
                          ? 'bg-celestial-indigo text-white border-celestial-indigo'
                          : 'border-cloud dark:border-nebula-purple/40 text-silver-mist hover:border-celestial-indigo/40'
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email delivery */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-cloud dark:border-nebula-purple/40 text-celestial-indigo"
                  />
                  <span className="text-xs font-medium text-ink-black dark:text-pearl flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-silver-mist" />
                    Email report when ready
                  </span>
                </label>
                {sendEmail && (
                  <input
                    type="email"
                    value={deliveryEmail}
                    onChange={(e) => setDeliveryEmail(e.target.value)}
                    placeholder="recipient@company.com"
                    className="mt-2 ml-6 w-64 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
                  />
                )}
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-5">
                <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-silver-mist" />
                  Data Preview
                </h3>
                <PreviewTable preview={preview} />
              </div>
            )}
          </div>

          {/* Template info & actions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4">
              <div
                className={`w-10 h-10 rounded-xl ${CATEGORY_META[selectedTemplate.category].bgColor} flex items-center justify-center mb-3`}
              >
                <span className={CATEGORY_META[selectedTemplate.category].color}>
                  <CategoryIcon category={selectedTemplate.category} />
                </span>
              </div>
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                {selectedTemplate.name}
              </h3>
              <p className="text-xs text-silver-mist mt-1">{selectedTemplate.description}</p>

              {selectedTemplate.estimatedRows !== undefined &&
                selectedTemplate.estimatedRows > 0 && (
                  <p className="text-xs text-silver-mist mt-2">
                    ~{selectedTemplate.estimatedRows} rows expected
                  </p>
                )}

              {selectedTemplate.sampleColumns.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-silver-mist mb-1.5">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.sampleColumns.map((col) => (
                      <span
                        key={col}
                        className="text-[10px] px-1.5 py-0.5 bg-pearl dark:bg-deep-cosmos text-silver-mist rounded"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
              <button
                onClick={() => setStep('select')}
                className="w-full px-4 py-2.5 text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
              >
                Choose Different Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && generatedReport && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
            Report is being generated
          </h3>
          <p className="text-sm text-silver-mist mt-2 max-w-sm">
            <span className="font-medium text-ink-black dark:text-pearl">
              {generatedReport.title}
            </span>{' '}
            is being prepared in the background. You&apos;ll find it in Report History when ready.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => {
                setStep('select');
                setSelectedTemplate(null);
                setGeneratedReport(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-celestial-indigo border border-celestial-indigo rounded-lg hover:bg-celestial-indigo/5 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportBuilder;
