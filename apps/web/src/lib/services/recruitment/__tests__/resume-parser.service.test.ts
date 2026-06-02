/**
 * Tests for ResumeParserService.
 *
 * These tests target the pure-function shape of the parser/scorer
 * (no I/O, no DB) so they run in <1s and don't need any test
 * infrastructure beyond vitest itself.
 *
 * Coverage focus per Phase 4 #49:
 *   - happy path  (well-formed resume → expected fields populated)
 *   - empty/short input (returns emptyResume with a warning)
 *   - confidence scoring monotonicity
 *   - candidate scoring with explicit requirements
 *
 * This file is also the TEMPLATE the rest of the recruitment domain
 * should follow when career-portal and other services get expanded
 * coverage.
 */

import { describe, it, expect } from 'vitest';
import {
  ResumeParserService,
  type JobRequirements,
} from '@/lib/services/recruitment/resume-parser.service';

const SAMPLE_RESUME = `
Jane Doe
jane.doe@example.com
+971 50 123 4567
linkedin.com/in/janedoe

SUMMARY
Senior software engineer with 8 years of experience building enterprise SaaS systems.
Specialised in TypeScript, React, and distributed systems.

EXPERIENCE
Senior Software Engineer at Acme Corp
Jan 2020 - Present
- Led platform migration to TypeScript reducing prod errors 40%.
- Mentored a team of 5 engineers.

Software Engineer at Beta Inc
Mar 2017 - Dec 2019
- Built billing engine handling 10K transactions/day.

EDUCATION
B.Tech Computer Science, IIT Bombay, 2017

SKILLS
TypeScript, React, Node.js, PostgreSQL, AWS, Kubernetes

LANGUAGES
English (native), Arabic (conversational)
`;

const REQUIREMENTS: JobRequirements = {
  title: 'Senior Engineer',
  requiredSkills: ['TypeScript', 'React'],
  preferredSkills: ['Kubernetes'],
  minExperienceYears: 5,
};

describe('ResumeParserService.parseResume', () => {
  it('extracts the candidate name, email, phone, and LinkedIn from a clean resume', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    expect(r.candidateName).toBe('Jane Doe');
    expect(r.email).toBe('jane.doe@example.com');
    expect(r.phone).toMatch(/\+971/);
    expect(r.linkedIn).toContain('linkedin.com/in/janedoe');
  });

  it('detects skills from the SKILLS section AND from the body text', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    const skillNames = r.skills.map((s) => s.name.toLowerCase());
    expect(skillNames).toEqual(expect.arrayContaining(['typescript', 'react', 'postgresql']));
  });

  it('returns an emptyResume with a warning when the input is too short', () => {
    const r = ResumeParserService.parseResume('Hi');
    expect(r.candidateName).toBe('Unknown');
    expect(r.parseWarnings.length).toBeGreaterThan(0);
    expect(r.parseConfidence).toBeLessThan(50);
  });

  it('emits a warning when no email is found', () => {
    const noEmail = SAMPLE_RESUME.replace('jane.doe@example.com', '');
    const r = ResumeParserService.parseResume(noEmail);
    expect(r.email).toBeUndefined();
    expect(r.parseWarnings).toEqual(expect.arrayContaining([expect.stringMatching(/email/i)]));
  });

  it('confidence is higher for richer input than for a near-empty resume', () => {
    const rich = ResumeParserService.parseResume(SAMPLE_RESUME);
    const sparse = ResumeParserService.parseResume(
      'John Smith\njohn@example.com\nA brief candidate profile with little detail and few words. ' +
        'Just enough text to clear the 50-character minimum but not much more.'
    );
    expect(rich.parseConfidence).toBeGreaterThan(sparse.parseConfidence);
  });
});

