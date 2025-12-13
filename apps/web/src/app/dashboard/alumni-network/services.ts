// Alumni Network Module - Service Layer
// TODO: Replace localStorage with actual API calls

import type {
  AlumniProfile,
  AlumniDirectory,
  AlumniSearch,
  AlumniSearchFilters,
  AlumniConnection,
  AlumniEvent,
  EventRegistration,
  EventAttendance,
  EventFeedback,
  Reunion,
  AlumniJob,
  JobApplication,
  JobAlert,
  JobSaved,
  JobSearchCriteria,
  AlumniNetworkAnalytics,
  AlumniEngagement,
  AlumniNetworkSettings,
  AlumniStatus,
  ConnectionStatus,
  EventStatus,
  RegistrationStatus,
  ApplicationStatus,
} from './types';

import {
  sampleAlumniProfiles,
  sampleAlumniDirectory,
  sampleAlumniEvents,
  sampleReunions,
  sampleAlumniJobs,
  sampleAlumniNetworkAnalytics,
  sampleAlumniNetworkSettings,
} from './data';

// ============================================================================
// ALUMNI DIRECTORY SERVICE
// ============================================================================

export class AlumniDirectoryService {
  private static STORAGE_KEY_PROFILES = 'alumni_profiles';
  private static STORAGE_KEY_DIRECTORY = 'alumni_directory';
  private static STORAGE_KEY_CONNECTIONS = 'alumni_connections';

