// Alumni Network Module - Service Layer

import { APIClient } from '@/lib/api-client';
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

// ============================================================================
// ALUMNI DIRECTORY SERVICE
// ============================================================================

export class AlumniDirectoryService {
  private static profilesEndpoint = '/alumni-network/profiles';
  private static directoryEndpoint = '/alumni-network/directory';
  private static connectionsEndpoint = '/alumni-network/connections';

  // Alumni Profile Methods
  static async getAllAlumniProfiles(): Promise<AlumniProfile[]> {
    return APIClient.get<AlumniProfile[]>(this.profilesEndpoint);
  }

  static async getAlumniProfileById(alumniId: string): Promise<AlumniProfile> {
    return APIClient.get<AlumniProfile>(`${this.profilesEndpoint}/${alumniId}`);
  }

  static async createAlumniProfile(profile: Partial<AlumniProfile>): Promise<AlumniProfile> {
    return APIClient.post<AlumniProfile>(this.profilesEndpoint, profile);
  }

  static async updateAlumniProfile(alumniId: string, updates: Partial<AlumniProfile>): Promise<AlumniProfile> {
    return APIClient.put<AlumniProfile>(`${this.profilesEndpoint}/${alumniId}`, updates);
  }

  static async deleteAlumniProfile(alumniId: string): Promise<void> {
    return APIClient.delete<void>(`${this.profilesEndpoint}/${alumniId}`);
  }

  static async updateAlumniStatus(alumniId: string, status: AlumniStatus): Promise<AlumniProfile> {
    return APIClient.put<AlumniProfile>(`${this.profilesEndpoint}/${alumniId}/status`, { status });
  }

  // Directory Methods
  static async getAlumniDirectory(): Promise<AlumniDirectory> {
    return APIClient.get<AlumniDirectory>(this.directoryEndpoint);
  }

  // Search Methods
  static async searchAlumni(
    query: string,
    filters: AlumniSearchFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<AlumniSearch> {
    return APIClient.get<AlumniSearch>(`${this.profilesEndpoint}/search`, { query, filters, page, pageSize });
  }

  // Connection Methods
  static async getAllConnections(): Promise<AlumniConnection[]> {
    return APIClient.get<AlumniConnection[]>(this.connectionsEndpoint);
  }

  static async getConnectionsByAlumniId(alumniId: string): Promise<AlumniConnection[]> {
    return APIClient.get<AlumniConnection[]>(this.connectionsEndpoint, { alumniId });
  }

  static async createConnection(fromAlumniId: string, toAlumniId: string, message?: string): Promise<AlumniConnection> {
    return APIClient.post<AlumniConnection>(this.connectionsEndpoint, { fromAlumniId, toAlumniId, message });
  }

  static async updateConnectionStatus(connectionId: string, status: ConnectionStatus): Promise<AlumniConnection> {
    return APIClient.put<AlumniConnection>(`${this.connectionsEndpoint}/${connectionId}/status`, { status });
  }
}

// ============================================================================
// EVENTS SERVICE
// ============================================================================

export class EventsService {
  private static eventsEndpoint = '/alumni-network/events';
  private static reunionsEndpoint = '/alumni-network/reunions';

  // Event Methods
  static async getAllEvents(): Promise<AlumniEvent[]> {
    return APIClient.get<AlumniEvent[]>(this.eventsEndpoint);
  }

  static async getEventById(eventId: string): Promise<AlumniEvent> {
    return APIClient.get<AlumniEvent>(`${this.eventsEndpoint}/${eventId}`);
  }

  static async createEvent(event: Partial<AlumniEvent>): Promise<AlumniEvent> {
    return APIClient.post<AlumniEvent>(this.eventsEndpoint, event);
  }

  static async updateEvent(eventId: string, updates: Partial<AlumniEvent>): Promise<AlumniEvent> {
    return APIClient.put<AlumniEvent>(`${this.eventsEndpoint}/${eventId}`, updates);
  }

  static async deleteEvent(eventId: string): Promise<void> {
    return APIClient.delete<void>(`${this.eventsEndpoint}/${eventId}`);
  }

  static async updateEventStatus(eventId: string, status: EventStatus): Promise<AlumniEvent> {
    return APIClient.put<AlumniEvent>(`${this.eventsEndpoint}/${eventId}/status`, { status });
  }

  // Registration Methods
  static async registerForEvent(
    eventId: string,
    alumniId: string,
    registration: Partial<EventRegistration>
  ): Promise<AlumniEvent> {
    return APIClient.post<AlumniEvent>(`${this.eventsEndpoint}/${eventId}/register`, { alumniId, registration });
  }

  static async cancelRegistration(eventId: string, registrationId: string): Promise<AlumniEvent> {
    return APIClient.delete<AlumniEvent>(`${this.eventsEndpoint}/${eventId}/registrations/${registrationId}`);
  }

