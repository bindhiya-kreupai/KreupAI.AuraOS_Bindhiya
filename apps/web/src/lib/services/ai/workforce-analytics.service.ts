/**
 * Workforce Analytics Service
 * Phase 3: Intelligence Layer - Workforce Planning
 *
 * Comprehensive workforce analytics including headcount planning,
 * skills gap analysis, succession planning, and diversity metrics
 */

import {
  WorkforcePlanningData,
  HeadcountForecast,
  SkillsGapAnalysis,
  SuccessionPlan,
  DiversityMetrics,
} from './types';

/**
 * Department growth rates by industry
 */
const INDUSTRY_GROWTH_RATES: Record<string, Record<string, number>> = {
  TECHNOLOGY: {
    Engineering: 0.15,
    Product: 0.12,
    'Data Science': 0.20,
    Sales: 0.10,
    Marketing: 0.08,
    HR: 0.05,
    Finance: 0.03,
    Operations: 0.05,
  },
  FINANCE: {
    Trading: 0.05,
    'Risk Management': 0.08,
    Compliance: 0.10,
    Technology: 0.12,
    Operations: 0.04,
    HR: 0.03,
  },
  HEALTHCARE: {
    Clinical: 0.10,
    Nursing: 0.08,
    Administration: 0.05,
    Technology: 0.15,
    Research: 0.12,
  },
  RETAIL: {
    'Store Operations': 0.03,
    'E-commerce': 0.15,
    Supply Chain: 0.08,
    Marketing: 0.10,
    Technology: 0.12,
  },
};

/**
 * Critical skills by role type
 */
const CRITICAL_SKILLS: Record<string, string[]> = {
  ENGINEERING: ['Python', 'JavaScript', 'Cloud (AWS/Azure/GCP)', 'System Design', 'DevOps'],
  DATA: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
  PRODUCT: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Stakeholder Management'],
  SALES: ['Negotiation', 'CRM', 'Pipeline Management', 'Presentation', 'Closing'],
  HR: ['Talent Acquisition', 'Employee Relations', 'HRIS', 'Compensation', 'Employment Law'],
  FINANCE: ['Financial Analysis', 'Excel', 'ERP Systems', 'Budgeting', 'Reporting'],
};

/**
 * Workforce Analytics Service
 */
