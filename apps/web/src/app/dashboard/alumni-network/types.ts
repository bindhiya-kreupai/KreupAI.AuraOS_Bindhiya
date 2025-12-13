// Alumni Network Module - Comprehensive Type Definitions

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

// ============================================================================
// ALUMNI DIRECTORY TYPES
// ============================================================================

export interface AlumniProfile {
  alumniId: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string;

  // Employment History
  dateJoined: Date;
  dateLeft: Date;
  tenure: number; // in months
  lastDesignation: string;
  lastDepartment: string;
  lastLocation: string;
  lastManager?: string;
  reasonForLeaving?: ExitReason;

  // Current Status
  currentCompany?: string;
  currentDesignation?: string;
  currentLocation?: string;
  currentIndustry?: string;
  linkedInProfile?: string;
  personalWebsite?: string;

  // Alumni Network Status
  alumniStatus: AlumniStatus;
  membershipType: MembershipType;
  joinedAlumniNetworkDate?: Date;
  lastActiveDate?: Date;
  profileVisibility: ProfileVisibility;

  // Preferences
  willingToMentor: boolean;
  openToOpportunities: boolean;
  openToReferrals: boolean;
  interests: string[];
  skills: string[];

  // Engagement
  eventsAttended: number;
  jobsPosted: number;
  referralsGiven: number;
  mentoringSessions: number;

  // Contact Preferences
  contactPreferences: ContactPreferences;

  // Additional Info
  address?: Address;
  socialMedia?: SocialMediaLinks;
  bio?: string;
  achievements?: string[];

  // Metadata
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  notes?: string;
}

export type AlumniStatus = 'pending' | 'active' | 'inactive' | 'blocked';
export type MembershipType = 'basic' | 'premium' | 'lifetime';
export type ProfileVisibility = 'public' | 'alumni_only' | 'private';
export type ExitReason = 'resignation' | 'retirement' | 'termination' | 'contract_end' | 'relocation' | 'personal' | 'other';

export interface ContactPreferences {
  allowEmail: boolean;
  allowPhone: boolean;
  allowSMS: boolean;
  allowWhatsApp: boolean;
  newsletterSubscription: boolean;
  eventNotifications: boolean;
  jobAlerts: boolean;
}

export interface Address {
  addressId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
}

export interface AlumniDirectory {
  directoryId: string;
  totalAlumni: number;
  activeAlumni: number;
  lastUpdatedDate: Date;
  categories: AlumniCategory[];
  featuredAlumni: string[]; // Alumni IDs
}

export interface AlumniCategory {
  categoryId: string;
  categoryName: string;
  categoryType: 'department' | 'location' | 'year' | 'designation' | 'industry';
  alumniCount: number;
}

export interface AlumniSearch {
  query: string;
  filters: AlumniSearchFilters;
  results: AlumniProfile[];
  totalResults: number;
  page: number;
  pageSize: number;
}

export interface AlumniSearchFilters {
  department?: string[];
  location?: string[];
  yearRange?: { start: number; end: number };
  currentCompany?: string[];
  currentIndustry?: string[];
  skills?: string[];
  willingToMentor?: boolean;
  openToOpportunities?: boolean;
}

export interface AlumniConnection {
  connectionId: string;
  fromAlumniId: string;
  fromAlumniName: string;
  toAlumniId: string;
  toAlumniName: string;
  connectionStatus: ConnectionStatus;
  connectionDate: Date;
  message?: string;
  commonInterests?: string[];
}

export type ConnectionStatus = 'pending' | 'connected' | 'declined' | 'blocked';

// ============================================================================
// EVENTS & REUNIONS TYPES
// ============================================================================

export interface AlumniEvent {
  eventId: string;
  eventName: string;
  eventType: EventType;
  eventFormat: EventFormat;
  description: string;
  eventDate: Date;
  eventTime: string;
  endDate?: Date;
  endTime?: string;

  // Location
  venue?: Venue;
  virtualLink?: string;

  // Event Details
  eventStatus: EventStatus;
  registrationOpen: boolean;
  registrationStartDate: Date;
  registrationEndDate: Date;
  maxAttendees?: number;
  currentAttendees: number;
  waitlistEnabled: boolean;
  waitlistCount: number;

  // Cost
  isFree: boolean;
  ticketPrice?: number;
  currency?: string;

