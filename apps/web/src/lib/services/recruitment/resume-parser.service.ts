/**
 * AI Resume Parser Service
 * Extracts structured candidate data from resume text/files
 * Supports English and Arabic resume formats
 */

import { prisma } from '@aura/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedResume {
  candidateName: string;
  candidateNameAr?: string;
  email?: string;
  phone?: string;
  phones?: string[];
  linkedIn?: string;
  location?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  visaStatus?: string;

  // Professional
  currentTitle?: string;
  currentCompany?: string;
  totalExperienceYears: number;
  expectedSalary?: { amount: number; currency: string };
  noticePeriod?: string;

  // Education
  education: EducationEntry[];
  certifications: CertificationEntry[];

  // Experience
  experience: ExperienceEntry[];

  // Skills
  skills: SkillEntry[];
  languages: LanguageEntry[];

  // Summary
  summary?: string;
  objectiveStatement?: string;

  // Metadata
  parseConfidence: number; // 0-100
  rawTextLength: number;
  detectedLanguage: 'en' | 'ar' | 'mixed';
  parseWarnings: string[];
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  year?: number;
  grade?: string;
  location?: string;
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  year?: number;
  expiryYear?: number;
  credentialId?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  durationMonths?: number;
  description?: string;
  achievements?: string[];
  skills?: string[];
}

export interface SkillEntry {
  name: string;
  category: 'TECHNICAL' | 'SOFT' | 'LANGUAGE' | 'TOOL' | 'DOMAIN' | 'OTHER';
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
}

export interface LanguageEntry {
  language: string;
  proficiency: 'NATIVE' | 'FLUENT' | 'PROFESSIONAL' | 'INTERMEDIATE' | 'BASIC';
}

export interface CandidateScore {
  overallScore: number; // 0-100
  experienceScore: number;
  educationScore: number;
  skillMatchScore: number;
  locationScore: number;
  salaryfitScore: number;
  breakdown: ScoreBreakdown[];
  recommendation: 'STRONG_FIT' | 'GOOD_FIT' | 'PARTIAL_FIT' | 'NOT_FIT';
  recommendationAr: string;
}

export interface ScoreBreakdown {
  criterion: string;
  weight: number;
  score: number;
  notes: string;
}

export interface JobRequirements {
  title: string;
  department?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minExperienceYears: number;
  maxExperienceYears?: number;
  requiredEducation?: string;
  preferredEducation?: string;
  requiredCertifications?: string[];
  location?: string;
  remoteAllowed?: boolean;
  salaryRange?: { min: number; max: number; currency: string };
  languages?: string[];
  nationality?: string[];
}

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const PATTERNS = {
  email: /[\w.+-]+@[\w-]+\.[\w.-]+/gi,
  phone: /(?:\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}/g,
  linkedIn: /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/)[\w-]+/gi,
  year: /\b(19|20)\d{2}\b/g,
  dateRange: /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{4}|Present|Current)/gi,
  degree: /\b(?:B\.?(?:Sc?|A|E|Tech|Com)|M\.?(?:Sc?|A|E|Tech|BA|Com)|Ph\.?D|MBA|BBA|BSc|MSc|BE|ME|BTech|MTech|Bachelor|Master|Doctorate|Diploma|Associate|Certificate)\b/gi,
  salary: /(?:(?:AED|SAR|INR|USD|BHD|QAR|OMR|KWD)\s*[\d,]+(?:\.\d{2})?)|(?:[\d,]+(?:\.\d{2})?\s*(?:AED|SAR|INR|USD|BHD|QAR|OMR|KWD))/gi,
  arabicName: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g,
};

const SECTION_HEADERS = {
  experience: /(?:work\s+)?experience|employment\s+history|professional\s+background|career\s+history|الخبرة|خبرة العمل/i,
  education: /education|academic|qualification|المؤهلات|التعليم/i,
  skills: /skills|competenc|technical\s+proficiency|المهارات/i,
  certifications: /certif|accredit|license|الشهادات/i,
  summary: /summary|objective|profile|about|overview|الملخص|نبذة/i,
  languages: /languages?|اللغات/i,
  projects: /projects?|المشاريع/i,
};

