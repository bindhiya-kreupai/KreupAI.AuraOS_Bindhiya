/**
 * DEI (Diversity, Equity & Inclusion) Service
 * Diversity metrics, inclusion surveys, bias detection, and DEI initiatives
 *
 * Features:
 * - Diversity metrics and analytics
 * - Inclusion surveys and pulse checks
 * - Pay equity analysis
 * - Bias detection in hiring
 * - DEI goals and tracking
 * - ERG (Employee Resource Group) management
 * - Accessibility compliance
 * - Training and awareness programs
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DiversityMetrics {
  overallDiversityScore: number;
  genderDistribution: DimensionDistribution;
  ageDistribution: DimensionDistribution;
  nationalityDistribution: DimensionDistribution;
  ethnicityDistribution: DimensionDistribution;
  disabilityDistribution: DimensionDistribution;
  veteranStatus: DimensionDistribution;
  leadershipDiversity: LeadershipDiversity;
  hiringDiversity: HiringDiversity;
  promotionEquity: PromotionEquity;
  retentionByGroup: RetentionByGroup[];
  payEquity: PayEquityAnalysis;
  trendData: DiversityTrend[];
  benchmarks: IndustryBenchmark[];
  lastUpdated: Date;
}

export interface DimensionDistribution {
  dimension: DiversityDimension;
  categories: CategoryCount[];
  total: number;
  representationGaps: RepresentationGap[];
}

export type DiversityDimension =
  | 'gender'
  | 'age'
  | 'nationality'
  | 'ethnicity'
  | 'disability'
  | 'veteran_status'
  | 'religion'
  | 'sexual_orientation'
  | 'education_level';

export interface CategoryCount {
  category: string;
  categoryAr: string;
  count: number;
  percentage: number;
  change: number; // vs previous period
}

export interface RepresentationGap {
  category: string;
  currentPercentage: number;
  targetPercentage: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
}

export interface LeadershipDiversity {
  executiveLevel: DimensionDistribution;
  seniorManagement: DimensionDistribution;
  management: DimensionDistribution;
  overall: DimensionDistribution;
  pipelineAnalysis: PipelineStage[];
}

export interface PipelineStage {
  stage: string;
  stageAr: string;
  diversityScore: number;
  dropOffRate: number;
}

export interface HiringDiversity {
  applicantPool: DimensionDistribution;
  interviewStage: DimensionDistribution;
  offers: DimensionDistribution;
  hires: DimensionDistribution;
  conversionRates: ConversionRate[];
  biasIndicators: BiasIndicator[];
}

export interface ConversionRate {
  stage: string;
  overallRate: number;
  ratesByGroup: { group: string; rate: number }[];
  significantDifference: boolean;
}

export interface BiasIndicator {
  type: BiasType;
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high';
  affectedGroups: string[];
  recommendation: string;
  recommendationAr: string;
}

export type BiasType =
  | 'name_bias'
  | 'age_bias'
  | 'gender_bias'
  | 'education_bias'
  | 'affinity_bias'
  | 'halo_effect'
  | 'confirmation_bias';

export interface PromotionEquity {
  promotionRatesByGroup: { group: string; rate: number; benchmark: number }[];
  timeToPromotionByGroup: { group: string; avgMonths: number }[];
  equityScore: number;
  gaps: EquityGap[];
}

export interface EquityGap {
  metric: string;
  metricAr: string;
  advantagedGroup: string;
  disadvantagedGroup: string;
  gapPercentage: number;
  significance: 'low' | 'medium' | 'high';
}

export interface RetentionByGroup {
  group: string;
  retentionRate: number;
  turnoverRate: number;
  avgTenure: number;
  exitReasons: { reason: string; percentage: number }[];
}

export interface PayEquityAnalysis {
  overallGap: number; // percentage
  gapsByDimension: PayGap[];
  adjustedGap: number; // after controlling for factors
  medianPayByGroup: { group: string; median: number; currency: string }[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface PayGap {
  dimension: DiversityDimension;
  referenceGroup: string;
  comparisonGroup: string;
  rawGap: number;
  adjustedGap: number;
  sampleSize: number;
  statisticallySignificant: boolean;
}

export interface DiversityTrend {
  period: string;
  diversityScore: number;
  dimensionScores: { dimension: DiversityDimension; score: number }[];
}

export interface IndustryBenchmark {
  dimension: DiversityDimension;
  category: string;
  industryAverage: number;
  topQuartile: number;
  ourValue: number;
  status: 'below' | 'at' | 'above';
}

export interface InclusionSurvey {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: SurveyType;
  questions: InclusionQuestion[];
  status: SurveyStatus;
  startDate: Date;
  endDate: Date;
  responseRate: number;
  responses: number;
  targetAudience: string[];
  isAnonymous: boolean;
  createdAt: Date;
}

export type SurveyType =
  | 'annual_inclusion'
  | 'pulse_check'
  | 'belonging_index'
  | 'psychological_safety'
  | 'exit_survey'
  | 'onboarding_experience';

export type SurveyStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'closed'
  | 'analyzed';

export interface InclusionQuestion {
  id: string;
  text: string;
  textAr: string;
  type: QuestionType;
  category: InclusionCategory;
  options?: string[];
  optionsAr?: string[];
  isRequired: boolean;
}

export type QuestionType =
  | 'likert_5'
  | 'likert_7'
  | 'multiple_choice'
  | 'open_text'
  | 'yes_no'
  | 'ranking';

export type InclusionCategory =
  | 'belonging'
  | 'respect'
  | 'fairness'
  | 'psychological_safety'
  | 'voice'
  | 'growth_opportunity'
  | 'leadership_commitment'
  | 'team_dynamics';

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId?: string; // null if anonymous
  department: string;
  responses: QuestionResponse[];
  submittedAt: Date;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | number | string[];
}

export interface InclusionResults {
  surveyId: string;
  overallInclusionScore: number;
  categoryScores: { category: InclusionCategory; score: number; benchmark: number }[];
  demographicBreakdown: DemographicBreakdown[];
  keyFindings: Finding[];
  actionItems: ActionItem[];
  comparisonToPrevious: number;
  responseRateByDepartment: { department: string; rate: number }[];
}

export interface DemographicBreakdown {
  dimension: DiversityDimension;
  group: string;
  inclusionScore: number;
  sampleSize: number;
  significantDifference: boolean;
}

export interface Finding {
  type: 'strength' | 'concern' | 'opportunity';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  affectedGroups?: string[];
  dataPoints: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: InclusionCategory;
  owner?: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DEIGoal {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: DEIGoalCategory;
  dimension?: DiversityDimension;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  status: GoalStatus;
  milestones: GoalMilestone[];
  initiatives: string[];
  owner: string;
  createdAt: Date;
}

export type DEIGoalCategory =
  | 'representation'
  | 'hiring'
  | 'retention'
  | 'promotion'
  | 'pay_equity'
  | 'inclusion_score'
  | 'leadership'
  | 'training';

export type GoalStatus =
  | 'not_started'
  | 'on_track'
  | 'at_risk'
  | 'behind'
  | 'completed';

export interface GoalMilestone {
  name: string;
  targetValue: number;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
}

export interface ERG {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: ERGCategory;
  memberCount: number;
  leaders: ERGLeader[];
  events: ERGEvent[];
  budget?: number;
  currency?: string;
  isActive: boolean;
  createdAt: Date;
}

export type ERGCategory =
  | 'gender'
  | 'ethnicity'
  | 'lgbtq'
  | 'disability'
  | 'veterans'
  | 'parents'
  | 'young_professionals'
  | 'cultural'
  | 'interfaith';

export interface ERGLeader {
  employeeId: string;
  name: string;
  role: 'chair' | 'co_chair' | 'secretary' | 'treasurer' | 'member';
  since: Date;
}

export interface ERGEvent {
  id: string;
  name: string;
  nameAr: string;
  date: Date;
  type: 'meeting' | 'workshop' | 'celebration' | 'networking' | 'volunteer';
  attendees: number;
}

export interface AccessibilityAudit {
  id: string;
  auditDate: Date;
  overallScore: number;
  categories: AccessibilityCategory[];
  findings: AccessibilityFinding[];
  recommendations: string[];
  recommendationsAr: string[];
  nextAuditDate: Date;
}

export interface AccessibilityCategory {
  name: string;
  nameAr: string;
  score: number;
  standard: string; // e.g., "WCAG 2.1 AA"
  compliant: boolean;
}

export interface AccessibilityFinding {
  id: string;
  type: 'physical' | 'digital' | 'policy';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  descriptionAr: string;
  location?: string;
  remediation: string;
  remediationAr: string;
  status: 'open' | 'in_progress' | 'resolved';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DIMENSION_LABELS: Record<DiversityDimension, { en: string; ar: string }> = {
  gender: { en: 'Gender', ar: 'الجنس' },
  age: { en: 'Age', ar: 'العمر' },
  nationality: { en: 'Nationality', ar: 'الجنسية' },
  ethnicity: { en: 'Ethnicity', ar: 'العرق' },
  disability: { en: 'Disability Status', ar: 'حالة الإعاقة' },
  veteran_status: { en: 'Veteran Status', ar: 'حالة المحارب' },
  religion: { en: 'Religion', ar: 'الدين' },
  sexual_orientation: { en: 'Sexual Orientation', ar: 'التوجه الجنسي' },
  education_level: { en: 'Education Level', ar: 'المستوى التعليمي' },
};

const INCLUSION_CATEGORY_LABELS: Record<InclusionCategory, { en: string; ar: string }> = {
  belonging: { en: 'Belonging', ar: 'الانتماء' },
  respect: { en: 'Respect', ar: 'الاحترام' },
  fairness: { en: 'Fairness', ar: 'العدالة' },
  psychological_safety: { en: 'Psychological Safety', ar: 'الأمان النفسي' },
  voice: { en: 'Voice & Input', ar: 'الصوت والمشاركة' },
  growth_opportunity: { en: 'Growth Opportunities', ar: 'فرص النمو' },
  leadership_commitment: { en: 'Leadership Commitment', ar: 'التزام القيادة' },
  team_dynamics: { en: 'Team Dynamics', ar: 'ديناميكيات الفريق' },
};

const INCLUSION_QUESTIONS: InclusionQuestion[] = [
  {
    id: 'belong_1',
    text: 'I feel like I belong at this organization',
    textAr: 'أشعر أنني أنتمي إلى هذه المنظمة',
    type: 'likert_5',
    category: 'belonging',
    isRequired: true,
  },
  {
    id: 'respect_1',
    text: 'I am treated with respect by my colleagues',
    textAr: 'يعاملني زملائي باحترام',
    type: 'likert_5',
    category: 'respect',
    isRequired: true,
  },
  {
    id: 'fairness_1',
    text: 'Decisions at this organization are made fairly',
    textAr: 'القرارات في هذه المنظمة تتخذ بعدالة',
    type: 'likert_5',
    category: 'fairness',
    isRequired: true,
  },
  {
    id: 'safety_1',
    text: 'I feel safe to express my opinions without fear of negative consequences',
    textAr: 'أشعر بالأمان للتعبير عن آرائي دون خوف من العواقب السلبية',
    type: 'likert_5',
    category: 'psychological_safety',
    isRequired: true,
  },
  {
    id: 'voice_1',
    text: 'My input is valued and considered in decisions that affect my work',
    textAr: 'يتم تقدير مساهماتي والنظر فيها في القرارات التي تؤثر على عملي',
    type: 'likert_5',
    category: 'voice',
    isRequired: true,
  },
  {
    id: 'growth_1',
    text: 'I have equal access to growth and advancement opportunities',
    textAr: 'لدي وصول متساوٍ لفرص النمو والترقي',
    type: 'likert_5',
    category: 'growth_opportunity',
    isRequired: true,
  },
  {
    id: 'leader_1',
    text: 'Leadership demonstrates commitment to diversity and inclusion',
    textAr: 'تُظهر القيادة التزاماً بالتنوع والشمول',
    type: 'likert_5',
    category: 'leadership_commitment',
    isRequired: true,
  },
  {
    id: 'team_1',
    text: 'My team values diverse perspectives and backgrounds',
    textAr: 'يقدر فريقي وجهات النظر والخلفيات المتنوعة',
    type: 'likert_5',
    category: 'team_dynamics',
    isRequired: true,
  },
];

const BIAS_DESCRIPTIONS: Record<BiasType, { en: string; ar: string }> = {
  name_bias: { en: 'Name-based discrimination in screening', ar: 'تمييز على أساس الاسم في الفرز' },
  age_bias: { en: 'Age-related discrimination', ar: 'تمييز مرتبط بالعمر' },
  gender_bias: { en: 'Gender-based discrimination', ar: 'تمييز على أساس الجنس' },
  education_bias: { en: 'Preference for specific educational backgrounds', ar: 'تفضيل خلفيات تعليمية محددة' },
  affinity_bias: { en: 'Preference for similar backgrounds', ar: 'تفضيل الخلفيات المشابهة' },
  halo_effect: { en: 'Overvaluing one positive trait', ar: 'المبالغة في تقدير سمة إيجابية واحدة' },
  confirmation_bias: { en: 'Seeking information to confirm existing beliefs', ar: 'البحث عن معلومات تؤكد المعتقدات القائمة' },
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class DEIService {
  private surveys: Map<string, InclusionSurvey> = new Map();
  private responses: Map<string, SurveyResponse[]> = new Map();
  private goals: Map<string, DEIGoal> = new Map();
  private ergs: Map<string, ERG> = new Map();
  private actionItems: Map<string, ActionItem> = new Map();

  /**
   * Calculate diversity metrics
   */
  calculateDiversityMetrics(employees: EmployeeData[]): DiversityMetrics {
    const genderDist = this.calculateDistribution(employees, 'gender');
    const ageDist = this.calculateAgeDistribution(employees);
    const nationalityDist = this.calculateDistribution(employees, 'nationality');

    const overallScore = this.calculateDiversityScore([genderDist, ageDist, nationalityDist]);

    return {
      overallDiversityScore: overallScore,
      genderDistribution: genderDist,
      ageDistribution: ageDist,
      nationalityDistribution: nationalityDist,
      ethnicityDistribution: this.createEmptyDistribution('ethnicity'),
      disabilityDistribution: this.createEmptyDistribution('disability'),
      veteranStatus: this.createEmptyDistribution('veteran_status'),
      leadershipDiversity: this.calculateLeadershipDiversity(employees),
      hiringDiversity: this.createEmptyHiringDiversity(),
      promotionEquity: this.calculatePromotionEquity(employees),
      retentionByGroup: this.calculateRetentionByGroup(employees),
      payEquity: this.calculatePayEquity(employees),
      trendData: this.generateTrendData(),
      benchmarks: this.generateBenchmarks(),
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate distribution for a dimension
   */
  private calculateDistribution(employees: EmployeeData[], dimension: DiversityDimension): DimensionDistribution {
    const counts: Record<string, number> = {};
    const total = employees.length;

    employees.forEach(emp => {
      const value = emp[dimension] || 'Not Specified';
      counts[value] = (counts[value] || 0) + 1;
    });

    const categories: CategoryCount[] = Object.entries(counts)
      .map(([category, count]) => ({
        category,
        categoryAr: category, // Would need translation mapping
        count,
        percentage: (count / total) * 100,
        change: Math.random() * 4 - 2, // Mock change
      }))
      .sort((a, b) => b.count - a.count);

    return {
      dimension,
      categories,
      total,
      representationGaps: this.calculateRepresentationGaps(categories),
    };
  }

  /**
   * Calculate age distribution
   */
  private calculateAgeDistribution(employees: EmployeeData[]): DimensionDistribution {
    const ageGroups = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
    const counts: Record<string, number> = {};
    const total = employees.length;

    ageGroups.forEach(group => {
      counts[group] = 0;
    });

    employees.forEach(emp => {
      const age = emp.age || 30;
      let group = '26-35';
      if (age < 26) group = '18-25';
      else if (age < 36) group = '26-35';
      else if (age < 46) group = '36-45';
      else if (age < 56) group = '46-55';
      else if (age < 66) group = '56-65';
      else group = '65+';
      counts[group]++;
    });

    const categories: CategoryCount[] = ageGroups.map(group => ({
      category: group,
      categoryAr: group,
      count: counts[group],
      percentage: (counts[group] / total) * 100,
      change: Math.random() * 2 - 1,
    }));

    return {
      dimension: 'age',
      categories,
      total,
      representationGaps: [],
    };
  }

  /**
   * Calculate representation gaps
   */
  private calculateRepresentationGaps(categories: CategoryCount[]): RepresentationGap[] {
    const gaps: RepresentationGap[] = [];

    // Example: check for underrepresentation
    categories.forEach(cat => {
      const target = 100 / categories.length; // Equal representation target
      const gap = target - cat.percentage;

      if (gap > 5) {
        gaps.push({
          category: cat.category,
          currentPercentage: cat.percentage,
          targetPercentage: target,
          gap,
          priority: gap > 15 ? 'high' : gap > 10 ? 'medium' : 'low',
        });
      }
    });

    return gaps;
  }

  /**
   * Create empty distribution
   */
  private createEmptyDistribution(dimension: DiversityDimension): DimensionDistribution {
    return {
      dimension,
      categories: [],
      total: 0,
      representationGaps: [],
    };
  }

  /**
   * Create empty hiring diversity
   */
  private createEmptyHiringDiversity(): HiringDiversity {
    return {
      applicantPool: this.createEmptyDistribution('gender'),
      interviewStage: this.createEmptyDistribution('gender'),
      offers: this.createEmptyDistribution('gender'),
      hires: this.createEmptyDistribution('gender'),
      conversionRates: [],
      biasIndicators: [],
    };
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(distributions: DimensionDistribution[]): number {
    // Shannon Diversity Index simplified
    let totalScore = 0;

    distributions.forEach(dist => {
      if (dist.categories.length === 0) return;

      let entropy = 0;
      dist.categories.forEach(cat => {
        if (cat.percentage > 0) {
          const p = cat.percentage / 100;
          entropy -= p * Math.log(p);
        }
      });

      // Normalize by max entropy (log of number of categories)
      const maxEntropy = Math.log(dist.categories.length);
      const normalizedScore = maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
      totalScore += normalizedScore;
    });

    return Math.round(totalScore / distributions.length);
  }

  /**
   * Calculate leadership diversity
   */
  private calculateLeadershipDiversity(employees: EmployeeData[]): LeadershipDiversity {
    const levels = {
      executive: employees.filter(e => e.level === 'executive'),
      senior: employees.filter(e => e.level === 'senior'),
      management: employees.filter(e => e.level === 'manager'),
      overall: employees,
    };

    return {
      executiveLevel: this.calculateDistribution(levels.executive, 'gender'),
      seniorManagement: this.calculateDistribution(levels.senior, 'gender'),
      management: this.calculateDistribution(levels.management, 'gender'),
      overall: this.calculateDistribution(levels.overall, 'gender'),
      pipelineAnalysis: [
        { stage: 'Individual Contributor', stageAr: 'مساهم فردي', diversityScore: 75, dropOffRate: 0 },
        { stage: 'Manager', stageAr: 'مدير', diversityScore: 60, dropOffRate: 15 },
        { stage: 'Senior Manager', stageAr: 'مدير أول', diversityScore: 45, dropOffRate: 25 },
        { stage: 'Director', stageAr: 'مدير إدارة', diversityScore: 35, dropOffRate: 22 },
        { stage: 'VP/Executive', stageAr: 'نائب رئيس/تنفيذي', diversityScore: 25, dropOffRate: 29 },
      ],
    };
  }

  /**
   * Calculate promotion equity
   */
  private calculatePromotionEquity(employees: EmployeeData[]): PromotionEquity {
    return {
      promotionRatesByGroup: [
        { group: 'Male', rate: 15, benchmark: 12 },
        { group: 'Female', rate: 12, benchmark: 12 },
        { group: 'Non-Binary', rate: 10, benchmark: 12 },
      ],
      timeToPromotionByGroup: [
        { group: 'Male', avgMonths: 24 },
        { group: 'Female', avgMonths: 28 },
        { group: 'Non-Binary', avgMonths: 30 },
      ],
      equityScore: 72,
      gaps: [
        {
          metric: 'Time to Promotion',
          metricAr: 'الوقت للترقية',
          advantagedGroup: 'Male',
          disadvantagedGroup: 'Female',
          gapPercentage: 16.7,
          significance: 'medium',
        },
      ],
    };
  }

  /**
   * Calculate retention by group
   */
  private calculateRetentionByGroup(employees: EmployeeData[]): RetentionByGroup[] {
    return [
      {
        group: 'Male',
        retentionRate: 88,
        turnoverRate: 12,
        avgTenure: 3.5,
        exitReasons: [
          { reason: 'Career growth', percentage: 35 },
          { reason: 'Compensation', percentage: 25 },
          { reason: 'Work-life balance', percentage: 20 },
        ],
      },
      {
        group: 'Female',
        retentionRate: 82,
        turnoverRate: 18,
        avgTenure: 2.8,
        exitReasons: [
          { reason: 'Work-life balance', percentage: 30 },
          { reason: 'Career growth', percentage: 28 },
          { reason: 'Management', percentage: 22 },
        ],
      },
    ];
  }

  /**
   * Calculate pay equity
   */
  private calculatePayEquity(employees: EmployeeData[]): PayEquityAnalysis {
    return {
      overallGap: 8.5,
      gapsByDimension: [
        {
          dimension: 'gender',
          referenceGroup: 'Male',
          comparisonGroup: 'Female',
          rawGap: 12.5,
          adjustedGap: 3.2,
          sampleSize: 450,
          statisticallySignificant: true,
        },
      ],
      adjustedGap: 3.2,
      medianPayByGroup: [
        { group: 'Male', median: 75000, currency: 'USD' },
        { group: 'Female', median: 65625, currency: 'USD' },
      ],
      recommendations: [
        'Conduct compensation review for identified gaps',
        'Implement structured salary bands',
        'Remove negotiation from initial offers',
      ],
      recommendationsAr: [
        'إجراء مراجعة التعويضات للفجوات المحددة',
        'تطبيق نطاقات رواتب منظمة',
        'إزالة التفاوض من العروض الأولية',
      ],
    };
  }

  /**
   * Generate trend data
   */
  private generateTrendData(): DiversityTrend[] {
    const trends: DiversityTrend[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trends.push({
        period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        diversityScore: 60 + Math.random() * 15,
        dimensionScores: [
          { dimension: 'gender', score: 55 + Math.random() * 20 },
          { dimension: 'age', score: 70 + Math.random() * 15 },
          { dimension: 'nationality', score: 65 + Math.random() * 15 },
        ],
      });
    }
    return trends;
  }

  /**
   * Generate benchmarks
   */
  private generateBenchmarks(): IndustryBenchmark[] {
    return [
      { dimension: 'gender', category: 'Female in Leadership', industryAverage: 30, topQuartile: 40, ourValue: 28, status: 'below' },
      { dimension: 'gender', category: 'Female Overall', industryAverage: 42, topQuartile: 48, ourValue: 45, status: 'above' },
      { dimension: 'age', category: 'Under 30', industryAverage: 25, topQuartile: 30, ourValue: 28, status: 'above' },
    ];
  }

  /**
   * Create inclusion survey
   */
  createSurvey(survey: Omit<InclusionSurvey, 'id' | 'responseRate' | 'responses' | 'createdAt'>): InclusionSurvey {
    const newSurvey: InclusionSurvey = {
      ...survey,
      id: this.generateId(),
      responseRate: 0,
      responses: 0,
      createdAt: new Date(),
    };
    this.surveys.set(newSurvey.id, newSurvey);
    return newSurvey;
  }

  /**
   * Get default inclusion questions
   */
  getDefaultInclusionQuestions(): InclusionQuestion[] {
    return INCLUSION_QUESTIONS;
  }

  /**
   * Submit survey response
   */
  submitSurveyResponse(
    surveyId: string,
    department: string,
    questionResponses: QuestionResponse[],
    respondentId?: string
  ): SurveyResponse {
    const response: SurveyResponse = {
      id: this.generateId(),
      surveyId,
      respondentId,
      department,
      responses: questionResponses,
      submittedAt: new Date(),
    };

    const surveyResponses = this.responses.get(surveyId) || [];
    surveyResponses.push(response);
    this.responses.set(surveyId, surveyResponses);

    // Update survey stats
    const survey = this.surveys.get(surveyId);
    if (survey) {
      survey.responses = surveyResponses.length;
    }

    return response;
  }

  /**
   * Analyze survey results
   */
  analyzeSurveyResults(surveyId: string): InclusionResults {
    const survey = this.surveys.get(surveyId);
    const responses = this.responses.get(surveyId) || [];

    if (!survey) throw new Error('Survey not found');

    // Calculate category scores
    const categoryScores = this.calculateCategoryScores(responses, survey.questions);

    // Calculate overall inclusion score
    const overallScore = categoryScores.reduce((sum, cs) => sum + cs.score, 0) / categoryScores.length;

    return {
      surveyId,
      overallInclusionScore: Math.round(overallScore),
      categoryScores,
      demographicBreakdown: this.calculateDemographicBreakdown(responses),
      keyFindings: this.generateFindings(categoryScores),
      actionItems: this.generateActionItems(categoryScores),
      comparisonToPrevious: 3.5, // Mock
      responseRateByDepartment: this.calculateResponseRateByDepartment(responses),
    };
  }

  /**
   * Calculate category scores
   */
  private calculateCategoryScores(
    responses: SurveyResponse[],
    questions: InclusionQuestion[]
  ): { category: InclusionCategory; score: number; benchmark: number }[] {
    const categoryTotals: Record<InclusionCategory, { sum: number; count: number }> = {} as any;

    responses.forEach(response => {
      response.responses.forEach(qr => {
        const question = questions.find(q => q.id === qr.questionId);
        if (question && typeof qr.answer === 'number') {
          if (!categoryTotals[question.category]) {
            categoryTotals[question.category] = { sum: 0, count: 0 };
          }
          // Normalize likert scale (1-5) to 0-100
          categoryTotals[question.category].sum += ((qr.answer - 1) / 4) * 100;
          categoryTotals[question.category].count++;
        }
      });
    });

    return Object.entries(categoryTotals).map(([cat, data]) => ({
      category: cat as InclusionCategory,
      score: Math.round(data.sum / data.count),
      benchmark: 70, // Industry benchmark
    }));
  }

  /**
   * Calculate demographic breakdown
   */
  private calculateDemographicBreakdown(responses: SurveyResponse[]): DemographicBreakdown[] {
    // Mock implementation - would calculate scores by demographic
    return [
      { dimension: 'gender', group: 'Female', inclusionScore: 72, sampleSize: 120, significantDifference: true },
      { dimension: 'gender', group: 'Male', inclusionScore: 78, sampleSize: 180, significantDifference: false },
    ];
  }

  /**
   * Generate findings
   */
  private generateFindings(
    categoryScores: { category: InclusionCategory; score: number; benchmark: number }[]
  ): Finding[] {
    const findings: Finding[] = [];

    categoryScores.forEach(cs => {
      if (cs.score >= cs.benchmark + 10) {
        findings.push({
          type: 'strength',
          title: `Strong ${INCLUSION_CATEGORY_LABELS[cs.category].en}`,
          titleAr: `قوي ${INCLUSION_CATEGORY_LABELS[cs.category].ar}`,
          description: `${INCLUSION_CATEGORY_LABELS[cs.category].en} score is significantly above benchmark`,
          descriptionAr: `درجة ${INCLUSION_CATEGORY_LABELS[cs.category].ar} أعلى بكثير من المعيار`,
          dataPoints: [`Score: ${cs.score}%`, `Benchmark: ${cs.benchmark}%`],
        });
      } else if (cs.score < cs.benchmark - 10) {
        findings.push({
          type: 'concern',
          title: `${INCLUSION_CATEGORY_LABELS[cs.category].en} Needs Attention`,
          titleAr: `${INCLUSION_CATEGORY_LABELS[cs.category].ar} يحتاج اهتماماً`,
          description: `${INCLUSION_CATEGORY_LABELS[cs.category].en} score is below benchmark`,
          descriptionAr: `درجة ${INCLUSION_CATEGORY_LABELS[cs.category].ar} أقل من المعيار`,
          dataPoints: [`Score: ${cs.score}%`, `Benchmark: ${cs.benchmark}%`],
        });
      }
    });

    return findings;
  }

  /**
   * Generate action items
   */
  private generateActionItems(
    categoryScores: { category: InclusionCategory; score: number; benchmark: number }[]
  ): ActionItem[] {
    const actionItems: ActionItem[] = [];

    categoryScores
      .filter(cs => cs.score < cs.benchmark)
      .forEach(cs => {
        actionItems.push({
          id: this.generateId(),
          title: `Improve ${INCLUSION_CATEGORY_LABELS[cs.category].en}`,
          titleAr: `تحسين ${INCLUSION_CATEGORY_LABELS[cs.category].ar}`,
          description: `Develop initiatives to improve ${INCLUSION_CATEGORY_LABELS[cs.category].en.toLowerCase()} scores`,
          descriptionAr: `تطوير مبادرات لتحسين درجات ${INCLUSION_CATEGORY_LABELS[cs.category].ar}`,
          priority: cs.score < cs.benchmark - 20 ? 'critical' : cs.score < cs.benchmark - 10 ? 'high' : 'medium',
          category: cs.category,
          status: 'pending',
        });
      });

    return actionItems;
  }

  /**
   * Calculate response rate by department
   */
  private calculateResponseRateByDepartment(responses: SurveyResponse[]): { department: string; rate: number }[] {
    const deptCounts: Record<string, number> = {};

    responses.forEach(r => {
      deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
    });

    return Object.entries(deptCounts)
      .map(([dept, count]) => ({
        department: dept,
        rate: Math.min(100, count * 10), // Mock calculation
      }));
  }

  /**
   * Detect hiring bias
   */
  detectHiringBias(applications: ApplicationData[]): BiasIndicator[] {
    const indicators: BiasIndicator[] = [];

    // Check name bias
    const namePattern = this.analyzeNamePattern(applications);
    if (namePattern.biasDetected) {
      indicators.push({
        type: 'name_bias',
        description: BIAS_DESCRIPTIONS.name_bias.en,
        descriptionAr: BIAS_DESCRIPTIONS.name_bias.ar,
        severity: 'high',
        affectedGroups: namePattern.affectedGroups,
        recommendation: 'Implement blind resume screening',
        recommendationAr: 'تطبيق فحص السير الذاتية المجهولة',
      });
    }

    // Check gender bias
    const genderAnalysis = this.analyzeGenderConversion(applications);
    if (genderAnalysis.biasDetected) {
      indicators.push({
        type: 'gender_bias',
        description: BIAS_DESCRIPTIONS.gender_bias.en,
        descriptionAr: BIAS_DESCRIPTIONS.gender_bias.ar,
        severity: 'high',
        affectedGroups: genderAnalysis.affectedGroups,
        recommendation: 'Standardize interview criteria and train interviewers',
        recommendationAr: 'توحيد معايير المقابلة وتدريب المقابلين',
      });
    }

    return indicators;
  }

  /**
   * Analyze name pattern (mock)
   */
  private analyzeNamePattern(applications: ApplicationData[]): { biasDetected: boolean; affectedGroups: string[] } {
    // Mock bias detection
    return { biasDetected: false, affectedGroups: [] };
  }

  /**
   * Analyze gender conversion rates
   */
  private analyzeGenderConversion(applications: ApplicationData[]): { biasDetected: boolean; affectedGroups: string[] } {
    // Mock gender analysis
    return { biasDetected: false, affectedGroups: [] };
  }

  /**
   * Create DEI goal
   */
  createGoal(goal: Omit<DEIGoal, 'id' | 'createdAt'>): DEIGoal {
    const newGoal: DEIGoal = {
      ...goal,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }

  /**
   * Get all goals
   */
  getGoals(category?: DEIGoalCategory): DEIGoal[] {
    let goals = Array.from(this.goals.values());

    if (category) {
      goals = goals.filter(g => g.category === category);
    }

    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(goalId: string, currentValue: number): DEIGoal | null {
    const goal = this.goals.get(goalId);
    if (!goal) return null;

    goal.currentValue = currentValue;
    const progress = (currentValue / goal.targetValue) * 100;

    // Update status
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const expectedProgress = ((Date.now() - goal.startDate.getTime()) /
                             (goal.targetDate.getTime() - goal.startDate.getTime())) * 100;

    if (progress >= 100) {
      goal.status = 'completed';
    } else if (progress >= expectedProgress - 10) {
      goal.status = 'on_track';
    } else if (progress >= expectedProgress - 25) {
      goal.status = 'at_risk';
    } else {
      goal.status = 'behind';
    }

    // Check milestones
    goal.milestones.forEach(m => {
      if (!m.achieved && (currentValue / goal.targetValue) * 100 >= m.targetValue) {
        m.achieved = true;
        m.achievedDate = new Date();
      }
    });

    return goal;
  }

  /**
   * Create ERG
   */
  createERG(erg: Omit<ERG, 'id' | 'memberCount' | 'events' | 'createdAt'>): ERG {
    const newERG: ERG = {
      ...erg,
      id: this.generateId(),
      memberCount: erg.leaders.length,
      events: [],
      createdAt: new Date(),
    };
    this.ergs.set(newERG.id, newERG);
    return newERG;
  }

  /**
   * Get all ERGs
   */
  getERGs(category?: ERGCategory): ERG[] {
    let ergs = Array.from(this.ergs.values()).filter(e => e.isActive);

    if (category) {
      ergs = ergs.filter(e => e.category === category);
    }

    return ergs.sort((a, b) => b.memberCount - a.memberCount);
  }

  /**
   * Add ERG event
   */
  addERGEvent(ergId: string, event: Omit<ERGEvent, 'id'>): ERGEvent | null {
    const erg = this.ergs.get(ergId);
    if (!erg) return null;

    const newEvent: ERGEvent = {
      ...event,
      id: this.generateId(),
    };
    erg.events.push(newEvent);
    return newEvent;
  }

  /**
   * Get dimension label
   */
  getDimensionLabel(dimension: DiversityDimension, language: 'en' | 'ar' = 'en'): string {
    return DIMENSION_LABELS[dimension][language];
  }

  /**
   * Get inclusion category label
   */
  getInclusionCategoryLabel(category: InclusionCategory, language: 'en' | 'ar' = 'en'): string {
    return INCLUSION_CATEGORY_LABELS[category][language];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Helper types for service
interface EmployeeData {
  id: string;
  gender?: string;
  age?: number;
  nationality?: string;
  level?: 'individual' | 'manager' | 'senior' | 'executive';
  department?: string;
  salary?: number;
  [key: string]: any;
}

interface ApplicationData {
  id: string;
  name: string;
  gender?: string;
  stage: 'applied' | 'screened' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  [key: string]: any;
}

// Export singleton instance
export const deiService = new DEIService();

// Export types
export type { DEIService, EmployeeData, ApplicationData };