export class WorkforceAnalyticsService {
  /**
   * Generate headcount forecast
   */
  static async forecastHeadcount(
    data: WorkforcePlanningData,
    months: number = 12
  ): Promise<HeadcountForecast> {
    const { currentHeadcount, departments, industry = 'TECHNOLOGY' } = data;

    // Get industry growth rates
    const growthRates = INDUSTRY_GROWTH_RATES[industry] || INDUSTRY_GROWTH_RATES.TECHNOLOGY;

    // Calculate department forecasts
    const departmentForecasts: HeadcountForecast['departmentBreakdown'] = [];

    for (const dept of departments) {
      const annualGrowthRate = growthRates[dept.name] || 0.05;
      const monthlyGrowthRate = annualGrowthRate / 12;

      // Calculate expected hires and attrition
      const avgAttritionRate = dept.historicalAttrition || 0.12;
      const monthlyAttritionRate = avgAttritionRate / 12;

      let projected = dept.currentCount;
      const monthlyProjection: number[] = [];

      for (let m = 1; m <= months; m++) {
        // Natural attrition
        const attrition = Math.round(projected * monthlyAttritionRate);

        // Growth hires
        const growthHires = Math.round(projected * monthlyGrowthRate);

        // Replacement hires
        const replacementHires = attrition;

        projected = projected - attrition + growthHires + replacementHires;
        monthlyProjection.push(projected);
      }

      const totalHiresNeeded = monthlyProjection[months - 1] - dept.currentCount +
        Math.round(dept.currentCount * avgAttritionRate * (months / 12));

      departmentForecasts.push({
        departmentId: dept.id,
        departmentName: dept.name,
        currentCount: dept.currentCount,
        forecastedCount: monthlyProjection[months - 1],
        netChange: monthlyProjection[months - 1] - dept.currentCount,
        hiringNeeded: totalHiresNeeded,
        expectedAttrition: Math.round(dept.currentCount * avgAttritionRate * (months / 12)),
        monthlyProjection,
        confidence: this.calculateForecastConfidence(dept),
      });
    }

    // Calculate totals
    const forecastedTotal = departmentForecasts.reduce((sum, d) => sum + d.forecastedCount, 0);
    const totalHiring = departmentForecasts.reduce((sum, d) => sum + d.hiringNeeded, 0);
    const totalAttrition = departmentForecasts.reduce((sum, d) => sum + d.expectedAttrition, 0);

    // Calculate hiring timeline
    const hiringTimeline = this.generateHiringTimeline(departmentForecasts, months);

    // Calculate budget impact
    const avgCostPerHire = data.avgCostPerHire || 5000;
    const avgSalary = data.avgAnnualSalary || 60000;
    const budgetImpact = {
      recruitingCosts: totalHiring * avgCostPerHire,
      newSalaryCosts: totalHiring * avgSalary * (months / 12),
      totalImpact: (totalHiring * avgCostPerHire) + (totalHiring * avgSalary * (months / 12)),
    };

    return {
      currentTotal: currentHeadcount,
      forecastedTotal,
      netChange: forecastedTotal - currentHeadcount,
      growthRate: ((forecastedTotal - currentHeadcount) / currentHeadcount) * 100,
      forecastPeriodMonths: months,
      departmentBreakdown: departmentForecasts,
      hiringTimeline,
      totalHiringNeeded: totalHiring,
      totalExpectedAttrition: totalAttrition,
      budgetImpact,
      assumptions: this.getAssumptions(data),
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate forecast confidence
   */
  private static calculateForecastConfidence(
    dept: WorkforcePlanningData['departments'][0]
  ): number {
    let confidence = 70;

    // Historical data improves confidence
    if (dept.historicalAttrition !== undefined) confidence += 10;
    if (dept.historicalGrowth !== undefined) confidence += 10;

    // Larger departments have more stable patterns
    if (dept.currentCount > 50) confidence += 5;
    if (dept.currentCount > 100) confidence += 5;

    return Math.min(95, confidence);
  }

  /**
   * Generate hiring timeline
   */
  private static generateHiringTimeline(
    forecasts: HeadcountForecast['departmentBreakdown'],
    months: number
  ): HeadcountForecast['hiringTimeline'] {
    const timeline: HeadcountForecast['hiringTimeline'] = [];

    for (let m = 0; m < months; m++) {
      const monthHires: Record<string, number> = {};
      let totalMonthHires = 0;

      for (const dept of forecasts) {
        const prevCount = m === 0 ? dept.currentCount : dept.monthlyProjection[m - 1];
        const currentCount = dept.monthlyProjection[m];
        const change = currentCount - prevCount;

        if (change > 0) {
          monthHires[dept.departmentName] = change;
          totalMonthHires += change;
        }
      }

      const date = new Date();
      date.setMonth(date.getMonth() + m + 1);

      timeline.push({
        month: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        totalHires: totalMonthHires,
        byDepartment: monthHires,
      });
    }

    return timeline;
  }

  /**
   * Get forecast assumptions
   */
  private static getAssumptions(data: WorkforcePlanningData): string[] {
    return [
      `Industry: ${data.industry || 'Technology'} growth patterns applied`,
      'Historical attrition rates continue',
      'No major organizational restructuring',
      'Economic conditions remain stable',
      'Current hiring pace can be maintained',
    ];
  }

  /**
   * Perform skills gap analysis
   */
  static async analyzeSkillsGap(
    data: WorkforcePlanningData
  ): Promise<SkillsGapAnalysis> {
    const { employees, departments, strategicGoals = [] } = data;

    // Aggregate current skills
    const currentSkills: Map<string, {
      count: number;
      levels: Record<string, number>;
      avgProficiency: number;
    }> = new Map();

    for (const emp of employees) {
      for (const skill of emp.skills) {
        const existing = currentSkills.get(skill.name) || {
          count: 0,
          levels: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 },
          avgProficiency: 0,
        };

        existing.count++;
        existing.levels[skill.level]++;
        existing.avgProficiency = (
          (existing.avgProficiency * (existing.count - 1)) + skill.proficiency
        ) / existing.count;

        currentSkills.set(skill.name, existing);
      }
    }

    // Identify required skills based on goals
    const requiredSkills: Map<string, {
      importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      requiredCount: number;
      minimumLevel: string;
    }> = new Map();

    // Add department-critical skills
    for (const dept of departments) {
      const criticalSkills = CRITICAL_SKILLS[dept.type || 'ENGINEERING'] || [];
      for (const skill of criticalSkills) {
        const required = requiredSkills.get(skill) || {
          importance: 'CRITICAL' as const,
          requiredCount: Math.ceil(dept.currentCount * 0.3),
          minimumLevel: 'INTERMEDIATE',
        };
        required.requiredCount += Math.ceil(dept.currentCount * 0.3);
        requiredSkills.set(skill, required);
      }
    }

    // Add skills from strategic goals
    for (const goal of strategicGoals) {
      for (const skill of goal.requiredSkills || []) {
        requiredSkills.set(skill, {
          importance: goal.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' || 'HIGH',
          requiredCount: goal.headcountNeeded || 5,
          minimumLevel: 'ADVANCED',
        });
      }
    }

    // Calculate gaps
    const gaps: SkillsGapAnalysis['gaps'] = [];
    const surpluses: SkillsGapAnalysis['surpluses'] = [];

    for (const [skillName, required] of requiredSkills) {
      const current = currentSkills.get(skillName);
      const currentCount = current?.count || 0;
      const qualifiedCount = current ? (
        (current.levels.ADVANCED || 0) +
        (current.levels.EXPERT || 0) +
        (required.minimumLevel === 'INTERMEDIATE' ? (current.levels.INTERMEDIATE || 0) : 0)
      ) : 0;

      const gap = required.requiredCount - qualifiedCount;

      if (gap > 0) {
        gaps.push({
          skill: skillName,
          currentCount,
          qualifiedCount,
          requiredCount: required.requiredCount,
          gap,
          importance: required.importance,
          recommendations: this.getSkillGapRecommendations(skillName, gap, current),
        });
      }
    }

    // Identify surpluses (skills with high count but not in requirements)
    for (const [skillName, data] of currentSkills) {
      if (!requiredSkills.has(skillName) && data.count > 10) {
        surpluses.push({
          skill: skillName,
          count: data.count,
          potentialUse: this.suggestSkillUse(skillName),
        });
      }
    }

    // Sort gaps by importance and gap size
    gaps.sort((a, b) => {
      const importanceOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aScore = importanceOrder[a.importance] * 100 + a.gap;
      const bScore = importanceOrder[b.importance] * 100 + b.gap;
      return bScore - aScore;
    });

    return {
      totalSkillsAnalyzed: currentSkills.size,
      totalGaps: gaps.length,
      criticalGaps: gaps.filter(g => g.importance === 'CRITICAL').length,
      gaps: gaps.slice(0, 20),
      surpluses: surpluses.slice(0, 10),
      readinessScore: this.calculateReadinessScore(gaps, requiredSkills.size),
      recommendations: this.generateSkillRecommendations(gaps),
      analyzedAt: new Date(),
    };
  }

  /**
   * Get recommendations for skill gap
   */
  private static getSkillGapRecommendations(
    skill: string,
    gap: number,
    current?: { count: number; levels: Record<string, number>; avgProficiency: number }
  ): string[] {
    const recommendations: string[] = [];

    // Training existing employees
    if (current && current.count > 0) {
      const trainable = (current.levels.BEGINNER || 0) + (current.levels.INTERMEDIATE || 0);
      if (trainable > 0) {
        recommendations.push(`Train ${Math.min(trainable, gap)} existing employees to advance ${skill} skills`);
      }
    }

    // Hiring
    if (gap > 2) {
      recommendations.push(`Hire ${Math.ceil(gap * 0.6)} ${skill} specialists`);
    }

    // Contractors/consultants for immediate needs
    if (gap > 0) {
      recommendations.push(`Consider contractors for immediate ${skill} needs`);
    }

    // Cross-training
    recommendations.push(`Implement cross-training program for ${skill}`);

    return recommendations.slice(0, 3);
  }

  /**
   * Suggest potential use for surplus skills
   */
  private static suggestSkillUse(skill: string): string {
    return `Could support new initiatives or be leveraged for ${skill}-related projects`;
  }

  /**
   * Calculate readiness score
   */
  private static calculateReadinessScore(
    gaps: SkillsGapAnalysis['gaps'],
    totalRequired: number
  ): number {
    if (totalRequired === 0) return 100;

    const gapPenalty = gaps.reduce((sum, gap) => {
      const importanceMultiplier = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }[gap.importance] || 1;
      return sum + (gap.gap * importanceMultiplier);
    }, 0);

    const maxPenalty = totalRequired * 4; // If all were critical gaps
    const score = Math.max(0, 100 - (gapPenalty / maxPenalty) * 100);

    return Math.round(score);
  }

