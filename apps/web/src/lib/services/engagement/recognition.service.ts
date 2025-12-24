/**
 * Recognition Service
 * Employee recognition, awards, nominations, and peer appreciation
 *
 * Features:
 * - Award programs and categories
 * - Peer-to-peer recognition
 * - Manager nominations
 * - Recognition wall/feed
 * - Points integration
 * - Social sharing
 * - Analytics and reporting
 */

// ============================================================================
// TYPES
// ============================================================================

export interface RecognitionProgram {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: ProgramType;
  frequency: RecognitionFrequency;
  pointsValue: number;
  budgetPerEmployee?: number;
  currency?: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  eligibleRoles: string[];
  approvalRequired: boolean;
  maxRecognitionsPerMonth?: number;
  categories: RecognitionCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProgramType =
  | 'peer_to_peer'
  | 'manager_recognition'
  | 'spot_award'
  | 'milestone'
  | 'anniversary'
  | 'performance'
  | 'innovation'
  | 'values_based'
  | 'team_achievement';

export type RecognitionFrequency =
  | 'instant'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual';

export interface RecognitionCategory {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  pointsValue: number;
  isActive: boolean;
}

export interface Recognition {
  id: string;
  programId: string;
  categoryId: string;
  giverId: string;
  giverName: string;
  giverDepartment: string;
  receiverId: string;
  receiverName: string;
  receiverDepartment: string;
  message: string;
  messageAr?: string;
  values: string[];
  pointsAwarded: number;
  monetaryValue?: number;
  currency?: string;
  status: RecognitionStatus;
  visibility: RecognitionVisibility;
  approvedBy?: string;
  approvedAt?: Date;
  reactions: Reaction[];
  comments: Comment[];
  sharedOn: SocialPlatform[];
  createdAt: Date;
  updatedAt: Date;
}

export type RecognitionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

export type RecognitionVisibility =
  | 'public'
  | 'department'
  | 'team'
  | 'private';

export interface Reaction {
  id: string;
  userId: string;
  userName: string;
  type: ReactionType;
  createdAt: Date;
}

export type ReactionType =
  | 'like'
  | 'love'
  | 'celebrate'
  | 'support'
  | 'insightful';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type SocialPlatform = 'internal' | 'slack' | 'teams' | 'linkedin';

export interface Award {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: AwardType;
  tier: AwardTier;
  icon: string;
  badgeUrl?: string;
  pointsValue: number;
  monetaryValue?: number;
  currency?: string;
  criteria: AwardCriteria;
  isActive: boolean;
  createdAt: Date;
}

export type AwardType =
  | 'individual'
  | 'team'
  | 'department'
  | 'company';

export type AwardTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export interface AwardCriteria {
  minRecognitions?: number;
  minPoints?: number;
  requiredValues?: string[];
  performanceRating?: number;
  tenureMonths?: number;
  customCriteria?: string;
}

export interface Nomination {
  id: string;
  awardId: string;
  awardName: string;
  nominatorId: string;
  nominatorName: string;
  nomineeId: string;
  nomineeName: string;
  nomineeDepartment: string;
  reason: string;
  reasonAr?: string;
  supportingEvidence?: string[];
  endorsements: Endorsement[];
  status: NominationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NominationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'selected'
  | 'rejected';

export interface Endorsement {
  id: string;
  userId: string;
  userName: string;
  comment?: string;
  createdAt: Date;
}

export interface RecognitionWall {
  recognitions: Recognition[];
  totalCount: number;
  page: number;
  pageSize: number;
  filters: RecognitionFilters;
}

export interface RecognitionFilters {
  programId?: string;
  categoryId?: string;
  departmentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  visibility?: RecognitionVisibility;
}

export interface RecognitionStats {
  totalRecognitions: number;
  totalPoints: number;
  recognitionsGiven: number;
  recognitionsReceived: number;
  topCategories: { category: string; count: number }[];
  topValues: { value: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  participationRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  recognitionsReceived: number;
  recognitionsGiven: number;
  totalPoints: number;
  topAward?: string;
}

export interface RecognitionResult {
  success: boolean;
  recognition?: Recognition;
  message: string;
  messageAr: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROGRAM_TYPE_LABELS: Record<ProgramType, { en: string; ar: string }> = {
  peer_to_peer: { en: 'Peer to Peer', ar: 'من زميل إلى زميل' },
  manager_recognition: { en: 'Manager Recognition', ar: 'تقدير المدير' },
  spot_award: { en: 'Spot Award', ar: 'جائزة فورية' },
  milestone: { en: 'Milestone', ar: 'إنجاز' },
  anniversary: { en: 'Work Anniversary', ar: 'ذكرى العمل' },
  performance: { en: 'Performance Award', ar: 'جائزة الأداء' },
  innovation: { en: 'Innovation Award', ar: 'جائزة الابتكار' },
  values_based: { en: 'Values Champion', ar: 'بطل القيم' },
  team_achievement: { en: 'Team Achievement', ar: 'إنجاز الفريق' },
};

const DEFAULT_CATEGORIES: RecognitionCategory[] = [
  {
    id: 'teamwork',
    name: 'Teamwork',
    nameAr: 'العمل الجماعي',
    description: 'Exceptional collaboration and team support',
    descriptionAr: 'تعاون استثنائي ودعم الفريق',
    icon: '🤝',
    color: '#3B82F6',
    pointsValue: 50,
    isActive: true,
  },
  {
    id: 'innovation',
    name: 'Innovation',
    nameAr: 'الابتكار',
    description: 'Creative problem solving and new ideas',
    descriptionAr: 'حل المشكلات الإبداعي والأفكار الجديدة',
    icon: '💡',
    color: '#F59E0B',
    pointsValue: 75,
    isActive: true,
  },
  {
    id: 'customer_focus',
    name: 'Customer Focus',
    nameAr: 'التركيز على العملاء',
    description: 'Outstanding customer service and satisfaction',
    descriptionAr: 'خدمة عملاء متميزة ورضا العملاء',
    icon: '⭐',
    color: '#10B981',
    pointsValue: 50,
    isActive: true,
  },
  {
    id: 'leadership',
    name: 'Leadership',
    nameAr: 'القيادة',
    description: 'Inspiring and guiding others to success',
    descriptionAr: 'إلهام وتوجيه الآخرين نحو النجاح',
    icon: '🏆',
    color: '#8B5CF6',
    pointsValue: 100,
    isActive: true,
  },
  {
    id: 'going_extra_mile',
    name: 'Going Extra Mile',
    nameAr: 'بذل جهد إضافي',
    description: 'Exceeding expectations and going above and beyond',
    descriptionAr: 'تجاوز التوقعات والذهاب إلى أبعد من ذلك',
    icon: '🚀',
    color: '#EC4899',
    pointsValue: 75,
    isActive: true,
  },
  {
    id: 'integrity',
    name: 'Integrity',
    nameAr: 'النزاهة',
    description: 'Demonstrating honesty and ethical behavior',
    descriptionAr: 'إظهار الصدق والسلوك الأخلاقي',
    icon: '🛡️',
    color: '#6366F1',
    pointsValue: 50,
    isActive: true,
  },
];

const REACTION_LABELS: Record<ReactionType, { en: string; ar: string; emoji: string }> = {
  like: { en: 'Like', ar: 'إعجاب', emoji: '👍' },
  love: { en: 'Love', ar: 'حب', emoji: '❤️' },
  celebrate: { en: 'Celebrate', ar: 'احتفال', emoji: '🎉' },
  support: { en: 'Support', ar: 'دعم', emoji: '🙌' },
  insightful: { en: 'Insightful', ar: 'ملهم', emoji: '💭' },
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class RecognitionService {
  private programs: Map<string, RecognitionProgram> = new Map();
  private recognitions: Map<string, Recognition> = new Map();
  private awards: Map<string, Award> = new Map();
  private nominations: Map<string, Nomination> = new Map();
  private employeePoints: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultProgram();
  }

  /**
   * Initialize default recognition program
   */
  private initializeDefaultProgram(): void {
    const defaultProgram: RecognitionProgram = {
      id: 'default',
      name: 'Peer Recognition',
      nameAr: 'تقدير الزملاء',
      description: 'Recognize your colleagues for their great work',
      descriptionAr: 'قدر زملاءك على عملهم الرائع',
      type: 'peer_to_peer',
      frequency: 'instant',
      pointsValue: 50,
      isActive: true,
      startDate: new Date(),
      eligibleRoles: ['all'],
      approvalRequired: false,
      maxRecognitionsPerMonth: 10,
      categories: DEFAULT_CATEGORIES,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.programs.set(defaultProgram.id, defaultProgram);
  }

  /**
   * Create a recognition program
   */
  createProgram(program: Omit<RecognitionProgram, 'id' | 'createdAt' | 'updatedAt'>): RecognitionProgram {
    const newProgram: RecognitionProgram = {
      ...program,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.programs.set(newProgram.id, newProgram);
    return newProgram;
  }

  /**
   * Get all active programs
   */
  getActivePrograms(): RecognitionProgram[] {
    return Array.from(this.programs.values())
      .filter(p => p.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get program by ID
   */
  getProgram(programId: string): RecognitionProgram | undefined {
    return this.programs.get(programId);
  }

  /**
   * Give recognition to an employee
   */
  async giveRecognition(
    programId: string,
    categoryId: string,
    giverId: string,
    giverName: string,
    giverDepartment: string,
    receiverId: string,
    receiverName: string,
    receiverDepartment: string,
    message: string,
    values: string[] = [],
    visibility: RecognitionVisibility = 'public'
  ): Promise<RecognitionResult> {
    const program = this.programs.get(programId);
    if (!program) {
      return {
        success: false,
        message: 'Recognition program not found',
        messageAr: 'برنامج التقدير غير موجود',
      };
    }

    const category = program.categories.find(c => c.id === categoryId);
    if (!category) {
      return {
        success: false,
        message: 'Recognition category not found',
        messageAr: 'فئة التقدير غير موجودة',
      };
    }

    // Check monthly limit
    if (program.maxRecognitionsPerMonth) {
      const monthlyCount = this.getMonthlyRecognitionCount(giverId);
      if (monthlyCount >= program.maxRecognitionsPerMonth) {
        return {
          success: false,
          message: `You have reached your monthly recognition limit (${program.maxRecognitionsPerMonth})`,
          messageAr: `لقد وصلت إلى الحد الشهري للتقدير (${program.maxRecognitionsPerMonth})`,
        };
      }
    }

    // Cannot recognize yourself
    if (giverId === receiverId) {
      return {
        success: false,
        message: 'You cannot recognize yourself',
        messageAr: 'لا يمكنك تقدير نفسك',
      };
    }

    const recognition: Recognition = {
      id: this.generateId(),
      programId,
      categoryId,
      giverId,
      giverName,
      giverDepartment,
      receiverId,
      receiverName,
      receiverDepartment,
      message,
      values,
      pointsAwarded: category.pointsValue,
      status: program.approvalRequired ? 'pending' : 'approved',
      visibility,
      reactions: [],
      comments: [],
      sharedOn: ['internal'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.recognitions.set(recognition.id, recognition);

    // Award points if approved
    if (recognition.status === 'approved') {
      this.awardPoints(receiverId, recognition.pointsAwarded);
    }

    return {
      success: true,
      recognition,
      message: 'Recognition sent successfully',
      messageAr: 'تم إرسال التقدير بنجاح',
    };
  }

  /**
   * Get monthly recognition count for a user
   */
  private getMonthlyRecognitionCount(userId: string): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return Array.from(this.recognitions.values())
      .filter(r =>
        r.giverId === userId &&
        r.createdAt >= startOfMonth
      ).length;
  }

  /**
   * Award points to an employee
   */
  private awardPoints(employeeId: string, points: number): void {
    const currentPoints = this.employeePoints.get(employeeId) || 0;
    this.employeePoints.set(employeeId, currentPoints + points);
  }

  /**
   * Get employee points
   */
  getEmployeePoints(employeeId: string): number {
    return this.employeePoints.get(employeeId) || 0;
  }

  /**
   * Approve a recognition
   */
  approveRecognition(recognitionId: string, approverId: string): RecognitionResult {
    const recognition = this.recognitions.get(recognitionId);
    if (!recognition) {
      return {
        success: false,
        message: 'Recognition not found',
        messageAr: 'التقدير غير موجود',
      };
    }

    if (recognition.status !== 'pending') {
      return {
        success: false,
        message: 'Recognition is not pending approval',
        messageAr: 'التقدير ليس في انتظار الموافقة',
      };
    }

    recognition.status = 'approved';
    recognition.approvedBy = approverId;
    recognition.approvedAt = new Date();
    recognition.updatedAt = new Date();

    // Award points
    this.awardPoints(recognition.receiverId, recognition.pointsAwarded);

    return {
      success: true,
      recognition,
      message: 'Recognition approved',
      messageAr: 'تمت الموافقة على التقدير',
    };
  }

  /**
   * Reject a recognition
   */
  rejectRecognition(recognitionId: string, reason?: string): RecognitionResult {
    const recognition = this.recognitions.get(recognitionId);
    if (!recognition) {
      return {
        success: false,
        message: 'Recognition not found',
        messageAr: 'التقدير غير موجود',
      };
    }

    recognition.status = 'rejected';
    recognition.updatedAt = new Date();

    return {
      success: true,
      recognition,
      message: 'Recognition rejected',
      messageAr: 'تم رفض التقدير',
    };
  }

  /**
   * Add reaction to recognition
   */
  addReaction(recognitionId: string, userId: string, userName: string, type: ReactionType): boolean {
    const recognition = this.recognitions.get(recognitionId);
    if (!recognition) return false;

    // Remove existing reaction from same user
    recognition.reactions = recognition.reactions.filter(r => r.userId !== userId);

    recognition.reactions.push({
      id: this.generateId(),
      userId,
      userName,
      type,
      createdAt: new Date(),
    });

    return true;
  }

  /**
   * Add comment to recognition
   */
  addComment(recognitionId: string, userId: string, userName: string, content: string): Comment | null {
    const recognition = this.recognitions.get(recognitionId);
    if (!recognition) return null;

    const comment: Comment = {
      id: this.generateId(),
      userId,
      userName,
      content,
      createdAt: new Date(),
    };

    recognition.comments.push(comment);
    return comment;
  }

  /**
   * Get recognition wall/feed
   */
  getRecognitionWall(
    filters: RecognitionFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): RecognitionWall {
    let recognitions = Array.from(this.recognitions.values())
      .filter(r => r.status === 'approved');

    // Apply filters
    if (filters.programId) {
      recognitions = recognitions.filter(r => r.programId === filters.programId);
    }
    if (filters.categoryId) {
      recognitions = recognitions.filter(r => r.categoryId === filters.categoryId);
    }
    if (filters.departmentId) {
      recognitions = recognitions.filter(r =>
        r.giverDepartment === filters.departmentId ||
        r.receiverDepartment === filters.departmentId
      );
    }
    if (filters.dateFrom) {
      recognitions = recognitions.filter(r => r.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      recognitions = recognitions.filter(r => r.createdAt <= filters.dateTo!);
    }
    if (filters.visibility) {
      recognitions = recognitions.filter(r => r.visibility === filters.visibility);
    }

    // Sort by date descending
    recognitions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalCount = recognitions.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedRecognitions = recognitions.slice(startIndex, startIndex + pageSize);

    return {
      recognitions: paginatedRecognitions,
      totalCount,
      page,
      pageSize,
      filters,
    };
  }

  /**
   * Get recognitions for an employee
   */
  getEmployeeRecognitions(employeeId: string, type: 'received' | 'given' = 'received'): Recognition[] {
    return Array.from(this.recognitions.values())
      .filter(r =>
        r.status === 'approved' &&
        (type === 'received' ? r.receiverId === employeeId : r.giverId === employeeId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get recognition statistics
   */
  getStats(employeeId?: string): RecognitionStats {
    let recognitions = Array.from(this.recognitions.values())
      .filter(r => r.status === 'approved');

    if (employeeId) {
      recognitions = recognitions.filter(r =>
        r.receiverId === employeeId || r.giverId === employeeId
      );
    }

    const totalRecognitions = recognitions.length;
    const totalPoints = recognitions.reduce((sum, r) => sum + r.pointsAwarded, 0);

    const recognitionsGiven = employeeId
      ? recognitions.filter(r => r.giverId === employeeId).length
      : 0;
    const recognitionsReceived = employeeId
      ? recognitions.filter(r => r.receiverId === employeeId).length
      : 0;

    // Top categories
    const categoryCounts: Record<string, number> = {};
    recognitions.forEach(r => {
      categoryCounts[r.categoryId] = (categoryCounts[r.categoryId] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top values
    const valueCounts: Record<string, number> = {};
    recognitions.forEach(r => {
      r.values.forEach(v => {
        valueCounts[v] = (valueCounts[v] || 0) + 1;
      });
    });
    const topValues = Object.entries(valueCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const count = recognitions.filter(r => {
        const rMonth = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return rMonth === monthKey;
      }).length;
      monthlyTrend.push({ month: monthKey, count });
    }

    // Participation rate (mock - would need employee count)
    const participationRate = 65;

    return {
      totalRecognitions,
      totalPoints,
      recognitionsGiven,
      recognitionsReceived,
      topCategories,
      topValues,
      monthlyTrend,
      participationRate,
    };
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(
    type: 'received' | 'given' | 'points' = 'received',
    limit: number = 10
  ): LeaderboardEntry[] {
    const employeeStats: Map<string, {
      name: string;
      department: string;
      received: number;
      given: number;
      points: number;
    }> = new Map();

    // Aggregate stats
    this.recognitions.forEach(r => {
      if (r.status !== 'approved') return;

      // Receiver stats
      const receiverStats = employeeStats.get(r.receiverId) || {
        name: r.receiverName,
        department: r.receiverDepartment,
        received: 0,
        given: 0,
        points: 0,
      };
      receiverStats.received++;
      receiverStats.points += r.pointsAwarded;
      employeeStats.set(r.receiverId, receiverStats);

      // Giver stats
      const giverStats = employeeStats.get(r.giverId) || {
        name: r.giverName,
        department: r.giverDepartment,
        received: 0,
        given: 0,
        points: 0,
      };
      giverStats.given++;
      employeeStats.set(r.giverId, giverStats);
    });

    // Sort and rank
    const entries = Array.from(employeeStats.entries())
      .map(([id, stats]) => ({
        rank: 0,
        employeeId: id,
        employeeName: stats.name,
        department: stats.department,
        recognitionsReceived: stats.received,
        recognitionsGiven: stats.given,
        totalPoints: stats.points,
      }))
      .sort((a, b) => {
        switch (type) {
          case 'received': return b.recognitionsReceived - a.recognitionsReceived;
          case 'given': return b.recognitionsGiven - a.recognitionsGiven;
          case 'points': return b.totalPoints - a.totalPoints;
        }
      })
      .slice(0, limit);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  /**
   * Create an award
   */
  createAward(award: Omit<Award, 'id' | 'createdAt'>): Award {
    const newAward: Award = {
      ...award,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.awards.set(newAward.id, newAward);
    return newAward;
  }

  /**
   * Get all awards
   */
  getAwards(): Award[] {
    return Array.from(this.awards.values())
      .filter(a => a.isActive)
      .sort((a, b) => {
        const tierOrder = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
        return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
      });
  }

  /**
   * Submit a nomination
   */
  submitNomination(
    awardId: string,
    nominatorId: string,
    nominatorName: string,
    nomineeId: string,
    nomineeName: string,
    nomineeDepartment: string,
    reason: string
  ): Nomination | null {
    const award = this.awards.get(awardId);
    if (!award) return null;

    // Cannot nominate yourself
    if (nominatorId === nomineeId) return null;

    const nomination: Nomination = {
      id: this.generateId(),
      awardId,
      awardName: award.name,
      nominatorId,
      nominatorName,
      nomineeId,
      nomineeName,
      nomineeDepartment,
      reason,
      endorsements: [],
      status: 'submitted',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.nominations.set(nomination.id, nomination);
    return nomination;
  }

  /**
   * Endorse a nomination
   */
  endorseNomination(nominationId: string, userId: string, userName: string, comment?: string): boolean {
    const nomination = this.nominations.get(nominationId);
    if (!nomination) return false;

    // Cannot endorse your own nomination
    if (nomination.nominatorId === userId) return false;

    // Cannot endorse twice
    if (nomination.endorsements.some(e => e.userId === userId)) return false;

    nomination.endorsements.push({
      id: this.generateId(),
      userId,
      userName,
      comment,
      createdAt: new Date(),
    });

    return true;
  }

  /**
   * Get nominations
   */
  getNominations(status?: NominationStatus): Nomination[] {
    let nominations = Array.from(this.nominations.values());

    if (status) {
      nominations = nominations.filter(n => n.status === status);
    }

    return nominations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update nomination status
   */
  updateNominationStatus(nominationId: string, status: NominationStatus, reviewNotes?: string): boolean {
    const nomination = this.nominations.get(nominationId);
    if (!nomination) return false;

    nomination.status = status;
    nomination.reviewNotes = reviewNotes;
    nomination.updatedAt = new Date();

    return true;
  }

  /**
   * Get program type label
   */
  getProgramTypeLabel(type: ProgramType, language: 'en' | 'ar' = 'en'): string {
    return PROGRAM_TYPE_LABELS[type][language];
  }

  /**
   * Get reaction info
   */
  getReactionInfo(type: ReactionType): typeof REACTION_LABELS[ReactionType] {
    return REACTION_LABELS[type];
  }

  /**
   * Get default categories
   */
  getDefaultCategories(): RecognitionCategory[] {
    return DEFAULT_CATEGORIES;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const recognitionService = new RecognitionService();

// Export types
export type { RecognitionService };