  // Organizer
  organizer: EventOrganizer;
  coHosts?: string[];
  sponsors?: EventSponsor[];

  // Content
  agenda?: EventAgenda[];
  speakers?: EventSpeaker[];
  tags: string[];
  images?: string[];

  // Registration
  registrations: EventRegistration[];
  attendanceList: EventAttendance[];

  // Engagement
  rsvpCount: number;
  attendedCount: number;
  feedbackCount: number;
  averageRating?: number;

  // Communication
  announcements: EventAnnouncement[];
  reminders: EventReminder[];

  // Metadata
  createdDate: Date;
  createdBy: string;
  createdByName: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  notes?: string;
}

export type EventType =
  | 'reunion'
  | 'networking'
  | 'webinar'
  | 'workshop'
  | 'social'
  | 'fundraiser'
  | 'award_ceremony'
  | 'conference'
  | 'sports'
  | 'other';

export type EventFormat = 'in_person' | 'virtual' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Venue {
  venueId: string;
  venueName: string;
  address: Address;
  capacity?: number;
  facilities?: string[];
  contactPerson?: string;
  contactPhone?: string;
  parkingAvailable?: boolean;
  accessibilityFeatures?: string[];
}

export interface EventOrganizer {
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  organizerRole: string;
}

export interface EventSponsor {
  sponsorId: string;
  sponsorName: string;
  sponsorLogo?: string;
  sponsorLevel: 'platinum' | 'gold' | 'silver' | 'bronze';
  sponsorshipAmount?: number;
  sponsorWebsite?: string;
}

export interface EventAgenda {
  agendaId: string;
  sessionName: string;
  sessionDescription?: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  location?: string;
}

export interface EventSpeaker {
  speakerId: string;
  speakerName: string;
  speakerTitle: string;
  speakerCompany?: string;
  speakerBio?: string;
  speakerPhoto?: string;
  speakerTopic?: string;
}

export interface EventRegistration {
  registrationId: string;
  eventId: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  registrationDate: Date;
  registrationStatus: RegistrationStatus;
  ticketType?: string;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentDate?: Date;
  guestCount: number;
  guestNames?: string[];
  dietaryRestrictions?: string;
  specialRequirements?: string;
  checkInStatus: CheckInStatus;
  checkInTime?: Date;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'waitlist' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type CheckInStatus = 'not_checked_in' | 'checked_in' | 'no_show';

export interface EventAttendance {
  attendanceId: string;
  eventId: string;
  alumniId: string;
  alumniName: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  attended: boolean;
  feedbackSubmitted: boolean;
  feedbackRating?: number;
  feedbackComments?: string;
}

export interface EventAnnouncement {
  announcementId: string;
  announcementTitle: string;
  announcementMessage: string;
  announcementDate: Date;
  announcementType: 'info' | 'update' | 'reminder' | 'urgent';
  targetAudience: 'all' | 'registered' | 'waitlist';
  sentVia: ('email' | 'sms' | 'push')[];
}

export interface EventReminder {
  reminderId: string;
  reminderType: 'registration_open' | 'registration_closing' | 'event_upcoming' | 'event_today';
  scheduledDate: Date;
  sent: boolean;
  sentDate?: Date;
  recipientCount: number;
}

export interface EventFeedback {
  feedbackId: string;
  eventId: string;
  alumniId: string;
  alumniName: string;
  overallRating: number;
  venueRating?: number;
  contentRating?: number;
  organizationRating?: number;
  networkingRating?: number;
  comments?: string;
  suggestions?: string;
  wouldAttendAgain: boolean;
  submittedDate: Date;
}

export interface Reunion {
  reunionId: string;
  reunionName: string;
  batchYear?: number;
  department?: string;
  location?: string;
  eventId: string; // Links to AlumniEvent
  targetAudience: ReunionTargetAudience;
  expectedAttendees: number;
  actualAttendees: number;
  reunionCommittee: ReunionCommitteeMember[];
  budget: ReunionBudget;
  activities: ReunionActivity[];
  memorabilia?: string[];
}

export interface ReunionTargetAudience {
  yearRange?: { start: number; end: number };
  departments?: string[];
  locations?: string[];
  designations?: string[];
}

export interface ReunionCommitteeMember {
  memberId: string;
  memberName: string;
  role: string;
  email: string;
  phone?: string;
}

export interface ReunionBudget {
  totalBudget: number;
  amountCollected: number;
  amountSpent: number;
  remainingBudget: number;
  expenses: BudgetExpense[];
}

export interface BudgetExpense {
  expenseId: string;
  expenseCategory: string;
  expenseDescription: string;
  plannedAmount: number;
  actualAmount?: number;
  status: 'planned' | 'approved' | 'paid';
}

export interface ReunionActivity {
  activityId: string;
  activityName: string;
  activityType: 'ice_breaker' | 'games' | 'dinner' | 'tour' | 'awards' | 'photo_session' | 'other';
  startTime: string;
  endTime: string;
  location?: string;
  responsible: string;
}

// ============================================================================
// ALUMNI JOBS TYPES
// ============================================================================

export interface AlumniJob {
  jobId: string;
  jobTitle: string;
  jobType: JobType;
  jobLevel: JobLevel;