  /**
   * Generate overall skill recommendations
   */
  private static generateSkillRecommendations(
    gaps: SkillsGapAnalysis['gaps']
  ): string[] {
    const recommendations: string[] = [];

    const criticalGaps = gaps.filter(g => g.importance === 'CRITICAL');
    if (criticalGaps.length > 0) {
      recommendations.push(`Address ${criticalGaps.length} critical skill gaps immediately`);
      recommendations.push(`Focus hiring on: ${criticalGaps.slice(0, 3).map(g => g.skill).join(', ')}`);
    }

    const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
    if (totalGap > 20) {
      recommendations.push('Develop comprehensive upskilling program');
      recommendations.push('Partner with training providers for accelerated skill development');
    }

    recommendations.push('Establish quarterly skill assessments to track progress');

    return recommendations;
  }

  /**
   * Generate succession planning analysis
   */
  static async analyzeSuccession(
    data: WorkforcePlanningData
  ): Promise<SuccessionPlan> {
    const { employees, criticalRoles = [] } = data;

    // Identify critical roles without successors
    const roleAnalysis: SuccessionPlan['roleAnalysis'] = [];

    for (const role of criticalRoles) {
      // Find current incumbent
      const incumbent = employees.find(e => e.id === role.incumbentId);

      // Find potential successors
      const potentialSuccessors = employees
        .filter(e => e.id !== role.incumbentId)
        .map(emp => {
          const readiness = this.calculateSuccessorReadiness(emp, role);
          return {
            employeeId: emp.id,
            employeeName: emp.name,
            currentRole: emp.position,
            readinessScore: readiness.score,
            readinessLevel: readiness.level,
            developmentNeeds: readiness.gaps,
            timeToReady: readiness.timeToReady,
          };
        })
        .filter(s => s.readinessScore >= 40)
        .sort((a, b) => b.readinessScore - a.readinessScore);

      // Calculate risk level
      let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      if (potentialSuccessors.length === 0) {
        riskLevel = 'CRITICAL';
      } else if (potentialSuccessors[0].readinessScore < 60) {
        riskLevel = 'HIGH';
      } else if (potentialSuccessors.length < 2) {
        riskLevel = 'MEDIUM';
      } else {
        riskLevel = 'LOW';
      }

      roleAnalysis.push({
        roleId: role.id,
        roleTitle: role.title,
        department: role.department,
        criticality: role.criticality || 'HIGH',
        incumbent: incumbent ? {
          id: incumbent.id,
          name: incumbent.name,
          tenure: incumbent.tenureMonths || 0,
          retirementRisk: this.calculateRetirementRisk(incumbent),
          flightRisk: incumbent.attritionRisk || 'LOW',
        } : undefined,
        successors: potentialSuccessors.slice(0, 5),
        benchStrength: this.calculateBenchStrength(potentialSuccessors),
        riskLevel,
        recommendations: this.getSuccessionRecommendations(role, potentialSuccessors),
      });
    }

    // Calculate overall metrics
    const criticalRolesCount = roleAnalysis.filter(r => r.criticality === 'CRITICAL').length;
    const rolesWithSuccessors = roleAnalysis.filter(r => r.successors.length > 0).length;
    const highRiskRoles = roleAnalysis.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;

    return {
      totalCriticalRoles: criticalRoles.length,
      rolesWithSuccessors,
      rolesWithoutSuccessors: criticalRoles.length - rolesWithSuccessors,
      averageBenchStrength: roleAnalysis.reduce((sum, r) => sum + r.benchStrength, 0) / roleAnalysis.length,
      highRiskRoles,
      roleAnalysis,
      overallReadiness: this.calculateOverallSuccessionReadiness(roleAnalysis),
      recommendations: this.getOverallSuccessionRecommendations(roleAnalysis),
      analyzedAt: new Date(),
    };
  }