const COMMON_SKILLS: Record<string, string> = {
  // Technical
  javascript: 'TECHNICAL', typescript: 'TECHNICAL', python: 'TECHNICAL',
  java: 'TECHNICAL', 'c#': 'TECHNICAL', 'c++': 'TECHNICAL', go: 'TECHNICAL',
  rust: 'TECHNICAL', ruby: 'TECHNICAL', php: 'TECHNICAL', swift: 'TECHNICAL',
  kotlin: 'TECHNICAL', react: 'TECHNICAL', angular: 'TECHNICAL', vue: 'TECHNICAL',
  'node.js': 'TECHNICAL', nodejs: 'TECHNICAL', nextjs: 'TECHNICAL',
  express: 'TECHNICAL', fastify: 'TECHNICAL', django: 'TECHNICAL',
  flask: 'TECHNICAL', spring: 'TECHNICAL', '.net': 'TECHNICAL',
  postgresql: 'TECHNICAL', mysql: 'TECHNICAL', mongodb: 'TECHNICAL',
  redis: 'TECHNICAL', elasticsearch: 'TECHNICAL', aws: 'TECHNICAL',
  azure: 'TECHNICAL', gcp: 'TECHNICAL', docker: 'TECHNICAL',
  kubernetes: 'TECHNICAL', terraform: 'TECHNICAL', jenkins: 'TECHNICAL',
  'ci/cd': 'TECHNICAL', git: 'TECHNICAL', graphql: 'TECHNICAL',
  'rest api': 'TECHNICAL', microservices: 'TECHNICAL', sql: 'TECHNICAL',
  html: 'TECHNICAL', css: 'TECHNICAL', sass: 'TECHNICAL',
  tailwind: 'TECHNICAL', figma: 'TOOL', jira: 'TOOL',
  confluence: 'TOOL', slack: 'TOOL', tableau: 'TOOL',
  'power bi': 'TOOL', excel: 'TOOL', sap: 'TOOL',
  oracle: 'TOOL', salesforce: 'TOOL',
  // Domain
  'machine learning': 'DOMAIN', 'deep learning': 'DOMAIN', ai: 'DOMAIN',
  nlp: 'DOMAIN', 'computer vision': 'DOMAIN', 'data science': 'DOMAIN',
  blockchain: 'DOMAIN', cybersecurity: 'DOMAIN', devops: 'DOMAIN',
  agile: 'DOMAIN', scrum: 'DOMAIN', erp: 'DOMAIN', hrms: 'DOMAIN',
  fintech: 'DOMAIN', ecommerce: 'DOMAIN',
  // Soft
  leadership: 'SOFT', 'team management': 'SOFT', communication: 'SOFT',
  'problem solving': 'SOFT', 'critical thinking': 'SOFT',
  'project management': 'SOFT', mentoring: 'SOFT', negotiation: 'SOFT',
};

// ============================================================================
// RESUME PARSER SERVICE
// ============================================================================

export class ResumeParserService {
  /**
   * Parse resume text into structured data
   */
  static parseResume(text: string): ParsedResume {
    const warnings: string[] = [];
    const trimmedText = text.trim();

    if (!trimmedText || trimmedText.length < 50) {
      return this.emptyResume('Resume text too short', trimmedText.length);
    }

    const detectedLanguage = this.detectLanguage(trimmedText);
    const sections = this.extractSections(trimmedText);

    // Extract contact info
    const emails = trimmedText.match(PATTERNS.email) || [];
    const phones = trimmedText.match(PATTERNS.phone) || [];
    const linkedIns = trimmedText.match(PATTERNS.linkedIn) || [];

    // Extract name (first meaningful line)
    const candidateName = this.extractName(trimmedText);
    const arabicNames = trimmedText.match(PATTERNS.arabicName) || [];

    // Extract experience
    const experience = this.extractExperience(sections.experience || '');
    const totalExperienceYears = this.calculateTotalExperience(experience);

    // Extract education
    const education = this.extractEducation(sections.education || '');

    // Extract skills
    const skills = this.extractSkills(sections.skills || '', trimmedText);

    // Extract certifications
    const certifications = this.extractCertifications(sections.certifications || '');

    // Extract languages
    const languages = this.extractLanguages(sections.languages || '', trimmedText);

    // Calculate confidence
    const parseConfidence = this.calculateConfidence({
      hasName: !!candidateName,
      hasEmail: emails.length > 0,
      hasPhone: phones.length > 0,
      hasExperience: experience.length > 0,
      hasEducation: education.length > 0,
      hasSkills: skills.length > 0,
      textLength: trimmedText.length,
    });

    if (emails.length === 0) warnings.push('No email address found');
    if (phones.length === 0) warnings.push('No phone number found');
    if (experience.length === 0) warnings.push('No work experience sections detected');

    return {
      candidateName: candidateName || 'Unknown',
      candidateNameAr: arabicNames.length > 0 ? arabicNames[0] : undefined,
      email: emails[0] || undefined,
      phone: phones[0] || undefined,
      phones: phones.length > 0 ? phones : undefined,
      linkedIn: linkedIns[0] ? `https://${linkedIns[0]}` : undefined,
      totalExperienceYears,
      currentTitle: experience[0]?.title,
      currentCompany: experience[0]?.company,
      education,
      certifications,
      experience,
      skills,
      languages,
      summary: sections.summary?.substring(0, 500),
      parseConfidence,
      rawTextLength: trimmedText.length,
      detectedLanguage,
      parseWarnings: warnings,
    };
  }