  static async checkInAttendee(eventId: string, registrationId: string): Promise<AlumniEvent> {
    return APIClient.post<AlumniEvent>(`${this.eventsEndpoint}/${eventId}/check-in/${registrationId}`, {});
  }

  static async submitEventFeedback(eventId: string, alumniId: string, feedback: EventFeedback): Promise<AlumniEvent> {
    return APIClient.post<AlumniEvent>(`${this.eventsEndpoint}/${eventId}/feedback`, { alumniId, feedback });
  }

  // Reunion Methods
  static async getAllReunions(): Promise<Reunion[]> {
    return APIClient.get<Reunion[]>(this.reunionsEndpoint);
  }

  static async getReunionById(reunionId: string): Promise<Reunion> {
    return APIClient.get<Reunion>(`${this.reunionsEndpoint}/${reunionId}`);
  }

  static async createReunion(reunion: Partial<Reunion>): Promise<Reunion> {
    return APIClient.post<Reunion>(this.reunionsEndpoint, reunion);
  }

  static async updateReunion(reunionId: string, updates: Partial<Reunion>): Promise<Reunion> {
    return APIClient.put<Reunion>(`${this.reunionsEndpoint}/${reunionId}`, updates);
  }
}

// ============================================================================
// JOBS SERVICE
// ============================================================================

export class JobsService {
  private static jobsEndpoint = '/alumni-network/jobs';
  private static alertsEndpoint = '/alumni-network/job-alerts';
  private static savedEndpoint = '/alumni-network/saved-jobs';

  // Job Methods
  static async getAllJobs(): Promise<AlumniJob[]> {
    return APIClient.get<AlumniJob[]>(this.jobsEndpoint);
  }

  static async getJobById(jobId: string): Promise<AlumniJob> {
    return APIClient.get<AlumniJob>(`${this.jobsEndpoint}/${jobId}`);
  }

  static async createJob(job: Partial<AlumniJob>): Promise<AlumniJob> {
    return APIClient.post<AlumniJob>(this.jobsEndpoint, job);
  }

  static async updateJob(jobId: string, updates: Partial<AlumniJob>): Promise<AlumniJob> {
    return APIClient.put<AlumniJob>(`${this.jobsEndpoint}/${jobId}`, updates);
  }

  static async deleteJob(jobId: string): Promise<void> {
    return APIClient.delete<void>(`${this.jobsEndpoint}/${jobId}`);
  }

  // Application Methods
  static async applyForJob(
    jobId: string,
    alumniId: string,
    application: Partial<JobApplication>
  ): Promise<AlumniJob> {
    return APIClient.post<AlumniJob>(`${this.jobsEndpoint}/${jobId}/apply`, { alumniId, application });
  }

  static async updateApplicationStatus(
    jobId: string,
    applicationId: string,
    status: ApplicationStatus
  ): Promise<AlumniJob> {
    return APIClient.put<AlumniJob>(`${this.jobsEndpoint}/${jobId}/applications/${applicationId}/status`, { status });
  }

  // Job Alert Methods
  static async createJobAlert(alumniId: string, alert: Partial<JobAlert>): Promise<JobAlert> {
    return APIClient.post<JobAlert>(this.alertsEndpoint, { alumniId, ...alert });
  }

  static async getJobAlertsByAlumniId(alumniId: string): Promise<JobAlert[]> {
    return APIClient.get<JobAlert[]>(this.alertsEndpoint, { alumniId });
  }

  // Saved Jobs Methods
  static async saveJob(jobId: string, alumniId: string, notes?: string): Promise<JobSaved> {
    return APIClient.post<JobSaved>(this.savedEndpoint, { jobId, alumniId, notes });
  }

  static async getSavedJobsByAlumniId(alumniId: string): Promise<JobSaved[]> {
    return APIClient.get<JobSaved[]>(this.savedEndpoint, { alumniId });
  }

  static async unsaveJob(savedId: string): Promise<void> {
    return APIClient.delete<void>(`${this.savedEndpoint}/${savedId}`);
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AlumniAnalyticsService {
  private static analyticsEndpoint = '/alumni-network/analytics';
  private static engagementEndpoint = '/alumni-network/engagement';

  static async getAnalytics(): Promise<AlumniNetworkAnalytics> {
    return APIClient.get<AlumniNetworkAnalytics>(this.analyticsEndpoint);
  }

  static async getAlumniEngagement(alumniId: string): Promise<AlumniEngagement> {
    return APIClient.get<AlumniEngagement>(`${this.engagementEndpoint}/${alumniId}`);
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AlumniSettingsService {
  private static endpoint = '/alumni-network/settings';

  static async getSettings(): Promise<AlumniNetworkSettings> {
    return APIClient.get<AlumniNetworkSettings>(this.endpoint);
  }

  static async updateSettings(updates: Partial<AlumniNetworkSettings>): Promise<AlumniNetworkSettings> {
    return APIClient.put<AlumniNetworkSettings>(this.endpoint, updates);
  }
}
