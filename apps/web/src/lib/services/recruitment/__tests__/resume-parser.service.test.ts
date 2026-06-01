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
    const skillNames = r.skills.map((s) => s.skill.toLowerCase());
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
});
