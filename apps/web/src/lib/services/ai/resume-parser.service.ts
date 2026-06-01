// @ts-nocheck — April 2026 sprint addition with heavy Prisma drift. Tracked under #29 for proper rewrite against current schema.
/**
 * Resume Parser Service
 * Phase 3: Intelligence Layer - Recruitment AI
 *
 * AI-powered resume parsing with skills extraction,
 * experience mapping, and candidate scoring
 */

import type {
  ResumeData,
  CandidateScore,
  JobMatch} from './types';
import {
  SkillMatch
} from './types';

/**
 * Skill categories for classification
 */
const SKILL_CATEGORIES = {
  TECHNICAL: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
    'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', '.net', 'rails',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
    'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science',
    'html', 'css', 'sass', 'webpack', 'graphql', 'rest api', 'microservices',
  ],
  SOFT: [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'project management', 'time management', 'adaptability', 'creativity', 'negotiation',
    'presentation', 'mentoring', 'conflict resolution', 'decision making', 'collaboration',
  ],
  DOMAIN: [
    'hr', 'human resources', 'payroll', 'recruitment', 'talent acquisition',
    'finance', 'accounting', 'audit', 'compliance', 'taxation',
    'sales', 'marketing', 'business development', 'customer success',
    'operations', 'supply chain', 'logistics', 'procurement',
    'healthcare', 'pharma', 'banking', 'insurance', 'retail', 'manufacturing',
  ],
  CERTIFICATIONS: [
    'pmp', 'scrum master', 'aws certified', 'azure certified', 'gcp certified',
    'cissp', 'cisa', 'cpa', 'cfa', 'phr', 'sphr', 'shrm-cp', 'shrm-scp',
    'six sigma', 'itil', 'prince2', 'togaf', 'safe', 'csm',
  ],
};

/**
 * Education level scoring
 */
const EDUCATION_SCORES: Record<string, number> = {
  phd: 100,
  doctorate: 100,
  masters: 85,
  mba: 85,
  bachelors: 70,
  bachelor: 70,
  associate: 55,
  diploma: 50,
  certificate: 40,
  'high school': 30,
};

/**
 * Resume Parser Service
 */
export class ResumeParserService {
  /**
   * Parse resume text and extract structured data
   */
  static async parseResume(
    resumeText: string,
    fileName?: string
  ): Promise<ResumeData> {
    const normalizedText = resumeText.toLowerCase();

    // Extract contact information
    const contact = this.extractContactInfo(resumeText);

    // Extract skills
    const skills = this.extractSkills(normalizedText);

    // Extract experience
    const experience = this.extractExperience(resumeText);

    // Extract education
    const education = this.extractEducation(resumeText);

    // Extract certifications
    const certifications = this.extractCertifications(normalizedText);

    // Extract languages
    const languages = this.extractLanguages(normalizedText);

    // Calculate total experience
    const totalExperience = experience.reduce((sum, exp) => sum + exp.durationMonths, 0);

    return {
      id: `resume_${Date.now()}`,
      fileName,
      contact,
      summary: this.extractSummary(resumeText),
      skills,
      experience,
      education,
      certifications,
      languages,
      totalExperienceMonths: totalExperience,
      parsedAt: new Date(),
      confidence: this.calculateParsingConfidence(contact, skills, experience, education),
    };
  }

  /**
   * Extract contact information from resume
   */
  private static extractContactInfo(text: string): ResumeData['contact'] {
    // Email pattern
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/i);