  // Company Details
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  companySize?: CompanySize;
  companyIndustry?: string;

  // Job Details
  jobDescription: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];

  // Location
  workLocation: JobLocation;
  locationCity?: string;
  locationCountry?: string;
  remotePolicy: RemotePolicy;

  // Compensation
  salaryRange?: SalaryRange;
  currency?: string;
  benefits?: string[];

  // Requirements
  experienceRequired: ExperienceRange;
  educationRequired: string[];
  skillsRequired: string[];
  certificationsRequired?: string[];

  // Application
  jobStatus: JobStatus;
  postedDate: Date;
  applicationDeadline?: Date;
  startDate?: Date;
  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  applicationEmail?: string;
  referralContactName?: string;
  referralContactEmail?: string;

  // Posted By
  postedBy: string; // Alumni ID
  postedByName: string;
  postedByEmail: string;
  postedByCompany?: string;
  isReferralAvailable: boolean;

  // Engagement
  viewCount: number;
  applicationCount: number;
  savedCount: number;
  shareCount: number;

  // Applications
  applications: JobApplication[];

  // Metadata
  featured: boolean;
  tags: string[];
  category: string;
  createdDate: Date;
  lastUpdatedDate: Date;
  expiryDate?: Date;
  notes?: string;
}

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type JobLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type JobLocation = 'on_site' | 'remote' | 'hybrid';
export type RemotePolicy = 'fully_remote' | 'hybrid' | 'office_only' | 'flexible';
export type JobStatus = 'draft' | 'active' | 'paused' | 'filled' | 'expired' | 'cancelled';
export type ApplicationMethod = 'url' | 'email' | 'referral' | 'internal';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
}

export interface ExperienceRange {
  min: number;
  max: number;
  unit: 'months' | 'years';
}

export interface JobApplication {
  applicationId: string;
  jobId: string;
  applicantId: string; // Alumni ID
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;

  // Application Details
  applicationDate: Date;
  applicationStatus: ApplicationStatus;
  resume?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;

  // Screening
  screeningQuestions?: ScreeningQuestion[];
  screeningScore?: number;

  // Process
  currentStage?: ApplicationStage;
  stages: ApplicationStageHistory[];

  // Referral
  isReferral: boolean;
  referredBy?: string; // Alumni ID
  referredByName?: string;

  // Interview
  interviews?: Interview[];

  // Offer
  offerExtended: boolean;
  offerDetails?: OfferDetails;

  // Feedback
  rejectionReason?: string;
  feedback?: string;

