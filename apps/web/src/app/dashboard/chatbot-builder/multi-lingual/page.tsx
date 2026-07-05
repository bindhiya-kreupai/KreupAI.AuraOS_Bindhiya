'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Languages,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Download,
  X,
  Search,
  Filter,
  RefreshCw,
  XCircle,
  Globe,
  BookTemplate,
  ScanText,
  Settings2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import type {
  LanguageContent as LC,
  LocalizationSettings as LS,
  Translation as TR,
} from '../types';

type Tab = 'languages' | 'translations' | 'language-content' | 'detection' | 'settings';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'languages', label: 'Languages', icon: <Globe className="w-4 h-4" /> },
  { key: 'translations', label: 'Translations', icon: <BookTemplate className="w-4 h-4" /> },
  { key: 'language-content', label: 'Content', icon: <ScanText className="w-4 h-4" /> },
  { key: 'detection', label: 'Detection', icon: <ScanText className="w-4 h-4" /> },
  { key: 'settings', label: 'Settings', icon: <Settings2 className="w-4 h-4" /> },
];

export default function MultiLingualPage() {
  const {
    languages,
    translations,
    languageContent,
    detectionResult,
    localizationSettings,
    loading,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    enableLanguage,
    loadLanguages,
    loadTranslations,
    createTranslation,
    autoTranslate,
    loadLanguageContent,
    createLanguageContent,
    detectLanguage,
    loadLocalizationSettings,
    updateLocalizationSettings,
    addToast,
  } = useChatbot();

  const [activeTab, setActiveTab] = useState<Tab>('languages');

  // =============================================
  // LANGUAGE TAB STATE
  // =============================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLang, setEditingLang] = useState<(typeof languages)[number] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [langForm, setLangForm] = useState({
    languageCode: '',
    languageName: '',
    isEnabled: true,
    isDefault: false,
    confidenceThreshold: 80,
    translationModel: '',
    supportedFeatures: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [defaultFilter, setDefaultFilter] = useState<'all' | 'default' | 'non-default'>('all');

  const resetLangForm = () => {
    setLangForm({
      languageCode: '',
      languageName: '',
      isEnabled: true,
      isDefault: false,
      confidenceThreshold: 80,
      translationModel: '',
      supportedFeatures: '',
    });
  };

  // =============================================
  // TRANSLATIONS TAB STATE
  // =============================================
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [translationForm, setTranslationForm] = useState({
    sourceLanguage: '',
    targetLanguage: '',
    sourceText: '',
    translatedText: '',
    translationMethod: 'manual' as 'manual' | 'automatic' | 'hybrid',
    isApproved: false,
  });
  const [autoSrcText, setAutoSrcText] = useState('');
  const [autoSrcLang, setAutoSrcLang] = useState('en');
  const [autoTgtLang, setAutoTgtLang] = useState('fr');
  const [autoResult, setAutoResult] = useState('');
  const [autoLoading, setAutoLoading] = useState(false);

  // =============================================
  // LANGUAGE CONTENT TAB STATE
  // =============================================
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentForm, setContentForm] = useState({
    contentType: 'intent_response' as LC['contentType'],
    referenceId: '',
    defaultLanguage: 'en',
    translations: '',
  });
  const [contentTypeFilter, setContentTypeFilter] = useState('');

  // =============================================
  // DETECTION TAB STATE
  // =============================================
  const [detectText, setDetectText] = useState('');
  const [detecting, setDetecting] = useState(false);

  // =============================================
  // SETTINGS TAB STATE
  // =============================================
  const [settingsForm, setSettingsForm] = useState({
    autoDetectLanguage: false,
    fallbackLanguage: '',
    supportedLanguages: '',
    translationProvider: 'google' as LS['translationProvider'],
    translationApiKey: '',
    enableAutoTranslation: false,
    requireApprovalForAutoTranslation: false,
  });

  useEffect(() => {
    loadLanguages();
    loadTranslations();
    loadLanguageContent();
    loadLocalizationSettings();
  }, []);

  useEffect(() => {
    if (localizationSettings) {
      setSettingsForm({
        autoDetectLanguage: localizationSettings.autoDetectLanguage,
        fallbackLanguage: localizationSettings.fallbackLanguage || '',
        supportedLanguages: (localizationSettings.supportedLanguages || []).join(', '),
        translationProvider: localizationSettings.translationProvider || 'google',
        translationApiKey: localizationSettings.translationApiKey || '',
        enableAutoTranslation: localizationSettings.enableAutoTranslation,
        requireApprovalForAutoTranslation: localizationSettings.requireApprovalForAutoTranslation,
      });
    }
  }, [localizationSettings]);

  // =============================================
  // LANGUAGE HANDLERS
  // =============================================
  const handleAddLang = async () => {
    if (!langForm.languageCode || !langForm.languageName) {
      addToast({ type: 'warning', message: 'Language code and name are required' });
      return;
    }
    try {
      const features = langForm.supportedFeatures
        ? langForm.supportedFeatures
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      await createLanguage({
        languageCode: langForm.languageCode,
        languageName: langForm.languageName,
        isEnabled: langForm.isEnabled,
        isDefault: langForm.isDefault,
        confidenceThreshold: langForm.confidenceThreshold,
        translationModel: langForm.translationModel || undefined,
        supportedFeatures: features,
      });
      setShowAddModal(false);
      resetLangForm();
    } catch {
      // handled by hook
    }
  };

  const handleEditLang = async () => {
    if (!editingLang) return;
    try {
      const features = langForm.supportedFeatures
        ? langForm.supportedFeatures
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      await updateLanguage(editingLang.languageCode, {
        languageName: langForm.languageName,
        isEnabled: langForm.isEnabled,
        isDefault: langForm.isDefault,
        confidenceThreshold: langForm.confidenceThreshold,
        translationModel: langForm.translationModel || undefined,
        supportedFeatures: features,
      });
      setEditingLang(null);
      resetLangForm();
    } catch {
      // handled by hook
    }
  };

  const handleDisable = async (lang: (typeof languages)[number]) => {
    try {
      await updateLanguage(lang.languageCode, { isEnabled: false });
    } catch {
      // handled by hook
    }
  };

  const openEdit = (lang: (typeof languages)[number]) => {
    setEditingLang(lang);
    setLangForm({
      languageCode: lang.languageCode,
      languageName: lang.languageName,
      isEnabled: lang.isEnabled,
      isDefault: lang.isDefault,
      confidenceThreshold: lang.confidenceThreshold,
      translationModel: lang.translationModel || '',
      supportedFeatures: (lang.supportedFeatures || []).join(', '),
    });
  };

  const handleDownload = (lang: (typeof languages)[number]) => {
    const data = JSON.stringify(lang, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lang.languageCode}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteLang = async (code: string) => {
    try {
      await deleteLanguage(code);
      setConfirmDelete(null);
    } catch {
      // handled by hook
    }
  };

  const filteredLangs = useMemo(() => {
    let result = languages;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) => l.languageName.toLowerCase().includes(q) || l.languageCode.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'active') result = result.filter((l) => l.isEnabled);
    else if (statusFilter === 'disabled') result = result.filter((l) => !l.isEnabled);
    if (defaultFilter === 'default') result = result.filter((l) => l.isDefault);
    else if (defaultFilter === 'non-default') result = result.filter((l) => !l.isDefault);
    return result;
  }, [languages, searchQuery, statusFilter, defaultFilter]);

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || defaultFilter !== 'all';

  // =============================================
  // TRANSLATION HANDLERS
  // =============================================
  const handleAddTranslation = async () => {
    if (
      !translationForm.sourceLanguage ||
      !translationForm.targetLanguage ||
      !translationForm.sourceText
    ) {
      addToast({
        type: 'warning',
        message: 'Source language, target language, and source text are required',
      });
      return;
    }
    try {
      await createTranslation(translationForm);
      setShowTranslationModal(false);
      setTranslationForm({
        sourceLanguage: '',
        targetLanguage: '',
        sourceText: '',
        translatedText: '',
        translationMethod: 'manual',
        isApproved: false,
      });
    } catch {
      // handled by hook
    }
  };

  const handleAutoTranslate = async () => {
    if (!autoSrcText || !autoSrcLang || !autoTgtLang) {
      addToast({ type: 'warning', message: 'Text and language pair are required' });
      return;
    }
    setAutoLoading(true);
    try {
      const result = await autoTranslate(autoSrcText, autoSrcLang, autoTgtLang);
      setAutoResult(result);
    } finally {
      setAutoLoading(false);
    }
  };

  // =============================================
  // LANGUAGE CONTENT HANDLERS
  // =============================================
  const handleAddContent = async () => {
    if (!contentForm.contentType || !contentForm.referenceId) {
      addToast({ type: 'warning', message: 'Content type and reference ID are required' });
      return;
    }
    const translationsObj: Record<string, string> = {};
    try {
      if (contentForm.translations) {
        const pairs = contentForm.translations.split('\n').filter(Boolean);
        for (const pair of pairs) {
          const [key, ...val] = pair.split(':');
          if (key && val.length) translationsObj[key.trim()] = val.join(':').trim();
        }
      }
    } catch {
      addToast({
        type: 'warning',
        message: 'Invalid translations format. Use langCode: text per line.',
      });
      return;
    }
    try {
      await createLanguageContent({
        contentType: contentForm.contentType,
        referenceId: contentForm.referenceId,
        translations: translationsObj,
        defaultLanguage: contentForm.defaultLanguage,
      });
      setShowContentModal(false);
      setContentForm({
        contentType: 'intent_response',
        referenceId: '',
        defaultLanguage: 'en',
        translations: '',
      });
    } catch {
      // handled by hook
    }
  };

  // =============================================
  // DETECTION HANDLERS
  // =============================================
  const handleDetect = async () => {
    if (!detectText.trim()) {
      addToast({ type: 'warning', message: 'Enter text to detect' });
      return;
    }
    setDetecting(true);
    try {
      await detectLanguage(detectText);
    } finally {
      setDetecting(false);
    }
  };

  // =============================================
  // SETTINGS HANDLERS
  // =============================================
  const handleSaveSettings = async () => {
    try {
      await updateLocalizationSettings({
        autoDetectLanguage: settingsForm.autoDetectLanguage,
        fallbackLanguage: settingsForm.fallbackLanguage || undefined,
        supportedLanguages: settingsForm.supportedLanguages
          ? settingsForm.supportedLanguages
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        translationProvider: settingsForm.translationProvider,
        translationApiKey: settingsForm.translationApiKey || undefined,
        enableAutoTranslation: settingsForm.enableAutoTranslation,
        requireApprovalForAutoTranslation: settingsForm.requireApprovalForAutoTranslation,
      });
    } catch {
      // handled by hook
    }
  };

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="w-6 h-6 text-indigo-500" />
            Multi-lingual Support
          </h1>
          <p className="text-slate-500 text-sm">
            Manage language packs, translations, and localization settings.
          </p>
        </div>
        {activeTab === 'languages' && (
          <button
            onClick={() => {
              resetLangForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Language
          </button>
        )}
        {activeTab === 'translations' && (
          <button
            onClick={() => setShowTranslationModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Translation
          </button>
        )}
        {activeTab === 'language-content' && (
          <button
            onClick={() => setShowContentModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Content
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================= */}
      {/* LANGUAGES TAB */}
      {/* ============================================= */}
      {activeTab === 'languages' && (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <select
                value={defaultFilter}
                onChange={(e) =>
                  setDefaultFilter(e.target.value as 'all' | 'default' | 'non-default')
                }
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="all">All Languages</option>
                <option value="default">Default Only</option>
                <option value="non-default">Non-default</option>
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDefaultFilter('all');
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 hover:text-rose-600 transition-colors"
                  title="Clear all filters"
                >
                  <XCircle className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <button
                onClick={() => loadLanguages()}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                title="Refresh languages"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading && languages.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          )}

          {!loading && filteredLangs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Languages className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">
                {hasActiveFilters ? 'No languages match your filters.' : 'No languages configured'}
              </p>
              <p className="text-sm">
                {hasActiveFilters
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Click "Add Language" to get started.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pb-4">
            {filteredLangs.map((lang) => {
              const completeness = Math.min(
                (lang.supportedFeatures?.length || 0) * 10 + (lang.confidenceThreshold / 100) * 50,
                100
              );
              return (
                <div
                  key={lang.languageId || lang.languageCode}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{lang.languageName}</h3>
                      <div className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                        {lang.languageCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lang.isDefault && (
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Primary
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          lang.isEnabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {lang.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Confidence Threshold</span>
                      <span className="font-semibold">{lang.confidenceThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supported Features</span>
                      <span className="font-semibold">{lang.supportedFeatures?.length || 0}</span>
                    </div>
                    {lang.translationModel && (
                      <div className="flex justify-between">
                        <span>Translation Model</span>
                        <span className="font-semibold text-xs font-mono">
                          {lang.translationModel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completeness >= 80
                          ? 'bg-emerald-500'
                          : completeness >= 40
                            ? 'bg-amber-500'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mb-6 flex justify-between">
                    <span>Translation Progress</span>
                    <span className="font-bold">{Math.round(completeness)}%</span>
                  </div>

                  <div className="flex gap-2">
                    {lang.isEnabled ? (
                      <button
                        onClick={() => handleDisable(lang)}
                        className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => enableLanguage(lang.languageCode)}
                        className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        Enable
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(lang)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(lang.languageCode)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(lang)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {confirmDelete === lang.languageCode && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
                      <p className="text-sm font-semibold text-center">Delete this language?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteLang(lang.languageCode)}
                          className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {lang.lastModifiedDate && (
                    <div className="mt-3 text-xs text-slate-400 text-center">
                      Updated {new Date(lang.lastModifiedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* TRANSLATIONS TAB */}
      {/* ============================================= */}
      {activeTab === 'translations' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Auto-translate Tool */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-4">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-500" />
              Auto-translate
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1">Source Text</label>
                <textarea
                  value={autoSrcText}
                  onChange={(e) => setAutoSrcText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">From</label>
                  <input
                    type="text"
                    value={autoSrcLang}
                    onChange={(e) => setAutoSrcLang(e.target.value)}
                    placeholder="e.g. en"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">To</label>
                  <input
                    type="text"
                    value={autoTgtLang}
                    onChange={(e) => setAutoTgtLang(e.target.value)}
                    placeholder="e.g. fr"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleAutoTranslate}
                  disabled={autoLoading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {autoLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  Translate
                </button>
              </div>
            </div>
            {autoResult && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs font-semibold text-slate-500 mb-1">Result:</p>
                <p className="text-sm">{autoResult}</p>
              </div>
            )}
          </div>

          {/* Translations List */}
          <h3 className="font-bold text-base mb-3">Translation Entries</h3>
          {translations.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BookTemplate className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No translations yet</p>
              <p className="text-sm">Click "Add Translation" to create one.</p>
            </div>
          )}
          <div className="space-y-2">
            {translations.map((t, i) => (
              <div
                key={t.translationId || i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {t.sourceLanguage}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {t.targetLanguage}
                      </span>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          t.isApproved
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">
                        {t.translationMethod}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{t.sourceText}</p>
                    <p className="text-sm font-medium mt-1">{t.translatedText}</p>
                  </div>
                  {t.quality !== undefined && t.quality !== null && (
                    <span className="text-xs font-bold text-slate-500 shrink-0">
                      Q: {t.quality}/100
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* LANGUAGE CONTENT TAB */}
      {/* ============================================= */}
      {activeTab === 'language-content' && (
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={contentTypeFilter}
              onChange={(e) => {
                setContentTypeFilter(e.target.value);
                loadLanguageContent(e.target.value ? { contentType: e.target.value } : undefined);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">All Types</option>
              <option value="intent_response">Intent Response</option>
              <option value="message">Message</option>
              <option value="button">Button</option>
              <option value="entity_value">Entity Value</option>
              <option value="error_message">Error Message</option>
            </select>
          </div>

          {languageContent.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ScanText className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No language content yet</p>
              <p className="text-sm">Click "Add Content" to create one.</p>
            </div>
          )}

          <div className="space-y-2">
            {languageContent.map((c, i) => (
              <div
                key={c.contentId || i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        {c.contentType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Ref: {c.referenceId}</span>
                      <span className="text-xs text-slate-400">
                        Default: <span className="font-semibold">{c.defaultLanguage}</span>
                      </span>
                    </div>
                    {c.translations && typeof c.translations === 'object' && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(c.translations)
                          .slice(0, 3)
                          .map(([lang, text]) => (
                            <div key={lang} className="flex items-start gap-2 text-sm">
                              <span className="text-xs font-mono font-bold text-slate-500 w-8 shrink-0">
                                {lang}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 line-clamp-1">
                                {text as string}
                              </span>
                            </div>
                          ))}
                        {Object.keys(c.translations).length > 3 && (
                          <p className="text-xs text-slate-400">
                            +{Object.keys(c.translations).length - 3} more languages
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* DETECTION TAB */}
      {/* ============================================= */}
      {activeTab === 'detection' && (
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl">
            <h3 className="font-bold text-base mb-2">Language Detection</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter text to detect its language using heuristic analysis.
            </p>
            <textarea
              value={detectText}
              onChange={(e) => setDetectText(e.target.value)}
              placeholder="Type or paste text here to detect the language..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
            />
            <button
              onClick={handleDetect}
              disabled={detecting || !detectText.trim()}
              className="mt-3 flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40"
            >
              {detecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ScanText className="w-4 h-4" />
              )}
              Detect Language
            </button>

            {detectionResult && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold">{detectionResult.detectedLanguage}</span>
                  <span className="text-sm text-slate-500">
                    Confidence: <span className="font-bold">{detectionResult.confidence}%</span>
                  </span>
                </div>
                {detectionResult.alternativeLanguages &&
                  detectionResult.alternativeLanguages.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Alternatives:</p>
                      <div className="flex flex-wrap gap-2">
                        {detectionResult.alternativeLanguages.map((alt) => (
                          <span
                            key={alt.languageCode}
                            className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded"
                          >
                            {alt.languageCode} ({alt.confidence}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* SETTINGS TAB */}
      {/* ============================================= */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl">
            <h3 className="font-bold text-base mb-4">Localization Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settingsForm.autoDetectLanguage}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, autoDetectLanguage: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold">Auto-detect Language</p>
                  <p className="text-xs text-slate-500">
                    Automatically detect user language on chat start
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settingsForm.enableAutoTranslation}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, enableAutoTranslation: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold">Enable Auto-translation</p>
                  <p className="text-xs text-slate-500">
                    Automatically translate responses to user language
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settingsForm.requireApprovalForAutoTranslation}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      requireApprovalForAutoTranslation: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold">Require Approval</p>
                  <p className="text-xs text-slate-500">
                    Require manual approval for auto-translations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Fallback Language</label>
                  <input
                    type="text"
                    value={settingsForm.fallbackLanguage}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, fallbackLanguage: e.target.value })
                    }
                    placeholder="e.g. en"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Translation Provider</label>
                  <select
                    value={settingsForm.translationProvider}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        translationProvider: e.target.value as LS['translationProvider'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="google">Google</option>
                    <option value="azure">Azure</option>
                    <option value="aws">AWS</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Supported Languages</label>
                  <input
                    type="text"
                    value={settingsForm.supportedLanguages}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, supportedLanguages: e.target.value })
                    }
                    placeholder="en, fr, es, de, ar, zh, ja"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated language codes</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Translation API Key</label>
                  <input
                    type="password"
                    value={settingsForm.translationApiKey}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, translationApiKey: e.target.value })
                    }
                    placeholder="Enter API key for translation provider"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* ADD LANGUAGE MODAL */}
      {/* ============================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add Language</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetLangForm();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Language Code</label>
                <input
                  type="text"
                  value={langForm.languageCode}
                  onChange={(e) => setLangForm({ ...langForm, languageCode: e.target.value })}
                  placeholder="e.g. fr-FR"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Language Name</label>
                <input
                  type="text"
                  value={langForm.languageName}
                  onChange={(e) => setLangForm({ ...langForm, languageName: e.target.value })}
                  placeholder="e.g. French (France)"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={langForm.isEnabled}
                    onChange={(e) => setLangForm({ ...langForm, isEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={langForm.isDefault}
                    onChange={(e) => setLangForm({ ...langForm, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Default</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Confidence Threshold ({langForm.confidenceThreshold}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={langForm.confidenceThreshold}
                  onChange={(e) =>
                    setLangForm({ ...langForm, confidenceThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Translation Model (optional)
                </label>
                <input
                  type="text"
                  value={langForm.translationModel}
                  onChange={(e) => setLangForm({ ...langForm, translationModel: e.target.value })}
                  placeholder="e.g. google, azure, custom"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Supported Features (optional)
                </label>
                <input
                  type="text"
                  value={langForm.supportedFeatures}
                  onChange={(e) => setLangForm({ ...langForm, supportedFeatures: e.target.value })}
                  placeholder="e.g. translation, detection, tts, stt"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Comma-separated feature names</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetLangForm();
                }}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLang}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Add Language
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* EDIT LANGUAGE MODAL */}
      {/* ============================================= */}
      {editingLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Edit Language</h2>
              <button
                onClick={() => {
                  setEditingLang(null);
                  resetLangForm();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Language Code</label>
                <input
                  type="text"
                  value={langForm.languageCode}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Language Name</label>
                <input
                  type="text"
                  value={langForm.languageName}
                  onChange={(e) => setLangForm({ ...langForm, languageName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={langForm.isEnabled}
                    onChange={(e) => setLangForm({ ...langForm, isEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={langForm.isDefault}
                    onChange={(e) => setLangForm({ ...langForm, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Default</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Confidence Threshold ({langForm.confidenceThreshold}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={langForm.confidenceThreshold}
                  onChange={(e) =>
                    setLangForm({ ...langForm, confidenceThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Translation Model (optional)
                </label>
                <input
                  type="text"
                  value={langForm.translationModel}
                  onChange={(e) => setLangForm({ ...langForm, translationModel: e.target.value })}
                  placeholder="e.g. google, azure, custom"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Supported Features (optional)
                </label>
                <input
                  type="text"
                  value={langForm.supportedFeatures}
                  onChange={(e) => setLangForm({ ...langForm, supportedFeatures: e.target.value })}
                  placeholder="e.g. translation, detection, tts, stt"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Comma-separated feature names</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingLang(null);
                  resetLangForm();
                }}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditLang}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* ADD TRANSLATION MODAL */}
      {/* ============================================= */}
      {showTranslationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add Translation</h2>
              <button
                onClick={() => setShowTranslationModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Source Language</label>
                  <input
                    type="text"
                    value={translationForm.sourceLanguage}
                    onChange={(e) =>
                      setTranslationForm({ ...translationForm, sourceLanguage: e.target.value })
                    }
                    placeholder="e.g. en"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Target Language</label>
                  <input
                    type="text"
                    value={translationForm.targetLanguage}
                    onChange={(e) =>
                      setTranslationForm({ ...translationForm, targetLanguage: e.target.value })
                    }
                    placeholder="e.g. fr"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Source Text</label>
                <textarea
                  value={translationForm.sourceText}
                  onChange={(e) =>
                    setTranslationForm({ ...translationForm, sourceText: e.target.value })
                  }
                  placeholder="Enter source text..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Translated Text</label>
                <textarea
                  value={translationForm.translatedText}
                  onChange={(e) =>
                    setTranslationForm({ ...translationForm, translatedText: e.target.value })
                  }
                  placeholder="Enter translated text..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Method</label>
                  <select
                    value={translationForm.translationMethod}
                    onChange={(e) =>
                      setTranslationForm({
                        ...translationForm,
                        translationMethod: e.target.value as 'manual' | 'automatic' | 'hybrid',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={translationForm.isApproved}
                      onChange={(e) =>
                        setTranslationForm({ ...translationForm, isApproved: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium">Approved</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTranslationModal(false)}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTranslation}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Save Translation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* ADD LANGUAGE CONTENT MODAL */}
      {/* ============================================= */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add Language Content</h2>
              <button
                onClick={() => setShowContentModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Content Type</label>
                <select
                  value={contentForm.contentType}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      contentType: e.target.value as LC['contentType'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="intent_response">Intent Response</option>
                  <option value="message">Message</option>
                  <option value="button">Button</option>
                  <option value="entity_value">Entity Value</option>
                  <option value="error_message">Error Message</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Reference ID</label>
                <input
                  type="text"
                  value={contentForm.referenceId}
                  onChange={(e) => setContentForm({ ...contentForm, referenceId: e.target.value })}
                  placeholder="e.g. greeting_intent"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Default Language</label>
                <input
                  type="text"
                  value={contentForm.defaultLanguage}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, defaultLanguage: e.target.value })
                  }
                  placeholder="e.g. en"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Translations</label>
                <textarea
                  value={contentForm.translations}
                  onChange={(e) => setContentForm({ ...contentForm, translations: e.target.value })}
                  placeholder={'en: Hello\nfr: Bonjour\nes: Hola'}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">
                  One per line: languageCode: translated text
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContentModal(false)}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Save Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
