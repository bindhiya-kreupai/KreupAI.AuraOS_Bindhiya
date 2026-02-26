/**
 * @module SurveyBuilder
 * @description Drag-to-reorder survey builder with question type selector,
 *              audience targeting, scheduling, preview mode, and templates (Sec 13.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  Send,
  AlignLeft,
  ToggleLeft,
  List,
  Hash,
  Star,
  Sliders,
  GripVertical,
  X,
  CheckCircle,
  Calendar,
  Users,
  Copy,
} from 'lucide-react';
import {
  SurveyService,
  type SurveyQuestion,
  type QuestionType,
  type CreateSurveyData,
} from '@/services/surveyService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BuilderQuestion extends Omit<SurveyQuestion, 'id'> {
  id: string;
  tempId: string;
}

type ViewMode = 'build' | 'preview';

// ── Constants ─────────────────────────────────────────────────────────────────

const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { type: 'rating', label: 'Star Rating', icon: Star, description: '1–5 star scale' },
  { type: 'nps', label: 'NPS (0–10)', icon: Hash, description: 'Net Promoter Score' },
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    icon: List,
    description: 'Select one option',
  },
  { type: 'text', label: 'Open Text', icon: AlignLeft, description: 'Free-form response' },
  { type: 'yes_no', label: 'Yes / No', icon: ToggleLeft, description: 'Binary choice' },
  { type: 'scale', label: 'Scale (1–10)', icon: Sliders, description: 'Numeric scale with labels' },
];

const TEMPLATES = SurveyService.getSurveyTemplates();

// ── Sub-components ─────────────────────────────────────────────────────────────

function QuestionTypeIcon({ type }: { type: QuestionType }) {
  const found = QUESTION_TYPES.find((t) => t.type === type);
  if (!found) return null;
  const Icon = found.icon;
  return <Icon className="w-4 h-4" />;
}

function StarRatingPreview({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl transition-colors ${
            (hover || value) >= s ? 'text-amber-400' : 'text-slate-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function NPSPreview({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              value === i
                ? i >= 9
                  ? 'bg-emerald-500 text-white'
                  : i >= 7
                    ? 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
    </div>
  );
}

function ScalePreview({
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
              value === s
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{minLabel || 'Strongly Disagree'}</span>
        <span>{maxLabel || 'Strongly Agree'}</span>
      </div>
    </div>
  );
}

// ── Question Editor Card ───────────────────────────────────────────────────────

function QuestionEditor({
  question,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  question: BuilderQuestion;
  index: number;
  total: number;
  onUpdate: (q: BuilderQuestion) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const updateField = <K extends keyof BuilderQuestion>(key: K, value: BuilderQuestion[K]) => {
    onUpdate({ ...question, [key]: value });
  };

  const addOption = () => {
    onUpdate({
      ...question,
      options: [...(question.options ?? []), `Option ${(question.options?.length ?? 0) + 1}`],
    });
  };

  const updateOption = (idx: number, text: string) => {
    const opts = [...(question.options ?? [])];
    opts[idx] = text;
    onUpdate({ ...question, options: opts });
  };

  const removeOption = (idx: number) => {
    onUpdate({ ...question, options: (question.options ?? []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 relative">
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div className="text-slate-300 mt-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3">
          {/* Question number + type */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Q{index + 1}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowTypeMenu((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <QuestionTypeIcon type={question.type} />
                {QUESTION_TYPES.find((t) => t.type === question.type)?.label}
              </button>
              {showTypeMenu && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-slate-200 rounded-xl shadow-lg p-2 w-52">
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.type}
                      onClick={() => {
                        updateField('type', qt.type);
                        setShowTypeMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        question.type === qt.type
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <qt.icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{qt.label}</div>
                        <div className="text-xs text-slate-400">{qt.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Question text */}
          <input
            type="text"
            value={question.text}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Enter your question..."
            className="w-full text-sm font-medium text-slate-800 border-b border-slate-200 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
          />

          {/* Type-specific options */}
          {question.type === 'multiple_choice' && (
            <div className="space-y-1.5 pl-2">
              {(question.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-slate-300 flex-shrink-0" />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="flex-1 text-sm text-slate-700 bg-transparent border-b border-slate-100 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => removeOption(idx)}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add option
              </button>
            </div>
          )}

          {(question.type === 'scale' || question.type === 'nps') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Low label</label>
                <input
                  value={question.minLabel ?? ''}
                  onChange={(e) => updateField('minLabel', e.target.value)}
                  placeholder="e.g. Not at all"
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">High label</label>
                <input
                  value={question.maxLabel ?? ''}
                  onChange={(e) => updateField('maxLabel', e.target.value)}
                  placeholder="e.g. Extremely"
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateField('required', !question.required)}
              className={`w-9 h-5 rounded-full transition-colors flex items-center ${
                question.required ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  question.required ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs text-slate-500">Required</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview Mode ───────────────────────────────────────────────────────────────

function SurveyPreview({
  title,
  description,
  questions,
  onClose,
}: {
  title: string;
  description: string;
  questions: BuilderQuestion[];
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  const handleAnswer = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-slate-800">{title || 'Survey Preview'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Preview mode — responses won&apos;t be saved
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <CheckCircle className="w-14 h-14 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Thank you!</h3>
            <p className="text-slate-500 text-sm">
              {description || 'Your response has been recorded.'}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Close Preview
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            Add questions to preview the survey
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 text-right">
              {currentQ + 1} / {questions.length}
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-800 leading-snug">
                  {q.text || 'Question text...'}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>
              </div>

              {q.type === 'rating' && (
                <StarRatingPreview
                  value={Number(answers[q.id] ?? 0)}
                  onChange={(v) => handleAnswer(q.id, v)}
                />
              )}
              {q.type === 'nps' && (
                <NPSPreview
                  value={Number(answers[q.id] ?? -1)}
                  onChange={(v) => handleAnswer(q.id, v)}
                />
              )}
              {q.type === 'scale' && (
                <ScalePreview
                  value={Number(answers[q.id] ?? 0)}
                  onChange={(v) => handleAnswer(q.id, v)}
                  minLabel={q.minLabel}
                  maxLabel={q.maxLabel}
                />
              )}
              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(q.options ?? []).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(q.id, opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                        answers[q.id] === opt
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {q.type === 'yes_no' && (
                <div className="flex gap-3">
                  {['yes', 'no'].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleAnswer(q.id, v)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        answers[q.id] === v
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {v === 'yes' ? '✓ Yes' : '✗ No'}
                    </button>
                  ))}
                </div>
              )}
              {q.type === 'text' && (
                <textarea
                  rows={3}
                  placeholder="Type your answer..."
                  value={String(answers[q.id] ?? '')}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                disabled={currentQ === 0}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (isLast) setSubmitted(true);
                  else setCurrentQ((p) => p + 1);
                }}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLast ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface SurveyBuilderProps {
  onSave?: (data: CreateSurveyData) => void;
  onPublish?: (data: CreateSurveyData) => void;
  onCancel?: () => void;
}

export default function SurveyBuilder({ onSave, onPublish, onCancel }: SurveyBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<'all' | 'department' | 'location' | 'role'>('all');
  const [audienceValue, setAudienceValue] = useState('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled' | 'recurring'>(
    'immediate'
  );
  const [scheduledDate, setScheduledDate] = useState('');
  const [recurringInterval, setRecurringInterval] = useState<'weekly' | 'monthly' | 'quarterly'>(
    'monthly'
  );
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('build');
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const nextId = useRef(1);

  const makeQuestion = (): BuilderQuestion => ({
    id: `q-${nextId.current++}`,
    tempId: `q-${nextId.current}`,
    type: 'rating',
    text: '',
    required: false,
    order: questions.length,
  });

  const addQuestion = () => setQuestions((prev) => [...prev, makeQuestion()]);

  const updateQuestion = (idx: number, q: BuilderQuestion) =>
    setQuestions((prev) => prev.map((item, i) => (i === idx ? q : item)));

  const deleteQuestion = (idx: number) => setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const moveQuestion = (idx: number, dir: 'up' | 'down') => {
    setQuestions((prev) => {
      const arr = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const buildPayload = (): CreateSurveyData => ({
    title,
    description,
    audience,
    audienceValue: audience !== 'all' ? audienceValue : undefined,
    questions: questions.map(({ _id, _tempId, ...rest }, i) => ({ ...rest, order: i })),
    scheduleType,
    scheduledDate: scheduleType === 'scheduled' ? scheduledDate : undefined,
    recurringInterval: scheduleType === 'recurring' ? recurringInterval : undefined,
  });

  const handleSave = async () => {
    setSaving(true);
    await SurveyService.createSurvey(buildPayload());
    setSaving(false);
    onSave?.(buildPayload());
  };

  const handlePublish = async () => {
    setSaving(true);
    const survey = await SurveyService.createSurvey(buildPayload());
    await SurveyService.publishSurvey(survey.id);
    setSaving(false);
    onPublish?.(buildPayload());
  };

  return (
    <>
      {viewMode === 'preview' && (
        <SurveyPreview
          title={title}
          description={description}
          questions={questions}
          onClose={() => setViewMode('build')}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Survey Builder</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create a new pulse survey</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Choose a Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setTitle(tpl.name);
                    setDescription(tpl.description);
                    setShowTemplates(false);
                  }}
                  className="text-left p-3 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-sm text-slate-800">{tpl.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{tpl.description}</div>
                  <div className="text-xs text-blue-600 mt-1">{tpl.questionCount} questions</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Survey metadata */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Survey Details</h2>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
              Survey Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 2026 Quarterly Pulse Survey"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description shown to respondents..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Employees</option>
                <option value="department">By Department</option>
                <option value="location">By Location</option>
                <option value="role">By Role</option>
              </select>
            </div>
            {audience !== 'all' && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                  {audience === 'department'
                    ? 'Department'
                    : audience === 'location'
                      ? 'Location'
                      : 'Role'}
                </label>
                <input
                  value={audienceValue}
                  onChange={(e) => setAudienceValue(e.target.value)}
                  placeholder={`Enter ${audience}...`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Schedule
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['immediate', 'scheduled', 'recurring'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScheduleType(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    scheduleType === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {scheduleType === 'scheduled' && (
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {scheduleType === 'recurring' && (
              <select
                value={recurringInterval}
                onChange={(e) => setRecurringInterval(e.target.value as typeof recurringInterval)}
                className="mt-2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Questions ({questions.length})</h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-500 text-sm font-medium">No questions yet</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">
                Add questions or start from a template
              </p>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Question
              </button>
            </div>
          ) : (
            questions.map((q, idx) => (
              <QuestionEditor
                key={q.id}
                question={q}
                index={idx}
                total={questions.length}
                onUpdate={(updated) => updateQuestion(idx, updated)}
                onDelete={() => deleteQuestion(idx)}
                onMoveUp={() => moveQuestion(idx, 'up')}
                onMoveDown={() => moveQuestion(idx, 'down')}
              />
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !title}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || !title || questions.length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Survey
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
