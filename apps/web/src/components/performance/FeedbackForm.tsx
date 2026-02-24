/**
 * @module FeedbackForm
 * @description Give feedback form with praise/constructive/suggestion types,
 *              recipient picker, anonymous toggle, tags, and goal linking
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Send,
  Heart,
  MessageCircle,
  Lightbulb,
  EyeOff,
  Globe,
  Lock,
  X,
  User,
  Tag,
  Sparkles,
} from 'lucide-react';
import type {
  FeedbackCategory,
  FeedbackVisibility,
  FeedbackFormData,
} from '@/services/feedbackService';

// ── Types ────────────────────────────────────────────────────────────────────────

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => void;
  isSaving?: boolean;
  onCancel?: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: {
  key: FeedbackCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  placeholder: string;
}[] = [
  {
    key: 'praise',
    label: 'Praise',
    description: 'Recognize great work',
    icon: Heart,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10 border-neural-mint/30',
    placeholder: 'What did they do well? Be specific about the impact...',
  },
  {
    key: 'constructive',
    label: 'Constructive',
    description: 'Help them grow',
    icon: MessageCircle,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10 border-sunset-amber/30',
    placeholder: 'What could they improve? Suggest specific actions...',
  },
  {
    key: 'suggestion',
    label: 'Suggestion',
    description: 'Share an idea',
    icon: Lightbulb,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10 border-nebula-purple/30',
    placeholder: 'What process or approach could be better?...',
  },
];

const VISIBILITY_CONFIG: {
  key: FeedbackVisibility;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { key: 'public', label: 'Public', description: 'Visible to everyone', icon: Globe },
  { key: 'private', label: 'Private', description: 'Only you and the recipient', icon: Lock },
  { key: 'anonymous', label: 'Anonymous', description: 'Your name is hidden', icon: EyeOff },
];

const SUGGESTED_TAGS = [
  'Technical Excellence',
  'Communication',
  'Teamwork',
  'Leadership',
  'Innovation',
  'Reliability',
  'Proactiveness',
  'Mentoring',
  'Quality',
  'Process Improvement',
  'Customer Focus',
  'Problem Solving',
];

const MOCK_TEAM = [
  { id: 'emp-201', name: 'Michael Torres', role: 'Engineering Manager' },
  { id: 'emp-202', name: 'Lisa Park', role: 'Tech Lead' },
  { id: 'emp-203', name: 'Anika Shah', role: 'Product Designer' },
  { id: 'emp-204', name: 'Jordan Lee', role: 'QA Engineer' },
  { id: 'emp-205', name: 'Rachel Green', role: 'DevOps Engineer' },
  { id: 'emp-206', name: 'Carlos Rivera', role: 'Product Manager' },
  { id: 'emp-207', name: 'Sarah Chen', role: 'Software Engineer' },
  { id: 'emp-208', name: 'David Kim', role: 'Data Analyst' },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  isSaving = false,
  onCancel,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('praise');
  const [visibility, setVisibility] = useState<FeedbackVisibility>('public');
  const [toId, setToId] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const selectedConfig = CATEGORY_CONFIG.find((c) => c.key === category)!;
  const selectedRecipient = MOCK_TEAM.find((t) => t.id === toId);

  const isValid = toId && message.trim().length >= 10;

  const handleSubmit = useCallback(() => {
    if (!isValid || !selectedRecipient) return;
    onSubmit({
      category,
      visibility,
      toId,
      toName: selectedRecipient.name,
      message: message.trim(),
      tags: selectedTags,
    });
    // Reset
    setMessage('');
    setSelectedTags([]);
    setToId('');
  }, [category, visibility, toId, message, selectedTags, isValid, selectedRecipient, onSubmit]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-celestial-indigo" />
          Give Feedback
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-silver-mist hover:text-ink-black dark:hover:text-pearl"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Selector */}
      <div className="flex gap-2">
        {CATEGORY_CONFIG.map((cat) => {
          const isActive = category === cat.key;
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-colors ${
                isActive
                  ? cat.bg
                  : 'border-cloud dark:border-nebula-purple/20 hover:bg-cloud/30 dark:hover:bg-nebula-purple/5'
              }`}
            >
              <CatIcon className={`w-4 h-4 ${isActive ? cat.color : 'text-silver-mist'}`} />
              <span className={`text-[9px] font-bold ${isActive ? cat.color : 'text-silver-mist'}`}>
                {cat.label}
              </span>
              <span className="text-[7px] text-silver-mist">{cat.description}</span>
            </button>
          );
        })}
      </div>

      {/* Recipient */}
      <div>
        <label className="text-[9px] font-bold text-silver-mist uppercase mb-1 block flex items-center gap-1">
          <User className="w-3 h-3" /> To
        </label>
        <select
          value={toId}
          onChange={(e) => setToId(e.target.value)}
          className="w-full px-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
        >
          <option value="">Select a team member...</option>
          {MOCK_TEAM.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.role}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={selectedConfig.placeholder}
          rows={4}
          className="w-full px-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
        />
        <div className="flex items-center justify-between mt-0.5">
          <span
            className={`text-[7px] ${message.length < 10 ? 'text-coral-alert' : 'text-silver-mist'}`}
          >
            {message.length < 10
              ? `${10 - message.length} more characters needed`
              : `${message.length} characters`}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <button
          onClick={() => setShowTagPicker((p) => !p)}
          className="flex items-center gap-1 text-[9px] font-semibold text-silver-mist hover:text-celestial-indigo transition-colors"
        >
          <Tag className="w-3 h-3" />
          {selectedTags.length > 0
            ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
            : 'Add tags (optional)'}
        </button>
        {showTagPicker && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded-full text-[8px] font-semibold border transition-colors ${
                    isSelected
                      ? 'border-celestial-indigo/30 bg-celestial-indigo/10 text-celestial-indigo'
                      : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                  }`}
                >
                  {isSelected && '✓ '}
                  {tag}
                </button>
              );
            })}
          </div>
        )}
        {selectedTags.length > 0 && !showTagPicker && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility + Submit */}
      <div className="flex items-center gap-2 pt-1 border-t border-cloud dark:border-nebula-purple/10">
        <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/20 overflow-hidden">
          {VISIBILITY_CONFIG.map((vis) => {
            const isActive = visibility === vis.key;
            const VisIcon = vis.icon;
            return (
              <button
                key={vis.key}
                onClick={() => setVisibility(vis.key)}
                title={vis.description}
                className={`flex items-center gap-0.5 px-2 py-1 text-[8px] font-bold transition-colors ${
                  isActive
                    ? 'bg-celestial-indigo/10 text-celestial-indigo'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                <VisIcon className="w-3 h-3" />
                {vis.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Send className="w-3 h-3" />
          {isSaving ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
