/**
 * @module CareerInterestsProfile
 * @description ESS Career Interests form — career goals, preferred roles, mobility preferences
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import {
  Target,
  Briefcase,
  MapPin,
  TrendingUp,
  GraduationCap,
  X,
  Plus,
  Check,
  Save,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CareerInterests {
  shortTermGoal: string;
  longTermGoal: string;
  preferredRoles: string[];
  interestedDepartments: string[];
  mobilityPreference: 'vertical' | 'horizontal' | 'lateral' | 'any';
  willingToRelocate: boolean;
  preferredLocations: string[];
  skills: string[];
  certifications: string[];
  developmentAreas: string[];
}

interface CareerInterestsProfileProps {
  onSave?: (interests: CareerInterests) => void;
}

// ── Predefined Options ────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Legal',
  'Data Science',
  'Customer Success',
];

const ROLE_SUGGESTIONS = [
  'Senior Software Engineer',
  'Engineering Manager',
  'Tech Lead',
  'Product Manager',
  'Staff Engineer',
  'Principal Engineer',
  'VP Engineering',
  'Director of Engineering',
  'Solutions Architect',
  'Data Engineer',
  'DevOps Engineer',
  'UX Designer',
];

const SKILL_SUGGESTIONS = [
  'Leadership',
  'Project Management',
  'Public Speaking',
  'Data Analysis',
  'Strategic Planning',
  'Team Building',
  'Technical Architecture',
  'Agile/Scrum',
  'Stakeholder Management',
  'Budgeting',
  'Mentoring',
  'Cross-functional Collaboration',
];

const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Denver, CO',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Remote',
  'London, UK',
  'Bangalore, India',
  'Toronto, Canada',
];

const MOBILITY_OPTIONS: {
  value: CareerInterests['mobilityPreference'];
  label: string;
  icon: LucideIcon;
  desc: string;
}[] = [
  {
    value: 'vertical',
    label: 'Vertical',
    icon: ArrowUpRight,
    desc: 'Move up within current function',
  },
  {
    value: 'horizontal',
    label: 'Horizontal',
    icon: ArrowRight,
    desc: 'Move to a different department',
  },
  {
    value: 'lateral',
    label: 'Lateral',
    icon: ArrowLeftRight,
    desc: 'Similar role, different team',
  },
  { value: 'any', label: 'Open to All', icon: Sparkles, desc: 'Flexible about direction' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const EMPTY_INTERESTS: CareerInterests = {
  shortTermGoal: '',
  longTermGoal: '',
  preferredRoles: [],
  interestedDepartments: [],
  mobilityPreference: 'any',
  willingToRelocate: false,
  preferredLocations: [],
  skills: [],
  certifications: [],
  developmentAreas: [],
};

export const CareerInterestsProfile: React.FC<CareerInterestsProfileProps> = ({ onSave }) => {
  const { refresh } = useCurrentUser();
  const [interests, setInterests] = useState<CareerInterests>(EMPTY_INTERESTS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/my-services/profile', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
        const body = await res.json();
        const stored = body?.data?.careerInterests as Partial<CareerInterests> | null | undefined;
        if (active && stored && typeof stored === 'object') {
          setInterests({ ...EMPTY_INTERESTS, ...stored });
        }
      } catch (error) {
        console.error('Failed to load career interests', error);
        if (active) toast.error('Failed to load career interests');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateField = useCallback(
    <K extends keyof CareerInterests>(field: K, value: CareerInterests[K]) => {
      setInterests((prev) => ({ ...prev, [field]: value }));
      setSaved(false);
    },
    []
  );

  const addToList = useCallback(
    (
      field:
        | 'preferredRoles'
        | 'interestedDepartments'
        | 'preferredLocations'
        | 'skills'
        | 'certifications'
        | 'developmentAreas',
      item: string
    ) => {
      if (!item.trim()) return;
      setInterests((prev) => ({
        ...prev,
        [field]: prev[field].includes(item) ? prev[field] : [...prev[field], item],
      }));
      setSaved(false);
    },
    []
  );

  const removeFromList = useCallback(
    (
      field:
        | 'preferredRoles'
        | 'interestedDepartments'
        | 'preferredLocations'
        | 'skills'
        | 'certifications'
        | 'developmentAreas',
      item: string
    ) => {
      setInterests((prev) => ({ ...prev, [field]: prev[field].filter((i) => i !== item) }));
      setSaved(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/my-services/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ careerInterests: interests }),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      onSave?.(interests);
      setSaved(true);
      refresh();
      toast.success('Career interests saved');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save career interests', error);
      toast.error('Failed to save career interests');
    } finally {
      setSaving(false);
    }
  }, [interests, onSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Career Goals */}
      <Section title="Career Goals" icon={Target} color="text-quantum-rose">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-silver-mist font-medium">
              Short-term Goal (1-2 years)
            </label>
            <textarea
              value={interests.shortTermGoal}
              onChange={(e) => updateField('shortTermGoal', e.target.value)}
              rows={2}
              className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
              placeholder="What do you want to achieve in the next 1-2 years?"
            />
          </div>
          <div>
            <label className="text-[10px] text-silver-mist font-medium">
              Long-term Goal (3-5 years)
            </label>
            <textarea
              value={interests.longTermGoal}
              onChange={(e) => updateField('longTermGoal', e.target.value)}
              rows={2}
              className="mt-0.5 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
              placeholder="Where do you see yourself in 3-5 years?"
            />
          </div>
        </div>
      </Section>

      {/* Preferred Roles */}
      <Section title="Preferred Roles" icon={Briefcase} color="text-celestial-indigo">
        <TagSelector
          items={interests.preferredRoles}
          suggestions={ROLE_SUGGESTIONS}
          onAdd={(item) => addToList('preferredRoles', item)}
          onRemove={(item) => removeFromList('preferredRoles', item)}
          placeholder="Add a role..."
        />
      </Section>

      {/* Interested Departments */}
      <Section title="Interested Departments" icon={TrendingUp} color="text-neural-mint">
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => {
            const isSelected = interests.interestedDepartments.includes(dept);
            return (
              <button
                key={dept}
                onClick={() =>
                  isSelected
                    ? removeFromList('interestedDepartments', dept)
                    : addToList('interestedDepartments', dept)
                }
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                  isSelected
                    ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                    : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 inline mr-1" />}
                {dept}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Mobility Preference */}
      <Section title="Mobility Preference" icon={TrendingUp} color="text-sunset-amber">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOBILITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = interests.mobilityPreference === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateField('mobilityPreference', opt.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                    : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                />
                <span
                  className={`text-[10px] font-semibold ${isActive ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                >
                  {opt.label}
                </span>
                <span className="text-[9px] text-silver-mist text-center leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Location Preferences */}
      <Section title="Location Preferences" icon={MapPin} color="text-nebula-purple">
        <label className="flex items-center gap-2.5 mb-3 cursor-pointer">
          <div
            onClick={() => updateField('willingToRelocate', !interests.willingToRelocate)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
              interests.willingToRelocate
                ? 'border-celestial-indigo bg-celestial-indigo'
                : 'border-cloud dark:border-nebula-purple/30'
            }`}
          >
            {interests.willingToRelocate && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-xs text-ink-black dark:text-pearl">Open to relocation</span>
        </label>
        <TagSelector
          items={interests.preferredLocations}
          suggestions={LOCATIONS}
          onAdd={(item) => addToList('preferredLocations', item)}
          onRemove={(item) => removeFromList('preferredLocations', item)}
          placeholder="Add a location..."
        />
      </Section>

      {/* Skills & Development */}
      <Section title="Skills & Development" icon={GraduationCap} color="text-celestial-indigo">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-silver-mist font-semibold uppercase tracking-wider mb-2 block">
              Key Skills
            </label>
            <TagSelector
              items={interests.skills}
              suggestions={SKILL_SUGGESTIONS}
              onAdd={(item) => addToList('skills', item)}
              onRemove={(item) => removeFromList('skills', item)}
              placeholder="Add a skill..."
            />
          </div>
          <div>
            <label className="text-[10px] text-silver-mist font-semibold uppercase tracking-wider mb-2 block">
              Certifications
            </label>
            <TagSelector
              items={interests.certifications}
              suggestions={[]}
              onAdd={(item) => addToList('certifications', item)}
              onRemove={(item) => removeFromList('certifications', item)}
              placeholder="Add a certification..."
            />
          </div>
          <div>
            <label className="text-[10px] text-silver-mist font-semibold uppercase tracking-wider mb-2 block">
              Areas for Development
            </label>
            <TagSelector
              items={interests.developmentAreas}
              suggestions={SKILL_SUGGESTIONS.filter((s) => !interests.skills.includes(s))}
              onAdd={(item) => addToList('developmentAreas', item)}
              onRemove={(item) => removeFromList('developmentAreas', item)}
              placeholder="Add a development area..."
            />
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
            saved ? 'bg-neural-mint text-white' : 'bg-celestial-indigo text-white hover:opacity-90'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" /> Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Interests
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Section Wrapper ───────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  icon: LucideIcon;
  color: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, color, children }) => (
  <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4">
    <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${color}`} />
      {title}
    </h4>
    {children}
  </div>
);

// ── Tag Selector ──────────────────────────────────────────────────────────────

const TagSelector: React.FC<{
  items: string[];
  suggestions: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
}> = ({ items, suggestions, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions
    .filter((s) => !items.includes(s))
    .filter((s) => !input || s.toLowerCase().includes(input.toLowerCase()));

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-celestial-indigo/10 text-celestial-indigo text-[10px] font-medium"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="hover:text-coral-alert transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors pr-8"
        />
        <button
          onClick={handleAdd}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos"
        >
          <Plus className="w-3.5 h-3.5 text-silver-mist" />
        </button>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
            <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-lg max-h-40 overflow-y-auto py-1">
              {filteredSuggestions.slice(0, 8).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onAdd(s);
                    setInput('');
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-ink-black dark:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CareerInterestsProfile;
