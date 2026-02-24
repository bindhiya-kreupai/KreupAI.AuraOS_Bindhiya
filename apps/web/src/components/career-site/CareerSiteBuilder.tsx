/**
 * @module CareerSiteBuilder
 * @description Main career site builder orchestrating branding, job listings,
 *              section toggles, and live preview in a split-pane layout
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Save,
  Eye,
  Palette,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Heart,
  Star,
} from 'lucide-react';
import { BrandingCustomizer } from './BrandingCustomizer';
import type { BrandingConfig } from './BrandingCustomizer';
import { JobListingEditor } from './JobListingEditor';
import type { CareerJobListing } from './JobListingEditor';
import { PreviewPane } from './PreviewPane';
import type { SectionConfig } from './PreviewPane';

// ── Types ────────────────────────────────────────────────────────────────────────

interface CareerSiteBuilderProps {
  companyName?: string;
  companyTagline?: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

const DEFAULT_BRANDING: BrandingConfig = {
  theme: 'modern-blue',
  primaryColor: '#4B3BF5',
  secondaryColor: '#6366F1',
  accentColor: '#00D4AA',
  backgroundColor: '#FFFFFF',
  textColor: '#1A1A2E',
  logoUrl: null,
  logoFile: null,
  faviconUrl: null,
  fontFamily: 'Inter',
  heroStyle: 'gradient',
  borderRadius: 'rounded',
  darkMode: false,
};

const DEFAULT_SECTIONS: SectionConfig = {
  hero: true,
  about: true,
  values: true,
  perks: true,
  team: true,
  openPositions: true,
};

const MOCK_LISTINGS: CareerJobListing[] = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-Time',
    mode: 'Hybrid',
    experienceLevel: 'Senior',
    salaryRange: { min: 180000, max: 220000, currency: 'USD', display: true },
    description: 'Build scalable distributed systems and lead technical initiatives.',
    responsibilities: ['Design microservices', 'Lead code reviews', 'Mentor junior engineers'],
    qualifications: ['5+ years experience', 'BS in Computer Science'],
    skills: ['TypeScript', 'React', 'Node.js', 'Kubernetes', 'PostgreSQL'],
    benefits: ['Health Insurance', '401(k)', 'RSUs'],
    applicationCount: 47,
    viewCount: 1240,
    publishedDate: '2026-02-01',
    expiryDate: '2026-03-31',
    isVisible: true,
    isFeatured: true,
    order: 1,
    externalBoards: ['LinkedIn', 'Indeed'],
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-Time',
    mode: 'Remote',
    experienceLevel: 'Mid-Level',
    salaryRange: { min: 140000, max: 170000, currency: 'USD', display: true },
    description: 'Drive product strategy and roadmap for our HCM platform.',
    responsibilities: ['Define product vision', 'Prioritize features', 'Analyze metrics'],
    qualifications: ['3+ years PM experience', 'SaaS background'],
    skills: ['Product Strategy', 'Analytics', 'Agile', 'SQL'],
    benefits: ['Health Insurance', '401(k)', 'PTO'],
    applicationCount: 32,
    viewCount: 890,
    publishedDate: '2026-02-05',
    expiryDate: '2026-04-05',
    isVisible: true,
    isFeatured: false,
    order: 2,
    externalBoards: ['LinkedIn'],
  },
  {
    id: 'job-3',
    title: 'UX Designer',
    department: 'Design',
    location: 'Austin, TX',
    type: 'Full-Time',
    mode: 'Hybrid',
    experienceLevel: 'Mid-Level',
    salaryRange: { min: 120000, max: 150000, currency: 'USD', display: true },
    description: 'Create beautiful, intuitive interfaces for enterprise users.',
    responsibilities: ['User research', 'Wireframes & prototypes', 'Design system maintenance'],
    qualifications: ['3+ years UX experience', 'Figma proficiency'],
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    benefits: ['Health Insurance', '401(k)'],
    applicationCount: 28,
    viewCount: 670,
    publishedDate: '2026-02-10',
    isVisible: true,
    isFeatured: false,
    order: 3,
    externalBoards: ['LinkedIn', 'Dribbble'],
  },
  {
    id: 'job-4',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-Time',
    mode: 'Remote',
    experienceLevel: 'Entry-Level',
    salaryRange: { min: 80000, max: 100000, currency: 'USD', display: true },
    description: 'Turn data into insights that drive business decisions.',
    responsibilities: ['Build dashboards', 'Analyze trends', 'Report generation'],
    qualifications: ['1+ years experience', 'SQL proficiency'],
    skills: ['SQL', 'Python', 'Tableau', 'Excel'],
    benefits: ['Health Insurance'],
    applicationCount: 65,
    viewCount: 1450,
    publishedDate: '2026-02-15',
    isVisible: true,
    isFeatured: true,
    order: 4,
    externalBoards: ['Indeed', 'Glassdoor'],
  },
  {
    id: 'job-5',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-Time',
    mode: 'Onsite',
    experienceLevel: 'Senior',
    description: 'Manage infrastructure and CI/CD for high-availability systems.',
    responsibilities: ['Kubernetes management', 'CI/CD pipelines', 'Monitoring'],
    qualifications: ['5+ years experience', 'AWS/GCP certified'],
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'GitHub Actions'],
    benefits: ['Health Insurance', '401(k)', 'RSUs'],
    applicationCount: 19,
    viewCount: 420,
    publishedDate: '2026-02-18',
    isVisible: true,
    isFeatured: false,
    order: 5,
    externalBoards: ['LinkedIn'],
  },
  {
    id: 'job-6',
    title: 'Marketing Coordinator',
    department: 'Marketing',
    location: 'New York, NY',
    type: 'Contract',
    mode: 'Hybrid',
    experienceLevel: 'Entry-Level',
    description: 'Support marketing campaigns and content creation.',
    responsibilities: ['Social media', 'Campaign support', 'Content writing'],
    qualifications: ['1+ years experience'],
    skills: ['Social Media', 'Content Marketing', 'Analytics'],
    benefits: [],
    applicationCount: 12,
    viewCount: 310,
    isVisible: false,
    isFeatured: false,
    order: 6,
    externalBoards: [],
  },
];

const SECTION_OPTIONS: { key: keyof SectionConfig; label: string; icon: LucideIcon }[] = [
  { key: 'hero', label: 'Hero Banner', icon: ImageIcon },
  { key: 'about', label: 'About Us', icon: MessageSquare },
  { key: 'values', label: 'Our Values', icon: Heart },
  { key: 'perks', label: 'Perks & Benefits', icon: Star },
  { key: 'team', label: 'Team Gallery', icon: Users },
  { key: 'openPositions', label: 'Open Positions', icon: Briefcase },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const CareerSiteBuilder: React.FC<CareerSiteBuilderProps> = ({
  companyName = 'AURA Technologies',
  companyTagline,
}) => {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [listings, setListings] = useState<CareerJobListing[]>(MOCK_LISTINGS);
  const [sections, setSections] = useState<SectionConfig>(DEFAULT_SECTIONS);
  const [activePanel, setActivePanel] = useState<'branding' | 'listings' | 'sections'>('branding');
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBrandingChange = useCallback((config: BrandingConfig) => {
    setBranding(config);
    setHasChanges(true);
    setSaved(false);
  }, []);

  const handleListingsChange = useCallback((updated: CareerJobListing[]) => {
    setListings(updated);
    setHasChanges(true);
    setSaved(false);
  }, []);

  const handleToggleSection = useCallback((key: keyof SectionConfig) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-celestial-indigo" />
          <div>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">Career Site Builder</p>
            <p className="text-[9px] text-silver-mist">Customize your public career page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="flex items-center gap-1 text-[9px] text-sunset-amber">
              <AlertTriangle className="w-3 h-3" /> Unsaved changes
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1 text-[9px] text-neural-mint">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors">
            <Eye className="w-3 h-3" /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Save className="w-3 h-3" /> Publish
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[600px]">
        {/* Left Panel: Controls */}
        <div className="space-y-3 max-h-[700px] overflow-y-auto">
          {/* Panel Tabs */}
          <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
            {[
              { key: 'branding' as const, label: 'Branding', icon: Palette },
              { key: 'listings' as const, label: 'Listings', icon: Briefcase },
              { key: 'sections' as const, label: 'Sections', icon: Layers },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-bold transition-colors ${
                  activePanel === tab.key
                    ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Branding Panel */}
          {activePanel === 'branding' && (
            <BrandingCustomizer config={branding} onChange={handleBrandingChange} />
          )}

          {/* Listings Panel */}
          {activePanel === 'listings' && (
            <JobListingEditor listings={listings} onChange={handleListingsChange} />
          )}

          {/* Sections Panel */}
          {activePanel === 'sections' && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <Layers className="w-4 h-4 text-celestial-indigo" />
                Page Sections
              </p>
              <p className="text-[9px] text-silver-mist">
                Toggle sections to show or hide on your career page.
              </p>

              <div className="space-y-1">
                {SECTION_OPTIONS.map((section) => {
                  const enabled = sections[section.key];
                  return (
                    <button
                      key={section.key}
                      onClick={() => handleToggleSection(section.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
                        enabled
                          ? 'border-celestial-indigo/20 bg-celestial-indigo/5'
                          : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
                      }`}
                    >
                      <div
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          enabled ? 'bg-celestial-indigo' : 'bg-silver-mist/30'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                            enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <section.icon
                        className={`w-3.5 h-3.5 ${enabled ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                      />
                      <span
                        className={`text-[10px] font-semibold ${
                          enabled ? 'text-ink-black dark:text-pearl' : 'text-silver-mist'
                        }`}
                      >
                        {section.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Preview */}
        <PreviewPane
          branding={branding}
          listings={listings}
          sections={sections}
          companyName={companyName}
          companyTagline={companyTagline}
        />
      </div>
    </div>
  );
};

export default CareerSiteBuilder;