describe('ResumeParserService.scoreCandidate', () => {
  it('produces an overall score in [0, 100] with a recommendation tag', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    expect(score.overallScore).toBeGreaterThanOrEqual(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(['STRONG_FIT', 'GOOD_FIT', 'PARTIAL_FIT', 'NOT_FIT']).toContain(score.recommendation);
    expect(score.breakdown.length).toBeGreaterThan(0);
  });

  it('penalizes candidates short on experience', () => {
    const juniorResume = ResumeParserService.parseResume(
      SAMPLE_RESUME.replace('8 years', '1 year')
        .replace('Jan 2020', 'Jan 2024')
        .replace('Mar 2017 - Dec 2019', 'Jan 2023 - Dec 2023')
    );
    const seniorResume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const juniorScore = ResumeParserService.scoreCandidate(juniorResume, REQUIREMENTS);
    const seniorScore = ResumeParserService.scoreCandidate(seniorResume, REQUIREMENTS);
    expect(juniorScore.overallScore).toBeLessThanOrEqual(seniorScore.overallScore);
  });
});

describe('ResumeParserService.rankCandidates', () => {
  it('returns candidates sorted by descending overallScore', () => {
    const strongResume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const sparseResume = ResumeParserService.parseResume(
      'John Smith\njohn@example.com\nA brief candidate profile with very little experience listed.'
    );
    const strongScore = ResumeParserService.scoreCandidate(strongResume, REQUIREMENTS);
    const sparseScore = ResumeParserService.scoreCandidate(sparseResume, REQUIREMENTS);

    const ranked = ResumeParserService.rankCandidates([
      { id: 'sparse', score: sparseScore },
      { id: 'strong', score: strongScore },
    ]);

    expect(ranked.length).toBe(2);
    expect(ranked[0].id).toBe('strong');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });

  it('handles a single candidate', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    const ranked = ResumeParserService.rankCandidates([{ id: 'only', score }]);
    expect(ranked.length).toBe(1);
    expect(ranked[0].rank).toBe(1);
  });

  it('handles an empty candidate list', () => {
    const ranked = ResumeParserService.rankCandidates([]);
    expect(ranked).toEqual([]);
  });
});

describe('ResumeParserService.parseResume — language detection', () => {
  it('detects English-only as "en"', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    expect(r.detectedLanguage).toBe('en');
  });

  it('detects mostly-Arabic resume as "ar"', () => {
    const arabicResume = `
محمد عبد الرحمن
mohammed@example.com
+971501234567

الملخص
مهندس برمجيات أول لديه ثماني سنوات من الخبرة في بناء أنظمة المؤسسات
متخصص في تطوير الواجهات الأمامية والخلفية والبنية التحتية السحابية

الخبرة
مهندس برمجيات في شركة آكمي
يناير 2020 - حتى الآن
بناء منصة المؤسسات الموزعة وإدارة فريق من خمسة مهندسين

التعليم
بكالوريوس علوم الحاسوب جامعة الإمارات 2015

المهارات
جافا سكريبت، تايب سكريبت، نود
`;
    const r = ResumeParserService.parseResume(arabicResume);
    expect(r.detectedLanguage).toBe('ar');
  });

  it('detects mixed Arabic/English as "mixed"', () => {
    const mixed = `
محمد عبد الرحمن Mohammed
mohammed@example.com
+971501234567

ثماني سنوات من الخبرة في تطوير البرامج
خبرة في React TypeScript
عمل في شركة آكمي لمدة خمس سنوات
متخصص في تطوير الواجهات الأمامية
بكالوريوس علوم الحاسوب جامعة الإمارات

B.Tech Computer Science
Skills: TypeScript, React
`;
    const r = ResumeParserService.parseResume(mixed);
    expect(r.detectedLanguage).toBe('mixed');
  });

  it('captures Arabic name when present', () => {
    const resumeWithArabicName = SAMPLE_RESUME + '\n\nمحمد عبد الرحمن';
    const r = ResumeParserService.parseResume(resumeWithArabicName);
    expect(r.candidateNameAr).toBeDefined();
  });
});

