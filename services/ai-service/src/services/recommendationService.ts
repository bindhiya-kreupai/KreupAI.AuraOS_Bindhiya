export interface EmployeeProfile {
  id: string;
  role: string;
  department: string;
  skills: string[];
  experience: number; // years
  completedCourses: string[];
  careerGoals?: string[];
  performanceRating?: number;
}

export interface LearningRecommendation {
  courseId: string;
  title: string;
  category: string;
  relevanceScore: number;
  reason: string;
  estimatedDuration: number; // hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skillsGained: string[];
}

export interface CareerRecommendation {
  targetRole: string;
  department: string;
  matchScore: number;
  gapAnalysis: SkillGap[];
  estimatedTimeToReady: number; // months
  suggestedPath: CareerStep[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CareerStep {
  order: number;
  type: 'course' | 'project' | 'mentorship' | 'certification' | 'rotation';
  title: string;
  description: string;
  estimatedDuration: number; // months
}

export interface RecommendationParams {
  employeeProfile: EmployeeProfile;
  maxResults?: number;
  includeCompleted?: boolean;
}

export class RecommendationService {
  /**
   * Generate personalized learning recommendations for an employee
   */
  async getLearningRecommendations(params: RecommendationParams): Promise<LearningRecommendation[]> {
    const { employeeProfile, maxResults = 10 } = params;

    // ML-based recommendation engine (Heuristic Mock)
    // 1. Analyze employee's current skills and gaps
    // 2. Consider role requirements and career goals
    // 3. Look at what similar employees have taken
    // 4. Factor in performance ratings and learning history
    // 5. Score and rank courses by relevance

    const recommendations: LearningRecommendation[] = [];

    // Placeholder: Generate recommendations based on skill gaps
    const roleSkills = await this.getRoleRequiredSkills(employeeProfile.role);
    const missingSkills = roleSkills.filter(
      (skill) => !employeeProfile.skills.includes(skill)
    );

    for (const skill of missingSkills.slice(0, maxResults)) {
      recommendations.push({
        courseId: 'course_' + skill.toLowerCase().replace(/\s+/g, '_'),
        title: 'Master ' + skill,
        category: 'Professional Development',
        relevanceScore: 0.85,
        reason: 'Required for your role as ' + employeeProfile.role,
        estimatedDuration: 10,
        difficulty: 'intermediate',
        skillsGained: [skill],
      });
    }

    return recommendations;
  }

  /**
   * Generate career path recommendations for an employee
   */
  async getCareerRecommendations(params: RecommendationParams): Promise<CareerRecommendation[]> {
    const { employeeProfile, maxResults = 5 } = params;

    // Heuristic career pathing algorithm based on employee profile
    const recommendations: CareerRecommendation[] = [];

    // Simple matching: if they have more than 3 years of experience, suggest Senior role
    const isSeniorTarget = employeeProfile.experience >= 3 && !employeeProfile.role.toLowerCase().includes('senior');
    const targetRole = isSeniorTarget ? 'Senior ' + employeeProfile.role : 'Lead ' + employeeProfile.role;
    
    const missingSkills = ['Leadership', 'Strategic Planning', 'Advanced Problem Solving'].filter(
      s => !employeeProfile.skills.includes(s)
    );
    
    recommendations.push({
      targetRole: targetRole,
      department: employeeProfile.department,
      matchScore: 0.8 - (missingSkills.length * 0.1),
      gapAnalysis: missingSkills.map(skill => ({
        skill,
        currentLevel: 1,
        requiredLevel: 4,
        priority: 'high'
      })),
      estimatedTimeToReady: missingSkills.length * 4, // 4 months per missing skill
      suggestedPath: missingSkills.map((skill, index) => ({
        order: index + 1,
        type: 'course',
        title: `Mastering ${skill}`,
        description: `Learn the fundamentals of ${skill}`,
        estimatedDuration: 2
      }))
    });

    // Placeholder career recommendation
    recommendations.push({
      targetRole: 'Senior ' + employeeProfile.role,
      department: employeeProfile.department,
      matchScore: 0.7,
      gapAnalysis: [],
      estimatedTimeToReady: 12,
      suggestedPath: [
        {
          order: 1,
          type: 'course',
          title: 'Leadership Fundamentals',
          description: 'Build core leadership competencies',
          estimatedDuration: 2,
        },
        {
          order: 2,
          type: 'project',
          title: 'Lead a Cross-functional Project',
          description: 'Gain hands-on leadership experience',
          estimatedDuration: 3,
        },
        {
          order: 3,
          type: 'mentorship',
          title: 'Senior Leader Mentorship',
          description: 'Learn from experienced leaders',
          estimatedDuration: 6,
        },
      ],
    });

    return recommendations.slice(0, maxResults);
  }

  /**
   * Get required skills for a given role.
   *
   * Returns an empty array when no role-skill mapping is configured.
   * The previous implementation returned the same four-skill list
   * regardless of role, which produced misleading "skill gap"
   * recommendations (e.g. recommending Leadership courses to an
   * accountant). Empty is more honest than wrong.
   *
   * To wire this up properly: query the CompetencyRoleMapping +
   * CompetencyCatalog tables (defined in packages/@aura/database
   * schema). Requires adding @aura/database as a dep of this service,
   * or exposing a dedicated read endpoint from the web app for the
   * recommendation engine to call.
   */
  private async getRoleRequiredSkills(_role: string): Promise<string[]> {
    return [];
  }

  /**
   * Calculate similarity between two employee profiles
   */
  private calculateProfileSimilarity(profile1: EmployeeProfile, profile2: EmployeeProfile): number {
    const skills1 = new Set(profile1.skills);
    const skills2 = new Set(profile2.skills);

    const intersection = [...skills1].filter((s) => skills2.has(s));
    const union = new Set([...skills1, ...skills2]);

    return union.size > 0 ? intersection.length / union.size : 0;
  }
}

export default new RecommendationService();
