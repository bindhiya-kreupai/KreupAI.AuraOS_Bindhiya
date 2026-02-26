/**
 * @module surveyService
 * @description Employee Engagement Pulse Surveys service — survey CRUD, response collection,
 *              eNPS analytics, participation tracking, and aggregate results (Sec 13.1)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'rating' | 'nps' | 'multiple_choice' | 'text' | 'yes_no' | 'scale';
export type SurveyStatus = 'draft' | 'active' | 'completed' | 'archived';
export type SurveyAudience = 'all' | 'department' | 'location' | 'role';
export type ScheduleType = 'immediate' | 'scheduled' | 'recurring';

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  order: number;
  options?: string[]; // for multiple_choice
  minLabel?: string; // for scale/nps
  maxLabel?: string;
  conditional?: {
    dependsOnQuestionId: string;
    showIfAnswer: string;
  };
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  audience: SurveyAudience;
  audienceValue?: string; // dept name / location / role
  questions: SurveyQuestion[];
  scheduleType: ScheduleType;
  scheduledDate?: string;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly';
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
  closedAt?: string;
  targetResponses: number;
  actualResponses: number;
  participationRate: number; // 0-100
}

export interface SurveyAnswer {
  questionId: string;
  value: string | number | string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId?: string; // null = anonymous
  answers: SurveyAnswer[];
  submittedAt: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalResponses: number;
  // for rating/scale/nps
  average?: number;
  distribution?: { label: string; count: number; percentage: number }[];
  // for multiple_choice
  choices?: { option: string; count: number; percentage: number }[];
  // for text
  textResponses?: string[];
  // for yes_no
  yesCount?: number;
  noCount?: number;
}

export interface NPSBreakdown {
  promoters: number; // 9-10
  passives: number; // 7-8
  detractors: number; // 0-6
  npsScore: number; // promoters% - detractors%
  totalResponses: number;
}

export interface DepartmentComparison {
  department: string;
  participationRate: number;
  averageScore: number;
  responses: number;
}

export interface SurveyResults {
  surveyId: string;
  surveyTitle: string;
  totalInvited: number;
  totalResponded: number;
  participationRate: number;
  averageCompletionTime: number; // minutes
  questionResults: QuestionResult[];
  npsBreakdown?: NPSBreakdown;
  departmentComparison: DepartmentComparison[];
  previousRunScore?: number;
  currentScore: number;
}

export interface SurveyAnalytics {
  eNPSScore: number;
  eNPSPromoters: number;
  eNPSPassives: number;
  eNPSDetractors: number;
  overallParticipationRate: number;
  engagementScoreTrend: { quarter: string; score: number }[];
  activeSurveysCount: number;
  completedSurveysCount: number;
  totalResponsesThisMonth: number;
  topInsights: string[];
}

export interface CreateSurveyData {
  title: string;
  description: string;
  audience: SurveyAudience;
  audienceValue?: string;
  questions: Omit<SurveyQuestion, 'id'>[];
  scheduleType: ScheduleType;
  scheduledDate?: string;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly';
}

export interface SurveyFilters {
  status?: SurveyStatus;
  audience?: SurveyAudience;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SURVEYS: Survey[] = [
  {
    id: 'survey-001',
    title: 'Q1 2026 Quarterly Pulse Survey',
    description:
      'Our quarterly check-in to measure employee engagement and satisfaction across the organization.',
    status: 'active',
    audience: 'all',
    questions: [
      {
        id: 'q1',
        type: 'nps',
        text: 'How likely are you to recommend KreupAI as a great place to work to a friend or colleague?',
        required: true,
        order: 1,
        minLabel: 'Not at all likely',
        maxLabel: 'Extremely likely',
      },
      {
        id: 'q2',
        type: 'rating',
        text: 'How satisfied are you with your overall work experience?',
        required: true,
        order: 2,
      },
      {
        id: 'q3',
        type: 'scale',
        text: 'How well does your manager support your professional development?',
        required: true,
        order: 3,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        text: 'Which area do you feel needs the most improvement?',
        required: false,
        order: 4,
        options: [
          'Work-Life Balance',
          'Career Growth',
          'Compensation',
          'Team Collaboration',
          'Leadership',
          'Tools & Technology',
        ],
      },
      {
        id: 'q5',
        type: 'text',
        text: 'What is one thing we could do to make your work experience better?',
        required: false,
        order: 5,
      },
    ],
    scheduleType: 'recurring',
    recurringInterval: 'quarterly',
    createdBy: 'hr-admin',
    createdAt: '2026-01-15T09:00:00Z',
    publishedAt: '2026-01-20T09:00:00Z',
    targetResponses: 250,
    actualResponses: 187,
    participationRate: 74.8,
  },
  {
    id: 'survey-002',
    title: 'Annual Engagement Survey 2025',
    description:
      'Comprehensive annual engagement assessment covering all dimensions of the employee experience.',
    status: 'completed',
    audience: 'all',
    questions: [
      {
        id: 'q1',
        type: 'nps',
        text: 'On a scale of 0-10, how likely are you to recommend working here to a friend?',
        required: true,
        order: 1,
        minLabel: 'Not at all likely',
        maxLabel: 'Extremely likely',
      },
      {
        id: 'q2',
        type: 'scale',
        text: 'I feel valued and appreciated for my contributions.',
        required: true,
        order: 2,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q3',
        type: 'scale',
        text: 'I have the resources I need to do my job effectively.',
        required: true,
        order: 3,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q4',
        type: 'scale',
        text: 'The company leadership communicates clearly about direction and strategy.',
        required: true,
        order: 4,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        text: 'What best describes your career aspirations within the company?',
        required: false,
        order: 5,
        options: [
          'Individual Contributor Growth',
          'Management Track',
          'Technical Specialist',
          'Cross-functional Move',
          'Undecided',
        ],
      },
    ],
    scheduleType: 'scheduled',
    scheduledDate: '2025-11-01T00:00:00Z',
    createdBy: 'hr-admin',
    createdAt: '2025-10-01T09:00:00Z',
    publishedAt: '2025-11-01T09:00:00Z',
    closedAt: '2025-11-30T23:59:59Z',
    targetResponses: 280,
    actualResponses: 256,
    participationRate: 91.4,
  },
  {
    id: 'survey-003',
    title: 'New Hire Onboarding Feedback',
    description:
      '30-day onboarding experience feedback for employees who joined in the last 30-45 days.',
    status: 'active',
    audience: 'department',
    audienceValue: 'New Hires (30-45 days)',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        text: 'How would you rate your overall onboarding experience?',
        required: true,
        order: 1,
      },
      {
        id: 'q2',
        type: 'yes_no',
        text: 'Did you receive adequate training for your role?',
        required: true,
        order: 2,
      },
      {
        id: 'q3',
        type: 'scale',
        text: 'How welcoming was your team during your first month?',
        required: true,
        order: 3,
        minLabel: 'Not Welcoming',
        maxLabel: 'Very Welcoming',
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        text: 'Which aspect of onboarding was most helpful?',
        required: false,
        order: 4,
        options: [
          'Team Introductions',
          'IT Setup',
          'Process Training',
          'Culture Overview',
          'Buddy Program',
          'HR Orientation',
        ],
      },
      {
        id: 'q5',
        type: 'text',
        text: 'What could we improve about the onboarding process?',
        required: false,
        order: 5,
      },
    ],
    scheduleType: 'recurring',
    recurringInterval: 'monthly',
    createdBy: 'hr-admin',
    createdAt: '2026-01-01T09:00:00Z',
    publishedAt: '2026-02-01T09:00:00Z',
    targetResponses: 25,
    actualResponses: 18,
    participationRate: 72.0,
  },
  {
    id: 'survey-004',
    title: 'Exit Survey — February 2026',
    description:
      'Confidential survey for departing employees to help us understand and improve retention.',
    status: 'active',
    audience: 'role',
    audienceValue: 'Departing Employees',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        text: 'What is the primary reason for your departure?',
        required: true,
        order: 1,
        options: [
          'Better Opportunity',
          'Compensation',
          'Career Growth',
          'Work Environment',
          'Personal Reasons',
          'Relocation',
          'Other',
        ],
      },
      {
        id: 'q2',
        type: 'scale',
        text: 'How satisfied were you with your compensation and benefits?',
        required: true,
        order: 2,
        minLabel: 'Very Unsatisfied',
        maxLabel: 'Very Satisfied',
      },
      {
        id: 'q3',
        type: 'yes_no',
        text: 'Would you recommend this company to others as a place to work?',
        required: true,
        order: 3,
      },
      {
        id: 'q4',
        type: 'text',
        text: 'What could the company have done to retain you?',
        required: false,
        order: 4,
      },
      {
        id: 'q5',
        type: 'rating',
        text: 'How would you rate your overall experience at the company?',
        required: true,
        order: 5,
      },
    ],
    scheduleType: 'immediate',
    createdBy: 'hr-admin',
    createdAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    targetResponses: 15,
    actualResponses: 9,
    participationRate: 60.0,
  },
  {
    id: 'survey-005',
    title: 'Manager Effectiveness Survey — Engineering',
    description:
      'Upward feedback survey to evaluate management effectiveness in the Engineering department.',
    status: 'draft',
    audience: 'department',
    audienceValue: 'Engineering',
    questions: [
      {
        id: 'q1',
        type: 'scale',
        text: 'My manager clearly communicates expectations.',
        required: true,
        order: 1,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q2',
        type: 'scale',
        text: 'My manager provides timely and constructive feedback.',
        required: true,
        order: 2,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q3',
        type: 'scale',
        text: 'My manager supports my career development and growth.',
        required: true,
        order: 3,
        minLabel: 'Strongly Disagree',
        maxLabel: 'Strongly Agree',
      },
      {
        id: 'q4',
        type: 'rating',
        text: 'Overall, how effective is your manager?',
        required: true,
        order: 4,
      },
      {
        id: 'q5',
        type: 'text',
        text: 'What is one thing your manager does exceptionally well?',
        required: false,
        order: 5,
      },
    ],
    scheduleType: 'scheduled',
    scheduledDate: '2026-03-01T00:00:00Z',
    createdBy: 'hr-admin',
    createdAt: '2026-02-20T09:00:00Z',
    targetResponses: 45,
    actualResponses: 0,
    participationRate: 0,
  },
];

// Generate 50+ mock responses for active/completed surveys
const MOCK_RESPONSES: SurveyResponse[] = (() => {
  const responses: SurveyResponse[] = [];
  const npsValues = [
    10, 9, 9, 8, 10, 7, 9, 10, 6, 8, 9, 10, 4, 9, 8, 10, 7, 9, 10, 8, 9, 10, 3, 8, 9, 7, 10, 9, 8,
    10, 9, 7, 10, 8, 9, 6, 10, 9, 8, 7, 10, 9, 8, 10, 9, 7, 8, 10, 9, 8,
  ];
  const textAnswers = [
    'More flexible work hours would help',
    'Better career progression transparency',
    'More cross-team collaboration opportunities',
    'Improve the performance review process',
    'Increase learning & development budget',
    'More frequent town halls',
    'Better onboarding documentation',
    'Remote work tools need improvement',
    'More recognition for individual contributions',
    'Clearer communication from leadership',
  ];

  npsValues.forEach((nps, i) => {
    responses.push({
      id: `resp-${i + 1}`,
      surveyId: 'survey-001',
      answers: [
        { questionId: 'q1', value: nps },
        { questionId: 'q2', value: Math.ceil(Math.random() * 5) },
        { questionId: 'q3', value: Math.ceil(Math.random() * 10) },
        {
          questionId: 'q4',
          value: ['Work-Life Balance', 'Career Growth', 'Compensation', 'Team Collaboration'][
            i % 4
          ],
        },
        { questionId: 'q5', value: textAnswers[i % textAnswers.length] },
      ],
      submittedAt: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  return responses;
})();

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class SurveyService {
  /**
   * List surveys with optional status/audience filter
   */
  static async getSurveys(filters?: SurveyFilters): Promise<Survey[]> {
    try {
      return await APIClient.get<Survey[]>('/v1/surveys', filters);
    } catch {
      let results = [...MOCK_SURVEYS];
      if (filters?.status) results = results.filter((s) => s.status === filters.status);
      if (filters?.audience) results = results.filter((s) => s.audience === filters.audience);
      return results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  /**
   * Get full survey detail with questions
   */
  static async getSurvey(id: string): Promise<Survey | null> {
    try {
      return await APIClient.get<Survey>(`/v1/surveys/${id}`);
    } catch {
      return MOCK_SURVEYS.find((s) => s.id === id) ?? null;
    }
  }

  /**
   * Create a new survey (saved as draft)
   */
  static async createSurvey(data: CreateSurveyData): Promise<Survey> {
    try {
      return await APIClient.post<Survey>('/v1/surveys', data);
    } catch {
      const newSurvey: Survey = {
        id: `survey-${Date.now()}`,
        title: data.title,
        description: data.description,
        status: 'draft',
        audience: data.audience,
        audienceValue: data.audienceValue,
        questions: data.questions.map((q, idx) => ({ ...q, id: `q-${Date.now()}-${idx}` })),
        scheduleType: data.scheduleType,
        scheduledDate: data.scheduledDate,
        recurringInterval: data.recurringInterval,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        targetResponses: 100,
        actualResponses: 0,
        participationRate: 0,
      };
      MOCK_SURVEYS.push(newSurvey);
      return newSurvey;
    }
  }

  /**
   * Publish a draft survey to its target audience
   */
  static async publishSurvey(id: string): Promise<Survey> {
    try {
      return await APIClient.post<Survey>(`/v1/surveys/${id}/publish`, {});
    } catch {
      const survey = MOCK_SURVEYS.find((s) => s.id === id);
      if (!survey) throw new Error(`Survey ${id} not found`);
      survey.status = 'active';
      survey.publishedAt = new Date().toISOString();
      return survey;
    }
  }

  /**
   * Submit an anonymous survey response
   */
  static async submitResponse(surveyId: string, answers: SurveyAnswer[]): Promise<SurveyResponse> {
    try {
      return await APIClient.post<SurveyResponse>(`/v1/surveys/${surveyId}/responses`, { answers });
    } catch {
      const survey = MOCK_SURVEYS.find((s) => s.id === surveyId);
      if (!survey) throw new Error(`Survey ${surveyId} not found`);
      const response: SurveyResponse = {
        id: `resp-${Date.now()}`,
        surveyId,
        answers,
        submittedAt: new Date().toISOString(),
      };
      MOCK_RESPONSES.push(response);
      survey.actualResponses += 1;
      survey.participationRate = (survey.actualResponses / survey.targetResponses) * 100;
      return response;
    }
  }

  /**
   * Get aggregate results for a survey
   */
  static async getSurveyResults(id: string): Promise<SurveyResults> {
    try {
      return await APIClient.get<SurveyResults>(`/v1/surveys/${id}/results`);
    } catch {
      const survey = MOCK_SURVEYS.find((s) => s.id === id);
      if (!survey) throw new Error(`Survey ${id} not found`);

      const responses = MOCK_RESPONSES.filter((r) => r.surveyId === id);
      const questionResults: QuestionResult[] = survey.questions.map((q) => {
        const answers = responses
          .map((r) => r.answers.find((a) => a.questionId === q.id))
          .filter(Boolean);

        if (q.type === 'nps') {
          const vals = answers.map((a) => Number(a!.value));
          const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
          const dist = Array.from({ length: 11 }, (_, i) => ({
            label: String(i),
            count: vals.filter((v) => v === i).length,
            percentage: vals.length ? (vals.filter((v) => v === i).length / vals.length) * 100 : 0,
          }));
          return {
            questionId: q.id,
            questionText: q.text,
            questionType: q.type,
            totalResponses: vals.length,
            average: avg,
            distribution: dist,
          };
        }
        if (q.type === 'rating') {
          const vals = answers.map((a) => Number(a!.value));
          const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
          const dist = [1, 2, 3, 4, 5].map((i) => ({
            label: String(i),
            count: vals.filter((v) => v === i).length,
            percentage: vals.length ? (vals.filter((v) => v === i).length / vals.length) * 100 : 0,
          }));
          return {
            questionId: q.id,
            questionText: q.text,
            questionType: q.type,
            totalResponses: vals.length,
            average: avg,
            distribution: dist,
          };
        }
        if (q.type === 'multiple_choice') {
          const choices = (q.options ?? []).map((opt) => {
            const count = answers.filter((a) => a!.value === opt).length;
            return {
              option: opt,
              count,
              percentage: answers.length ? (count / answers.length) * 100 : 0,
            };
          });
          return {
            questionId: q.id,
            questionText: q.text,
            questionType: q.type,
            totalResponses: answers.length,
            choices,
          };
        }
        if (q.type === 'text') {
          return {
            questionId: q.id,
            questionText: q.text,
            questionType: q.type,
            totalResponses: answers.length,
            textResponses: answers.map((a) => String(a!.value)),
          };
        }
        if (q.type === 'yes_no') {
          const yesCount = answers.filter((a) => a!.value === 'yes').length;
          return {
            questionId: q.id,
            questionText: q.text,
            questionType: q.type,
            totalResponses: answers.length,
            yesCount,
            noCount: answers.length - yesCount,
          };
        }
        const vals = answers.map((a) => Number(a!.value));
        const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
        return {
          questionId: q.id,
          questionText: q.text,
          questionType: q.type,
          totalResponses: vals.length,
          average: avg,
        };
      });

      // NPS calculation for surveys with NPS question
      const npsQuestion = survey.questions.find((q) => q.type === 'nps');
      let npsBreakdown: NPSBreakdown | undefined;
      if (npsQuestion) {
        const npsAnswers = responses
          .map((r) => r.answers.find((a) => a.questionId === npsQuestion.id))
          .filter(Boolean)
          .map((a) => Number(a!.value));
        const promoters = npsAnswers.filter((v) => v >= 9).length;
        const passives = npsAnswers.filter((v) => v >= 7 && v <= 8).length;
        const detractors = npsAnswers.filter((v) => v <= 6).length;
        const total = npsAnswers.length || 1;
        npsBreakdown = {
          promoters,
          passives,
          detractors,
          totalResponses: npsAnswers.length,
          npsScore: Math.round((promoters / total - detractors / total) * 100),
        };
      }

      return {
        surveyId: id,
        surveyTitle: survey.title,
        totalInvited: survey.targetResponses,
        totalResponded: survey.actualResponses,
        participationRate: survey.participationRate,
        averageCompletionTime: 4.2,
        questionResults,
        npsBreakdown,
        departmentComparison: [
          { department: 'Engineering', participationRate: 82, averageScore: 7.8, responses: 41 },
          { department: 'Sales', participationRate: 71, averageScore: 7.2, responses: 28 },
          { department: 'Marketing', participationRate: 78, averageScore: 7.9, responses: 22 },
          { department: 'HR', participationRate: 90, averageScore: 8.1, responses: 18 },
          { department: 'Finance', participationRate: 68, averageScore: 7.5, responses: 17 },
          { department: 'Operations', participationRate: 75, averageScore: 7.6, responses: 30 },
        ],
        previousRunScore: 7.2,
        currentScore: 7.8,
      };
    }
  }

  /**
   * Get company-level survey analytics: eNPS, participation trends, engagement score
   */
  static async getSurveyAnalytics(): Promise<SurveyAnalytics> {
    try {
      return await APIClient.get<SurveyAnalytics>('/v1/surveys/analytics');
    } catch {
      return {
        eNPSScore: 42,
        eNPSPromoters: 58,
        eNPSPassives: 26,
        eNPSDetractors: 16,
        overallParticipationRate: 76.2,
        engagementScoreTrend: [
          { quarter: 'Q2 2025', score: 68 },
          { quarter: 'Q3 2025', score: 71 },
          { quarter: 'Q4 2025', score: 74 },
          { quarter: 'Q1 2026', score: 78 },
        ],
        activeSurveysCount: 3,
        completedSurveysCount: 12,
        totalResponsesThisMonth: 214,
        topInsights: [
          'Engagement score increased 5.4% vs last quarter',
          'Work-Life Balance flagged as top improvement area (34% of responses)',
          'Manager support scores improved to 7.9/10',
          'Engineering department shows highest participation at 82%',
          'eNPS of +42 places us in the "Excellent" category',
        ],
      };
    }
  }

  /**
   * Get survey templates for quick setup
   */
  static getSurveyTemplates(): {
    id: string;
    name: string;
    description: string;
    questionCount: number;
  }[] {
    return [
      {
        id: 'tpl-pulse',
        name: 'Quarterly Pulse',
        description: '5 core engagement questions',
        questionCount: 5,
      },
      {
        id: 'tpl-enps',
        name: 'eNPS Only',
        description: 'Single NPS question for quick check',
        questionCount: 1,
      },
      {
        id: 'tpl-onboarding',
        name: 'Onboarding Feedback',
        description: 'New hire 30-day experience',
        questionCount: 6,
      },
      {
        id: 'tpl-exit',
        name: 'Exit Survey',
        description: 'Comprehensive departure feedback',
        questionCount: 8,
      },
      {
        id: 'tpl-manager',
        name: 'Manager Effectiveness',
        description: 'Upward feedback for managers',
        questionCount: 7,
      },
      {
        id: 'tpl-wellbeing',
        name: 'Employee Wellbeing',
        description: 'Physical & mental wellness check',
        questionCount: 6,
      },
    ];
  }
}
