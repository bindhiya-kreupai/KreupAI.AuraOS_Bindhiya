/**
 * Employee Engagement Module Types
 * Comprehensive engagement tracking including surveys, events, social feed, innovation, and recognition
 */

export type SurveyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type SurveyType = 'pulse' | 'engagement' | 'exit' | 'onboarding' | 'custom' | 'eNPS';
export type QuestionType = 'rating' | 'multiple_choice' | 'text' | 'yes_no' | 'nps' | 'likert';
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type EventType = 'training' | 'team_building' | 'social' | 'town_hall' | 'celebration' | 'volunteering' | 'conference';
export type RSVPStatus = 'going' | 'maybe' | 'not_going' | 'pending';
export type PostType = 'announcement' | 'achievement' | 'question' | 'poll' | 'article' | 'media';
export type IdeaStatus = 'submitted' | 'under_review' | 'approved' | 'in_development' | 'implemented' | 'rejected' | 'on_hold';
export type IdeaCategory = 'process_improvement' | 'cost_saving' | 'product' | 'technology' | 'culture' | 'sustainability' | 'other';

// Pulse Surveys
export interface PulseSurvey {
  id: string;
  surveyCode: string;
  surveyName: string;
  description: string;
  surveyType: SurveyType;
  status: SurveyStatus;
  isAnonymous: boolean;
  isRecurring: boolean;
  frequency?: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  targetAudience: TargetAudience;
  questions: SurveyQuestion[];
  responseCount: number;
  targetResponseCount: number;
  participationRate: number;
  averageCompletionTime: number; // minutes
  results: SurveyResults;
  sendReminders: boolean;
  reminderFrequency?: number; // days
  lastReminderSent?: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
}

export interface TargetAudience {
  allEmployees: boolean;
  departments?: string[];
  locations?: string[];
  jobLevels?: string[];
  employeeTypes?: string[];
  specificEmployees?: string[];
  excludedEmployees?: string[];
}

export interface SurveyQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  options?: string[];
  allowMultipleAnswers?: boolean;
  minRating?: number;
  maxRating?: number;
  ratingLabels?: { [key: number]: string };
  category?: string;
  helpText?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyName: string;
  respondentId?: string;
  respondentName?: string;
  isAnonymous: boolean;
  responses: QuestionResponse[];
  completedDate: string;
  completionTime: number; // seconds
  ipAddress?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

export interface QuestionResponse {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  answer: any;
  answerText?: string;
  rating?: number;
  selectedOptions?: string[];
}

export interface SurveyResults {
  totalResponses: number;
  participationRate: number;
  averageScore?: number;
  eNPSScore?: number;
  promoters?: number;
  passives?: number;
  detractors?: number;
  questionResults: QuestionResult[];
  demographicBreakdown?: DemographicBreakdown[];
  trendComparison?: TrendData[];
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  responseCount: number;
  averageRating?: number;
  distribution?: { [key: string]: number };
  textResponses?: string[];
  sentimentScore?: number;
}

export interface DemographicBreakdown {
  segment: string;
  segmentType: 'department' | 'location' | 'tenure' | 'job_level';
  responseCount: number;
  averageScore: number;
}

export interface TrendData {
  period: string;
  averageScore: number;
  responseCount: number;
  change?: number;
}

// Events
export interface Event {
  id: string;
  eventCode: string;
  eventName: string;
  description: string;
  eventType: EventType;
  status: EventStatus;
  startDateTime: string;
  endDateTime: string;
  location: EventLocation;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: string;
  organizerName: string;
  capacity?: number;
  registeredCount: number;
  attendedCount: number;
  isOpenToAll: boolean;
  targetAudience?: TargetAudience;
  agenda?: EventAgenda[];
  speakers?: Speaker[];
  rsvps: RSVP[];
  imageUrl?: string;
  attachments?: EventAttachment[];
  tags: string[];
  requiresApproval: boolean;
  registrationDeadline?: string;
  costs?: EventCost;
  feedback: EventFeedback[];
  averageRating?: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface EventLocation {
  type: 'office' | 'external' | 'virtual' | 'hybrid';
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  roomNumber?: string;
  mapUrl?: string;
}

export interface EventAgenda {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  speaker?: string;
  speakerName?: string;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  organization?: string;
  bio?: string;
  photoUrl?: string;
  linkedIn?: string;
}

export interface RSVP {
  id: string;
  eventId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  status: RSVPStatus;
  registeredDate: string;
  attended: boolean;
  attendedDate?: string;
  plusOnes?: number;
  dietaryRestrictions?: string;
  specialRequirements?: string;
  checkInCode?: string;
}

export interface EventAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedDate: string;
}