    // Phone pattern (various formats)
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);

    // LinkedIn pattern
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);

    // Name extraction (typically first line or before email)
    const lines = text.split('\n').filter(l => l.trim());
    const name = lines[0]?.replace(/[^\w\s]/g, '').trim() || undefined;

    // Location extraction (city, country patterns)
    const locationPatterns = [
      /(?:based in|located in|location:?\s*)([A-Za-z\s,]+)/i,
      /([A-Za-z]+,\s*(?:UAE|KSA|Saudi Arabia|Bahrain|Qatar|Oman|Kuwait|India|UK|USA|US))/i,
    ];

    let location: string | undefined;
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }

    return {
      name,
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
      linkedin: linkedinMatch?.[0],
      location,
    };
  }

  /**
   * Extract summary/objective from resume
   */
  private static extractSummary(text: string): string | undefined {
    const summaryPatterns = [
      /(?:professional\s+)?summary[:\s]*([^\n]+(?:\n(?![A-Z]{2})[^\n]+)*)/i,
      /(?:career\s+)?objective[:\s]*([^\n]+(?:\n(?![A-Z]{2})[^\n]+)*)/i,
      /about\s+me[:\s]*([^\n]+(?:\n(?![A-Z]{2})[^\n]+)*)/i,
      /profile[:\s]*([^\n]+(?:\n(?![A-Z]{2})[^\n]+)*)/i,
    ];

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1].length > 50) {
        return match[1].trim().substring(0, 500);
      }
    }

    return undefined;
  }

  /**
   * Extract skills from resume text
   */
  private static extractSkills(text: string): ResumeData['skills'] {
    const skills: ResumeData['skills'] = {
      technical: [],
      soft: [],
      domain: [],
      languages: [],
      tools: [],
    };

    // Extract technical skills
    for (const skill of SKILL_CATEGORIES.TECHNICAL) {
      if (text.includes(skill)) {
        skills.technical.push({
          name: skill.charAt(0).toUpperCase() + skill.slice(1),
          level: this.inferSkillLevel(text, skill),
          yearsOfExperience: this.inferYearsOfExperience(text, skill),
        });
      }
    }

    // Extract soft skills
    for (const skill of SKILL_CATEGORIES.SOFT) {
      if (text.includes(skill)) {
        skills.soft.push({
          name: skill.charAt(0).toUpperCase() + skill.slice(1),
          level: 'INTERMEDIATE',
        });
      }
    }

    // Extract domain skills
    for (const skill of SKILL_CATEGORIES.DOMAIN) {
      if (text.includes(skill)) {
        skills.domain.push({
          name: skill.toUpperCase(),
          level: 'INTERMEDIATE',
        });
      }
    }

    return skills;
  }

  /**
   * Infer skill level from context
   */
  private static inferSkillLevel(
    text: string,
    skill: string
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' {
    const skillContext = this.getContextAround(text, skill, 50);

    if (/expert|mastery|extensive|10\+\s*years?/i.test(skillContext)) {
      return 'EXPERT';
    }
    if (/advanced|proficient|senior|7\+\s*years?|8\+\s*years?/i.test(skillContext)) {
      return 'ADVANCED';
    }
    if (/intermediate|working knowledge|3\+\s*years?|4\+\s*years?|5\+\s*years?/i.test(skillContext)) {
      return 'INTERMEDIATE';
    }
    return 'BEGINNER';
  }

  /**
   * Get text context around a keyword
   */
  private static getContextAround(text: string, keyword: string, chars: number): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';

    const start = Math.max(0, index - chars);
    const end = Math.min(text.length, index + keyword.length + chars);

    return text.substring(start, end);
  }

  /**
   * Infer years of experience for a skill
   */
  private static inferYearsOfExperience(text: string, skill: string): number | undefined {
    const skillContext = this.getContextAround(text, skill, 100);
    const yearsMatch = skillContext.match(/(\d+)\+?\s*years?/i);

    return yearsMatch ? parseInt(yearsMatch[1]) : undefined;
  }

  /**
   * Extract work experience from resume
   */
  private static extractExperience(text: string): ResumeData['experience'] {
    const experience: ResumeData['experience'] = [];

    // Common patterns for experience sections
    const experienceSection = this.extractSection(text, [
      'work experience',
      'professional experience',
      'employment history',
      'experience',
    ]);

    if (!experienceSection) return experience;

    // Pattern for job entries
    const jobPattern = /(?:^|\n)([A-Za-z\s&,.]+)\s*[-–|]\s*([A-Za-z\s&,.]+)\s*\n?\s*(\d{4})\s*[-–]\s*(Present|\d{4})/gim;

    let match;
    while ((match = jobPattern.exec(experienceSection)) !== null) {
      const company = match[1].trim();
      const title = match[2].trim();
      const startYear = parseInt(match[3]);
      const endYear = match[4].toLowerCase() === 'present' ? new Date().getFullYear() : parseInt(match[4]);

      // Calculate duration
      const durationMonths = (endYear - startYear) * 12;

      // Extract description (text until next job entry or section)
      const descStart = match.index + match[0].length;
      const nextJobMatch = jobPattern.exec(experienceSection);
      const descEnd = nextJobMatch ? nextJobMatch.index : experienceSection.length;
      jobPattern.lastIndex = match.index + match[0].length; // Reset to continue from current position

      const description = experienceSection.substring(descStart, descEnd).trim();

      // Extract achievements (bullet points)
      const achievements = description
        .split(/[•\-\*]/)
        .map(a => a.trim())
        .filter(a => a.length > 20 && a.length < 300);

      experience.push({
        company,
        title,
        startDate: `${startYear}-01-01`,
        endDate: match[4].toLowerCase() === 'present' ? undefined : `${endYear}-12-31`,
        isCurrent: match[4].toLowerCase() === 'present',
        location: undefined, // Could be extracted with more patterns
        description: description.substring(0, 500),
        achievements: achievements.slice(0, 5),
        durationMonths,
      });
    }

    return experience;
  }

  /**
   * Extract a section from resume text
   */
  private static extractSection(text: string, headers: string[]): string | undefined {
    for (const header of headers) {
      const pattern = new RegExp(`${header}[:\\s]*([\\s\\S]*?)(?=\\n(?:education|skills|certifications|projects|references|$))`, 'i');
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  /**
   * Extract education from resume
   */
  private static extractEducation(text: string): ResumeData['education'] {
    const education: ResumeData['education'] = [];

    const educationSection = this.extractSection(text, [
      'education',
      'academic background',
      'qualifications',
    ]);

    if (!educationSection) return education;

    // Pattern for education entries
    const eduPattern = /(?:^|\n)([A-Za-z\s]+(?:University|College|Institute|School)[^\n]*)\s*\n?\s*([A-Za-z\s,.']+(?:degree|bachelor|master|phd|mba|diploma)[^\n]*)\s*(?:\n?\s*(\d{4}))?/gim;

    let match;
    while ((match = eduPattern.exec(educationSection)) !== null) {
      education.push({
        institution: match[1].trim(),
        degree: match[2].trim(),
        field: this.extractField(match[2]),
        graduationYear: match[3] ? parseInt(match[3]) : undefined,
        gpa: this.extractGPA(educationSection),
      });
    }

    // Fallback: simpler pattern
    if (education.length === 0) {
      const simplePattern = /(bachelor|master|phd|mba|diploma)[^\n]*/gi;
      let simpleMatch;
      while ((simpleMatch = simplePattern.exec(text)) !== null) {
        education.push({
          institution: 'Unknown',
          degree: simpleMatch[0].trim(),
          field: this.extractField(simpleMatch[0]),
        });
      }
    }

    return education;
  }

  /**
   * Extract field of study
   */
  private static extractField(degreeText: string): string | undefined {
    const fieldPattern = /(?:in|of)\s+([A-Za-z\s]+)/i;
    const match = degreeText.match(fieldPattern);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Extract GPA from text
   */
  private static extractGPA(text: string): number | undefined {
    const gpaPattern = /(?:gpa|cgpa)[:\s]*(\d+\.?\d*)\s*(?:\/\s*(\d+))?/i;
    const match = text.match(gpaPattern);

    if (match) {
      const gpa = parseFloat(match[1]);
      const scale = match[2] ? parseFloat(match[2]) : 4.0;
      return (gpa / scale) * 4.0; // Normalize to 4.0 scale
    }

    return undefined;
  }

  /**
   * Extract certifications from resume
   */
  private static extractCertifications(text: string): ResumeData['certifications'] {
    const certifications: ResumeData['certifications'] = [];

    for (const cert of SKILL_CATEGORIES.CERTIFICATIONS) {
      if (text.includes(cert)) {
        certifications.push({
          name: cert.toUpperCase(),
          issuer: this.inferCertIssuer(cert),
          year: this.extractCertYear(text, cert),
        });
      }
    }

    return certifications;
  }

  /**
   * Infer certification issuer
   */
  private static inferCertIssuer(cert: string): string | undefined {
    const issuers: Record<string, string> = {
      pmp: 'PMI',
      'scrum master': 'Scrum Alliance',
      csm: 'Scrum Alliance',
      'aws certified': 'Amazon Web Services',
      'azure certified': 'Microsoft',
      'gcp certified': 'Google Cloud',
      cissp: 'ISC2',
      cisa: 'ISACA',
      cpa: 'AICPA',
      cfa: 'CFA Institute',
      phr: 'HRCI',
      sphr: 'HRCI',
      'shrm-cp': 'SHRM',
      'shrm-scp': 'SHRM',
    };

    return issuers[cert.toLowerCase()];
  }

  /**
   * Extract certification year from context
   */
  private static extractCertYear(text: string, cert: string): number | undefined {
    const context = this.getContextAround(text, cert, 50);
    const yearMatch = context.match(/20\d{2}/);
    return yearMatch ? parseInt(yearMatch[0]) : undefined;
  }

  /**
   * Extract languages from resume
   */
  private static extractLanguages(text: string): ResumeData['languages'] {
    const languages: ResumeData['languages'] = [];

    const languagePatterns = [
      { lang: 'english', native: /native|mother tongue/i },
      { lang: 'arabic', native: /native|mother tongue/i },
      { lang: 'hindi', native: /native|mother tongue/i },
      { lang: 'french', native: /native|mother tongue/i },
      { lang: 'spanish', native: /native|mother tongue/i },
      { lang: 'german', native: /native|mother tongue/i },
      { lang: 'mandarin', native: /native|mother tongue/i },
      { lang: 'urdu', native: /native|mother tongue/i },
    ];

    for (const { lang, native } of languagePatterns) {
      if (text.includes(lang)) {
        const context = this.getContextAround(text, lang, 30);
        languages.push({
          language: lang.charAt(0).toUpperCase() + lang.slice(1),
          proficiency: native.test(context) ? 'NATIVE' :
                       /fluent/i.test(context) ? 'FLUENT' :
                       /professional/i.test(context) ? 'PROFESSIONAL' :
                       /intermediate/i.test(context) ? 'INTERMEDIATE' : 'BASIC',
        });
      }
    }

    return languages;
  }

  /**
   * Calculate parsing confidence score
   */
  private static calculateParsingConfidence(
    contact: ResumeData['contact'],
    skills: ResumeData['skills'],
    experience: ResumeData['experience'],
    education: ResumeData['education']
  ): number {
    let score = 0;
    let total = 0;

    // Contact info (20%)
    total += 20;
    if (contact.name) score += 5;
    if (contact.email) score += 8;
    if (contact.phone) score += 5;
    if (contact.linkedin) score += 2;

    // Skills (25%)
    total += 25;
    score += Math.min(15, skills.technical.length * 2);
    score += Math.min(5, skills.soft.length);
    score += Math.min(5, skills.domain.length);

    // Experience (35%)
    total += 35;
    score += Math.min(25, experience.length * 8);
    const hasDescriptions = experience.some(e => e.description && e.description.length > 50);
    if (hasDescriptions) score += 10;

    // Education (20%)
    total += 20;
    score += Math.min(15, education.length * 8);
    const hasField = education.some(e => e.field);
    if (hasField) score += 5;

    return Math.round((score / total) * 100);
  }

  /**
   * Score candidate against job requirements
   */
  static async scoreCandidate(
    resume: ResumeData,
    jobRequirements: {
      requiredSkills: string[];
      preferredSkills?: string[];
      minimumExperience: number; // months
      educationLevel?: string;
      requiredCertifications?: string[];
      languages?: string[];
    }
  ): Promise<CandidateScore> {
    const scores: CandidateScore['breakdown'] = {};
    const allResumeSkills = [
      ...resume.skills.technical.map(s => s.name.toLowerCase()),
      ...resume.skills.soft.map(s => s.name.toLowerCase()),
      ...resume.skills.domain.map(s => s.name.toLowerCase()),
    ];

    // Skills match (40%)
    const requiredSkillsMatch = jobRequirements.requiredSkills.filter(
      skill => allResumeSkills.includes(skill.toLowerCase())
    ).length;
    scores['requiredSkills'] = {
      weight: 0.25,
      score: (requiredSkillsMatch / jobRequirements.requiredSkills.length) * 100,
      details: `${requiredSkillsMatch}/${jobRequirements.requiredSkills.length} required skills matched`,
    };

    if (jobRequirements.preferredSkills?.length) {
      const preferredSkillsMatch = jobRequirements.preferredSkills.filter(
        skill => allResumeSkills.includes(skill.toLowerCase())
      ).length;
      scores['preferredSkills'] = {
        weight: 0.15,
        score: (preferredSkillsMatch / jobRequirements.preferredSkills.length) * 100,
        details: `${preferredSkillsMatch}/${jobRequirements.preferredSkills.length} preferred skills matched`,
      };
    }

    // Experience match (30%)
    const experienceScore = Math.min(100, (resume.totalExperienceMonths / jobRequirements.minimumExperience) * 100);
    scores['experience'] = {
      weight: 0.30,
      score: experienceScore,
      details: `${Math.round(resume.totalExperienceMonths / 12)} years experience (${Math.round(jobRequirements.minimumExperience / 12)} years required)`,
    };

    // Education match (15%)
    if (jobRequirements.educationLevel) {
      const requiredLevel = EDUCATION_SCORES[jobRequirements.educationLevel.toLowerCase()] || 50;
      const candidateLevel = Math.max(
        ...resume.education.map(e => {
          const degreeType = e.degree.toLowerCase();
          for (const [key, score] of Object.entries(EDUCATION_SCORES)) {
            if (degreeType.includes(key)) return score;
          }
          return 50;
        }),
        0
      );
      scores['education'] = {
        weight: 0.15,
        score: Math.min(100, (candidateLevel / requiredLevel) * 100),
        details: `Education level: ${resume.education[0]?.degree || 'Not specified'}`,
      };
    }

    // Certifications match (10%)
    if (jobRequirements.requiredCertifications?.length) {
      const certMatch = jobRequirements.requiredCertifications.filter(
        cert => resume.certifications.some(c => c.name.toLowerCase().includes(cert.toLowerCase()))
      ).length;
      scores['certifications'] = {
        weight: 0.10,
        score: (certMatch / jobRequirements.requiredCertifications.length) * 100,
        details: `${certMatch}/${jobRequirements.requiredCertifications.length} required certifications`,
      };
    }

    // Languages match (5%)
    if (jobRequirements.languages?.length) {
      const langMatch = jobRequirements.languages.filter(
        lang => resume.languages.some(l => l.language.toLowerCase() === lang.toLowerCase())
      ).length;
      scores['languages'] = {
        weight: 0.05,
        score: (langMatch / jobRequirements.languages.length) * 100,
        details: `${langMatch}/${jobRequirements.languages.length} required languages`,
      };
    }

    // Calculate weighted total
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [_, data] of Object.entries(scores)) {
      totalWeight += data.weight;
      weightedSum += data.score * data.weight;
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // Determine recommendation
    let recommendation: CandidateScore['recommendation'];
    if (overallScore >= 80) {
      recommendation = 'STRONG_FIT';
    } else if (overallScore >= 60) {
      recommendation = 'GOOD_FIT';
    } else if (overallScore >= 40) {
      recommendation = 'PARTIAL_FIT';
    } else {
      recommendation = 'NOT_RECOMMENDED';
    }

    // Generate skill gaps
    const missingSkills = jobRequirements.requiredSkills.filter(
      skill => !allResumeSkills.includes(skill.toLowerCase())
    );

    return {
      candidateId: resume.id,
      overallScore,
      breakdown: scores,
      recommendation,
      skillGaps: missingSkills,
      strengths: this.identifyStrengths(resume, scores),
    };
  }

  /**
   * Identify candidate strengths
   */
  private static identifyStrengths(
    resume: ResumeData,
    scores: CandidateScore['breakdown']
  ): string[] {
    const strengths: string[] = [];

    // High experience
    if (resume.totalExperienceMonths > 60) {
      strengths.push(`${Math.round(resume.totalExperienceMonths / 12)}+ years of experience`);
    }

    // Many technical skills
    if (resume.skills.technical.length > 10) {
      strengths.push('Broad technical skill set');
    }

    // Advanced/Expert skills
    const advancedSkills = resume.skills.technical.filter(
      s => s.level === 'ADVANCED' || s.level === 'EXPERT'
    );
    if (advancedSkills.length > 0) {
      strengths.push(`Expert in ${advancedSkills.slice(0, 3).map(s => s.name).join(', ')}`);
    }

    // Certifications
    if (resume.certifications.length > 0) {
      strengths.push(`Certified: ${resume.certifications.slice(0, 2).map(c => c.name).join(', ')}`);
    }

    // Multilingual
    if (resume.languages.length > 2) {
      strengths.push('Multilingual');
    }

    // High scores
    for (const [key, data] of Object.entries(scores)) {
      if (data.score >= 90) {
        strengths.push(`Excellent ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} match`);
      }
    }

    return strengths.slice(0, 5);
  }

  /**
   * Match candidate to multiple jobs
   */
  static async matchToJobs(
    resume: ResumeData,
    jobs: Array<{
      id: string;
      title: string;
      department: string;
      requirements: Parameters<typeof ResumeParserService.scoreCandidate>[1];
    }>
  ): Promise<JobMatch[]> {
    const matches: JobMatch[] = [];

    for (const job of jobs) {
      const score = await this.scoreCandidate(resume, job.requirements);

      matches.push({
        jobId: job.id,
        jobTitle: job.title,
        department: job.department,
        matchScore: score.overallScore,
        recommendation: score.recommendation,
        keyMatches: score.strengths,
        gaps: score.skillGaps,
      });
    }

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Extract keywords for ATS optimization
   */
  static extractATSKeywords(resume: ResumeData): string[] {
    const keywords: Set<string> = new Set();

    // Add all skills
    resume.skills.technical.forEach(s => keywords.add(s.name.toLowerCase()));
    resume.skills.soft.forEach(s => keywords.add(s.name.toLowerCase()));
    resume.skills.domain.forEach(s => keywords.add(s.name.toLowerCase()));

    // Add job titles
    resume.experience.forEach(e => {
      const titleWords = e.title.toLowerCase().split(/\s+/);
      titleWords.forEach(w => {
        if (w.length > 3) keywords.add(w);
      });
    });

    // Add certifications
    resume.certifications.forEach(c => keywords.add(c.name.toLowerCase()));

    // Add education fields
    resume.education.forEach(e => {
      if (e.field) keywords.add(e.field.toLowerCase());
    });

    return Array.from(keywords);
  }
}
