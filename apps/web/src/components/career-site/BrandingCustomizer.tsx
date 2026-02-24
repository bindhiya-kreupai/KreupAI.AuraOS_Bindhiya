/**
 * @module BrandingCustomizer
 * @description Career site branding controls — theme selection, color picker,
 *              logo upload, typography, and layout customization
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Palette,
  Image as ImageIcon,
  Type,
  Layout,
  Sun,
  Moon,
  Upload,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface BrandingConfig {
  theme: ThemePreset;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string | null;
  logoFile: File | null;
  faviconUrl: string | null;
  fontFamily: string;
  heroStyle: 'gradient' | 'image' | 'minimal';
  borderRadius: 'sharp' | 'rounded' | 'pill';
  darkMode: boolean;
  customCss?: string;
}

export type ThemePreset =
  | 'modern-blue'
  | 'classic-dark'
  | 'vibrant'
  | 'minimal'
  | 'nature'
  | 'custom';

interface BrandingCustomizerProps {
  config: BrandingConfig;
  onChange: (config: BrandingConfig) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

interface ThemeOption {
  id: ThemePreset;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  preview: string; // gradient
}

const THEME_PRESETS: ThemeOption[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    primary: '#4B3BF5',
    secondary: '#6366F1',
    accent: '#00D4AA',
    bg: '#FFFFFF',
    text: '#1A1A2E',
    preview: 'bg-gradient-to-br from-[#4B3BF5] to-[#6366F1]',
  },
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    primary: '#1E293B',
    secondary: '#334155',
    accent: '#38BDF8',
    bg: '#0F172A',
    text: '#F1F5F9',
    preview: 'bg-gradient-to-br from-[#1E293B] to-[#0F172A]',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    primary: '#E91E8C',
    secondary: '#F472B6',
    accent: '#FFB547',
    bg: '#FFFFFF',
    text: '#1A1A2E',
    preview: 'bg-gradient-to-br from-[#E91E8C] to-[#F472B6]',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primary: '#18181B',
    secondary: '#3F3F46',
    accent: '#A1A1AA',
    bg: '#FAFAFA',
    text: '#18181B',
    preview: 'bg-gradient-to-br from-[#18181B] to-[#3F3F46]',
  },
  {
    id: 'nature',
    name: 'Nature',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B',
    bg: '#FFFFFF',
    text: '#1A1A2E',
    preview: 'bg-gradient-to-br from-[#059669] to-[#10B981]',
  },
  {
    id: 'custom',
    name: 'Custom',
    primary: '#4B3BF5',
    secondary: '#6366F1',
    accent: '#00D4AA',
    bg: '#FFFFFF',
    text: '#1A1A2E',
    preview: 'bg-gradient-to-br from-pearl to-cloud',
  },
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Plus Jakarta Sans', label: 'Jakarta Sans (Clean)' },
  { value: 'DM Sans', label: 'DM Sans (Geometric)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Tech)' },
];

const HERO_STYLES: { id: BrandingConfig['heroStyle']; label: string; desc: string }[] = [
  { id: 'gradient', label: 'Gradient', desc: 'Color gradient background' },
  { id: 'image', label: 'Image', desc: 'Background image with overlay' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean white with accent' },
];

const RADIUS_OPTIONS: { id: BrandingConfig['borderRadius']; label: string; sample: string }[] = [
  { id: 'sharp', label: 'Sharp', sample: 'rounded-none' },
  { id: 'rounded', label: 'Rounded', sample: 'rounded-lg' },
  { id: 'pill', label: 'Pill', sample: 'rounded-full' },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const BrandingCustomizer: React.FC<BrandingCustomizerProps> = ({ config, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    theme: true,
    colors: false,
    logo: true,
    typography: false,
    layout: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateConfig = useCallback(
    (updates: Partial<BrandingConfig>) => {
      onChange({ ...config, ...updates });
    },
    [config, onChange]
  );

  const handleThemeSelect = useCallback(
    (preset: ThemeOption) => {
      updateConfig({
        theme: preset.id,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        accentColor: preset.accent,
        backgroundColor: preset.bg,
        textColor: preset.text,
      });
    },
    [updateConfig]
  );

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        updateConfig({ logoUrl: url, logoFile: file });
      }
    },
    [updateConfig]
  );

  const handleRemoveLogo = useCallback(() => {
    updateConfig({ logoUrl: null, logoFile: null });
  }, [updateConfig]);

  const handleReset = useCallback(() => {
    const defaultPreset = THEME_PRESETS[0];
    onChange({
      theme: defaultPreset.id,
      primaryColor: defaultPreset.primary,
      secondaryColor: defaultPreset.secondary,
      accentColor: defaultPreset.accent,
      backgroundColor: defaultPreset.bg,
      textColor: defaultPreset.text,
      logoUrl: null,
      logoFile: null,
      faviconUrl: null,
      fontFamily: 'Inter',
      heroStyle: 'gradient',
      borderRadius: 'rounded',
      darkMode: false,
    });
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Palette className="w-4 h-4 text-celestial-indigo" />
          Branding
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[9px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Theme Presets */}
      <CollapsibleSection
        title="Theme Preset"
        icon={Palette}
        expanded={expandedSections.theme}
        onToggle={() => toggleSection('theme')}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleThemeSelect(preset)}
              className={`p-2 rounded-lg border-2 transition-all text-center ${
                config.theme === preset.id
                  ? 'border-celestial-indigo shadow-sm'
                  : 'border-transparent hover:border-cloud dark:hover:border-nebula-purple/30'
              }`}
            >
              <div className={`w-full h-6 rounded ${preset.preview} mb-1`} />
              <p className="text-[8px] font-bold text-ink-black dark:text-pearl">{preset.name}</p>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Color Customization */}
      <CollapsibleSection
        title="Colors"
        icon={Palette}
        expanded={expandedSections.colors}
        onToggle={() => toggleSection('colors')}
      >
        <div className="space-y-2">
          <ColorPicker
            label="Primary"
            value={config.primaryColor}
            onChange={(v) => updateConfig({ primaryColor: v, theme: 'custom' })}
          />
          <ColorPicker
            label="Secondary"
            value={config.secondaryColor}
            onChange={(v) => updateConfig({ secondaryColor: v, theme: 'custom' })}
          />
          <ColorPicker
            label="Accent"
            value={config.accentColor}
            onChange={(v) => updateConfig({ accentColor: v, theme: 'custom' })}
          />
          <ColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(v) => updateConfig({ backgroundColor: v, theme: 'custom' })}
          />
          <ColorPicker
            label="Text"
            value={config.textColor}
            onChange={(v) => updateConfig({ textColor: v, theme: 'custom' })}
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {config.darkMode ? (
                <Moon className="w-3 h-3 text-celestial-indigo" />
              ) : (
                <Sun className="w-3 h-3 text-sunset-amber" />
              )}
              <span className="text-[9px] font-semibold text-ink-black dark:text-pearl">
                Dark Mode
              </span>
            </div>
            <button
              onClick={() => updateConfig({ darkMode: !config.darkMode })}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                config.darkMode ? 'bg-celestial-indigo' : 'bg-silver-mist/30'
              }`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                  config.darkMode ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Logo Upload */}
      <CollapsibleSection
        title="Logo"
        icon={ImageIcon}
        expanded={expandedSections.logo}
        onToggle={() => toggleSection('logo')}
      >
        {config.logoUrl ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10">
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/20 flex items-center justify-center overflow-hidden">
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-semibold text-ink-black dark:text-pearl">
                  Logo uploaded
                </p>
                <p className="text-[8px] text-silver-mist">Click to replace</p>
              </div>
              <button
                onClick={handleRemoveLogo}
                className="p-1 text-silver-mist hover:text-coral-alert transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-lg p-4 flex flex-col items-center justify-center text-silver-mist hover:text-celestial-indigo hover:border-celestial-indigo/30 hover:bg-celestial-indigo/5 transition-all">
              <Upload className="w-5 h-5 mb-1" />
              <p className="text-[9px] font-bold">Upload Logo</p>
              <p className="text-[8px] text-silver-mist">PNG, SVG, or JPG (max 2 MB)</p>
            </div>
            <input
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        )}
      </CollapsibleSection>

      {/* Typography */}
      <CollapsibleSection
        title="Typography"
        icon={Type}
        expanded={expandedSections.typography}
        onToggle={() => toggleSection('typography')}
      >
        <div className="space-y-1.5">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => updateConfig({ fontFamily: font.value })}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-colors text-left ${
                config.fontFamily === font.value
                  ? 'border-celestial-indigo bg-celestial-indigo/5'
                  : 'border-cloud dark:border-nebula-purple/20 hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10'
              }`}
            >
              <span
                className="text-[10px] font-semibold text-ink-black dark:text-pearl"
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </span>
              {config.fontFamily === font.value && (
                <CheckCircle2 className="w-3 h-3 text-celestial-indigo" />
              )}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Layout */}
      <CollapsibleSection
        title="Layout"
        icon={Layout}
        expanded={expandedSections.layout}
        onToggle={() => toggleSection('layout')}
      >
        <div className="space-y-3">
          {/* Hero Style */}
          <div>
            <p className="text-[8px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
              Hero Style
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {HERO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateConfig({ heroStyle: style.id })}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    config.heroStyle === style.id
                      ? 'border-celestial-indigo bg-celestial-indigo/5'
                      : 'border-cloud dark:border-nebula-purple/20 hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10'
                  }`}
                >
                  <p className="text-[9px] font-bold text-ink-black dark:text-pearl">
                    {style.label}
                  </p>
                  <p className="text-[7px] text-silver-mist">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <p className="text-[8px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
              Border Radius
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateConfig({ borderRadius: opt.id })}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    config.borderRadius === opt.id
                      ? 'border-celestial-indigo bg-celestial-indigo/5'
                      : 'border-cloud dark:border-nebula-purple/20 hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10'
                  }`}
                >
                  <div
                    className={`w-8 h-5 mx-auto mb-1 bg-celestial-indigo/20 border border-celestial-indigo/30 ${opt.sample}`}
                  />
                  <p className="text-[8px] font-bold text-ink-black dark:text-pearl">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const CollapsibleSection: React.FC<{
  title: string;
  icon: LucideIcon;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon: Icon, expanded, onToggle, children }) => (
  <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2">
      <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-celestial-indigo" />
        {title}
      </p>
      {expanded ? (
        <ChevronUp className="w-3 h-3 text-silver-mist" />
      ) : (
        <ChevronDown className="w-3 h-3 text-silver-mist" />
      )}
    </button>
    {expanded && <div className="px-3 pb-3">{children}</div>}
  </div>
);

const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-[9px] font-semibold text-ink-black dark:text-pearl">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] text-silver-mist font-mono">{value}</span>
      <label className="relative cursor-pointer">
        <div
          className="w-6 h-6 rounded-md border border-cloud dark:border-nebula-purple/30 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
    </div>
  </div>
);

export default BrandingCustomizer;