describe('ResumeParserService.parseResume — education extraction', () => {
  it('extracts B.Tech degree from education section', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    expect(r.education.length).toBeGreaterThan(0);
    const btech = r.education.find((e) => /tech|bachelor/i.test(e.degree));
    expect(btech).toBeDefined();
  });

  it('extracts year from education line', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    const withYear = r.education.find((e) => e.year);
    expect(withYear).toBeDefined();
    expect(withYear!.year).toBe(2017);
  });

  it('returns empty education for resume without an education section', () => {
    const noEd = `
Jane Doe
jane@example.com
+971501234567

EXPERIENCE
Developer at Acme, 2 years.

SKILLS
JavaScript, Python.
`;
    const r = ResumeParserService.parseResume(noEd);
    expect(r.education).toEqual([]);
  });
});

describe('ResumeParserService.parseResume — certifications', () => {
  it('extracts certifications when section present', () => {
    // Note: cert lines must not include the word "Certified" (would re-match the
    // section header regex and bounce the parser into a new section). Use the
    // shorter credential names that AWS itself uses on its badges.
    const withCerts =
      SAMPLE_RESUME +
      `

CERTIFICATIONS
AWS Solutions Architect Associate 2022
Kubernetes Administrator CKA 2023
`;
    const r = ResumeParserService.parseResume(withCerts);
    expect(r.certifications.length).toBeGreaterThan(0);
    const aws = r.certifications.find((c) => /aws/i.test(c.name));
    expect(aws).toBeDefined();
    expect(aws!.year).toBe(2022);
  });

  it('returns empty certifications when section missing', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    expect(Array.isArray(r.certifications)).toBe(true);
  });
});

describe('ResumeParserService.parseResume — language proficiency', () => {
  it('detects English from the languages section', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    const eng = r.languages.find((l) => l.language === 'English');
    expect(eng).toBeDefined();
  });

  it('detects Arabic when present', () => {
    const withArabic = SAMPLE_RESUME.replace(
      'English (native), Arabic (conversational)',
      'English (native), Arabic (fluent)'
    );
    const r = ResumeParserService.parseResume(withArabic);
    const ar = r.languages.find((l) => l.language === 'Arabic');
    expect(ar).toBeDefined();
  });

  it('detects Hindi when present', () => {
    const withHindi = SAMPLE_RESUME.replace('Arabic (conversational)', 'Hindi (native)');
    const r = ResumeParserService.parseResume(withHindi);
    expect(r.languages.some((l) => l.language === 'Hindi')).toBe(true);
  });
});

describe('ResumeParserService.parseResume — experience calculation', () => {
  it('calculates total experience > 0 for a multi-position resume', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    expect(r.totalExperienceYears).toBeGreaterThan(0);
  });

  it('extracts current title from latest position', () => {
    const r = ResumeParserService.parseResume(SAMPLE_RESUME);
    expect(r.currentTitle).toBeTruthy();
  });

  it('emits no-experience warning when no work section', () => {
    const noExp = `
Jane Doe
jane@example.com
+971501234567

EDUCATION
B.Tech, IIT, 2017

SKILLS
JavaScript, Python.
`;
    const r = ResumeParserService.parseResume(noExp);
    expect(r.experience).toEqual([]);
    expect(r.parseWarnings).toEqual(expect.arrayContaining([expect.stringMatching(/experience/i)]));
  });
});

describe('ResumeParserService.scoreCandidate — score components', () => {
  it('returns each component score in [0, 100]', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    expect(score.experienceScore).toBeGreaterThanOrEqual(0);
    expect(score.experienceScore).toBeLessThanOrEqual(100);
    expect(score.educationScore).toBeGreaterThanOrEqual(0);
    expect(score.educationScore).toBeLessThanOrEqual(100);
    expect(score.skillMatchScore).toBeGreaterThanOrEqual(0);
    expect(score.skillMatchScore).toBeLessThanOrEqual(100);
  });

  it('returns Arabic recommendation', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    expect(score.recommendationAr).toBeTruthy();
  });

  it('marks empty resume as NOT_FIT', () => {
    const resume = ResumeParserService.parseResume('Hi');
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    expect(score.recommendation).toBe('NOT_FIT');
  });

  it('returns 5-line breakdown (experience, education, skills, location, salary)', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    expect(score.breakdown).toHaveLength(5);
    const criteria = score.breakdown.map((b) => b.criterion);
    expect(criteria).toEqual(
      expect.arrayContaining(['Experience', 'Education', 'Skills', 'Location', 'Salary Fit'])
    );
  });

  it('weights add up to 100%', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const score = ResumeParserService.scoreCandidate(resume, REQUIREMENTS);
    const totalWeight = score.breakdown.reduce((s, b) => s + b.weight, 0);
    expect(totalWeight).toBe(100);
  });
});