  // Metadata
  notes?: string;
  lastUpdatedDate: Date;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'rejected'
  | 'withdrawn';

export type ApplicationStage =
  | 'application_received'
  | 'screening'
  | 'technical_assessment'
  | 'phone_interview'
  | 'onsite_interview'
  | 'final_interview'
  | 'reference_check'
  | 'offer'
  | 'closed';

export interface ApplicationStageHistory {
  stageId: string;
  stage: ApplicationStage;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startDate?: Date;
  completionDate?: Date;
  notes?: string;
}

export interface ScreeningQuestion {
  questionId: string;
  question: string;
  answer: string;
  score?: number;
}

export interface Interview {
  interviewId: string;
  interviewType: 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral';
  scheduledDate: Date;
  duration: number; // in minutes
  interviewers: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: InterviewFeedback;
}

export interface InterviewFeedback {
  feedbackId: string;
  interviewerId: string;
  interviewerName: string;
  overallRating: number;
  technicalSkills?: number;
  communication?: number;
  problemSolving?: number;
  culturalFit?: number;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  comments: string;
  submittedDate: Date;
}

export interface OfferDetails {
  offerId: string;
  offerDate: Date;
  offerExpiry: Date;
  salary: number;
  currency: string;
  joiningDate: Date;
  benefits: string[];
  offerStatus: 'pending' | 'accepted' | 'declined' | 'negotiating';
  acceptedDate?: Date;
  declinedDate?: Date;
  declineReason?: string;
}

export interface JobAlert {
  alertId: string;
  alumniId: string;
  alertName: string;
  criteria: JobSearchCriteria;
  frequency: 'instant' | 'daily' | 'weekly';
  lastSent?: Date;
  isActive: boolean;
  createdDate: Date;
}

export interface JobSearchCriteria {
  keywords?: string[];
  jobTypes?: JobType[];
  jobLevels?: JobLevel[];
  locations?: string[];
  remoteOnly?: boolean;
  salaryMin?: number;
  industries?: string[];
  companies?: string[];
}

export interface JobSaved {
  savedId: string;
  jobId: string;
  alumniId: string;
  savedDate: Date;
  notes?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AlumniNetworkAnalytics {
  // Directory Analytics
  totalAlumni: number;
  activeAlumni: number;
  newAlumniThisMonth: number;
  alumniByDepartment: { department: string; count: number }[];
  alumniByLocation: { location: string; count: number }[];
  alumniByYear: { year: number; count: number }[];
  alumniByCurrentIndustry: { industry: string; count: number }[];

  // Events Analytics
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  averageAttendanceRate: number;
  eventsByType: { type: string; count: number }[];
  topRatedEvents: { eventId: string; eventName: string; rating: number }[];

  // Jobs Analytics
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  averageApplicationsPerJob: number;
  jobsByType: { type: string; count: number }[];
  jobsByIndustry: { industry: string; count: number }[];
  placementRate: number;

  // Engagement Analytics
  activeUsers: number;
  totalConnections: number;
  totalMentoringSessions: number;
  totalReferrals: number;
  engagementRate: number;

  // Growth Metrics
  monthlyGrowth: { month: string; alumni: number; events: number; jobs: number }[];
}

export interface AlumniEngagement {
  alumniId: string;
  alumniName: string;
  engagementScore: number;
  lastActivityDate: Date;
  profileViews: number;
  eventsAttended: number;
  jobsPosted: number;
  applicationsSubmitted: number;
  connectionsCount: number;
  referralsGiven: number;
  mentoringSessions: number;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface AlumniNetworkSettings {
  settingsId: string;

  // General Settings
  networkName: string;
  networkDescription: string;
  networkLogo?: string;
  contactEmail: string;
  contactPhone?: string;

  // Directory Settings
  directorySettings: {
    enablePublicDirectory: boolean;
    requireApprovalForMembership: boolean;
    allowSelfRegistration: boolean;
    defaultProfileVisibility: ProfileVisibility;
    allowProfileEditing: boolean;
    mandatoryFields: string[];
  };

  // Events Settings
  eventsSettings: {
    enableEvents: boolean;
    requireEventApproval: boolean;
    allowAlumniToCreateEvents: boolean;
    defaultEventFormat: EventFormat;
    enableEventPayments: boolean;
    paymentGateway?: string;
    enableWaitlist: boolean;
    sendEventReminders: boolean;
    reminderDaysBefore: number[];
  };

  // Jobs Settings
  jobsSettings: {
    enableJobs: boolean;
    requireJobApproval: boolean;
    allowAlumniToPostJobs: boolean;
    jobPostingDurationDays: number;
    enableJobApplications: boolean;
    enableJobAlerts: boolean;
    moderateJobPosts: boolean;
  };

  // Communication Settings
  communicationSettings: {
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enablePushNotifications: boolean;
    newsletterFrequency: 'weekly' | 'monthly' | 'quarterly';
    allowDirectMessaging: boolean;
  };

  // Privacy Settings
  privacySettings: {
    dataRetentionPeriod: number; // in years
    allowDataExport: boolean;
    requireConsentForCommunication: boolean;
    gdprCompliant: boolean;
  };

  // Integration Settings
  integrationSettings: {
    linkedInIntegration: boolean;
    emailMarketingIntegration: boolean;
    paymentGatewayIntegration: boolean;
    analyticsIntegration: boolean;
  };

  // Metadata
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
}
