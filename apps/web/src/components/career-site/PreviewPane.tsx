/**
 * @module PreviewPane
 * @description Live career site preview in a browser-frame mockup that
 *              reflects branding config, job listings, and section toggles in real time
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Users,
  Zap,
  Globe,
  Shield,
} from 'lucide-react';
import type { BrandingConfig } from './BrandingCustomizer';
import type { CareerJobListing } from './JobListingEditor';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface SectionConfig {
  hero: boolean;
  about: boolean;
  values: boolean;
  perks: boolean;
  team: boolean;
  openPositions: boolean;
}

interface PreviewPaneProps {
  branding: BrandingConfig;
  listings: CareerJobListing[];
  sections: SectionConfig;
  companyName: string;
  companyTagline?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const getBorderRadius = (style: BrandingConfig['borderRadius']): string => {
  if (style === 'sharp') return 'rounded-none';
  if (style === 'pill') return 'rounded-full';
  return 'rounded-xl';
};

const getBtnRadius = (style: BrandingConfig['borderRadius']): string => {
  if (style === 'sharp') return 'rounded-none';
  if (style === 'pill') return 'rounded-full';
  return 'rounded-lg';
};

const MOCK_VALUES = [
  { icon: Zap, title: 'Innovation First', desc: 'We push boundaries and embrace new ideas.' },
  { icon: Users, title: 'Team Spirit', desc: 'Collaboration is at the heart of everything.' },
  { icon: Shield, title: 'Trust & Integrity', desc: 'We build trust through transparency.' },
  { icon: Globe, title: 'Global Impact', desc: 'Our work reaches people worldwide.' },
];

const MOCK_PERKS = [
  'Health Insurance',
  'Remote Flexibility',
  '401(k) Match',
  'Learning Budget',
  'Wellness Stipend',
  'Unlimited PTO',
  'Home Office Setup',
  'Team Retreats',
];

// ── Component ────────────────────────────────────────────────────────────────────

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  branding,
  listings,
  sections,
  companyName,
  companyTagline,
}) => {
  const visibleListings = useMemo(
    () =>
      listings
        .filter((l) => l.isVisible)
        .sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.order - b.order;
        }),
    [listings]
  );

  const cardRadius = getBorderRadius(branding.borderRadius);
  const btnRadius = getBtnRadius(branding.borderRadius);

  return (
    <div className="rounded-xl border-[6px] border-ink-black dark:border-deep-cosmos overflow-hidden shadow-xl flex flex-col h-full">
      {/* Browser Chrome */}
      <div className="bg-ink-black dark:bg-deep-cosmos px-3 py-1.5 flex items-center gap-1.5">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-coral-alert" />
          <div className="w-2 h-2 rounded-full bg-sunset-amber" />
          <div className="w-2 h-2 rounded-full bg-neural-mint" />
        </div>
        <div className="flex-1 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/10 text-[8px] text-white/50 font-mono">
            <Globe className="w-2.5 h-2.5" />
            careers.{companyName.toLowerCase().replace(/\s+/g, '')}.com
          </div>
        </div>
        <ExternalLink className="w-2.5 h-2.5 text-white/30" />
      </div>

      {/* Site Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: branding.darkMode ? '#0F172A' : branding.backgroundColor,
          color: branding.darkMode ? '#F1F5F9' : branding.textColor,
          fontFamily: branding.fontFamily,
        }}
      >
        {/* Navigation */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: branding.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-5 object-contain" />
            ) : (
              <div className="text-[10px] font-bold" style={{ color: branding.primaryColor }}>
                {companyName}
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-3 text-[8px]"
            style={{ color: branding.darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
          >
            <span>About</span>
            <span>Jobs</span>
            <span>Culture</span>
            <span
              className={`px-2 py-0.5 ${btnRadius} text-white text-[7px] font-bold`}
              style={{ backgroundColor: branding.primaryColor }}
            >
              Apply
            </span>
          </div>
        </div>

        {/* Hero Section */}
        {sections.hero && (
          <div className="relative overflow-hidden">
            {branding.heroStyle === 'gradient' ? (
              <div
                className="py-12 px-6 text-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                }}
              >
                <h1 className="text-xl font-black mb-2" style={{ fontFamily: branding.fontFamily }}>
                  {companyTagline || 'Join Our Mission'}
                </h1>
                <p className="text-[10px] opacity-80 max-w-xs mx-auto mb-4">
                  We&apos;re building the future of work. Find your place on our growing team.
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    className={`px-4 py-1.5 bg-white text-[9px] font-bold ${btnRadius}`}
                    style={{ color: branding.primaryColor }}
                  >
                    View Open Roles
                  </button>
                  <button
                    className={`px-4 py-1.5 border border-white/30 text-[9px] font-bold text-white ${btnRadius}`}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ) : branding.heroStyle === 'image' ? (
              <div
                className="py-12 px-6 text-center text-white relative"
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}CC, ${branding.secondaryColor}CC)`,
                }}
              >
                <h1 className="text-xl font-black mb-2 relative z-10">
                  {companyTagline || 'Join Our Mission'}
                </h1>
                <p className="text-[10px] opacity-80 max-w-xs mx-auto mb-4 relative z-10">
                  Discover opportunities that match your passion.
                </p>
                <button
                  className={`px-4 py-1.5 bg-white text-[9px] font-bold ${btnRadius} relative z-10`}
                  style={{ color: branding.primaryColor }}
                >
                  View Open Roles
                </button>
              </div>
            ) : (
              <div className="py-10 px-6 text-center">
                <h1 className="text-xl font-black mb-2" style={{ color: branding.primaryColor }}>
                  {companyTagline || 'Join Our Mission'}
                </h1>
                <p className="text-[10px] opacity-60 max-w-xs mx-auto mb-4">
                  Explore careers that make an impact every day.
                </p>
                <button
                  className={`px-4 py-1.5 text-white text-[9px] font-bold ${btnRadius}`}
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  View Open Roles
                </button>
              </div>
            )}
          </div>
        )}

        {/* About Section */}
        {sections.about && (
          <div className="px-6 py-6">
            <h2 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
              About {companyName}
            </h2>
            <p className="text-[9px] opacity-60 leading-relaxed max-w-lg">
              We are a team of passionate innovators dedicated to transforming the way organizations
              manage and empower their people. With cutting-edge technology and a human-first
              approach, we build tools that make work better for everyone.
            </p>
          </div>
        )}

        {/* Values Section */}
        {sections.values && (
          <div
            className="px-6 py-4"
            style={{
              backgroundColor: branding.darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: branding.primaryColor }}>
              Our Values
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_VALUES.map((val, i) => (
                <div
                  key={i}
                  className={`p-2.5 ${cardRadius} border`}
                  style={{
                    borderColor: branding.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  }}
                >
                  <val.icon className="w-3.5 h-3.5 mb-1" style={{ color: branding.accentColor }} />
                  <p className="text-[9px] font-bold">{val.title}</p>
                  <p className="text-[7px] opacity-50">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perks Section */}
        {sections.perks && (
          <div className="px-6 py-4">
            <h2 className="text-sm font-bold mb-3" style={{ color: branding.primaryColor }}>
              Perks & Benefits
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {MOCK_PERKS.map((perk, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 ${btnRadius} text-[8px] font-semibold border`}
                  style={{
                    borderColor: branding.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    color: branding.darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  }}
                >
                  {perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Team Gallery */}
        {sections.team && (
          <div
            className="px-6 py-4"
            style={{
              backgroundColor: branding.darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: branding.primaryColor }}>
              Meet the Team
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {['SC', 'JW', 'EP', 'MK'].map((initials, i) => (
                <div key={i} className="text-center">
                  <div
                    className={`w-10 h-10 mx-auto mb-1 ${cardRadius} flex items-center justify-center text-[9px] font-bold text-white`}
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? branding.primaryColor : branding.secondaryColor,
                    }}
                  >
                    {initials}
                  </div>
                  <div
                    className={`h-2 w-12 mx-auto ${cardRadius} mb-0.5`}
                    style={{
                      backgroundColor: branding.darkMode
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.06)',
                    }}
                  />
                  <div
                    className={`h-1.5 w-8 mx-auto ${cardRadius}`}
                    style={{
                      backgroundColor: branding.darkMode
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.03)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Positions */}
        {sections.openPositions && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: branding.primaryColor }}>
                Open Positions ({visibleListings.length})
              </h2>
            </div>

            {/* Search Bar */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 mb-3 border ${cardRadius}`}
              style={{
                borderColor: branding.darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              }}
            >
              <Search className="w-3 h-3 opacity-30" />
              <span className="text-[8px] opacity-30">Search positions...</span>
            </div>

            {/* Job Cards */}
            <div className="space-y-1.5">
              {visibleListings.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className={`p-3 border ${cardRadius} transition-all hover:shadow-sm`}
                  style={{
                    borderColor: job.isFeatured
                      ? branding.accentColor + '40'
                      : branding.darkMode
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.06)',
                    backgroundColor: job.isFeatured
                      ? branding.darkMode
                        ? 'rgba(255,255,255,0.02)'
                        : branding.accentColor + '08'
                      : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <p className="text-[10px] font-bold">{job.title}</p>
                        {job.isFeatured && (
                          <Star className="w-2.5 h-2.5" style={{ color: branding.accentColor }} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[7px] opacity-50">
                        <span>{job.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2 h-2" /> {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.mode}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-30" />
                  </div>
                </div>
              ))}

              {visibleListings.length > 5 && (
                <p className="text-center text-[8px] opacity-40 py-1">
                  +{visibleListings.length - 5} more positions
                </p>
              )}

              {visibleListings.length === 0 && (
                <div className="text-center py-4">
                  <Briefcase className="w-4 h-4 opacity-10 mx-auto mb-1" />
                  <p className="text-[8px] opacity-30">No open positions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="px-6 py-4 mt-2 border-t text-center"
          style={{ borderColor: branding.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
        >
          <p className="text-[7px] opacity-30">
            © 2026 {companyName}. All rights reserved. Powered by AURA HCM
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
