import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const screenings = [];
    return NextResponse.json({ screenings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching resume screenings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const screening = {
      screeningId: `screen-${Date.now()}`,
      jobId: body.jobId || '',
      jobTitle: body.jobTitle || '',
      candidateId: body.candidateId || '',
      candidateName: body.candidateName || '',
      resumeUrl: body.resumeUrl || '',
      overallScore: Math.floor(Math.random() * 40) + 60,
      overallRanking: 0,
      recommendation: 'good_match',
      skillsMatch: { requiredSkills: [], preferredSkills: [], additionalSkills: [], overallMatchPercentage: 75, topMatchingSkills: [], missingCriticalSkills: [] },
      experienceMatch: { totalYearsRequired: 5, totalYearsFound: 6, relevantExperienceYears: 5, industryMatch: true, seniorityMatch: true, careerProgression: 'good', relevantCompanies: [] },
      educationMatch: { degreeRequired: "Bachelor's", degreeFound: "Bachelor's", degreeMismatch: false, institutions: [], certifications: [], continualLearning: true },
      cultureFitScore: 80,
      extractedData: { contactInfo: {}, summary: '', workHistory: [], education: [], skills: [], certifications: [], languages: [], achievements: [] },
      redFlags: [],
      strengths: [],
      interviewRecommended: true,
      interviewType: 'technical',
      suggestedInterviewers: [],
      interviewFocusAreas: [],
      modelVersion: 'v1.5.0',
      confidenceLevel: 'high',
      processingTime: 1250,
      screeningDate: new Date().toISOString(),
      reviewedByHuman: false
    };
    return NextResponse.json({ screening }, { status: 201 });
  } catch (error) {
    console.error('Error screening resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
