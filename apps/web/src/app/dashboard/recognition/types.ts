// Employee Recognition & Rewards Module Types

export type RecognitionType = 'peer_to_peer' | 'manager_to_employee' | 'company_award' | 'spot_award' | 'milestone' | 'achievement' | 'custom';
export type RecognitionCategory = 'performance' | 'teamwork' | 'innovation' | 'leadership' | 'customer_service' | 'culture' | 'safety' | 'quality' | 'other';
export type RecognitionStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'declined' | 'published';
export type RewardType = 'points' | 'badge' | 'certificate' | 'gift_card' | 'monetary' | 'time_off' | 'physical_item' | 'experience';
export type RedemptionStatus = 'pending' | 'processing' | 'approved' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type ProgramStatus = 'draft' | 'active' | 'paused' | 'ended' | 'archived';
export type VisibilityType = 'public' | 'private' | 'team' | 'department' | 'company';

export interface Recognition {
  id: string;
  recognitionCode: string;
  recognitionType: RecognitionType;
  category: RecognitionCategory;
  status: RecognitionStatus;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderDepartment: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientDepartment: string;
  programId?: string;
  programName?: string;
  title: string;
  message: string;
  coreValues: string[];
  visibility: VisibilityType;
  isAnonymous: boolean;
  rewards: RecognitionReward[];
  totalPointsAwarded: number;
  badges: string[];
  attachments: RecognitionAttachment[];
  reactions: RecognitionReaction[];
  comments: RecognitionComment[];
  viewCount: number;
  isPublished: boolean;
  publishedDate?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  declinedReason?: string;
  relatedRecognitions: string[];
  tags: string[];
  createdDate: string;
  lastModified: string;
}

export interface RecognitionReward {
  id: string;
  rewardType: RewardType;
  rewardName: string;
  pointsValue: number;
  monetaryValue?: number;
  currency?: string;
  description?: string;
  badgeId?: string;
  certificateId?: string;
}

export interface RecognitionAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface RecognitionReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  reactionType: 'like' | 'love' | 'celebrate' | 'support' | 'inspire';
  createdDate: string;
}

export interface RecognitionComment {
  id: string;
  recognitionId: string;
  userId: string;
  userName: string;
  comment: string;
  mentions: string[];
  createdDate: string;
}

export interface Badge {
  id: string;
  badgeCode: string;
  badgeName: string;
  description: string;
  category: RecognitionCategory;
  level: BadgeLevel;
  iconUrl: string;
  criteria: BadgeCriteria;
  pointsValue: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  isAutoAwarded: boolean;
  totalAwarded: number;
  createdBy: string;
  createdDate: string;
}

export interface BadgeCriteria {
  criteriaType: 'manual' | 'automatic' | 'achievement';
  requirements: string[];
  threshold?: number;
  timeframe?: string;
}

export interface EmployeeBadge {
  id: string;
  employeeId: string;
  employeeName: string;
  badgeId: string;
  badgeName: string;
  badgeLevel: BadgeLevel;
  awardedBy: string;
  awardedByName: string;
  awardedDate: string;
  recognitionId?: string;
  reason?: string;
  displayOnProfile: boolean;
}