  // Initialize data
  static {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.STORAGE_KEY_PROFILES)) {
        localStorage.setItem(this.STORAGE_KEY_PROFILES, JSON.stringify(sampleAlumniProfiles));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_DIRECTORY)) {
        localStorage.setItem(this.STORAGE_KEY_DIRECTORY, JSON.stringify(sampleAlumniDirectory));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_CONNECTIONS)) {
        localStorage.setItem(this.STORAGE_KEY_CONNECTIONS, JSON.stringify([]));
      }
    }
  }

  // Alumni Profile Methods
  static async getAllAlumniProfiles(): Promise<AlumniProfile[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_PROFILES);
    return data ? JSON.parse(data) : [];
  }

  static async getAlumniProfileById(alumniId: string): Promise<AlumniProfile> {
    // TODO: Replace with API call
    const profiles = await this.getAllAlumniProfiles();
    const profile = profiles.find((p) => p.alumniId === alumniId);
    if (!profile) throw new Error(`Alumni profile not found: ${alumniId}`);
    return profile;
  }

  static async createAlumniProfile(profile: Partial<AlumniProfile>): Promise<AlumniProfile> {
    // TODO: Replace with API call
    const profiles = await this.getAllAlumniProfiles();
    const newProfile: AlumniProfile = {
      alumniId: `alumni-${Date.now()}`,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      fullName: `${profile.firstName} ${profile.lastName}`,
      email: profile.email || '',
      phone: profile.phone,
      profilePicture: profile.profilePicture,
      dateJoined: profile.dateJoined || new Date(),
      dateLeft: profile.dateLeft || new Date(),
      tenure: profile.tenure || 0,
      lastDesignation: profile.lastDesignation || '',
      lastDepartment: profile.lastDepartment || '',
      lastLocation: profile.lastLocation || '',
      lastManager: profile.lastManager,
      reasonForLeaving: profile.reasonForLeaving,
      currentCompany: profile.currentCompany,
      currentDesignation: profile.currentDesignation,
      currentLocation: profile.currentLocation,
      currentIndustry: profile.currentIndustry,
      linkedInProfile: profile.linkedInProfile,
      personalWebsite: profile.personalWebsite,
      alumniStatus: profile.alumniStatus || 'pending',
      membershipType: profile.membershipType || 'basic',
      joinedAlumniNetworkDate: profile.joinedAlumniNetworkDate,
      lastActiveDate: profile.lastActiveDate,
      profileVisibility: profile.profileVisibility || 'alumni_only',
      willingToMentor: profile.willingToMentor || false,
      openToOpportunities: profile.openToOpportunities || false,
      openToReferrals: profile.openToReferrals || false,
      interests: profile.interests || [],
      skills: profile.skills || [],
      eventsAttended: profile.eventsAttended || 0,
      jobsPosted: profile.jobsPosted || 0,
      referralsGiven: profile.referralsGiven || 0,
      mentoringSessions: profile.mentoringSessions || 0,
      contactPreferences: profile.contactPreferences || {
        allowEmail: true,
        allowPhone: false,
        allowSMS: false,
        allowWhatsApp: false,
        newsletterSubscription: true,
        eventNotifications: true,
        jobAlerts: true,
      },
      address: profile.address,
      socialMedia: profile.socialMedia,
      bio: profile.bio,
      achievements: profile.achievements,
      createdDate: new Date(),
      createdBy: 'system',
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'system',
      notes: profile.notes,
    };

    profiles.push(newProfile);
    localStorage.setItem(this.STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    return newProfile;
  }

  static async updateAlumniProfile(
    alumniId: string,
    updates: Partial<AlumniProfile>
  ): Promise<AlumniProfile> {
    // TODO: Replace with API call
    const profiles = await this.getAllAlumniProfiles();
    const index = profiles.findIndex((p) => p.alumniId === alumniId);
    if (index === -1) throw new Error(`Alumni profile not found: ${alumniId}`);

    const updatedProfile = {
      ...profiles[index],
      ...updates,
      lastUpdatedDate: new Date(),
    };

    profiles[index] = updatedProfile;
    localStorage.setItem(this.STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    return updatedProfile;
  }

  static async deleteAlumniProfile(alumniId: string): Promise<void> {
    // TODO: Replace with API call
    const profiles = await this.getAllAlumniProfiles();
    const filtered = profiles.filter((p) => p.alumniId !== alumniId);
    localStorage.setItem(this.STORAGE_KEY_PROFILES, JSON.stringify(filtered));
  }

  static async updateAlumniStatus(alumniId: string, status: AlumniStatus): Promise<AlumniProfile> {
    return this.updateAlumniProfile(alumniId, { alumniStatus: status });
  }

  // Directory Methods
  static async getAlumniDirectory(): Promise<AlumniDirectory> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_DIRECTORY);
    return data ? JSON.parse(data) : sampleAlumniDirectory;
  }

  // Search Methods
  static async searchAlumni(
    query: string,
    filters: AlumniSearchFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<AlumniSearch> {
    // TODO: Replace with API call
    const profiles = await this.getAllAlumniProfiles();
    let filtered = profiles.filter((p) => p.alumniStatus === 'active');

    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(lowerQuery) ||
          p.email.toLowerCase().includes(lowerQuery) ||
          p.lastDepartment?.toLowerCase().includes(lowerQuery) ||
          p.currentCompany?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply filters
    if (filters.department && filters.department.length > 0) {
      filtered = filtered.filter((p) => filters.department!.includes(p.lastDepartment));
    }

    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter((p) => filters.location!.includes(p.lastLocation));
    }

    if (filters.currentCompany && filters.currentCompany.length > 0) {
      filtered = filtered.filter((p) => p.currentCompany && filters.currentCompany!.includes(p.currentCompany));
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter((p) => filters.skills!.some((skill) => p.skills.includes(skill)));
    }

    if (filters.willingToMentor !== undefined) {
      filtered = filtered.filter((p) => p.willingToMentor === filters.willingToMentor);
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const paginatedResults = filtered.slice(start, start + pageSize);

    return {
      query,
      filters,
      results: paginatedResults,
      totalResults: filtered.length,
      page,
      pageSize,
    };
  }

  // Connection Methods
  static async getAllConnections(): Promise<AlumniConnection[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_CONNECTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getConnectionsByAlumniId(alumniId: string): Promise<AlumniConnection[]> {
    const connections = await this.getAllConnections();
    return connections.filter((c) => c.fromAlumniId === alumniId || c.toAlumniId === alumniId);
  }

  static async createConnection(
    fromAlumniId: string,
    toAlumniId: string,
    message?: string
  ): Promise<AlumniConnection> {
    // TODO: Replace with API call
    const connections = await this.getAllConnections();
    const fromProfile = await this.getAlumniProfileById(fromAlumniId);
    const toProfile = await this.getAlumniProfileById(toAlumniId);

    const newConnection: AlumniConnection = {
      connectionId: `conn-${Date.now()}`,
      fromAlumniId,
      fromAlumniName: fromProfile.fullName,
      toAlumniId,
      toAlumniName: toProfile.fullName,
      connectionStatus: 'pending',
      connectionDate: new Date(),
      message,
    };

    connections.push(newConnection);
    localStorage.setItem(this.STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    return newConnection;
  }

  static async updateConnectionStatus(
    connectionId: string,
    status: ConnectionStatus
  ): Promise<AlumniConnection> {
    // TODO: Replace with API call
    const connections = await this.getAllConnections();
    const index = connections.findIndex((c) => c.connectionId === connectionId);
    if (index === -1) throw new Error(`Connection not found: ${connectionId}`);

    connections[index].connectionStatus = status;
    localStorage.setItem(this.STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    return connections[index];
  }
}

// ============================================================================
// EVENTS SERVICE
// ============================================================================

export class EventsService {
  private static STORAGE_KEY_EVENTS = 'alumni_events';
  private static STORAGE_KEY_REUNIONS = 'alumni_reunions';

  // Initialize data
  static {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.STORAGE_KEY_EVENTS)) {
        localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(sampleAlumniEvents));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_REUNIONS)) {
        localStorage.setItem(this.STORAGE_KEY_REUNIONS, JSON.stringify(sampleReunions));
      }
    }
  }

  // Event Methods
  static async getAllEvents(): Promise<AlumniEvent[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getEventById(eventId: string): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const events = await this.getAllEvents();
    const event = events.find((e) => e.eventId === eventId);
    if (!event) throw new Error(`Event not found: ${eventId}`);
    return event;
  }

  static async createEvent(event: Partial<AlumniEvent>): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const events = await this.getAllEvents();
    const newEvent: AlumniEvent = {
      eventId: `event-${Date.now()}`,
      eventName: event.eventName || '',
      eventType: event.eventType || 'networking',
      eventFormat: event.eventFormat || 'in_person',
      description: event.description || '',
      eventDate: event.eventDate || new Date(),
      eventTime: event.eventTime || '09:00',
      endDate: event.endDate,
      endTime: event.endTime,
      venue: event.venue,
      virtualLink: event.virtualLink,
      eventStatus: event.eventStatus || 'draft',
      registrationOpen: event.registrationOpen || false,
      registrationStartDate: event.registrationStartDate || new Date(),
      registrationEndDate: event.registrationEndDate || new Date(),
      maxAttendees: event.maxAttendees,
      currentAttendees: 0,
      waitlistEnabled: event.waitlistEnabled || false,
      waitlistCount: 0,
      isFree: event.isFree || true,
      ticketPrice: event.ticketPrice,
      currency: event.currency || 'USD',
      organizer: event.organizer || {
        organizerId: 'org-001',
        organizerName: 'Alumni Relations',
        organizerEmail: 'alumni@company.com',
        organizerRole: 'Alumni Coordinator',
      },
      coHosts: event.coHosts || [],
      sponsors: event.sponsors || [],
      agenda: event.agenda || [],
      speakers: event.speakers || [],
      tags: event.tags || [],
      images: event.images || [],
      registrations: [],
      attendanceList: [],
      rsvpCount: 0,
      attendedCount: 0,
      feedbackCount: 0,
      announcements: [],
      reminders: [],
      createdDate: new Date(),
      createdBy: 'current-user',
      createdByName: 'Current User',
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
      lastUpdatedByName: 'Current User',
      notes: event.notes,
    };

    events.push(newEvent);
    localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(events));
    return newEvent;
  }

  static async updateEvent(eventId: string, updates: Partial<AlumniEvent>): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const events = await this.getAllEvents();
    const index = events.findIndex((e) => e.eventId === eventId);
    if (index === -1) throw new Error(`Event not found: ${eventId}`);

    const updatedEvent = {
      ...events[index],
      ...updates,
      lastUpdatedDate: new Date(),
    };

    events[index] = updatedEvent;
    localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(events));
    return updatedEvent;
  }

  static async deleteEvent(eventId: string): Promise<void> {
    // TODO: Replace with API call
    const events = await this.getAllEvents();
    const filtered = events.filter((e) => e.eventId !== eventId);
    localStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(filtered));
  }

  static async updateEventStatus(eventId: string, status: EventStatus): Promise<AlumniEvent> {
    return this.updateEvent(eventId, { eventStatus: status });
  }

  // Registration Methods
  static async registerForEvent(
    eventId: string,
    alumniId: string,
    registration: Partial<EventRegistration>
  ): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const event = await this.getEventById(eventId);
    const alumniProfile = await AlumniDirectoryService.getAlumniProfileById(alumniId);

    const newRegistration: EventRegistration = {
      registrationId: `reg-${Date.now()}`,
      eventId,
      alumniId,
      alumniName: alumniProfile.fullName,
      alumniEmail: alumniProfile.email,
      registrationDate: new Date(),
      registrationStatus: 'confirmed',
      paymentStatus: event.isFree ? 'paid' : 'pending',
      paymentAmount: event.ticketPrice || 0,
      guestCount: registration.guestCount || 0,
      guestNames: registration.guestNames || [],
      dietaryRestrictions: registration.dietaryRestrictions,
      specialRequirements: registration.specialRequirements,
      checkInStatus: 'not_checked_in',
    };

    event.registrations.push(newRegistration);
    event.currentAttendees += 1 + (registration.guestCount || 0);
    event.rsvpCount += 1;

    return this.updateEvent(eventId, {
      registrations: event.registrations,
      currentAttendees: event.currentAttendees,
      rsvpCount: event.rsvpCount,
    });
  }

  static async cancelRegistration(eventId: string, registrationId: string): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const event = await this.getEventById(eventId);
    const registration = event.registrations.find((r) => r.registrationId === registrationId);
    if (!registration) throw new Error(`Registration not found: ${registrationId}`);

    registration.registrationStatus = 'cancelled';
    event.currentAttendees -= 1 + (registration.guestCount || 0);
    event.rsvpCount -= 1;

    return this.updateEvent(eventId, {
      registrations: event.registrations,
      currentAttendees: event.currentAttendees,
      rsvpCount: event.rsvpCount,
    });
  }

  static async checkInAttendee(eventId: string, registrationId: string): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const event = await this.getEventById(eventId);
    const registration = event.registrations.find((r) => r.registrationId === registrationId);
    if (!registration) throw new Error(`Registration not found: ${registrationId}`);

    registration.checkInStatus = 'checked_in';
    registration.checkInTime = new Date();

    const attendance: EventAttendance = {
      attendanceId: `att-${Date.now()}`,
      eventId,
      alumniId: registration.alumniId,
      alumniName: registration.alumniName,
      checkInTime: new Date(),
      attended: true,
      feedbackSubmitted: false,
    };

    event.attendanceList.push(attendance);
    event.attendedCount += 1;

    return this.updateEvent(eventId, {
      registrations: event.registrations,
      attendanceList: event.attendanceList,
      attendedCount: event.attendedCount,
    });
  }

  static async submitEventFeedback(
    eventId: string,
    alumniId: string,
    feedback: EventFeedback
  ): Promise<AlumniEvent> {
    // TODO: Replace with API call
    const event = await this.getEventById(eventId);
    const attendance = event.attendanceList.find((a) => a.alumniId === alumniId);
    if (!attendance) throw new Error(`Attendance not found for alumni: ${alumniId}`);

    attendance.feedbackSubmitted = true;
    attendance.feedbackRating = feedback.overallRating;
    attendance.feedbackComments = feedback.comments;

    event.feedbackCount += 1;

    // Calculate average rating
    const totalRating = event.attendanceList.reduce((sum, a) => sum + (a.feedbackRating || 0), 0);
    event.averageRating = totalRating / event.feedbackCount;

    return this.updateEvent(eventId, {
      attendanceList: event.attendanceList,
      feedbackCount: event.feedbackCount,
      averageRating: event.averageRating,
    });
  }

  // Reunion Methods
  static async getAllReunions(): Promise<Reunion[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_REUNIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getReunionById(reunionId: string): Promise<Reunion> {
    // TODO: Replace with API call
    const reunions = await this.getAllReunions();
    const reunion = reunions.find((r) => r.reunionId === reunionId);
    if (!reunion) throw new Error(`Reunion not found: ${reunionId}`);
    return reunion;
  }

  static async createReunion(reunion: Partial<Reunion>): Promise<Reunion> {
    // TODO: Replace with API call
    const reunions = await this.getAllReunions();
    const newReunion: Reunion = {
      reunionId: `reunion-${Date.now()}`,
      reunionName: reunion.reunionName || '',
      batchYear: reunion.batchYear,
      department: reunion.department,
      location: reunion.location,
      eventId: reunion.eventId || '',
      targetAudience: reunion.targetAudience || {},
      expectedAttendees: reunion.expectedAttendees || 0,
      actualAttendees: reunion.actualAttendees || 0,
      reunionCommittee: reunion.reunionCommittee || [],
      budget: reunion.budget || {
        totalBudget: 0,
        amountCollected: 0,
        amountSpent: 0,
        remainingBudget: 0,
        expenses: [],
      },
      activities: reunion.activities || [],
      memorabilia: reunion.memorabilia || [],
    };

    reunions.push(newReunion);
    localStorage.setItem(this.STORAGE_KEY_REUNIONS, JSON.stringify(reunions));
    return newReunion;
  }

  static async updateReunion(reunionId: string, updates: Partial<Reunion>): Promise<Reunion> {
    // TODO: Replace with API call
    const reunions = await this.getAllReunions();
    const index = reunions.findIndex((r) => r.reunionId === reunionId);
    if (index === -1) throw new Error(`Reunion not found: ${reunionId}`);

    const updatedReunion = {
      ...reunions[index],
      ...updates,
    };

    reunions[index] = updatedReunion;
    localStorage.setItem(this.STORAGE_KEY_REUNIONS, JSON.stringify(reunions));
    return updatedReunion;
  }
}

