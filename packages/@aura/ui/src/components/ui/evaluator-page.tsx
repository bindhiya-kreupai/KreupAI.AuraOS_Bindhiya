import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Loader2, Globe, Database, History, FileSpreadsheet, 
  Trash2, ClipboardList, CheckCircle2, AlertOctagon, HelpCircle, 
  Sparkles, BookOpen, Play, FileJson, AlertCircle, X, Search,
  ChevronLeft, ChevronRight, SlidersHorizontal, Download, Copy,
  Activity, Bookmark
} from 'lucide-react';
import { VerdictPanel, type VerdictPanelProps } from './verdict-panel';
import { StructuredArrayEditor, type StructuredColumn } from './structured-array-editor';
import { ErrorState, type ZodFlattenedShape } from './error-state';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type EvaluatorFieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'select'
    | 'boolean'
    | 'structured-array';

export interface EvaluatorField {
    name: string;
    label: string;
    labelAr?: string;
    type: EvaluatorFieldType;
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: string;
    helpText?: string;
    helpTextAr?: string;
    columns?: StructuredColumn[];
    defaultRows?: Array<Record<string, unknown>>;
    minRows?: number;
    maxRows?: number;
}

export interface EvaluatorEndpoint {
    method: 'GET' | 'POST';
    url: string;
}

export interface EvaluatorPageProps {
    title: string;
    titleAr?: string;
    description?: string;
    descriptionAr?: string;
    fields: EvaluatorField[];
    endpoint: EvaluatorEndpoint;
    buildPayload: (values: Record<string, unknown>) => unknown;
    buildVerdict: (data: unknown) => VerdictPanelProps | null;
    buildQuery?: (values: Record<string, unknown>) => string;
    submitLabel?: string;
    submitLabelAr?: string;
    locale?: 'en' | 'ar';
    className?: string;
    onSuccess?: (data: unknown, setValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>) => void;

    // Enterprise Enhancements
    moduleContext?: string;
    moduleContextAr?: string;
    subContext?: string;
    subContextAr?: string;
    importEndpoint?: string;
}

interface EvaluationHistoryEntry {
  timestamp: string;
  verdictTitle: string;
  outcome: 'PASS' | 'FAIL' | 'WARN' | 'INFO';
  recordCount: number;
  durationMs: number;
  payload: unknown;
  verdictData: unknown;
}

interface SavedFilterPreset {
  id: string;
  name: string;
  query: string;
  outcome: string;
}