export interface EventCost {
  totalBudget: number;
  spentAmount: number;
  currency: string;
  breakdown?: { category: string; amount: number }[];
}

export interface EventFeedback {
  id: string;
  eventId: string;
  employeeId: string;
  employeeName: string;
  rating: number;
  wouldRecommend: boolean;
  feedback: string;
  submittedDate: string;
}

// Social Feed
export interface SocialPost {
  id: string;
  postCode: string;
  postType: PostType;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorDepartment?: string;
  content: string;
  media?: PostMedia[];
  mentions: string[];
  hashtags: string[];
  visibility: 'public' | 'department' | 'team' | 'private';
  isPinned: boolean;
  likes: PostLike[];
  comments: PostComment[];
  shares: number;
  views: number;
  poll?: Poll;
  createdDate: string;
  lastModified: string;
  editedDate?: string;
  isEdited: boolean;
}

export interface PostMedia {
  id: string;
  mediaType: 'image' | 'video' | 'document';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  fileSize?: number;
}

export interface PostLike {
  id: string;
  userId: string;
  userName: string;
  likedDate: string;
  reactionType?: 'like' | 'love' | 'celebrate' | 'support' | 'insightful';
}

export interface PostComment {
  id: string;
  postId: string;
  commenterId: string;
  commenterName: string;
  commenterPhoto?: string;
  comment: string;
  mentions: string[];
  likes: number;
  replies: PostComment[];
  createdDate: string;
  editedDate?: string;
  isEdited: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  endDate?: string;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  optionText: string;
  voteCount: number;
  percentage: number;
  voters?: string[];
}

// Innovation & Ideas
export interface Idea {
  id: string;
  ideaCode: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  submittedBy: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByDepartment: string;
  submittedDate: string;
  problemStatement: string;
  proposedSolution: string;
  expectedBenefits: string[];
  estimatedImpact: ImpactAssessment;
  attachments: IdeaAttachment[];
  tags: string[];
  votes: IdeaVote[];
  voteCount: number;
  comments: IdeaComment[];
  reviewers: IdeaReviewer[];
  currentReviewStage?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  implementationPlan?: ImplementationPlan;
  implementationStatus?: 'not_started' | 'in_progress' | 'completed';
  implementationDate?: string;
  actualImpact?: ActualImpact;
  rewards?: IdeaReward[];
  relatedIdeas: string[];
  isAnonymous: boolean;
  lastModified: string;
}

export interface ImpactAssessment {
  financialImpact?: {
    estimatedSavings: number;
    estimatedRevenue: number;
    currency: string;
  };
  timeImpact?: {
    timeSaved: number;
    unit: 'hours' | 'days' | 'weeks';
  };
  qualityImpact?: 'low' | 'medium' | 'high';
  customerImpact?: 'low' | 'medium' | 'high';
  employeeImpact?: 'low' | 'medium' | 'high';
}

export interface IdeaAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedDate: string;
}

export interface IdeaVote {
  id: string;
  ideaId: string;
  voterId: string;
  voterName: string;
  voteDate: string;
  voteType: 'up' | 'down';
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  commenterId: string;
  commenterName: string;
  commenterRole?: string;
  comment: string;
  isReviewerComment: boolean;
  createdDate: string;
}

export interface IdeaReviewer {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  stage: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewDate?: string;
  comments?: string;
  rating?: number;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  requiredResources: string[];
  estimatedCost?: number;
  estimatedDuration?: number;
  assignedTeam?: string[];
  milestones: string[];
}

export interface ImplementationPhase {
  phaseNumber: number;
  phaseName: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  deliverables: string[];
}

export interface ActualImpact {
  actualSavings?: number;
  actualRevenue?: number;
  actualTimeSaved?: number;
  measuredDate: string;
  notes?: string;
}

export interface IdeaReward {
  rewardType: 'monetary' | 'points' | 'recognition' | 'other';
  amount?: number;
  description: string;
  awardedDate: string;
}