  /**
   * Calculate successor readiness
   */
  private static calculateSuccessorReadiness(
    employee: WorkforcePlanningData['employees'][0],
    role: WorkforcePlanningData['criticalRoles'][0]
  ): {
    score: number;
    level: 'READY_NOW' | 'READY_1_YEAR' | 'READY_2_YEARS' | 'DEVELOPING';
    gaps: string[];
    timeToReady: string;
  } {
    let score = 0;
    const gaps: string[] = [];

    // Check required skills
    const requiredSkills = role.requiredSkills || [];
    const employeeSkills = new Set(employee.skills.map(s => s.name.toLowerCase()));

    let skillsMatch = 0;
    for (const skill of requiredSkills) {
      if (employeeSkills.has(skill.toLowerCase())) {
        skillsMatch++;
      } else {
        gaps.push(`Missing skill: ${skill}`);
      }
    }
    score += (skillsMatch / requiredSkills.length) * 40;

    // Check experience level
    const requiredExperience = role.minimumExperience || 60; // months
    if ((employee.tenureMonths || 0) >= requiredExperience) {
      score += 25;
    } else {
      gaps.push(`Need ${requiredExperience - (employee.tenureMonths || 0)} more months experience`);
      score += ((employee.tenureMonths || 0) / requiredExperience) * 25;
    }

    // Check performance
    if (employee.performanceRating) {
      const performanceScore = (employee.performanceRating / 5) * 20;
      score += performanceScore;
      if (employee.performanceRating < 4) {
        gaps.push('Performance below target for succession');
      }
    }

    // Leadership readiness
    if (employee.leadershipScore) {
      score += (employee.leadershipScore / 100) * 15;
      if (employee.leadershipScore < 70) {
        gaps.push('Leadership development needed');
      }
    }

    // Determine readiness level
    let level: 'READY_NOW' | 'READY_1_YEAR' | 'READY_2_YEARS' | 'DEVELOPING';
    let timeToReady: string;

    if (score >= 85) {
      level = 'READY_NOW';
      timeToReady = 'Ready now';
    } else if (score >= 70) {
      level = 'READY_1_YEAR';
      timeToReady = '6-12 months';
    } else if (score >= 50) {
      level = 'READY_2_YEARS';
      timeToReady = '1-2 years';
    } else {
      level = 'DEVELOPING';
      timeToReady = '2+ years';
    }

    return {
      score: Math.round(score),
      level,
      gaps: gaps.slice(0, 3),
      timeToReady,
    };
  }