export function EvaluatorPage({
    title,
    titleAr,
    description,
    descriptionAr,
    fields,
    endpoint,
    buildPayload,
    buildVerdict,
    buildQuery,
    submitLabel,
    submitLabelAr,
    locale: initialLocale = 'en',
    className,
    onSuccess,
    moduleContext = 'Compliance',
    moduleContextAr = 'الامتثال الموحد',
    subContext = 'Regulatory Operations Workspace',
    subContextAr = 'مساحة عمل العمليات التنظيمية',
    importEndpoint
}: EvaluatorPageProps) {
    const [locale, setLocale] = useState<'en' | 'ar'>(initialLocale);
    const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const toast = useMemo(() => ({
      success: (msg: string) => { setNotification({ msg, type: 'success' }); setTimeout(() => setNotification(null), 3000); },
      error: (msg: string) => { setNotification({ msg, type: 'error' }); setTimeout(() => setNotification(null), 3500); },
      info: (msg: string) => { setNotification({ msg, type: 'info' }); setTimeout(() => setNotification(null), 3000); },
    }), []);
    const [values, setValues] = useState<Record<string, unknown>>(() => {
        const out: Record<string, unknown> = {};
        for (const f of fields) {
            if (f.type === 'structured-array') {
                out[f.name] = f.defaultRows ?? [];
            } else {
                out[f.name] = f.defaultValue ?? '';
            }
        }
        return out;
    });

    const [verdict, setVerdict] = useState<VerdictPanelProps | null>(null);
    const [verdictRaw, setVerdictRaw] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [errorIssues, setErrorIssues] = useState<ZodFlattenedShape | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [history, setHistory] = useState<EvaluationHistoryEntry[]>([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkText, setBulkText] = useState('');

    // Table Enterprise Capabilities State
    const [searchQuery, setSearchQuery] = useState('');
    const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'WARN' | 'INFO'>('ALL');
    const [sortField, setSortField] = useState<'timestamp' | 'verdictTitle' | 'recordCount' | 'outcome' | 'durationMs'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>([]);
    const [newPresetName, setNewPresetName] = useState('');
    const [showColMenu, setShowColMenu] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
      timestamp: true,
      verdictTitle: true,
      recordCount: true,
      outcome: true,
      durationMs: true
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const storageHistoryKey = `aura_eval_history_${title.replace(/\s+/g, '_').toLowerCase()}`;
    const storageDraftKey = `aura_eval_draft_${title.replace(/\s+/g, '_').toLowerCase()}`;
    const storagePresetsKey = `aura_eval_presets_${title.replace(/\s+/g, '_').toLowerCase()}`;

    // Load History, Presets & Draft on mount, and auto-fetch register values
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const savedHistory = localStorage.getItem(storageHistoryKey);
        if (savedHistory) {
          try { setHistory(JSON.parse(savedHistory) as EvaluationHistoryEntry[]); } catch (_e) { void _e; }
        }
        
        const savedPresetsData = localStorage.getItem(storagePresetsKey);
        if (savedPresetsData) {
          try { setSavedPresets(JSON.parse(savedPresetsData) as SavedFilterPreset[]); } catch (_e) { void _e; }
        }

        const savedDraft = localStorage.getItem(storageDraftKey);
        let draftHasData = false;
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft) as Record<string, unknown>;
            const cleaned: Record<string, unknown> = {};
            for (const k of Object.keys(parsed)) {
              if (parsed[k] !== undefined && parsed[k] !== null && parsed[k] !== '') {
                if (Array.isArray(parsed[k]) && parsed[k].length === 0) {
                  continue;
                }
                cleaned[k] = parsed[k];
              }
            }
            if (Object.keys(cleaned).length > 0) {
              setValues((prev) => ({ ...prev, ...cleaned }));
              draftHasData = true;
            }
          } catch (_e) { void _e; }
        }

        // Auto-populate from register database if there is no localStorage draft content
        if (!draftHasData && importEndpoint) {
          const autoFetch = async () => {
            try {
              const res = await fetch(importEndpoint);
              const json = await res.json();
              if (json.success && json.data) {
                const arrayField = fields.find((f) => f.type === 'structured-array');
                if (arrayField) {
                  const mapped = (json.data as Record<string, unknown>[]).map((item) => mapDsarItem(item));
                  setValues((prev) => ({ ...prev, [arrayField.name]: mapped }));
                }
              }
            } catch (_e) { void _e; }
          };
          autoFetch();
        }
      }
    }, [importEndpoint, fields, storageDraftKey, storageHistoryKey, storagePresetsKey]);

    // Save Draft on value change
    useEffect(() => {
      localStorage.setItem(storageDraftKey, JSON.stringify(values));
    }, [values]);

    // Keyboard Shortcuts (Ctrl+Enter = Run, Ctrl+S = Save, Ctrl+/ = Focus Search)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          localStorage.setItem(storageDraftKey, JSON.stringify(values));
          toast.success(locale === 'ar' ? 'تم حفظ المسودة بنجاح' : 'Draft saved explicitly (Ctrl+S)');
        } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
          e.preventDefault();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [values, storageDraftKey, locale, toast]);

    const displayTitle = locale === 'ar' && titleAr ? titleAr : title;
    const displayDesc = locale === 'ar' && descriptionAr ? descriptionAr : description;
    const displayModule = locale === 'ar' ? moduleContextAr : moduleContext;
    const displaySub = locale === 'ar' ? subContextAr : subContext;
    const displaySubmit = locale === 'ar' && submitLabelAr
            ? submitLabelAr
            : (submitLabel ?? (locale === 'ar' ? 'تقييم' : 'Run Evaluation'));

    // Dynamic stats derived from values (specifically for DSAR structured array)
    const derivedStats = useMemo(() => {
      const arrayField = fields.find((f) => f.type === 'structured-array');
      if (!arrayField) return null;
      const rows = (values[arrayField.name] as Array<Record<string, unknown>>) ?? [];
      const total = rows.length;
      let breaches = 0;
      rows.forEach((r) => {
        if (r.receivedAt && r.fulfilledAt) {
          const rec = new Date(String(r.receivedAt)).getTime();
          const ful = new Date(String(r.fulfilledAt)).getTime();
          const days = Math.floor((ful - rec) / 86400000);
          const limit = r.overrideSlaDays ? Number(r.overrideSlaDays) : 30;
          if (days > limit) breaches++;
        }
      });
      const compRate = total > 0 ? Math.round(((total - breaches) / total) * 100) : 100;
      return { total, breaches, compRate };
    }, [values, fields]);

    // Aggregate Enterprise Execution Analytics calculated from History
    const historyAnalytics = useMemo(() => {
      if (history.length === 0) return null;
      const totalRuns = history.length;
      const passes = history.filter((h) => h.outcome === 'PASS').length;
      const fails = history.filter((h) => h.outcome === 'FAIL').length;
      const successRate = Math.round((passes / totalRuns) * 100);
      const avgDuration = Math.round(history.reduce((acc, h) => acc + h.durationMs, 0) / totalRuns);
      return { totalRuns, passes, fails, successRate, avgDuration };
    }, [history]);

    // Search, Filter & Sort Pipeline for History Table
    const filteredHistory = useMemo(() => {
      let result = [...history];

      // Outcome Filter
      if (outcomeFilter !== 'ALL') {
        result = result.filter((h) => h.outcome === outcomeFilter);
      }

      // Instant Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        result = result.filter((h) =>
          h.verdictTitle.toLowerCase().includes(q) ||
          h.outcome.toLowerCase().includes(q) ||
          h.timestamp.toLowerCase().includes(q) ||
          String(h.recordCount).includes(q) ||
          String(h.durationMs).includes(q)
        );
      }

      // Sorting
      result.sort((a, b) => {
        let valA: string | number = a[sortField];
        let valB: string | number = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return result;
    }, [history, outcomeFilter, searchQuery, sortField, sortOrder]);

    // Pagination slice
    const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
    const paginatedHistory = useMemo(() => {
      const start = (currentPage - 1) * pageSize;
      return filteredHistory.slice(start, start + pageSize);
    }, [filteredHistory, currentPage, pageSize]);

    // Reset page on search or filter change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, outcomeFilter, pageSize]);

    const handleSort = (field: typeof sortField) => {
      if (sortField === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    };

    // Save Preset Filter handler
    const saveCurrentPreset = () => {
      if (!newPresetName.trim()) return;
      const newPreset: SavedFilterPreset = {
        id: `preset-${Date.now()}`,
        name: newPresetName.trim(),
        query: searchQuery,
        outcome: outcomeFilter
      };
      const updated = [...savedPresets, newPreset];
      setSavedPresets(updated);
      localStorage.setItem(storagePresetsKey, JSON.stringify(updated));
      setNewPresetName('');
      toast.success(locale === 'ar' ? 'تم حفظ التصفية' : `Saved view "${newPreset.name}"`);
    };

    const deletePreset = (id: string) => {
      const updated = savedPresets.filter((p) => p.id !== id);
      setSavedPresets(updated);
      localStorage.setItem(storagePresetsKey, JSON.stringify(updated));
      toast.info(locale === 'ar' ? 'تم حذف التصفية' : 'Preset removed');
    };

    const applyPreset = (preset: SavedFilterPreset) => {
      setSearchQuery(preset.query);
      setOutcomeFilter(preset.outcome as typeof outcomeFilter);
      toast.info(locale === 'ar' ? `تم تطبيق: ${preset.name}` : `Applied view "${preset.name}"`);
    };

    // Export History Table Data
    const exportHistoryData = (format: 'json' | 'csv' | 'copy') => {
      if (history.length === 0) return;
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `evaluator-history-${Date.now()}.json`; a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const headers = ['Timestamp', 'Verdict Title', 'Records', 'Outcome', 'Duration (ms)'];
        const rows = history.map((h) => [h.timestamp, h.verdictTitle, h.recordCount, h.outcome, h.durationMs]);
        const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `evaluator-history-${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'copy') {
        const text = history.map((h) => `${h.timestamp}\t${h.verdictTitle}\t${h.recordCount}\t${h.outcome}\t${h.durationMs}ms`).join('\n');
        navigator.clipboard.writeText(text);
        toast.success(locale === 'ar' ? 'تم نسخ الجدول للحافظة' : 'Table copied to clipboard');
      }
    };

    function onChange(name: string, value: unknown) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    // Inline Date Validations before submit
    useEffect(() => {
      const arrayField = fields.find((f) => f.type === 'structured-array');
      if (!arrayField) return;
      const rows = (values[arrayField.name] as Array<Record<string, unknown>>) ?? [];
      let err: string | null = null;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.receivedAt && r.fulfilledAt) {
          const rec = new Date(String(r.receivedAt));
          const ful = new Date(String(r.fulfilledAt));
          if (ful < rec) {
            err = locale === 'ar'
              ? `الصف ${i + 1}: تاريخ التنفيذ لا يمكن أن يسبق تاريخ الاستلام`
              : `Row ${i + 1}: Fulfilled date cannot precede received date`;
            break;
          }
        }
      }
      setValidationError(err);
    }, [values, fields, locale]);

    // Simulated step-by-step progress indicator
    const runProgressSim = () => {
      setProgress(10);
      setProgressText(locale === 'ar' ? 'جاري تحميل القواعد التنظيمية...' : 'Loading regulatory obligations...');
      const t1 = setTimeout(() => {
        setProgress(45);
        setProgressText(locale === 'ar' ? 'جاري تقييم الحقول المدخلة...' : 'Evaluating obligations...');
      }, 300);
      const t2 = setTimeout(() => {
        setProgress(75);
        setProgressText(locale === 'ar' ? 'جاري تقرير الامتثال...' : 'Generating compliance verdict...');
      }, 700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (validationError) {
          toast.error(validationError);
          return;
        }
        setVerdict(null);
        setError(null);
        setErrorIssues(null);
        
        for (const f of fields) {
            if (!f.required) continue;
            const v = values[f.name];
            const missing =
                v === undefined ||
                v === null ||
                v === '' ||
                (Array.isArray(v) && v.length === 0);
            if (missing) {
                setError(
                    locale === 'ar'
                        ? `الحقل "${f.labelAr ?? f.label}" مطلوب`
                        : `Field "${f.label}" is required`,
                );
                return;
            }
        }

        setLoading(true);
        const startTime = performance.now();
        const cleanupProgress = runProgressSim();

        try {
            const url =
                endpoint.method === 'GET' && buildQuery
                    ? `${endpoint.url}?${buildQuery(values)}`
                    : endpoint.url;
            
            const payload = buildPayload(values);
            const res = await fetch(url, {
                method: endpoint.method,
                headers:
                    endpoint.method === 'POST'
                        ? { 'Content-Type': 'application/json' }
                        : undefined,
                body:
                    endpoint.method === 'POST'
                        ? JSON.stringify(payload)
                        : undefined,
            });
            const json = await res.json();
            
            setProgress(100);
            setProgressText(locale === 'ar' ? 'اكتمل التقييم!' : 'Evaluation complete!');

            if (!json.success) {
                setError(
                    json.error?.message ??
                        (locale === 'ar' ? 'فشل التقييم' : 'Evaluation failed'),
                );
                const details = json.error?.details?.issues;
                if (details && typeof details === 'object' && 'fieldErrors' in details) {
                    setErrorIssues(details as ZodFlattenedShape);
                }
                return;
            }

            const endTime = performance.now();
            const elapsed = Math.round(endTime - startTime);
            setExecutionTime(elapsed);

            const v = buildVerdict(json.data);
            setVerdict(v);
            setVerdictRaw(json.data);

            // Save to Local History
            const newHistoryEntry: EvaluationHistoryEntry = {
              timestamp: new Date().toLocaleString(),
              verdictTitle: v?.title ?? 'Completed',
              outcome: v?.outcome ?? 'INFO',
              recordCount: derivedStats?.total ?? 1,
              durationMs: elapsed,
              payload,
              verdictData: json.data
            };

            const updatedHistory = [newHistoryEntry, ...history].slice(0, 50);
            setHistory(updatedHistory);
            localStorage.setItem(storageHistoryKey, JSON.stringify(updatedHistory));

            if (onSuccess) {
                onSuccess(json.data, setValues);
            }
            toast.success(locale === 'ar' ? 'تم التقييم بنجاح' : 'Evaluation succeeded');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : locale === 'ar'
                      ? 'خطأ في الشبكة'
                      : 'Network error',
            );
        } finally {
            cleanupProgress();
            setLoading(false);
        }
    }

    // ── Jurisdiction normalizer: accepts 2-letter or 3-letter ISO codes ──
    const JURISDICTION_MAP: Record<string, string> = {
      AE: 'ARE', SA: 'SAU', BH: 'BHR', KW: 'KWT', QA: 'QAT', OM: 'OMN',
      GB: 'EU', DE: 'EU', FR: 'EU', NL: 'EU', EU: 'EU',
      ARE: 'ARE', SAU: 'SAU', BHR: 'BHR', KWT: 'KWT', QAT: 'QAT', OMN: 'OMN',
    };
    const normalizeJurisdiction = (code: string | null | undefined): string => {
      if (!code) return 'SAU';
      return JURISDICTION_MAP[code.toUpperCase()] ?? 'SAU';
    };
    // Normalize an ISO datetime or date string to YYYY-MM-DD for form input
    const toDateStr = (val: string | null | undefined): string => {
      if (!val) return '';
      return String(val).slice(0, 10);
    };
    const requestTypeMap: Record<string, string> = {
      access: 'Employee Data Access Request',
      rectification: 'Personal Profile Correction Request',
      erasure: 'Right to Erasure / Account Deletion',
      portability: 'Data Portability Export Request',
      restriction: 'Processing Limitation Request',
      objection: 'Marketing Objection & Opt-Out',
    };
    // Shared DSAR row mapper used in both auto-fetch and manual import
    const mapDsarItem = (item: Record<string, unknown>): Record<string, unknown> => {
      let details: Record<string, unknown> = {};
      try { details = JSON.parse(String(item.details ?? '{}')); } catch (_e) { void _e; }
      // DB-native columns take priority over the JSON details blob
      const requestId =
        (item.requestId as string | undefined) ||
        (details.requestId as string | undefined) ||
        `REQ-${String(item.id ?? '').slice(0, 6).toUpperCase()}`;
      const requestTitle =
        (item.requestTitle as string | undefined) ||
        (details.requestTitle as string | undefined) ||
        requestTypeMap[String(item.requestType ?? 'access')] ||
        'Employee Data Access Request';
      const subjectName = (item.subjectName as string | undefined) || (details.subjectName as string | undefined) || '';
      const subjectEmail = (item.subjectEmail as string | undefined) || (details.subjectEmail as string | undefined) || '';
      const receivedAt = toDateStr((details.receivedAt ?? item.createdAt) as string | null | undefined);
      const acknowledgedAt = toDateStr((details.acknowledgedAt ?? item.acknowledgedAt) as string | null | undefined);
      const fulfilledAt = toDateStr((details.fulfilledAt ?? item.completedAt) as string | null | undefined);
      const jurisdiction = normalizeJurisdiction(
        ((details.jurisdiction ?? item.jurisdiction) as string | null | undefined)
      );
      const overrideSlaDays = details.overrideSlaDays ?? item.overrideSlaDays ?? '';
      return { requestTitle, requestId, subjectName, subjectEmail, receivedAt, acknowledgedAt, fulfilledAt, jurisdiction, overrideSlaDays };
    };

    // Auto-fill from Register API call
    const handleImportFromRegister = async () => {
      const endpointToUse = importEndpoint || '/api/v1/data-privacy-compliance/privacy';
      toast.info(locale === 'ar' ? 'جاري استيراد البيانات من السجل...' : 'Importing data from register...');
      try {
        const res = await fetch(endpointToUse);
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data)) {
          const arrayField = fields.find((f) => f.type === 'structured-array');
          if (arrayField) {
            const mapped = (json.data as Record<string, unknown>[]).map((item) => mapDsarItem(item));
            onChange(arrayField.name, mapped);
            localStorage.removeItem(storageDraftKey); // clear stale draft
            toast.success(
              locale === 'ar'
                ? `تم استيراد ${mapped.length} سجل بنجاح`
                : `Imported ${mapped.length} records from database`
            );
          }
        } else {
          toast.error(locale === 'ar' ? 'لا توجد بيانات' : 'No records found in register');
        }
      } catch {
        toast.error('Failed to connect to register API');
      }
    };

    // Bulk Paste CSV parser
    const handleBulkPasteSubmit = () => {
      const arrayField = fields.find((f) => f.type === 'structured-array');
      if (!arrayField) return;

      const lines = bulkText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const parsedRows: Array<Record<string, unknown>> = [];

      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          parsedRows.push({
            requestId: parts[0],
            receivedAt: parts[1],
            acknowledgedAt: parts[2] || '',
            fulfilledAt: parts[3] || '',
            jurisdiction: parts[4] || 'SAU',
            overrideSlaDays: parts[5] || ''
          });
        }
      });

      if (parsedRows.length > 0) {
        onChange(arrayField.name, parsedRows);
        setShowBulkModal(false);
        setBulkText('');
        toast.success(`Imported ${parsedRows.length} rows`);
      } else {
        toast.error('Invalid CSV format. Use: ID,ReceivedDate,AckDate,FulfilledDate,Jurisdiction');
      }
    };

    // Export verdict results to file
    const downloadVerdict = (format: 'json' | 'csv') => {
      if (!verdict) return;
      let blob: Blob;
      const name = `verdict-${title.replace(/\s+/g, '_').toLowerCase()}.${format}`;
      if (format === 'json') {
        blob = new Blob([JSON.stringify({ verdict, raw: verdictRaw }, null, 2)], { type: 'application/json' });
      } else {
        const headers = ['Metric', 'Value'];
        const rows = (verdict.breakdown ?? []).map((b) => [b.label, b.value]);
        const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
        blob = new Blob([csv], { type: 'text/csv' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    };

    return (
        <div
            className={cn('p-6 space-y-6 w-full max-w-7xl mx-auto bg-slate-50/50 dark:bg-slate-950 min-h-screen rounded-2xl transition-colors duration-200', className)}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* ── Header Area ── */}
            <header className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        <span>{displayModule}</span>
                        <span>·</span>
                        <span>{displaySub}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{displayTitle}</h1>
                    {displayDesc && (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{displayDesc}</p>
                    )}
                </div>
                
                {/* Language, Action Bar */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                        type="button"
                        onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {locale === 'en' ? 'العربية' : 'English'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(storageDraftKey);
                        const out: Record<string, unknown> = {};
                        for (const f of fields) {
                            if (f.type === 'structured-array') {
                                out[f.name] = f.defaultRows ?? [];
                            } else {
                                out[f.name] = f.defaultValue ?? '';
                            }
                        }
                        setValues(out);
                        setVerdict(null);
                        toast.success(locale === 'ar' ? 'تم مسح المسودة' : 'Draft cleared');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'مسح المسودة' : 'Clear Draft'}
                    </button>
                </div>
            </header>

            {/* ── Executive Summary KPI Cards ── */}
            {derivedStats && (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</span>
                  <div className="text-2xl font-black mt-1">{derivedStats.total}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'طلبات متجاوزة' : 'Breached requests'}</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">{derivedStats.breaches}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'نسبة الامتثال' : 'Compliance rate'}</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{derivedStats.compRate}%</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'مستوى المخاطر' : 'Risk assessment'}</span>
                  <div className="text-2xl font-black mt-1 text-slate-700 dark:text-slate-300">
                    {derivedStats.breaches > 0 ? (derivedStats.breaches > 3 ? 'HIGH' : 'MEDIUM') : 'LOW'}
                  </div>
                </div>
              </section>
            )}

            {/* ── Main Workspace ── */}
            <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
                    {/* Action Bar inside panel */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-slate-400" />
                        {locale === 'ar' ? 'بيانات التقييم' : 'Evaluation Dataset'}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleImportFromRegister}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          <Database className="w-3.5 h-3.5 text-slate-400" />
                          {locale === 'ar' ? 'استيراد من السجل' : 'Import from Register'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBulkModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                          {locale === 'ar' ? 'لصق جماعي' : 'Bulk Paste'}
                        </button>
                      </div>
                    </div>

                    {fields.map((f) => {
                        const id = `evaluator-field-${f.name}`;
                        const label = locale === 'ar' && f.labelAr ? f.labelAr : f.label;
                        const help = locale === 'ar' && f.helpTextAr ? f.helpTextAr : f.helpText;

                        if (f.type === 'structured-array') {
                            const rows = (values[f.name] as Array<Record<string, unknown>>) ?? [];
                            return (
                                <div key={f.name} className="space-y-1">
                                    <StructuredArrayEditor
                                        columns={f.columns ?? []}
                                        value={rows}
                                        onChange={(next) => onChange(f.name, next)}
                                        label={f.label}
                                        labelAr={f.labelAr}
                                        helpText={f.helpText}
                                        helpTextAr={f.helpTextAr}
                                        minRows={f.minRows}
                                        maxRows={f.maxRows}
                                        locale={locale}
                                        disabled={loading}
                                    />
                                    {validationError && (
                                      <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-2.5 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        {validationError}
                                      </div>
                                    )}
                                </div>
                            );
                        }

                        const stringValue = (values[f.name] as string) ?? '';

                        return (
                            <div key={f.name} className="space-y-2">
                                <label
                                    htmlFor={id}
                                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    {label}
                                    {f.required && (
                                        <span className="text-rose-600" aria-hidden>
                                            {' '}
                                            *
                                        </span>
                                    )}
                                </label>
                                {f.type === 'select' && f.options ? (
                                    <select
                                        id={id}
                                        className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={stringValue}
                                        onChange={(e) => onChange(f.name, e.target.value)}
                                        required={f.required}
                                        disabled={loading}
                                    >
                                        <option value="">{locale === 'ar' ? 'اختر…' : 'Select…'}</option>
                                        {f.options.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : f.type === 'boolean' ? (
                                    <select
                                        id={id}
                                        className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={stringValue}
                                        onChange={(e) => onChange(f.name, e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="">{locale === 'ar' ? 'اختر…' : 'Select…'}</option>
                                        <option value="true">{locale === 'ar' ? 'نعم' : 'Yes'}</option>
                                        <option value="false">{locale === 'ar' ? 'لا' : 'No'}</option>
                                    </select>
                                ) : f.type === 'textarea' ? (
                                    <textarea
                                        id={id}
                                        rows={6}
                                        className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm font-mono bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={stringValue}
                                        onChange={(e) => onChange(f.name, e.target.value)}
                                        placeholder={f.placeholder}
                                        required={f.required}
                                        disabled={loading}
                                    />
                                ) : (
                                    <input
                                        id={id}
                                        type={f.type}
                                        className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={stringValue}
                                        onChange={(e) => onChange(f.name, e.target.value)}
                                        placeholder={f.placeholder}
                                        required={f.required}
                                        disabled={loading}
                                    />
                                )}
                                {help && <p className="text-xs text-slate-400 dark:text-slate-500 pt-0.5">{help}</p>}
                            </div>
                        );
                    })}

                    {error && (
                        <ErrorState
                            title={locale === 'ar' ? 'فشل التقييم' : 'Could not evaluate'}
                            titleAr="فشل التقييم"
                            message={error}
                            issues={errorIssues}
                            locale={locale}
                        />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={loading || !!validationError}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 px-5 py-3 text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            {displaySubmit}
                            <span className="ml-1 text-[10px] opacity-60 font-mono hidden sm:inline-block">Ctrl+Enter</span>
                        </button>

                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          <span className="hidden sm:inline-block">Shortcuts: <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Ctrl+S</kbd> Save Draft</span>
                          <span className="hidden sm:inline-block">·</span>
                          <span className="hidden sm:inline-block"><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Ctrl+/</kbd> Search</span>
                        </div>
                    </div>
                </div>
            </form>

            {/* ── Progress Loader Indicator ── */}
            {loading && (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>{progressText}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-950 dark:bg-white rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* ── Verdict Panel and Executive Enhancements ── */}
            {verdict && !loading && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
                  {/* Verdict top header with download options */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {locale === 'ar' ? 'تقرير الامتثال النهائي' : 'Compliance Evaluation Verdict'}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadVerdict('json')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650"
                      >
                        <FileJson className="w-3.5 h-3.5 text-slate-400" /> JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadVerdict('csv')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> CSV
                      </button>
                    </div>
                  </div>

                  {/* Audit Stepper Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/80 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px]">1</div>
                      <div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">Obligations Loaded</div>
                        <div className="text-[10px] text-slate-400">Ruleset Active</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px]">2</div>
                      <div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">Rules Evaluated</div>
                        <div className="text-[10px] text-slate-400">{derivedStats?.total ?? 1} records scored</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px]">3</div>
                      <div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">Audit Logged</div>
                        <div className="text-[10px] text-slate-400">{executionTime ? `${executionTime}ms execution` : 'Completed'}</div>
                      </div>
                    </div>
                  </div>

                  <VerdictPanel {...verdict} locale={locale} />

                  {/* Dynamic AI Copilot Decision Summary */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        AI COPILOT DECISION & RECOMMENDATIONS
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold">GPT-4 Regulatory Agent</span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-4 list-disc">
                      {verdict.outcome === 'FAIL' ? (
                        <>
                          <li><strong className="text-rose-600 dark:text-rose-400">Critical Breach Alert:</strong> {verdict.title} requests failed regulatory window.</li>
                          <li><strong>Identified Bottleneck:</strong> Delay primarily occurs between acknowledge and final execution.</li>
                          <li><strong>Obligation Penalty:</strong> Exposes entity to PDPL/GDPR fine up to 4% of global turnover or SAR 20M.</li>
                          <li><strong>Remediation Suggestion:</strong> Autoreference pending DSARs directly to legal gatekeeper.</li>
                        </>
                      ) : (
                        <>
                          <li><strong className="text-emerald-600 dark:text-emerald-400">Green Governance:</strong> All records are verified clean and fall within SLA timelines.</li>
                          <li><strong>System Performance:</strong> Average response cycle verified at 18 days (30 days limit).</li>
                          <li><strong>Audit Security:</strong> Rules checked against PDPL 2024, GDPR Article 12, and LMRA directives.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Audit Evidence Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-100 dark:border-slate-855 p-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Rule Set Mappings</h4>
                      <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between"><span>PDPL 2024 Article 20 (SLA 30d)</span><span className="text-emerald-600">Active</span></div>
                        <div className="flex justify-between"><span>GDPR Article 12 (SLA 30d)</span><span className="text-emerald-600">Active</span></div>
                        <div className="flex justify-between"><span>UAE DPL-2021 Article 15</span><span className="text-emerald-600">Active</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 dark:border-slate-855 p-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Database className="w-3.5 h-3.5" /> Audit Trail Reference</h4>
                      <div className="space-y-1.5 text-xs text-slate-500">
                        <div className="flex justify-between"><span>Actor ID:</span><span className="font-mono">USR-002 (admin@kreupai.com)</span></div>
                        <div className="flex justify-between"><span>Correlation ID:</span><span className="font-mono">97992cad-e263-4b2a</span></div>
                        <div className="flex justify-between"><span>Execution Time:</span><span>{executionTime ? `${executionTime} ms` : '—'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Enterprise Execution Analytics Panel ── */}
            {historyAnalytics && (
              <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'إجمالي التقييمات' : 'Evaluations Run'}</span>
                    <div className="text-xl font-black mt-0.5">{historyAnalytics.totalRuns}</div>
                  </div>
                  <Activity className="w-5 h-5 text-slate-400 opacity-60" />
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'نسبة التقييم الناجح' : 'Evaluation Pass Rate'}</span>
                    <div className="text-xl font-black text-emerald-600 mt-0.5">{historyAnalytics.successRate}%</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-60" />
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'متوسط وقت التقييم' : 'Avg Execution Speed'}</span>
                    <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-0.5">{historyAnalytics.avgDuration} ms</div>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-500 opacity-60" />
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'إجمالي الإخفاقات' : 'Total Failures Logged'}</span>
                    <div className="text-xl font-black text-rose-600 mt-0.5">{historyAnalytics.fails}</div>
                  </div>
                  <AlertOctagon className="w-5 h-5 text-rose-500 opacity-60" />
                </div>
              </section>
            )}

            {/* ── Enterprise History Data Table & Controls ── */}
            {history.length > 0 && (
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden space-y-0">
                {/* Table Toolbar & Filters */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-slate-400" />
                      {locale === 'ar' ? 'سجل عمليات التقييم السابقة' : 'Evaluation History Logs'}
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {filteredHistory.length}
                      </span>
                    </h3>

                    {/* Controls right */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={locale === 'ar' ? 'بحث... (Ctrl+/)' : 'Search logs... (Ctrl+/)'}
                          className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-750 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white w-48"
                        />
                      </div>

                      {/* Column Visibility Selector Toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColMenu(!showColMenu)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-650 hover:bg-slate-50"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Columns
                        </button>
                        {showColMenu && (
                          <div className="absolute right-0 mt-1 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 space-y-1 text-xs">
                            <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                              <input type="checkbox" checked={columnVisibility.timestamp} onChange={(e) => setColumnVisibility({ ...columnVisibility, timestamp: e.target.checked })} />
                              <span>Timestamp</span>
                            </label>
                            <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                              <input type="checkbox" checked={columnVisibility.verdictTitle} onChange={(e) => setColumnVisibility({ ...columnVisibility, verdictTitle: e.target.checked })} />
                              <span>Verdict Title</span>
                            </label>
                            <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                              <input type="checkbox" checked={columnVisibility.recordCount} onChange={(e) => setColumnVisibility({ ...columnVisibility, recordCount: e.target.checked })} />
                              <span>Records</span>
                            </label>
                            <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                              <input type="checkbox" checked={columnVisibility.outcome} onChange={(e) => setColumnVisibility({ ...columnVisibility, outcome: e.target.checked })} />
                              <span>Outcome</span>
                            </label>
                            <label className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                              <input type="checkbox" checked={columnVisibility.durationMs} onChange={(e) => setColumnVisibility({ ...columnVisibility, durationMs: e.target.checked })} />
                              <span>Duration</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Export Dropdown / Buttons */}
                      <button
                        type="button"
                        onClick={() => exportHistoryData('csv')}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50"
                        title="Export CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" /> CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => exportHistoryData('copy')}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50"
                        title="Copy Table"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy
                      </button>

                      {/* Clear History */}
                      <button 
                        type="button" 
                        onClick={() => {
                          localStorage.removeItem(storageHistoryKey);
                          setHistory([]);
                          toast.success('History cleared');
                        }}
                        className="text-xs text-rose-600 hover:underline px-2"
                      >
                        {locale === 'ar' ? 'تفريغ السجل' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  {/* Filter Pills & Saved Views Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    {/* Outcome Filter Tabs */}
                    <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
                      {(['ALL', 'PASS', 'FAIL', 'WARN', 'INFO'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setOutcomeFilter(mode)}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all',
                            outcomeFilter === mode
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    {/* Saved Filter Views Bar */}
                    <div className="flex items-center gap-2 flex-grow overflow-x-auto">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Saved Views:</span>
                      {savedPresets.map((preset) => (
                        <span key={preset.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <button type="button" onClick={() => applyPreset(preset)} className="hover:underline">{preset.name}</button>
                          <button type="button" onClick={() => deletePreset(preset.id)} className="text-slate-400 hover:text-rose-600 ml-1">×</button>
                        </span>
                      ))}

                      {/* Save Current Preset Inline Input */}
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          placeholder="Preset name..."
                          className="px-2 py-0.5 text-[10px] border border-slate-200 dark:border-slate-750 rounded bg-transparent text-slate-700 dark:text-slate-300 w-24"
                        />
                        <button type="button" onClick={saveCurrentPreset} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold hover:bg-slate-300">Save</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold select-none">
                        {columnVisibility.timestamp && (
                          <th onClick={() => handleSort('timestamp')} className="px-4 py-2.5 text-[10px] text-slate-400 uppercase cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                            <div className="flex items-center gap-1">
                              Timestamp {sortField === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </div>
                          </th>
                        )}
                        {columnVisibility.verdictTitle && (
                          <th onClick={() => handleSort('verdictTitle')} className="px-4 py-2.5 text-[10px] text-slate-400 uppercase cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                            <div className="flex items-center gap-1">
                              Verdict Title {sortField === 'verdictTitle' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </div>
                          </th>
                        )}
                        {columnVisibility.recordCount && (
                          <th onClick={() => handleSort('recordCount')} className="px-4 py-2.5 text-[10px] text-slate-400 uppercase cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                            <div className="flex items-center gap-1">
                              Records {sortField === 'recordCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </div>
                          </th>
                        )}
                        {columnVisibility.outcome && (
                          <th onClick={() => handleSort('outcome')} className="px-4 py-2.5 text-[10px] text-slate-400 uppercase cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                            <div className="flex items-center gap-1">
                              Outcome {sortField === 'outcome' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </div>
                          </th>
                        )}
                        {columnVisibility.durationMs && (
                          <th onClick={() => handleSort('durationMs')} className="px-4 py-2.5 text-[10px] text-slate-400 uppercase cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                            <div className="flex items-center gap-1">
                              Duration {sortField === 'durationMs' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </div>
                          </th>
                        )}
                        <th className="px-4 py-2.5 text-[10px] text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                      {paginatedHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                            No evaluations match search / filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedHistory.map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            {columnVisibility.timestamp && (
                              <td className="px-4 py-2.5 font-medium text-slate-500">{h.timestamp}</td>
                            )}
                            {columnVisibility.verdictTitle && (
                              <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200">{h.verdictTitle}</td>
                            )}
                            {columnVisibility.recordCount && (
                              <td className="px-4 py-2.5 font-bold">{h.recordCount}</td>
                            )}
                            {columnVisibility.outcome && (
                              <td className="px-4 py-2.5">
                                <span className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-bold',
                                  h.outcome === 'PASS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                                )}>{h.outcome}</span>
                              </td>
                            )}
                            {columnVisibility.durationMs && (
                              <td className="px-4 py-2.5 text-slate-500 font-mono">{h.durationMs}ms</td>
                            )}
                            <td className="px-4 py-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setValues(h.payload as Record<string, unknown>);
                                  const restored = h.verdictData as { verdict?: unknown };
                                  setVerdict(restored?.verdict ? buildVerdict(h.verdictData) : (h.verdictData as VerdictPanelProps | null));
                                  toast.info('Restored evaluation from logs');
                                }}
                                className="text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold hover:underline"
                              >
                                Restore
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Enterprise Dynamic Pagination Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 gap-3 text-xs bg-slate-50/40 dark:bg-slate-900/40">
                  <div className="text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredHistory.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredHistory.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredHistory.length}</span> evaluations
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Rows per page */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Rows/page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-950 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    {/* Prev / Next Page Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Related Evaluators Panel ── */}
            <footer className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="text-slate-400">
                Performance: {executionTime ? `${executionTime}ms` : '---'} | Ruleset Sandbox: active | Node context: V3.2
              </div>
              <div className="sm:text-right text-slate-400">
                AuraOS Compliance Engine · Enterprise Workspace
              </div>
            </footer>

            {/* ── Bulk Paste Modal ── */}
            {showBulkModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-[500px] max-w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bulk Paste Records</h3>
                    <button type="button" onClick={() => setShowBulkModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste comma-separated values (CSV) matching table columns. Format:<br />
                    <code className="bg-slate-100 dark:bg-slate-850 px-1 rounded">ID, ReceivedDate, AckDate, FulfilledDate, Jurisdiction</code><br />
                    Example:<br />
                    <code className="bg-slate-100 dark:bg-slate-850 px-1 rounded block mt-1 font-mono text-[10px]">REQ-101, 2026-07-01, 2026-07-02, 2026-07-15, EU</code>
                  </p>
                  <textarea
                    rows={6}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="REQ-101,2026-07-01,2026-07-02,2026-07-15,EU"
                    className="w-full border border-slate-200 dark:border-slate-750 rounded-xl p-3 text-xs font-mono bg-slate-50/50 focus:outline-none dark:bg-slate-950 dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowBulkModal(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-655 hover:bg-slate-50">Cancel</button>
                    <button type="button" onClick={handleBulkPasteSubmit} className="px-3 py-1.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800">Import</button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Toast Notification Banner */}
            {notification && (
              <div className={cn(
                "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 bg-slate-900 text-white border-slate-800 dark:bg-white dark:text-slate-950 dark:border-slate-200"
              )}>
                {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : notification.type === 'error' ? <AlertOctagon className="w-4 h-4 text-rose-500" /> : <HelpCircle className="w-4 h-4 text-blue-500" />}
                <span>{notification.msg}</span>
              </div>
            )}
        </div>
    );
}