  /**
   * Score a candidate against job requirements
   */
  static scoreCandidate(resume: ParsedResume, requirements: JobRequirements): CandidateScore {
    const breakdown: ScoreBreakdown[] = [];

    // Experience score (25%)
    const expScore = this.scoreExperience(resume, requirements);
    breakdown.push({ criterion: 'Experience', weight: 25, score: expScore, notes: `${resume.totalExperienceYears} years (need ${requirements.minExperienceYears}+)` });

    // Education score (15%)
    const eduScore = this.scoreEducation(resume, requirements);
    breakdown.push({ criterion: 'Education', weight: 15, score: eduScore, notes: `${resume.education.length} degrees found` });

    // Skill match score (35%)
    const skillScore = this.scoreSkills(resume, requirements);
    breakdown.push({ criterion: 'Skills', weight: 35, score: skillScore.score, notes: `${skillScore.matched}/${requirements.requiredSkills.length} required skills` });

    // Location score (10%)
    const locScore = this.scoreLocation(resume, requirements);
    breakdown.push({ criterion: 'Location', weight: 10, score: locScore, notes: resume.location || 'Not specified' });

    // Salary fit score (15%)
    const salScore = this.scoreSalary(resume, requirements);
    breakdown.push({ criterion: 'Salary Fit', weight: 15, score: salScore, notes: resume.expectedSalary ? `${resume.expectedSalary.currency} ${resume.expectedSalary.amount}` : 'Not specified' });

    const overallScore = Math.round(
      (expScore * 0.25) + (eduScore * 0.15) + (skillScore.score * 0.35) +
      (locScore * 0.10) + (salScore * 0.15)
    );

    const recommendation = overallScore >= 80 ? 'STRONG_FIT' :
      overallScore >= 60 ? 'GOOD_FIT' :
      overallScore >= 40 ? 'PARTIAL_FIT' : 'NOT_FIT';

    const recommendationArMap: Record<string, string> = {
      STRONG_FIT: 'مناسب جداً',
      GOOD_FIT: 'مناسب',
      PARTIAL_FIT: 'مناسب جزئياً',
      NOT_FIT: 'غير مناسب',
    };

    return {
      overallScore,
      experienceScore: expScore,
      educationScore: eduScore,
      skillMatchScore: skillScore.score,
      locationScore: locScore,
      salaryfitScore: salScore,
      breakdown,
      recommendation,
      recommendationAr: recommendationArMap[recommendation],
    };
  }

  /**
   * Batch parse and score multiple candidates for a job
   */
  static async batchParseAndScore(
    tenantId: string,
    jobId: string,
    resumeTexts: Array<{ candidateId: string; text: string }>
  ): Promise<Array<{ candidateId: string; resume: ParsedResume; score?: CandidateScore }>> {
    // Get job requirements
    const job = await prisma.jobPosting.findFirst({
      where: { id: jobId, tenantId },
    });

    const requirements: JobRequirements | null = job ? {
      title: job.title,
      department: job.department || undefined,
      requiredSkills: (job.requiredSkills as string[]) || [],
      preferredSkills: (job.preferredSkills as string[]) || [],
      minExperienceYears: job.minExperience || 0,
      maxExperienceYears: job.maxExperience || undefined,
      requiredEducation: job.education || undefined,
      location: job.location || undefined,
      salaryRange: job.salaryMin && job.salaryMax ? {
        min: Number(job.salaryMin),
        max: Number(job.salaryMax),
        currency: job.currency || 'AED',
      } : undefined,
    } : null;

    return resumeTexts.map(({ candidateId, text }) => {
      const resume = this.parseResume(text);
      const score = requirements ? this.scoreCandidate(resume, requirements) : undefined;
      return { candidateId, resume, score };
    });
  }