  /**
   * Calculate retirement risk
   */
  private static calculateRetirementRisk(
    employee: WorkforcePlanningData['employees'][0]
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    const age = employee.age || 40;

    if (age >= 60) return 'HIGH';
    if (age >= 55) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate bench strength
   */
  private static calculateBenchStrength(
    successors: Array<{ readinessScore: number }>
  ): number {
    if (successors.length === 0) return 0;

    const readyNow = successors.filter(s => s.readinessScore >= 85).length;
    const ready1Year = successors.filter(s => s.readinessScore >= 70 && s.readinessScore < 85).length;

    // Score: 40 for ready now, 25 for ready in 1 year
    const score = Math.min(100, (readyNow * 40) + (ready1Year * 25));

    return score;
  }

  /**
   * Get succession recommendations for role
   */
  private static getSuccessionRecommendations(
    role: WorkforcePlanningData['criticalRoles'][0],
    successors: Array<{ employeeName: string; readinessScore: number; developmentNeeds: string[] }>
  ): string[] {
    const recommendations: string[] = [];

    if (successors.length === 0) {
      recommendations.push('URGENT: Identify and develop internal candidates');
      recommendations.push('Consider external recruitment for succession pipeline');
    } else if (successors[0].readinessScore < 70) {
      recommendations.push(`Accelerate development for top candidate: ${successors[0].employeeName}`);
      if (successors[0].developmentNeeds.length > 0) {
        recommendations.push(`Focus areas: ${successors[0].developmentNeeds.join(', ')}`);
      }
    }

    if (successors.length < 2) {
      recommendations.push('Build deeper succession bench with additional candidates');
    }

    recommendations.push('Implement mentoring program with current incumbent');

    return recommendations.slice(0, 4);
  }

  /**
   * Calculate overall succession readiness
   */
  private static calculateOverallSuccessionReadiness(
    roleAnalysis: SuccessionPlan['roleAnalysis']
  ): number {
    if (roleAnalysis.length === 0) return 0;

    const totalScore = roleAnalysis.reduce((sum, role) => sum + role.benchStrength, 0);
    return Math.round(totalScore / roleAnalysis.length);
  }

  /**
   * Get overall succession recommendations
   */
  private static getOverallSuccessionRecommendations(
    roleAnalysis: SuccessionPlan['roleAnalysis']
  ): string[] {
    const recommendations: string[] = [];

    const criticalRisks = roleAnalysis.filter(r => r.riskLevel === 'CRITICAL');
    if (criticalRisks.length > 0) {
      recommendations.push(`URGENT: ${criticalRisks.length} critical roles have no succession plan`);
    }

    const highRisks = roleAnalysis.filter(r => r.riskLevel === 'HIGH');
    if (highRisks.length > 0) {
      recommendations.push(`${highRisks.length} roles need accelerated succession development`);
    }

    recommendations.push('Conduct quarterly succession planning reviews');
    recommendations.push('Implement formal high-potential identification program');
    recommendations.push('Create development rotations for succession candidates');

    return recommendations;
  }

  /**
   * Calculate diversity metrics
   */
  static async analyzeDiversity(
    data: WorkforcePlanningData
  ): Promise<DiversityMetrics> {
    const { employees, departments } = data;

    // Gender distribution
    const genderCounts: Record<string, number> = {};
    employees.forEach(emp => {
      const gender = emp.gender || 'Not Specified';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    // Age distribution
    const ageBands: Record<string, number> = {
      'Under 25': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0,
    };
    employees.forEach(emp => {
      const age = emp.age || 35;
      if (age < 25) ageBands['Under 25']++;
      else if (age < 35) ageBands['25-34']++;
      else if (age < 45) ageBands['35-44']++;
      else if (age < 55) ageBands['45-54']++;
      else ageBands['55+']++;
    });

    // Nationality distribution
    const nationalityCounts: Record<string, number> = {};
    employees.forEach(emp => {
      const nationality = emp.nationality || 'Not Specified';
      nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
    });

    // Leadership diversity
    const leaders = employees.filter(e => e.isLeader);
    const leaderGender: Record<string, number> = {};
    leaders.forEach(leader => {
      const gender = leader.gender || 'Not Specified';
      leaderGender[gender] = (leaderGender[gender] || 0) + 1;
    });

    // Department diversity
    const deptDiversity: DiversityMetrics['departmentBreakdown'] = [];
    for (const dept of departments) {
      const deptEmployees = employees.filter(e => e.departmentId === dept.id);
      const deptGender: Record<string, number> = {};
      deptEmployees.forEach(emp => {
        const gender = emp.gender || 'Not Specified';
        deptGender[gender] = (deptGender[gender] || 0) + 1;
      });

      deptDiversity.push({
        departmentId: dept.id,
        departmentName: dept.name,
        totalCount: deptEmployees.length,
        genderDistribution: deptGender,
        diversityScore: this.calculateDiversityScore(deptGender),
      });
    }

    // Calculate overall diversity score
    const overallScore = this.calculateDiversityScore(genderCounts);

    // Identify gaps
    const gaps: string[] = [];
    const femalePercentage = ((genderCounts['Female'] || 0) / employees.length) * 100;
    if (femalePercentage < 30) {
      gaps.push(`Gender gap: ${femalePercentage.toFixed(1)}% female representation`);
    }

    const leaderFemalePercentage = ((leaderGender['Female'] || 0) / leaders.length) * 100;
    if (leaderFemalePercentage < 25) {
      gaps.push(`Leadership gap: ${leaderFemalePercentage.toFixed(1)}% female leaders`);
    }

    return {
      totalEmployees: employees.length,
      genderDistribution: genderCounts,
      ageDistribution: ageBands,
      nationalityDistribution: nationalityCounts,
      leadershipDiversity: leaderGender,
      departmentBreakdown: deptDiversity,
      overallDiversityScore: overallScore,
      gaps,
      recommendations: this.getDiversityRecommendations(gaps, genderCounts, leaderGender),
      analyzedAt: new Date(),
    };
  }

  /**
   * Calculate diversity score using Shannon diversity index
   */
  private static calculateDiversityScore(distribution: Record<string, number>): number {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    // Calculate Shannon index
    let shannonIndex = 0;
    for (const count of Object.values(distribution)) {
      if (count > 0) {
        const proportion = count / total;
        shannonIndex -= proportion * Math.log(proportion);
      }
    }

    // Normalize to 0-100
    const maxEntropy = Math.log(Object.keys(distribution).length);
    const normalizedScore = maxEntropy > 0 ? (shannonIndex / maxEntropy) * 100 : 0;

    return Math.round(normalizedScore);
  }

  /**
   * Get diversity recommendations
   */
  private static getDiversityRecommendations(
    gaps: string[],
    genderCounts: Record<string, number>,
    leaderGender: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    const total = Object.values(genderCounts).reduce((a, b) => a + b, 0);
    const femalePercentage = ((genderCounts['Female'] || 0) / total) * 100;

    if (femalePercentage < 40) {
      recommendations.push('Implement targeted recruitment for underrepresented genders');
      recommendations.push('Review job descriptions for inclusive language');
    }

    const leaderTotal = Object.values(leaderGender).reduce((a, b) => a + b, 0);
    const leaderFemalePercentage = ((leaderGender['Female'] || 0) / leaderTotal) * 100;

    if (leaderFemalePercentage < femalePercentage) {
      recommendations.push('Develop leadership pipeline for underrepresented groups');
      recommendations.push('Implement mentorship program for diverse talent');
    }

    recommendations.push('Conduct regular pay equity audits');
    recommendations.push('Establish employee resource groups');
    recommendations.push('Set measurable diversity goals and track progress');

    return recommendations.slice(0, 5);
  }
}
