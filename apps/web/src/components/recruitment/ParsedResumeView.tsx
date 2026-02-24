/**
 * @module ParsedResumeView
 * @description Structured view of a parsed resume showing name, contact, experience,
 *              education, skills, certifications, and languages
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  Star,
  CheckCircle2,
} from 'lucide-react';
import type { ResumeData } from '@/lib/services/ai/types';

// ── Types ────────────────────────────────────────────────────────────────────────

interface ParsedResumeViewProps {
  resume: ResumeData;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const SKILL_LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; width: string }
> = {
  BEGINNER: {
    label: 'Beginner',
    color: 'text-silver-mist',
    bgColor: 'bg-silver-mist/20',
    width: 'w-1/4',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    color: 'text-sunset-amber',
    bgColor: 'bg-sunset-amber/20',
    width: 'w-2/4',
  },
  ADVANCED: {
    label: 'Advanced',
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/20',
    width: 'w-3/4',
  },
  EXPERT: {
    label: 'Expert',
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/20',
    width: 'w-full',
  },
};

const PROFICIENCY_CONFIG: Record<string, { label: string; color: string }> = {
  BASIC: { label: 'Basic', color: 'text-silver-mist' },
  INTERMEDIATE: { label: 'Intermediate', color: 'text-sunset-amber' },
  PROFESSIONAL: { label: 'Professional', color: 'text-celestial-indigo' },
  FLUENT: { label: 'Fluent', color: 'text-neural-mint' },
  NATIVE: { label: 'Native', color: 'text-neural-mint' },
};

const formatMonths = (months: number): string => {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr${years > 1 ? 's' : ''}`;
  return `${years} yr${years > 1 ? 's' : ''} ${rem} mo`;
};

const _confidenceColor = (c: number): string => {
  if (c >= 0.85) return 'text-neural-mint';
  if (c >= 0.65) return 'text-sunset-amber';
  return 'text-coral-alert';
};

// ── Section Wrapper ──────────────────────────────────────────────────────────────

const Section: React.FC<{
  icon: LucideIcon;
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ icon: Icon, title, count, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10 transition-colors"
      >
        <Icon className="w-4 h-4 text-celestial-indigo" />
        <span className="text-[11px] font-bold text-ink-black dark:text-pearl">{title}</span>
        {count !== undefined && (
          <span className="text-[9px] font-bold text-silver-mist bg-pearl dark:bg-deep-cosmos/20 px-1.5 py-0.5 rounded">
            {count}
          </span>
        )}
        <span className="ml-auto">
          {open ? (
            <ChevronUp className="w-3 h-3 text-silver-mist" />
          ) : (
            <ChevronDown className="w-3 h-3 text-silver-mist" />
          )}
        </span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────────

export const ParsedResumeView: React.FC<ParsedResumeViewProps> = ({ resume }) => {
  const totalSkills =
    resume.skills.technical.length +
    resume.skills.soft.length +
    resume.skills.domain.length +
    resume.skills.tools.length;

  return (
    <div className="space-y-3">
      {/* Header: Contact Info + Confidence */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-lg font-bold text-celestial-indigo shrink-0">
            {resume.contact.name
              ? resume.contact.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : '?'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl">
              {resume.contact.name || 'Unknown Candidate'}
            </h3>

            {/* Contact Details */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {resume.contact.email && (
                <span className="text-[10px] text-silver-mist flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {resume.contact.email}
                </span>
              )}
              {resume.contact.phone && (
                <span className="text-[10px] text-silver-mist flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {resume.contact.phone}
                </span>
              )}
              {resume.contact.location && (
                <span className="text-[10px] text-silver-mist flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {resume.contact.location}
                </span>
              )}
              {resume.contact.linkedin && (
                <span className="text-[10px] text-silver-mist flex items-center gap-1">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2">
              {resume.totalExperienceMonths > 0 && (
                <span className="text-[10px] font-semibold text-celestial-indigo bg-celestial-indigo/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {formatMonths(resume.totalExperienceMonths)} experience
                </span>
              )}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  resume.confidence >= 0.85
                    ? 'bg-neural-mint/10 text-neural-mint'
                    : resume.confidence >= 0.65
                      ? 'bg-sunset-amber/10 text-sunset-amber'
                      : 'bg-coral-alert/10 text-coral-alert'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {Math.round(resume.confidence * 100)}% confidence
              </span>
              {resume.fileName && (
                <span className="text-[10px] text-silver-mist flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {resume.fileName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mt-3 px-2 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
            <p className="text-[10px] text-ink-black dark:text-pearl leading-relaxed">
              {resume.summary}
            </p>
          </div>
        )}
      </div>

      {/* Work Experience */}
      <Section icon={Briefcase} title="Work Experience" count={resume.experience.length}>
        <div className="space-y-2 relative">
          {resume.experience.length > 1 && (
            <div className="absolute left-[7px] top-4 bottom-4 w-px bg-cloud dark:bg-nebula-purple/20" />
          )}
          {resume.experience.map((exp, i) => (
            <div key={i} className="relative pl-5">
              <div
                className={`absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2 ${
                  exp.isCurrent
                    ? 'bg-neural-mint/20 border-neural-mint'
                    : 'bg-pearl dark:bg-deep-cosmos border-cloud dark:border-nebula-purple/30'
                }`}
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-ink-black dark:text-pearl">
                    {exp.title}
                  </span>
                  {exp.isCurrent && (
                    <span className="text-[8px] font-bold text-neural-mint bg-neural-mint/10 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-silver-mist">
                  <Building2 className="w-3 h-3" />
                  <span className="font-medium">{exp.company}</span>
                  {exp.location && (
                    <>
                      <span>·</span>
                      <span>{exp.location}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-silver-mist">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate || 'N/A'}
                  </span>
                  <span>·</span>
                  <span className="font-semibold">{formatMonths(exp.durationMonths)}</span>
                </div>
                {exp.description && (
                  <p className="text-[9px] text-ink-black dark:text-pearl/80 mt-0.5">
                    {exp.description}
                  </p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.achievements.map((a, j) => (
                      <li
                        key={j}
                        className="text-[9px] text-ink-black dark:text-pearl/80 flex items-start gap-1"
                      >
                        <Star className="w-2.5 h-2.5 text-sunset-amber shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {resume.experience.length === 0 && (
            <p className="text-[10px] text-silver-mist italic">No work experience extracted</p>
          )}
        </div>
      </Section>

      {/* Education */}
      <Section icon={GraduationCap} title="Education" count={resume.education.length}>
        <div className="space-y-2">
          {resume.education.map((edu, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-pearl/20 dark:bg-deep-cosmos/10"
            >
              <GraduationCap className="w-4 h-4 text-celestial-indigo shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-ink-black dark:text-pearl">
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ''}
                </p>
                <p className="text-[10px] text-silver-mist">{edu.institution}</p>
                <div className="flex items-center gap-2 text-[9px] text-silver-mist mt-0.5">
                  {edu.graduationYear && <span>Class of {edu.graduationYear}</span>}
                  {edu.gpa && (
                    <>
                      <span>·</span>
                      <span>GPA: {edu.gpa}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {resume.education.length === 0 && (
            <p className="text-[10px] text-silver-mist italic">No education extracted</p>
          )}
        </div>
      </Section>

      {/* Skills */}
      <Section icon={Wrench} title="Skills" count={totalSkills}>
        <div className="space-y-3">
          {/* Technical Skills */}
          {resume.skills.technical.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
                Technical
              </p>
              <div className="space-y-1">
                {resume.skills.technical.map((s, i) => {
                  const cfg = SKILL_LEVEL_CONFIG[s.level] || SKILL_LEVEL_CONFIG.BEGINNER;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-ink-black dark:text-pearl w-28 truncate">
                        {s.name}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                        <div className={`h-full rounded-full ${cfg.bgColor} ${cfg.width}`} />
                      </div>
                      <span className={`text-[8px] font-semibold ${cfg.color} w-16 text-right`}>
                        {cfg.label}
                      </span>
                      {s.yearsOfExperience && (
                        <span className="text-[8px] text-silver-mist w-8 text-right">
                          {s.yearsOfExperience}yr
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {resume.skills.soft.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
                Soft Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {resume.skills.soft.map((s, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl bg-pearl/20 dark:bg-deep-cosmos/10"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Domain Skills */}
          {resume.skills.domain.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
                Domain
              </p>
              <div className="flex flex-wrap gap-1">
                {resume.skills.domain.map((s, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full border border-celestial-indigo/20 text-celestial-indigo bg-celestial-indigo/5"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {resume.skills.tools.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
                Tools & Technologies
              </p>
              <div className="flex flex-wrap gap-1">
                {resume.skills.tools.map((s, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full border border-sunset-amber/20 text-sunset-amber bg-sunset-amber/5"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {totalSkills === 0 && (
            <p className="text-[10px] text-silver-mist italic">No skills extracted</p>
          )}
        </div>
      </Section>

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <Section icon={Award} title="Certifications" count={resume.certifications.length}>
          <div className="space-y-1">
            {resume.certifications.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-pearl/20 dark:bg-deep-cosmos/10"
              >
                <Award className="w-3.5 h-3.5 text-sunset-amber shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-ink-black dark:text-pearl truncate">
                    {c.name}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] text-silver-mist">
                    {c.issuer && <span>{c.issuer}</span>}
                    {c.year && (
                      <>
                        <span>·</span>
                        <span>{c.year}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <Section icon={Globe} title="Languages" count={resume.languages.length}>
          <div className="flex flex-wrap gap-2">
            {resume.languages.map((l, i) => {
              const cfg = PROFICIENCY_CONFIG[l.proficiency] || PROFICIENCY_CONFIG.BASIC;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10"
                >
                  <Globe className="w-3 h-3 text-celestial-indigo" />
                  <span className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                    {l.language}
                  </span>
                  <span className={`text-[8px] font-semibold ${cfg.color}`}>({cfg.label})</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
};

export default ParsedResumeView;
