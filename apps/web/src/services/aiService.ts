/**
 * @module aiService
 * @description AI/ML Predictive Analytics service — attrition risk prediction,
 *              flight risk detection, absenteeism prediction, hiring recommendations,
 *              sentiment analysis, anomaly detection, workforce forecasting,
 *              HR chatbot (Sec 7.1)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface RiskFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  weight: number; // 0–100 contribution to score
}

export interface AttritionRiskProfile {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  riskScore: number; // 0–100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  confidenceScore: number; // 0–100 model confidence
  predictedAttritionDate?: string;
  retentionActions: string[];
  lastUpdated: string;
}

export interface AbsenteeismPrediction {
  departmentId?: string;
  departmentName: string;
  period: string;
  predictedAbsenceRate: number;
  historicalRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  peakDays: string[];
  confidenceScore: number;
  keyFactors: string[];
}

export interface CandidateRecommendation {
  candidateId: string;
  name: string;
  matchScore: number; // 0–100
  skillsMatch: number;
  experienceMatch: number;
  culturalFitScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'pass';
}

export interface SentimentAnalysis {
  surveyId?: string;
  period: string;
  overallSentiment: SentimentLabel;
  sentimentScore: number; // -1 to 1
  positive: number; // percentage
  neutral: number;
  negative: number;
  topPositiveThemes: string[];
  topNegativeThemes: string[];
  trend: { period: string; score: number; label: SentimentLabel }[];
}

export interface AnomalyAlert {
  id: string;
  metric: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
  affectedDepartment?: string;
  currentValue: number;
  expectedValue: number;
  deviation: number; // percentage
  recommendedAction: string;
}

export interface WorkforceForecast {
  month: string;
  predictedHeadcount: number;
  confidenceLow: number;
  confidenceHigh: number;
  predictedCost: number; // $M
  predictedAttrition: number;
  predictedHires: number;
  skillDemand: { skill: string; demandScore: number }[];
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  card?: ChatbotCard;
}

export interface ChatbotCard {
  type: 'leave_balance' | 'payslip' | 'policy' | 'contact' | 'faq';
  title: string;
  data: Record<string, string | number>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ATTRITION_PROFILES: AttritionRiskProfile[] = [
  {
    employeeId: 'emp-011',
    employeeName: 'James Wilson',
    department: 'Engineering',
    role: 'Software Engineer',
    riskScore: 87,
    riskLevel: 'critical',
    riskFactors: [
      {
        factor: 'No promotion in 3+ years',
        impact: 'high',
        description: 'Last promoted Jan 2023',
        weight: 32,
      },
      {
        factor: 'Below-market salary',
        impact: 'high',
        description: '18% below P50 for role',
        weight: 28,
      },
      {
        factor: 'Low engagement score',
        impact: 'medium',
        description: 'Survey score: 5.2/10',
        weight: 18,
      },
      {
        factor: 'Manager change',
        impact: 'medium',
        description: '3rd manager in 12 months',
        weight: 12,
      },
      {
        factor: 'Short tenure (<1 yr in current role)',
        impact: 'low',
        description: '8 months in current role',
        weight: 10,
      },
    ],
    confidenceScore: 83,
    predictedAttritionDate: '2026-05-15',
    retentionActions: [
      'Schedule immediate salary review',
      'Define clear promotion path',
      'Pair with senior mentor',
      'Discuss career growth plan',
    ],
    lastUpdated: '2026-02-25T06:00:00Z',
  },
  {
    employeeId: 'emp-012',
    employeeName: 'Maria Santos',
    department: 'Sales',
    role: 'Senior Sales Executive',
    riskScore: 76,
    riskLevel: 'high',
    riskFactors: [
      {
        factor: 'Missed quota 3 consecutive quarters',
        impact: 'high',
        description: 'May be considering exit',
        weight: 35,
      },
      {
        factor: 'Limited career progression',
        impact: 'high',
        description: 'Ceiling at current role',
        weight: 25,
      },
      {
        factor: 'Low collaboration score',
        impact: 'medium',
        description: 'Peer feedback flagged',
        weight: 20,
      },
      {
        factor: 'Frequent leave usage',
        impact: 'low',
        description: '18 days used vs 15 avg',
        weight: 20,
      },
    ],
    confidenceScore: 74,
    predictedAttritionDate: '2026-06-01',
    retentionActions: [
      'Performance coaching program',
      'Territory reassignment consideration',
      'Career discussion with VP Sales',
    ],
    lastUpdated: '2026-02-25T06:00:00Z',
  },
  {
    employeeId: 'emp-013',
    employeeName: 'Raj Patel',
    department: 'Engineering',
    role: 'Principal Engineer',
    riskScore: 72,
    riskLevel: 'high',
    riskFactors: [
      {
        factor: 'Received external offer',
        impact: 'high',
        description: 'Mentioned in Glassdoor signal',
        weight: 40,
      },
      {
        factor: 'Below market equity',
        impact: 'high',
        description: 'Equity refresh needed',
        weight: 30,
      },
      {
        factor: 'Low satisfaction with tech stack',
        impact: 'medium',
        description: 'Survey responses indicate',
        weight: 30,
      },
    ],
    confidenceScore: 71,
    retentionActions: [
      'Immediate equity refresh discussion',
      'Technology modernization roadmap',
      'Expand role scope',
    ],
    lastUpdated: '2026-02-25T06:00:00Z',
  },
  {
    employeeId: 'emp-014',
    employeeName: 'Linda Chen',
    department: 'Marketing',
    role: 'Marketing Manager',
    riskScore: 61,
    riskLevel: 'medium',
    riskFactors: [
      {
        factor: 'Stagnant in role',
        impact: 'medium',
        description: '2.5 years without progression',
        weight: 45,
      },
      {
        factor: 'Low recognition',
        impact: 'medium',
        description: 'Below avg recognition score',
        weight: 35,
      },
      {
        factor: 'Work-life balance concerns',
        impact: 'low',
        description: 'High overtime hours logged',
        weight: 20,
      },
    ],
    confidenceScore: 68,
    retentionActions: [
      'Recognition program enrollment',
      'Workload assessment',
      'Future role discussion',
    ],
    lastUpdated: '2026-02-25T06:00:00Z',
  },
  {
    employeeId: 'emp-015',
    employeeName: 'Tom Bradley',
    department: 'Finance',
    role: 'Finance Analyst',
    riskScore: 58,
    riskLevel: 'medium',
    riskFactors: [
      {
        factor: 'New graduate — common early attrition',
        impact: 'medium',
        description: '14 months tenure',
        weight: 50,
      },
      {
        factor: 'Competing offers common for role',
        impact: 'medium',
        description: 'High demand market',
        weight: 30,
      },
      {
        factor: 'Limited mentorship',
        impact: 'low',
        description: 'No formal mentor assigned',
        weight: 20,
      },
    ],
    confidenceScore: 62,
    retentionActions: [
      'Assign senior mentor',
      'Early career development plan',
      'Competitive compensation review',
    ],
    lastUpdated: '2026-02-25T06:00:00Z',
  },
];

const MOCK_ANOMALY_ALERTS: AnomalyAlert[] = [
  {
    id: 'anomaly-001',
    metric: 'Overtime Hours',
    description: 'Engineering team overtime hours spiked 45% above average this week',
    severity: 'high',
    detectedAt: '2026-02-25T08:00:00Z',
    affectedDepartment: 'Engineering',
    currentValue: 12.8,
    expectedValue: 8.8,
    deviation: 45.5,
    recommendedAction: 'Schedule manager check-in; review sprint planning capacity',
  },
  {
    id: 'anomaly-002',
    metric: 'Absenteeism Rate',
    description: 'Sales department absence rate elevated for 3rd consecutive week',
    severity: 'medium',
    detectedAt: '2026-02-24T09:00:00Z',
    affectedDepartment: 'Sales',
    currentValue: 6.2,
    expectedValue: 3.8,
    deviation: 63.2,
    recommendedAction: 'HR check-in with Sales managers; assess if team stress-related',
  },
  {
    id: 'anomaly-003',
    metric: 'Leave Requests',
    description: 'Unusual spike in sudden leave requests (same-day submissions)',
    severity: 'low',
    detectedAt: '2026-02-23T10:00:00Z',
    currentValue: 18,
    expectedValue: 9,
    deviation: 100,
    recommendedAction:
      'Review leave patterns; may indicate upcoming team event or wellness concern',
  },
  {
    id: 'anomaly-004',
    metric: 'Performance Review Completions',
    description: 'Mid-year review completion rate lagging — only 42% complete vs 75% expected',
    severity: 'medium',
    detectedAt: '2026-02-22T11:00:00Z',
    currentValue: 42,
    expectedValue: 75,
    deviation: -44,
    recommendedAction: 'Send automated reminders to managers; escalate to VP level if needed',
  },
];

const MOCK_WORKFORCE_FORECASTS: WorkforceForecast[] = [
  {
    month: 'Mar 2026',
    predictedHeadcount: 291,
    confidenceLow: 285,
    confidenceHigh: 298,
    predictedCost: 2.2,
    predictedAttrition: 4,
    predictedHires: 10,
    skillDemand: [
      { skill: 'ML/AI', demandScore: 92 },
      { skill: 'Cloud', demandScore: 87 },
    ],
  },
  {
    month: 'Apr 2026',
    predictedHeadcount: 297,
    confidenceLow: 289,
    confidenceHigh: 306,
    predictedCost: 2.3,
    predictedAttrition: 3,
    predictedHires: 9,
    skillDemand: [
      { skill: 'ML/AI', demandScore: 95 },
      { skill: 'DevOps', demandScore: 82 },
    ],
  },
  {
    month: 'May 2026',
    predictedHeadcount: 303,
    confidenceLow: 292,
    confidenceHigh: 315,
    predictedCost: 2.4,
    predictedAttrition: 4,
    predictedHires: 10,
    skillDemand: [
      { skill: 'Sales', demandScore: 90 },
      { skill: 'ML/AI', demandScore: 94 },
    ],
  },
  {
    month: 'Jun 2026',
    predictedHeadcount: 308,
    confidenceLow: 295,
    confidenceHigh: 322,
    predictedCost: 2.4,
    predictedAttrition: 5,
    predictedHires: 10,
    skillDemand: [
      { skill: 'ML/AI', demandScore: 96 },
      { skill: 'Product', demandScore: 88 },
    ],
  },
  {
    month: 'Jul 2026',
    predictedHeadcount: 314,
    confidenceLow: 298,
    confidenceHigh: 330,
    predictedCost: 2.5,
    predictedAttrition: 4,
    predictedHires: 10,
    skillDemand: [
      { skill: 'Cloud', demandScore: 91 },
      { skill: 'ML/AI', demandScore: 97 },
    ],
  },
  {
    month: 'Aug 2026',
    predictedHeadcount: 320,
    confidenceLow: 301,
    confidenceHigh: 339,
    predictedCost: 2.6,
    predictedAttrition: 4,
    predictedHires: 10,
    skillDemand: [
      { skill: 'ML/AI', demandScore: 98 },
      { skill: 'Sales', demandScore: 93 },
    ],
  },
];

// Chatbot FAQ patterns
const FAQ_PATTERNS: { patterns: string[]; response: string; card?: ChatbotCard }[] = [
  {
    patterns: ['leave balance', 'how many leaves', 'annual leave', 'days off'],
    response:
      'Your current leave balance is shown below. You have **15 annual leave days** remaining this year.',
    card: {
      type: 'leave_balance',
      title: 'Leave Balance — 2026',
      data: { Annual: 15, Sick: 8, Casual: 3, 'Total Used': 7 },
    },
  },
  {
    patterns: ['payslip', 'salary slip', 'pay stub', 'last salary'],
    response: 'Here is your most recent payslip for February 2026.',
    card: {
      type: 'payslip',
      title: 'Payslip — February 2026',
      data: {
        'Basic Salary': '$5,200',
        HRA: '$1,200',
        Allowances: '$800',
        'Net Pay': '$6,850',
        'Tax Deducted': '$350',
      },
    },
  },
  {
    patterns: ['wfh policy', 'work from home', 'remote work', 'hybrid policy'],
    response: 'Our hybrid work policy allows flexible remote work. Here are the key details.',
    card: {
      type: 'policy',
      title: 'Hybrid Work Policy',
      data: {
        'Core In-Office Days': 'Tue & Wed',
        'Flexible Days': 'Mon, Thu, Fri',
        'Full Remote': 'By prior arrangement',
        'Effective Date': 'March 1, 2026',
      },
    },
  },
  {
    patterns: ['hr contact', 'contact hr', 'speak to hr', 'hr team'],
    response: 'Here are the HR contact details for your region.',
    card: {
      type: 'contact',
      title: 'HR Team Contacts',
      data: {
        'HR Business Partner': 'Sarah Lee',
        Email: 'hr@kreupai.com',
        Phone: '+1-800-HR-HELP',
        'Office Hours': '9 AM – 6 PM IST',
      },
    },
  },
  {
    patterns: ['password reset', 'reset password', 'forgot password', 'account locked'],
    response:
      'To reset your password: Go to **Settings → Security → Change Password** or click "Forgot Password" on the login screen. If your account is locked, contact IT support.',
  },
  {
    patterns: ['health insurance', 'medical benefits', 'dental coverage'],
    response:
      'Your health insurance covers medical, dental, and vision. The updated Aetna plan is effective April 1, 2026. Check the Benefits portal for full details or contact hr@kreupai.com.',
  },
  {
    patterns: ['performance review', 'appraisal', 'review cycle'],
    response:
      'Performance reviews run in **June (mid-year)** and **December (annual)**. Self-assessments open 2 weeks before. Manager reviews open 1 week after. Results shared within 4 weeks.',
  },
  {
    patterns: ['training', 'learning', 'courses', 'development'],
    response:
      'KreupAI provides a $1,000 annual learning budget. Browse courses in the **Learning portal** under My Development. You can also request external training through your manager.',
  },
  {
    patterns: ['expense', 'reimbursement', 'claim'],
    response:
      'Submit expenses through **Finance → Expenses → New Expense**. Expenses are reimbursed within 5-7 business days after manager approval. Receipts required for items over $25.',
  },
  {
    patterns: ['overtime', 'comp off', 'compensatory'],
    response:
      'Overtime hours above 45/week are compensated either as additional pay (1.5x rate for hourly) or compensatory time off, subject to manager approval. Log overtime in the Timesheet module.',
  },
];

function matchFAQ(query: string): { response: string; card?: ChatbotCard } | null {
  const lower = query.toLowerCase();
  for (const faq of FAQ_PATTERNS) {
    if (faq.patterns.some((p) => lower.includes(p))) {
      return { response: faq.response, card: faq.card };
    }
  }
  return null;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class AIService {
  /**
   * Predict attrition risk for a specific employee or all employees
   */
  static async predictAttritionRisk(
    employeeId?: string
  ): Promise<AttritionRiskProfile | AttritionRiskProfile[]> {
    try {
      if (employeeId) {
        return await APIClient.get<AttritionRiskProfile>(`/v1/ai/attrition/${employeeId}`);
      }
      return await APIClient.get<AttritionRiskProfile[]>('/v1/ai/attrition');
    } catch {
      if (employeeId) {
        return (
          MOCK_ATTRITION_PROFILES.find((p) => p.employeeId === employeeId) ??
          MOCK_ATTRITION_PROFILES[0]
        );
      }
      return MOCK_ATTRITION_PROFILES;
    }
  }

  /**
   * Get employees above a given risk threshold
   */
  static async getFlightRiskEmployees(threshold = 60): Promise<AttritionRiskProfile[]> {
    try {
      return await APIClient.get<AttritionRiskProfile[]>('/v1/ai/flight-risk', { threshold });
    } catch {
      return MOCK_ATTRITION_PROFILES.filter((p) => p.riskScore >= threshold).sort(
        (a, b) => b.riskScore - a.riskScore
      );
    }
  }

  /**
   * Predict absenteeism for a department or company
   */
  static async predictAbsenteeism(departmentId?: string): Promise<AbsenteeismPrediction[]> {
    try {
      return await APIClient.get<AbsenteeismPrediction[]>('/v1/ai/absenteeism', { departmentId });
    } catch {
      return [
        {
          departmentId: 'eng',
          departmentName: 'Engineering',
          period: 'March 2026',
          predictedAbsenceRate: 3.2,
          historicalRate: 2.8,
          trend: 'increasing',
          peakDays: ['Monday', 'Friday'],
          confidenceScore: 78,
          keyFactors: ['Sprint deadline pressure', 'Seasonal illness', 'WFH flexibility'],
        },
        {
          departmentId: 'sales',
          departmentName: 'Sales',
          period: 'March 2026',
          predictedAbsenceRate: 5.1,
          historicalRate: 3.8,
          trend: 'increasing',
          peakDays: ['Monday', 'Friday'],
          confidenceScore: 72,
          keyFactors: ['Q1 end stress', 'Quota pressure', 'Seasonal'],
        },
        {
          departmentId: 'ops',
          departmentName: 'Operations',
          period: 'March 2026',
          predictedAbsenceRate: 2.1,
          historicalRate: 2.3,
          trend: 'decreasing',
          peakDays: ['Friday'],
          confidenceScore: 81,
          keyFactors: ['Good team morale', 'Flexible scheduling'],
        },
        {
          departmentId: 'hr',
          departmentName: 'HR',
          period: 'March 2026',
          predictedAbsenceRate: 1.8,
          historicalRate: 2.0,
          trend: 'stable',
          peakDays: ['Monday'],
          confidenceScore: 85,
          keyFactors: ['Low workload period', 'Good work-life balance'],
        },
      ].filter((d) => !departmentId || d.departmentId === departmentId);
    }
  }

  /**
   * Get AI-ranked candidate recommendations for a job
   */
  static async getHiringRecommendations(jobId: string): Promise<CandidateRecommendation[]> {
    try {
      return await APIClient.get<CandidateRecommendation[]>(
        `/v1/ai/hiring/${jobId}/recommendations`
      );
    } catch {
      return [
        {
          candidateId: 'cand-001',
          name: 'Alex Johnson',
          matchScore: 94,
          skillsMatch: 96,
          experienceMatch: 92,
          culturalFitScore: 89,
          strengths: ['Strong ML background', 'Open source contributions', 'Team player'],
          gaps: ['No fintech experience'],
          recommendation: 'strong_hire',
        },
        {
          candidateId: 'cand-002',
          name: 'Priya Kumar',
          matchScore: 88,
          skillsMatch: 90,
          experienceMatch: 85,
          culturalFitScore: 92,
          strengths: ['Perfect skills match', 'Great cultural fit'],
          gaps: ['Shorter tenure history'],
          recommendation: 'hire',
        },
        {
          candidateId: 'cand-003',
          name: 'David Park',
          matchScore: 72,
          skillsMatch: 75,
          experienceMatch: 80,
          culturalFitScore: 65,
          strengths: ['Strong technical skills'],
          gaps: ['Culture fit concerns', 'Communication style'],
          recommendation: 'consider',
        },
        {
          candidateId: 'cand-004',
          name: 'Sarah Brown',
          matchScore: 58,
          skillsMatch: 55,
          experienceMatch: 70,
          culturalFitScore: 75,
          strengths: ['Good experience'],
          gaps: ['Skills gap in required areas', 'Overqualified'],
          recommendation: 'pass',
        },
      ];
    }
  }

  /**
   * Analyze sentiment from survey text responses
   */
  static async getSentimentAnalysis(surveyId?: string): Promise<SentimentAnalysis> {
    try {
      return await APIClient.get<SentimentAnalysis>('/v1/ai/sentiment', { surveyId });
    } catch {
      return {
        surveyId,
        period: 'Q1 2026',
        overallSentiment: 'positive',
        sentimentScore: 0.42,
        positive: 58,
        neutral: 28,
        negative: 14,
        topPositiveThemes: [
          'Team culture & collaboration',
          'Manager support',
          'Work flexibility',
          'Learning opportunities',
          'Company direction',
        ],
        topNegativeThemes: [
          'Compensation growth',
          'Career progression pace',
          'Tool & process overhead',
          'Meeting overload',
        ],
        trend: [
          { period: 'Q2 2025', score: 0.28, label: 'neutral' },
          { period: 'Q3 2025', score: 0.34, label: 'positive' },
          { period: 'Q4 2025', score: 0.39, label: 'positive' },
          { period: 'Q1 2026', score: 0.42, label: 'positive' },
        ],
      };
    }
  }

  /**
   * Detect anomalies in HR metrics
   */
  static async getAnomalyDetection(): Promise<AnomalyAlert[]> {
    try {
      return await APIClient.get<AnomalyAlert[]>('/v1/ai/anomalies');
    } catch {
      return MOCK_ANOMALY_ALERTS;
    }
  }

  /**
   * Get 6-month workforce forecasts
   */
  static async getWorkforceForecasts(months = 6): Promise<WorkforceForecast[]> {
    try {
      return await APIClient.get<WorkforceForecast[]>('/v1/ai/forecasts', { months });
    } catch {
      return MOCK_WORKFORCE_FORECASTS.slice(0, months);
    }
  }

  /**
   * HR Chatbot — FAQ matching with typed card responses
   */
  static async getChatbotResponse(
    query: string
  ): Promise<{ response: string; card?: ChatbotCard }> {
    try {
      return await APIClient.post<{ response: string; card?: ChatbotCard }>('/v1/ai/chatbot', {
        query,
      });
    } catch {
      // Simulate slight delay for realism
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));

      const match = matchFAQ(query);
      if (match) return match;

      // Fallback escalation response
      return {
        response: `I don't have a specific answer for that. Here are some options:\n\n• Search the **Help Center** for articles\n• Contact your **HR Business Partner**: hr@kreupai.com\n• Raise an **IT ticket** for technical issues\n• Speak to your **manager** for team-specific questions\n\nWould you like me to connect you with a human HR agent?`,
      };
    }
  }

  /**
   * Get attrition risk summary for dashboard
   */
  static async getAttritionSummary(): Promise<{
    high: number;
    medium: number;
    low: number;
    totalAtRisk: number;
    avgRiskScore: number;
  }> {
    const profiles = MOCK_ATTRITION_PROFILES;
    const high = profiles.filter(
      (p) => p.riskLevel === 'high' || p.riskLevel === 'critical'
    ).length;
    const medium = profiles.filter((p) => p.riskLevel === 'medium').length;
    const low = profiles.filter((p) => p.riskLevel === 'low').length;
    const avgRiskScore = Math.round(
      profiles.reduce((s, p) => s + p.riskScore, 0) / profiles.length
    );
    return { high, medium, low, totalAtRisk: high + medium, avgRiskScore };
  }

  /**
   * Risk level helpers
   */
  static getRiskColor(level: RiskLevel): string {
    return { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }[level];
  }

  static getRiskBgColor(level: RiskLevel): string {
    return { low: '#d1fae5', medium: '#fef3c7', high: '#fff7ed', critical: '#fee2e2' }[level];
  }
}