  /**
   * Rank candidates for a position
   */
  static rankCandidates(
    candidates: Array<{ id: string; score: CandidateScore }>
  ): Array<{ id: string; rank: number; score: number; recommendation: string }> {
    return candidates
      .sort((a, b) => b.score.overallScore - a.score.overallScore)
      .map((c, i) => ({
        id: c.id,
        rank: i + 1,
        score: c.score.overallScore,
        recommendation: c.score.recommendation,
      }));
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private static detectLanguage(text: string): 'en' | 'ar' | 'mixed' {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
    const total = arabicChars + latinChars;
    if (total === 0) return 'en';
    const arabicRatio = arabicChars / total;
    if (arabicRatio > 0.7) return 'ar';
    if (arabicRatio > 0.2) return 'mixed';
    return 'en';
  }

  private static extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = 'summary';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let matched = false;
      for (const [key, pattern] of Object.entries(SECTION_HEADERS)) {
        if (pattern.test(trimmed) && trimmed.length < 60) {
          if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
          }
          currentSection = key;
          currentContent = [];
          matched = true;
          break;
        }
      }

      if (!matched) {
        currentContent.push(trimmed);
      }
    }

    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  }

  private static extractName(text: string): string {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    for (const line of lines.slice(0, 5)) {
      // Skip lines that look like headers, emails, phones
      if (PATTERNS.email.test(line)) continue;
      if (/^\+?\d/.test(line)) continue;
      if (line.length > 60) continue;
      if (/^(resume|cv|curriculum|bio)/i.test(line)) continue;

      // Name: typically 2-4 words, first/last capitalized
      const words = line.split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 5) {
        const allCapitalized = words.every(w => /^[A-Z\u0600-\u06FF]/.test(w));
        if (allCapitalized) return line;
      }

      // First non-trivial line might be name
      if (words.length >= 2 && words.length <= 4 && !/\d/.test(line)) {
        return line;
      }
    }

    return lines[0]?.substring(0, 50) || 'Unknown';
  }

  private static extractExperience(text: string): ExperienceEntry[] {
    if (!text) return [];

    const entries: ExperienceEntry[] = [];
    const blocks = text.split(/\n(?=[A-Z\u0600-\u06FF])/);

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) continue;

      // Find date range
      const dateMatch = block.match(PATTERNS.dateRange);
      const isCurrent = /present|current|now|حالي/i.test(block);

      // First line is usually title or company
      const title = lines[0] || '';
      const company = lines.length > 1 ? lines[1] : '';

      if (title.length > 3 && !PATTERNS.email.test(title)) {
        const achievements = lines.slice(2).filter(l =>
          /^[•\-\*▪►]/.test(l) || /^\d+[.)]\s/.test(l)
        ).map(l => l.replace(/^[•\-\*▪►\d.)]\s*/, ''));

        entries.push({
          title: title.replace(PATTERNS.dateRange, '').trim(),
          company: company.replace(PATTERNS.dateRange, '').trim() || 'Not specified',
          startDate: dateMatch?.[0]?.split(/[-–—to]+/)[0]?.trim(),
          endDate: isCurrent ? undefined : dateMatch?.[0]?.split(/[-–—to]+/)[1]?.trim(),
          isCurrent,
          description: lines.slice(2).join(' ').substring(0, 500),
          achievements: achievements.length > 0 ? achievements : undefined,
        });
      }
    }

    return entries;
  }

  private static extractEducation(text: string): EducationEntry[] {
    if (!text) return [];

    const entries: EducationEntry[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const degreeMatch = line.match(PATTERNS.degree);
      const yearMatch = line.match(PATTERNS.year);

      if (degreeMatch) {
        entries.push({
          degree: degreeMatch[0],
          field: line.replace(degreeMatch[0], '').replace(/[,\-–—in]/g, ' ').trim() || 'General',
          institution: lines[i + 1] || 'Not specified',
          year: yearMatch ? parseInt(yearMatch[yearMatch.length - 1]) : undefined,
        });
      }
    }

    return entries;
  }

  private static extractSkills(skillsText: string, fullText: string): SkillEntry[] {
    const skills: SkillEntry[] = [];
    const foundSkills = new Set<string>();

    // Check against known skills database
    const textLower = (skillsText + ' ' + fullText).toLowerCase();

    for (const [skill, category] of Object.entries(COMMON_SKILLS)) {
      if (textLower.includes(skill) && !foundSkills.has(skill)) {
        foundSkills.add(skill);
        skills.push({
          name: skill.charAt(0).toUpperCase() + skill.slice(1),
          category: category as SkillEntry['category'],
        });
      }
    }

    // Extract additional skills from bullet points
    if (skillsText) {
      const bullets = skillsText.split(/[•\-\*,;|\/\n]/).map(s => s.trim()).filter(s =>
        s.length > 1 && s.length < 40
      );

      for (const bullet of bullets) {
        const normalized = bullet.toLowerCase();
        if (!foundSkills.has(normalized) && !/^\d/.test(bullet)) {
          foundSkills.add(normalized);
          skills.push({
            name: bullet,
            category: 'OTHER',
          });
        }
      }
    }

    return skills;
  }

  private static extractCertifications(text: string): CertificationEntry[] {
    if (!text) return [];

    const entries: CertificationEntry[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);

    for (const line of lines) {
      const yearMatch = line.match(PATTERNS.year);
      const cleaned = line.replace(PATTERNS.year, '').replace(/[•\-\*▪►]/g, '').trim();
      if (cleaned.length > 3) {
        entries.push({
          name: cleaned,
          year: yearMatch ? parseInt(yearMatch[0]) : undefined,
        });
      }
    }

    return entries;
  }

  private static extractLanguages(langText: string, fullText: string): LanguageEntry[] {
    const languages: LanguageEntry[] = [];
    const langPatterns: Array<{ lang: string; pattern: RegExp }> = [
      { lang: 'English', pattern: /english/i },
      { lang: 'Arabic', pattern: /arabic|عربي/i },
      { lang: 'Hindi', pattern: /hindi|हिन्दी/i },
      { lang: 'Urdu', pattern: /urdu|اردو/i },
      { lang: 'French', pattern: /french|français/i },
      { lang: 'Spanish', pattern: /spanish|español/i },
      { lang: 'Malayalam', pattern: /malayalam/i },
      { lang: 'Tamil', pattern: /tamil/i },
      { lang: 'Telugu', pattern: /telugu/i },
      { lang: 'Bengali', pattern: /bengali|bangla/i },
      { lang: 'Tagalog', pattern: /tagalog|filipino/i },
    ];

    const text = langText + ' ' + fullText;

    for (const { lang, pattern } of langPatterns) {
      if (pattern.test(text)) {
        const proficiency = /native|mother\s*tongue|أم/i.test(text) && pattern.test(text)
          ? 'NATIVE'
          : /fluent|excellent/i.test(text) ? 'FLUENT'
          : /professional|good/i.test(text) ? 'PROFESSIONAL'
          : /intermediate|fair/i.test(text) ? 'INTERMEDIATE'
          : 'PROFESSIONAL';

        languages.push({ language: lang, proficiency });
      }
    }

    return languages;
  }

  private static calculateTotalExperience(experience: ExperienceEntry[]): number {
    if (experience.length === 0) return 0;

    let totalMonths = 0;
    for (const exp of experience) {
      if (exp.durationMonths) {
        totalMonths += exp.durationMonths;
      } else if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    }

    // Fallback: estimate from number of positions
    if (totalMonths === 0) {
      totalMonths = experience.length * 24; // Assume 2 years per position
    }

    return Math.round((totalMonths / 12) * 10) / 10;
  }

  private static scoreExperience(resume: ParsedResume, req: JobRequirements): number {
    if (resume.totalExperienceYears >= req.minExperienceYears) {
      if (req.maxExperienceYears && resume.totalExperienceYears > req.maxExperienceYears * 1.5) {
        return 70; // Overqualified
      }
      return Math.min(100, 80 + (resume.totalExperienceYears - req.minExperienceYears) * 5);
    }
    const ratio = resume.totalExperienceYears / Math.max(1, req.minExperienceYears);
    return Math.round(ratio * 60);
  }

  private static scoreEducation(resume: ParsedResume, req: JobRequirements): number {
    if (!req.requiredEducation) return 75;

    const degreeHierarchy: Record<string, number> = {
      'phd': 100, 'doctorate': 100, 'ph.d': 100,
      'mba': 90, 'master': 90, 'msc': 90, 'ma': 90, 'mtech': 90,
      'bachelor': 70, 'bsc': 70, 'ba': 70, 'btech': 70, 'be': 70,
      'diploma': 50, 'associate': 50, 'certificate': 40,
    };

    let maxScore = 0;
    for (const edu of resume.education) {
      const degreeLower = edu.degree.toLowerCase();
      for (const [key, score] of Object.entries(degreeHierarchy)) {
        if (degreeLower.includes(key)) {
          maxScore = Math.max(maxScore, score);
        }
      }
    }

    return maxScore || 30;
  }

  private static scoreSkills(resume: ParsedResume, req: JobRequirements): { score: number; matched: number } {
    const resumeSkillNames = new Set(resume.skills.map(s => s.name.toLowerCase()));
    let matched = 0;

    for (const reqSkill of req.requiredSkills) {
      const reqLower = reqSkill.toLowerCase();
      if (resumeSkillNames.has(reqLower) ||
          [...resumeSkillNames].some(s => s.includes(reqLower) || reqLower.includes(s))) {
        matched++;
      }
    }

    const requiredCount = Math.max(1, req.requiredSkills.length);
    let score = Math.round((matched / requiredCount) * 80);

    // Bonus for preferred skills
    if (req.preferredSkills) {
      let preferredMatched = 0;
      for (const skill of req.preferredSkills) {
        const skillLower = skill.toLowerCase();
        if (resumeSkillNames.has(skillLower) ||
            [...resumeSkillNames].some(s => s.includes(skillLower))) {
          preferredMatched++;
        }
      }
      score += Math.round((preferredMatched / Math.max(1, req.preferredSkills.length)) * 20);
    }

    return { score: Math.min(100, score), matched };
  }

  private static scoreLocation(resume: ParsedResume, req: JobRequirements): number {
    if (!req.location || req.remoteAllowed) return 80;
    if (!resume.location) return 50;

    const resumeLoc = resume.location.toLowerCase();
    const reqLoc = req.location.toLowerCase();

    if (resumeLoc.includes(reqLoc) || reqLoc.includes(resumeLoc)) return 100;

    // GCC proximity
    const gccCountries = ['uae', 'dubai', 'abu dhabi', 'saudi', 'riyadh', 'jeddah',
      'bahrain', 'manama', 'qatar', 'doha', 'oman', 'muscat', 'kuwait'];
    const isResumeGCC = gccCountries.some(c => resumeLoc.includes(c));
    const isReqGCC = gccCountries.some(c => reqLoc.includes(c));
    if (isResumeGCC && isReqGCC) return 70;

    return 30;
  }

  private static scoreSalary(resume: ParsedResume, req: JobRequirements): number {
    if (!req.salaryRange || !resume.expectedSalary) return 75;

    const expected = resume.expectedSalary.amount;
    const { min, max } = req.salaryRange;

    if (expected >= min && expected <= max) return 100;
    if (expected < min) return Math.max(50, 100 - ((min - expected) / min) * 100);
    if (expected > max) return Math.max(20, 100 - ((expected - max) / max) * 100);

    return 50;
  }

  private static calculateConfidence(factors: {
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    textLength: number;
  }): number {
    let score = 0;
    if (factors.hasName) score += 15;
    if (factors.hasEmail) score += 15;
    if (factors.hasPhone) score += 10;
    if (factors.hasExperience) score += 25;
    if (factors.hasEducation) score += 15;
    if (factors.hasSkills) score += 10;
    if (factors.textLength > 500) score += 5;
    if (factors.textLength > 1500) score += 5;
    return Math.min(100, score);
  }

  private static emptyResume(warning: string, textLength: number): ParsedResume {
    return {
      candidateName: 'Unknown',
      totalExperienceYears: 0,
      education: [],
      certifications: [],
      experience: [],
      skills: [],
      languages: [],
      parseConfidence: 0,
      rawTextLength: textLength,
      detectedLanguage: 'en',
      parseWarnings: [warning],
    };
  }
}

export default ResumeParserService;