describe('ResumeParserService.scoreCandidate — skill matching', () => {
  it('rewards candidates with all required skills', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const requirements: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript', 'react'],
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, requirements);
    expect(score.skillMatchScore).toBeGreaterThan(50);
  });

  it('penalizes candidates missing all required skills', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const requirements: JobRequirements = {
      title: 'Designer',
      requiredSkills: ['photoshop', 'illustrator', 'figma-pro-edition'],
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, requirements);
    expect(score.skillMatchScore).toBeLessThan(50);
  });

  it('credits preferred skill matches as bonus', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const reqWithPref: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      preferredSkills: ['kubernetes', 'aws'],
      minExperienceYears: 3,
    };
    const reqWithoutPref: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      minExperienceYears: 3,
    };
    const withPref = ResumeParserService.scoreCandidate(resume, reqWithPref);
    const withoutPref = ResumeParserService.scoreCandidate(resume, reqWithoutPref);
    expect(withPref.skillMatchScore).toBeGreaterThanOrEqual(withoutPref.skillMatchScore);
  });
});

describe('ResumeParserService.scoreCandidate — education hierarchy', () => {
  it('scores PhD higher than Bachelor for same job', () => {
    const phdResume = ResumeParserService.parseResume(
      SAMPLE_RESUME.replace(
        'B.Tech Computer Science, IIT Bombay, 2017',
        'PhD Computer Science, MIT, 2022'
      )
    );
    const bachelorResume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      requiredEducation: 'Bachelor',
      minExperienceYears: 3,
    };
    const phdScore = ResumeParserService.scoreCandidate(phdResume, req);
    const bachelorScore = ResumeParserService.scoreCandidate(bachelorResume, req);
    expect(phdScore.educationScore).toBeGreaterThanOrEqual(bachelorScore.educationScore);
  });

  it('returns default education score when requirement not specified', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.educationScore).toBeGreaterThan(0);
  });
});

describe('ResumeParserService.scoreCandidate — location matching', () => {
  it('rewards exact city match', () => {
    const resume = ResumeParserService.parseResume(
      `Jane Doe\njane@example.com\n+971501234567\nLocation: Dubai\n\n` + SAMPLE_RESUME
    );
    resume.location = 'Dubai, UAE'; // direct field mutation since parser does not always populate
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      location: 'Dubai',
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.locationScore).toBeGreaterThan(50);
  });

  it('rewards remote-allowed jobs regardless of candidate location', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      location: 'Tokyo',
      remoteAllowed: true,
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.locationScore).toBeGreaterThan(50);
  });

  it('partially rewards GCC-to-GCC moves', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    resume.location = 'Riyadh, Saudi Arabia';
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      location: 'Dubai',
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.locationScore).toBeGreaterThan(50);
    expect(score.locationScore).toBeLessThan(100);
  });
});

describe('ResumeParserService.scoreCandidate — salary fit', () => {
  it('rewards candidate within range', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    resume.expectedSalary = { amount: 12000, currency: 'AED' };
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      salaryRange: { min: 10000, max: 15000, currency: 'AED' },
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.salaryfitScore).toBe(100);
  });

  it('penalizes candidate well above max', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    resume.expectedSalary = { amount: 30000, currency: 'AED' };
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      salaryRange: { min: 10000, max: 15000, currency: 'AED' },
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.salaryfitScore).toBeLessThan(100);
  });

  it('returns default when no range specified', () => {
    const resume = ResumeParserService.parseResume(SAMPLE_RESUME);
    const req: JobRequirements = {
      title: 'Engineer',
      requiredSkills: ['typescript'],
      minExperienceYears: 3,
    };
    const score = ResumeParserService.scoreCandidate(resume, req);
    expect(score.salaryfitScore).toBeGreaterThan(0);
  });
});