// CSR & Volunteering
export interface CSRActivity {
  id: string;
  activityCode: string;
  activityName: string;
  description: string;
  cause: 'education' | 'health' | 'environment' | 'poverty' | 'animal_welfare' | 'community' | 'other';
  activityType: 'volunteering' | 'donation' | 'fundraising' | 'sponsorship';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location?: string;
  partnerOrganization?: string;
  volunteerSlots?: number;
  volunteersRegistered: number;
  volunteersAttended: number;
  volunteerHours: number;
  fundingGoal?: number;
  fundsRaised?: number;
  currency?: string;
  impact: CSRImpact;
  media: CSRMedia[];
  volunteers: Volunteer[];
  organizer: string;
  organizerName: string;
  createdDate: string;
  lastModified: string;
}

export interface CSRImpact {
  beneficiaries?: number;
  description: string;
  metrics?: { metric: string; value: number; unit: string }[];
  stories?: string[];
}

export interface CSRMedia {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption?: string;
  uploadedDate: string;
}

export interface Volunteer {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  registeredDate: string;
  attended: boolean;
  hoursContributed?: number;
  feedback?: string;
  rating?: number;
}

// Newsletters
export interface Newsletter {
  id: string;
  newsletterCode: string;
  title: string;
  description: string;
  editionNumber: number;
  publishDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  sections: NewsletterSection[];
  coverImageUrl?: string;
  targetAudience: TargetAudience;
  sentCount: number;
  openRate: number;
  clickRate: number;
  editor: string;
  editorName: string;
  createdDate: string;
  lastModified: string;
}

export interface NewsletterSection {
  id: string;
  sectionType: 'article' | 'announcement' | 'spotlight' | 'achievements' | 'events' | 'quotes';
  title: string;
  content: string;
  imageUrl?: string;
  author?: string;
  authorName?: string;
  links?: { text: string; url: string }[];
  displayOrder: number;
}

// Recognition Wall
export interface RecognitionWallPost {
  id: string;
  recognitionId: string;
  recognitionType: string;
  recognizerName: string;
  recognizerPhoto?: string;
  recipientName: string;
  recipientPhoto?: string;
  message: string;
  coreValues?: string[];
  postedDate: string;
  likes: number;
  comments: number;
  isPinned: boolean;
}

// Engagement Metrics
export interface EngagementMetrics {
  overallEngagementScore: number;
  activeSurveys: number;
  surveyParticipationRate: number;
  averageeSatisfaction: number;
  eNPSScore: number;
  upcomingEvents: number;
  eventParticipationRate: number;
  averageEventRating: number;
  socialPosts: number;
  socialEngagementRate: number;
  activeIdeas: number;
  implementedIdeas: number;
  ideaImplementationRate: number;
  csrParticipationRate: number;
  volunteerHoursThisYear: number;
  fundsRaisedThisYear: number;
  surveyTrends: TrendData[];
  departmentEngagement: { department: string; score: number }[];
  engagementByCategory: { category: string; score: number }[];
  lastUpdated: string;
}

// Engagement Settings
export interface EngagementSettings {
  enablePulseSurveys: boolean;
  enableEvents: boolean;
  enableSocialFeed: boolean;
  enableInnovation: boolean;
  enableCSR: boolean;
  enableRecognitionWall: boolean;
  enableNewsletters: boolean;
  surveyAnonymityDefault: boolean;
  surveyReminderEnabled: boolean;
  surveyReminderDays: number;
  eventAutoApproval: boolean;
  eventCapacityManagement: boolean;
  socialModerationEnabled: boolean;
  socialModerators: string[];
  ideaReviewLevels: number;
  ideaVotingEnabled: boolean;
  ideaRewardsEnabled: boolean;
  csrHoursTracking: boolean;
  csrTaxDeductibleReceipts: boolean;
  newsletterFrequency: 'weekly' | 'bi_weekly' | 'monthly';
  enableNotifications: boolean;
  notifyOnSurveyLaunch: boolean;
  notifyOnEventInvite: boolean;
  notifyOnSocialMention: boolean;
  notifyOnIdeaReview: boolean;
  createdDate: string;
  lastModified: string;
}

// Engagement Notifications
export interface EngagementNotification {
  id: string;
  notificationType: 'survey_invite' | 'event_invite' | 'social_mention' | 'idea_review' | 'csr_opportunity' | 'recognition';
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