export interface RewardsCatalog {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  rewardType: RewardType;
  pointsCost: number;
  monetaryValue?: number;
  currency: string;
  imageUrl: string;
  vendor?: string;
  stockQuantity?: number;
  isAvailable: boolean;
  minRedemptionLevel?: string;
  expiryDate?: string;
  features: string[];
  terms: string[];
  deliveryTimeframe?: string;
  totalRedeemed: number;
  rating?: number;
  reviews: CatalogReview[];
  tags: string[];
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

export interface CatalogReview {
  id: string;
  catalogItemId: string;
  employeeId: string;
  employeeName: string;
  rating: number;
  review: string;
  createdDate: string;
}

export interface Redemption {
  id: string;
  redemptionCode: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  catalogItemId: string;
  catalogItemName: string;
  rewardType: RewardType;
  pointsCost: number;
  quantity: number;
  totalPointsCost: number;
  status: RedemptionStatus;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
  cancelledBy?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  createdDate: string;
  lastModified: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

export interface PointsTransaction {
  id: string;
  transactionCode: string;
  employeeId: string;
  employeeName: string;
  transactionType: 'earned' | 'redeemed' | 'adjustment' | 'expired' | 'bonus';
  points: number;
  balance: number;
  source: string;
  recognitionId?: string;
  redemptionId?: string;
  programId?: string;
  description: string;
  expiryDate?: string;
  processedBy?: string;
  createdDate: string;
}

export interface EmployeePoints {
  employeeId: string;
  employeeName: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  expiringSoon: number;
  nextExpiryDate?: string;
  tier?: PointsTier;
  transactions: PointsTransaction[];
  lastEarned?: string;
  lastRedeemed?: string;
}

export interface PointsTier {
  tierName: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  multiplier: number;
}

export interface RecognitionProgram {
  id: string;
  programCode: string;
  programName: string;
  description: string;
  programType: RecognitionType;
  category: RecognitionCategory;
  status: ProgramStatus;
  startDate: string;
  endDate?: string;
  budget?: ProgramBudget;
  eligibility: ProgramEligibility;
  rules: ProgramRule[];
  rewards: ProgramReward[];
  requiresApproval: boolean;
  approvers: string[];
  visibility: VisibilityType;
  allowNominations: boolean;
  allowPeerRecognition: boolean;
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  participantCount: number;
  recognitionCount: number;
  pointsDistributed: number;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ProgramBudget {
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  fiscalYear: string;
}

export interface ProgramEligibility {
  departments?: string[];
  locations?: string[];
  jobLevels?: string[];
  employeeTypes?: string[];
  minTenure?: number;
  excludedEmployees?: string[];
}

export interface ProgramRule {
  id: string;
  ruleName: string;
  ruleType: 'limit' | 'requirement' | 'restriction' | 'automation';
  description: string;
  condition: string;
  action: string;
  isActive: boolean;
}

export interface ProgramReward {
  rewardType: RewardType;
  rewardName: string;
  pointsValue: number;
  monetaryValue?: number;
  isDefault: boolean;
}

export interface Nomination {
  id: string;
  nominationCode: string;
  programId: string;
  programName: string;
  nominatorId: string;
  nominatorName: string;
  nomineeId: string;
  nomineeName: string;
  nomineeEmail: string;
  nomineeDepartment: string;
  category: RecognitionCategory;
  title: string;
  description: string;
  achievements: string[];
  impact: string;
  supportingDocuments: string[];
  status: 'submitted' | 'under_review' | 'shortlisted' | 'selected' | 'declined';
  reviewers: NominationReviewer[];
  votes: NominationVote[];
  isWinner: boolean;
  awardedDate?: string;
  declinedReason?: string;
  createdDate: string;
  lastModified: string;
}

export interface NominationReviewer {
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'reviewed' | 'abstained';
  rating?: number;
  comments?: string;
  reviewedDate?: string;
}

export interface NominationVote {
  voterId: string;
  voterName: string;
  voteDate: string;
}

export interface Award {
  id: string;
  awardCode: string;
  awardName: string;
  description: string;
  category: RecognitionCategory;
  awardType: 'individual' | 'team' | 'department';
  programId?: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  criteria: string[];
  rewards: AwardReward[];
  winners: AwardWinner[];
  nominationRequired: boolean;
  isActive: boolean;
  nextAwardDate?: string;
  createdBy: string;
  createdDate: string;
}

export interface AwardReward {
  rewardType: RewardType;
  description: string;
  value: number;
  currency?: string;
}

export interface AwardWinner {
  id: string;
  awardId: string;
  employeeId?: string;
  employeeName?: string;
  teamId?: string;
  teamName?: string;
  awardedDate: string;
  nominationId?: string;
  achievements: string[];
  recognitionId?: string;
}

export interface RecognitionLeaderboard {
  id: string;
  leaderboardType: 'points_earned' | 'recognitions_received' | 'recognitions_given' | 'badges_earned';
  period: 'current_month' | 'current_quarter' | 'current_year' | 'all_time';
  rankings: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeePhoto?: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  previousRank?: number;
}

export interface RecognitionMetrics {
  totalRecognitions: number;
  recognitionsThisMonth: number;
  recognitionsThisQuarter: number;
  recognitionsThisYear: number;
  averageRecognitionsPerEmployee: number;
  participationRate: number;
  topRecipients: { employeeId: string; employeeName: string; count: number }[];
  topSenders: { employeeId: string; employeeName: string; count: number }[];
  recognitionsByCategory: { category: RecognitionCategory; count: number; percentage: number }[];
  recognitionsByType: { type: RecognitionType; count: number; percentage: number }[];
  recognitionsByDepartment: { departmentId: string; departmentName: string; sent: number; received: number }[];
  totalPointsAwarded: number;
  totalPointsRedeemed: number;
  totalBadgesAwarded: number;
  uniqueBadgesAwarded: number;
  redemptionRate: number;
  averageRedemptionValue: number;
  programParticipation: { programId: string; programName: string; participants: number; recognitions: number }[];
  engagementScore: number;
  sentimentScore: number;
  trends: {
    period: string;
    recognitions: number;
    pointsAwarded: number;
    redemptions: number;
  }[];
}

export interface RecognitionSettings {
  enableRecognition: boolean;
  enablePeerToPeer: boolean;
  enableManagerRecognition: boolean;
  enablePoints: boolean;
  enableBadges: boolean;
  enableRewards: boolean;
  requireApproval: boolean;
  approvalLevels: number;
  defaultApprovers: string[];
  allowAnonymous: boolean;
  enableComments: boolean;
  enableReactions: boolean;
  defaultVisibility: VisibilityType;
  pointsPerRecognition: number;
  maxPointsPerRecognition: number;
  managerPointsMultiplier: number;
  enablePointsExpiry: boolean;
  pointsExpiryMonths: number;
  enableTiers: boolean;
  tiers: PointsTier[];
  enableLeaderboards: boolean;
  publicLeaderboards: boolean;
  enableNominations: boolean;
  enableRedemption: boolean;
  minRedemptionPoints: number;
  shippingEnabled: boolean;
  defaultCurrency: string;
  fiscalYearStart: string;
  enableNotifications: boolean;
  notifyOnRecognition: boolean;
  notifyOnBadge: boolean;
  notifyOnRedemption: boolean;
  enableMobileApp: boolean;
  enableIntegrations: boolean;
}

export interface RecognitionNotification {
  id: string;
  notificationType: 'received_recognition' | 'badge_earned' | 'points_earned' | 'points_expiring' | 'redemption_shipped' | 'nomination_selected';
  recipientId: string;
  recipientName: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  readDate?: string;
  actionUrl?: string;
  createdDate: string;
}

export interface RecognitionReport {
  id: string;
  reportType: 'individual' | 'team' | 'department' | 'company' | 'program';
  reportName: string;
  periodStart: string;
  periodEnd: string;
  filters: { [key: string]: any };
  data: any[];
  summary: { [key: string]: any };
  generatedBy: string;
  generatedDate: string;
  fileUrl?: string;
}

export interface CoreValue {
  id: string;
  valueName: string;
  description: string;
  examples: string[];
  iconUrl?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface RecognitionAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'approved' | 'declined' | 'redeemed' | 'commented' | 'reacted';
  entityType: 'recognition' | 'redemption' | 'badge' | 'nomination';
  entityId: string;
  details: string;
  ipAddress?: string;
}