// ============================================================================
// JOBS SERVICE
// ============================================================================

export class JobsService {
  private static STORAGE_KEY_JOBS = 'alumni_jobs';
  private static STORAGE_KEY_ALERTS = 'alumni_job_alerts';
  private static STORAGE_KEY_SAVED = 'alumni_saved_jobs';

  // Initialize data
  static {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.STORAGE_KEY_JOBS)) {
        localStorage.setItem(this.STORAGE_KEY_JOBS, JSON.stringify(sampleAlumniJobs));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_ALERTS)) {
        localStorage.setItem(this.STORAGE_KEY_ALERTS, JSON.stringify([]));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_SAVED)) {
        localStorage.setItem(this.STORAGE_KEY_SAVED, JSON.stringify([]));
      }
    }
  }

  // Job Methods
  static async getAllJobs(): Promise<AlumniJob[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_JOBS);
    return data ? JSON.parse(data) : [];
  }

  static async getJobById(jobId: string): Promise<AlumniJob> {
    // TODO: Replace with API call
    const jobs = await this.getAllJobs();
    const job = jobs.find((j) => j.jobId === jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    return job;
  }

  static async createJob(job: Partial<AlumniJob>): Promise<AlumniJob> {
    // TODO: Replace with API call
    const jobs = await this.getAllJobs();
    const newJob: AlumniJob = {
      jobId: `job-${Date.now()}`,
      jobTitle: job.jobTitle || '',
      jobType: job.jobType || 'full_time',
      jobLevel: job.jobLevel || 'mid',
      companyName: job.companyName || '',
      companyLogo: job.companyLogo,
      companyWebsite: job.companyWebsite,
      companySize: job.companySize,
      companyIndustry: job.companyIndustry,
      jobDescription: job.jobDescription || '',
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      niceToHave: job.niceToHave || [],
      workLocation: job.workLocation || 'on_site',
      locationCity: job.locationCity,
      locationCountry: job.locationCountry,
      remotePolicy: job.remotePolicy || 'office_only',
      salaryRange: job.salaryRange,
      currency: job.currency || 'USD',
      benefits: job.benefits || [],
      experienceRequired: job.experienceRequired || { min: 0, max: 5, unit: 'years' },
      educationRequired: job.educationRequired || [],
      skillsRequired: job.skillsRequired || [],
      certificationsRequired: job.certificationsRequired || [],
      jobStatus: job.jobStatus || 'draft',
      postedDate: new Date(),
      applicationDeadline: job.applicationDeadline,
      startDate: job.startDate,
      applicationMethod: job.applicationMethod || 'email',
      applicationUrl: job.applicationUrl,
      applicationEmail: job.applicationEmail,
      referralContactName: job.referralContactName,
      referralContactEmail: job.referralContactEmail,
      postedBy: job.postedBy || 'current-user',
      postedByName: job.postedByName || 'Current User',
      postedByEmail: job.postedByEmail || 'user@company.com',
      postedByCompany: job.postedByCompany,
      isReferralAvailable: job.isReferralAvailable || false,
      viewCount: 0,
      applicationCount: 0,
      savedCount: 0,
      shareCount: 0,
      applications: [],
      featured: job.featured || false,
      tags: job.tags || [],
      category: job.category || 'Technology',
      createdDate: new Date(),
      lastUpdatedDate: new Date(),
      expiryDate: job.expiryDate,
      notes: job.notes,
    };

    jobs.push(newJob);
    localStorage.setItem(this.STORAGE_KEY_JOBS, JSON.stringify(jobs));
    return newJob;
  }

  static async updateJob(jobId: string, updates: Partial<AlumniJob>): Promise<AlumniJob> {
    // TODO: Replace with API call
    const jobs = await this.getAllJobs();
    const index = jobs.findIndex((j) => j.jobId === jobId);
    if (index === -1) throw new Error(`Job not found: ${jobId}`);

    const updatedJob = {
      ...jobs[index],
      ...updates,
      lastUpdatedDate: new Date(),
    };

    jobs[index] = updatedJob;
    localStorage.setItem(this.STORAGE_KEY_JOBS, JSON.stringify(jobs));
    return updatedJob;
  }

  static async deleteJob(jobId: string): Promise<void> {
    // TODO: Replace with API call
    const jobs = await this.getAllJobs();
    const filtered = jobs.filter((j) => j.jobId !== jobId);
    localStorage.setItem(this.STORAGE_KEY_JOBS, JSON.stringify(filtered));
  }

  // Application Methods
  static async applyForJob(
    jobId: string,
    alumniId: string,
    application: Partial<JobApplication>
  ): Promise<AlumniJob> {
    // TODO: Replace with API call
    const job = await this.getJobById(jobId);
    const alumniProfile = await AlumniDirectoryService.getAlumniProfileById(alumniId);

    const newApplication: JobApplication = {
      applicationId: `app-${Date.now()}`,
      jobId,
      applicantId: alumniId,
      applicantName: alumniProfile.fullName,
      applicantEmail: alumniProfile.email,
      applicantPhone: alumniProfile.phone,
      applicationDate: new Date(),
      applicationStatus: 'submitted',
      resume: application.resume,
      coverLetter: application.coverLetter,
      portfolioUrl: application.portfolioUrl,
      linkedInUrl: application.linkedInUrl || alumniProfile.linkedInProfile,
      screeningQuestions: application.screeningQuestions || [],
      stages: [
        {
          stageId: `stage-${Date.now()}`,
          stage: 'application_received',
          status: 'completed',
          startDate: new Date(),
          completionDate: new Date(),
        },
      ],
      isReferral: application.isReferral || false,
      referredBy: application.referredBy,
      referredByName: application.referredByName,
      interviews: [],
      offerExtended: false,
      lastUpdatedDate: new Date(),
    };

    job.applications.push(newApplication);
    job.applicationCount += 1;

    return this.updateJob(jobId, {
      applications: job.applications,
      applicationCount: job.applicationCount,
    });
  }

  static async updateApplicationStatus(
    jobId: string,
    applicationId: string,
    status: ApplicationStatus
  ): Promise<AlumniJob> {
    // TODO: Replace with API call
    const job = await this.getJobById(jobId);
    const application = job.applications.find((a) => a.applicationId === applicationId);
    if (!application) throw new Error(`Application not found: ${applicationId}`);

    application.applicationStatus = status;
    application.lastUpdatedDate = new Date();

    return this.updateJob(jobId, { applications: job.applications });
  }

  // Job Alert Methods
  static async createJobAlert(alumniId: string, alert: Partial<JobAlert>): Promise<JobAlert> {
    // TODO: Replace with API call
    const alerts = await this.getJobAlertsByAlumniId(alumniId);
    const newAlert: JobAlert = {
      alertId: `alert-${Date.now()}`,
      alumniId,
      alertName: alert.alertName || 'Job Alert',
      criteria: alert.criteria || {},
      frequency: alert.frequency || 'daily',
      isActive: true,
      createdDate: new Date(),
    };

    alerts.push(newAlert);
    localStorage.setItem(this.STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    return newAlert;
  }

  static async getJobAlertsByAlumniId(alumniId: string): Promise<JobAlert[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_ALERTS);
    const alerts: JobAlert[] = data ? JSON.parse(data) : [];
    return alerts.filter((a) => a.alumniId === alumniId);
  }

  // Saved Jobs Methods
  static async saveJob(jobId: string, alumniId: string, notes?: string): Promise<JobSaved> {
    // TODO: Replace with API call
    const savedJobs = await this.getSavedJobsByAlumniId(alumniId);
    const newSaved: JobSaved = {
      savedId: `saved-${Date.now()}`,
      jobId,
      alumniId,
      savedDate: new Date(),
      notes,
    };

    savedJobs.push(newSaved);
    localStorage.setItem(this.STORAGE_KEY_SAVED, JSON.stringify(savedJobs));

    // Update job saved count
    const job = await this.getJobById(jobId);
    await this.updateJob(jobId, { savedCount: job.savedCount + 1 });

    return newSaved;
  }

  static async getSavedJobsByAlumniId(alumniId: string): Promise<JobSaved[]> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_SAVED);
    const saved: JobSaved[] = data ? JSON.parse(data) : [];
    return saved.filter((s) => s.alumniId === alumniId);
  }

  static async unsaveJob(savedId: string): Promise<void> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY_SAVED);
    const saved: JobSaved[] = data ? JSON.parse(data) : [];
    const filtered = saved.filter((s) => s.savedId !== savedId);
    localStorage.setItem(this.STORAGE_KEY_SAVED, JSON.stringify(filtered));
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AlumniAnalyticsService {
  static async getAnalytics(): Promise<AlumniNetworkAnalytics> {
    // TODO: Replace with API call
    return sampleAlumniNetworkAnalytics;
  }

  static async getAlumniEngagement(alumniId: string): Promise<AlumniEngagement> {
    // TODO: Replace with API call
    const profile = await AlumniDirectoryService.getAlumniProfileById(alumniId);
    return {
      alumniId,
      alumniName: profile.fullName,
      engagementScore: 85,
      lastActivityDate: profile.lastActiveDate || new Date(),
      profileViews: 150,
      eventsAttended: profile.eventsAttended,
      jobsPosted: profile.jobsPosted,
      applicationsSubmitted: 5,
      connectionsCount: 45,
      referralsGiven: profile.referralsGiven,
      mentoringSessions: profile.mentoringSessions,
    };
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AlumniSettingsService {
  private static STORAGE_KEY = 'alumni_network_settings';

  // Initialize data
  static {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleAlumniNetworkSettings));
      }
    }
  }

  static async getSettings(): Promise<AlumniNetworkSettings> {
    // TODO: Replace with API call
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : sampleAlumniNetworkSettings;
  }

  static async updateSettings(updates: Partial<AlumniNetworkSettings>): Promise<AlumniNetworkSettings> {
    // TODO: Replace with API call
    const settings = await this.getSettings();
    const updatedSettings = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  }
}
