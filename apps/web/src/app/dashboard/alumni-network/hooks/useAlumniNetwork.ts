'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlumniDirectoryService,
  EventsService,
  JobsService,
  AlumniAnalyticsService,
  AlumniSettingsService,
} from '../services';
import type {
  AlumniProfile,
  AlumniDirectory,
  AlumniSearch,
  AlumniSearchFilters,
  AlumniConnection,
  AlumniEvent,
  EventRegistration,
  EventFeedback,
  Reunion,
  AlumniJob,
  JobApplication,
  JobAlert,
  JobSaved,
  AlumniNetworkAnalytics,
  AlumniEngagement,
  AlumniNetworkSettings,
  AlumniStatus,
  ConnectionStatus,
  EventStatus,
  ApplicationStatus,
} from '../types';

interface UseAlumniNetworkReturn {
  // Alumni Directory State
  alumniProfiles: AlumniProfile[];
  selectedAlumniProfile: AlumniProfile | null;
  alumniDirectory: AlumniDirectory | null;
  alumniSearch: AlumniSearch | null;
  alumniConnections: AlumniConnection[];
  alumniLoading: boolean;
  alumniError: string | null;

  // Events State
  events: AlumniEvent[];
  selectedEvent: AlumniEvent | null;
  reunions: Reunion[];
  eventsLoading: boolean;
  eventsError: string | null;

  // Jobs State
  jobs: AlumniJob[];
  selectedJob: AlumniJob | null;
  jobAlerts: JobAlert[];
  savedJobs: JobSaved[];
  jobsLoading: boolean;
  jobsError: string | null;

  // Analytics State
  analytics: AlumniNetworkAnalytics | null;
  engagement: AlumniEngagement | null;
  analyticsLoading: boolean;

  // Settings State
  settings: AlumniNetworkSettings | null;
  settingsLoading: boolean;

  // Alumni Directory Methods
  fetchAlumniProfiles: () => Promise<void>;
  fetchAlumniProfileById: (alumniId: string) => Promise<void>;
  createAlumniProfile: (profile: Partial<AlumniProfile>) => Promise<AlumniProfile>;
  updateAlumniProfile: (alumniId: string, updates: Partial<AlumniProfile>) => Promise<AlumniProfile>;
  deleteAlumniProfile: (alumniId: string) => Promise<void>;
  updateAlumniStatus: (alumniId: string, status: AlumniStatus) => Promise<AlumniProfile>;
  fetchAlumniDirectory: () => Promise<void>;
  searchAlumni: (query: string, filters: AlumniSearchFilters, page?: number) => Promise<void>;
  fetchAlumniConnections: () => Promise<void>;
  createConnection: (toAlumniId: string, message?: string) => Promise<AlumniConnection>;
  updateConnectionStatus: (connectionId: string, status: ConnectionStatus) => Promise<AlumniConnection>;

  // Events Methods
  fetchEvents: () => Promise<void>;
  fetchEventById: (eventId: string) => Promise<void>;
  createEvent: (event: Partial<AlumniEvent>) => Promise<AlumniEvent>;
  updateEvent: (eventId: string, updates: Partial<AlumniEvent>) => Promise<AlumniEvent>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<AlumniEvent>;
  registerForEvent: (eventId: string, registration: Partial<EventRegistration>) => Promise<AlumniEvent>;
  cancelRegistration: (eventId: string, registrationId: string) => Promise<AlumniEvent>;
  checkInAttendee: (eventId: string, registrationId: string) => Promise<AlumniEvent>;
  submitEventFeedback: (eventId: string, feedback: EventFeedback) => Promise<AlumniEvent>;
  fetchReunions: () => Promise<void>;
  createReunion: (reunion: Partial<Reunion>) => Promise<Reunion>;

  // Jobs Methods
  fetchJobs: () => Promise<void>;
  fetchJobById: (jobId: string) => Promise<void>;
  createJob: (job: Partial<AlumniJob>) => Promise<AlumniJob>;
  updateJob: (jobId: string, updates: Partial<AlumniJob>) => Promise<AlumniJob>;
  deleteJob: (jobId: string) => Promise<void>;
  applyForJob: (jobId: string, application: Partial<JobApplication>) => Promise<AlumniJob>;
  updateApplicationStatus: (
    jobId: string,
    applicationId: string,
    status: ApplicationStatus
  ) => Promise<AlumniJob>;
  createJobAlert: (alert: Partial<JobAlert>) => Promise<JobAlert>;
  fetchJobAlerts: () => Promise<void>;
  saveJob: (jobId: string, notes?: string) => Promise<JobSaved>;
  fetchSavedJobs: () => Promise<void>;
  unsaveJob: (savedId: string) => Promise<void>;

  // Analytics Methods
  fetchAnalytics: () => Promise<void>;
  fetchEngagement: (alumniId: string) => Promise<void>;

  // Settings Methods
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AlumniNetworkSettings>) => Promise<AlumniNetworkSettings>;

  // Utility Methods
  clearSelectedAlumniProfile: () => void;
  clearSelectedEvent: () => void;
  clearSelectedJob: () => void;
  clearErrors: () => void;
}

export function useAlumniNetwork(currentAlumniId?: string): UseAlumniNetworkReturn {
  // Alumni Directory State
  const [alumniProfiles, setAlumniProfiles] = useState<AlumniProfile[]>([]);
  const [selectedAlumniProfile, setSelectedAlumniProfile] = useState<AlumniProfile | null>(null);
  const [alumniDirectory, setAlumniDirectory] = useState<AlumniDirectory | null>(null);
  const [alumniSearch, setAlumniSearch] = useState<AlumniSearch | null>(null);
  const [alumniConnections, setAlumniConnections] = useState<AlumniConnection[]>([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [alumniError, setAlumniError] = useState<string | null>(null);

  // Events State
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AlumniEvent | null>(null);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Jobs State
  const [jobs, setJobs] = useState<AlumniJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<AlumniJob | null>(null);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobSaved[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<AlumniNetworkAnalytics | null>(null);
  const [engagement, setEngagement] = useState<AlumniEngagement | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AlumniNetworkSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Alumni Directory Methods
  const fetchAlumniProfiles = useCallback(async () => {
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const profiles = await AlumniDirectoryService.getAllAlumniProfiles();
      setAlumniProfiles(profiles);
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to fetch alumni profiles');
    } finally {
      setAlumniLoading(false);
    }
  }, []);

  const fetchAlumniProfileById = useCallback(async (alumniId: string) => {
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const profile = await AlumniDirectoryService.getAlumniProfileById(alumniId);
      setSelectedAlumniProfile(profile);
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to fetch alumni profile');
    } finally {
      setAlumniLoading(false);
    }
  }, []);

  const createAlumniProfile = useCallback(async (profile: Partial<AlumniProfile>) => {
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const newProfile = await AlumniDirectoryService.createAlumniProfile(profile);
      setAlumniProfiles((prev) => [...prev, newProfile]);
      return newProfile;
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to create alumni profile');
      throw error;
    } finally {
      setAlumniLoading(false);
    }
  }, []);

  const updateAlumniProfile = useCallback(
    async (alumniId: string, updates: Partial<AlumniProfile>) => {
      setAlumniLoading(true);
      setAlumniError(null);
      try {
        const updatedProfile = await AlumniDirectoryService.updateAlumniProfile(alumniId, updates);
        setAlumniProfiles((prev) => prev.map((p) => (p.alumniId === alumniId ? updatedProfile : p)));
        if (selectedAlumniProfile?.alumniId === alumniId) {
          setSelectedAlumniProfile(updatedProfile);
        }
        return updatedProfile;
      } catch (error: any) {
        setAlumniError(error instanceof Error ? error.message : 'Failed to update alumni profile');
        throw error;
      } finally {
        setAlumniLoading(false);
      }
    },
    [selectedAlumniProfile]
  );

  const deleteAlumniProfile = useCallback(
    async (alumniId: string) => {
      setAlumniLoading(true);
      setAlumniError(null);
      try {
        await AlumniDirectoryService.deleteAlumniProfile(alumniId);
        setAlumniProfiles((prev) => prev.filter((p) => p.alumniId !== alumniId));
        if (selectedAlumniProfile?.alumniId === alumniId) {
          setSelectedAlumniProfile(null);
        }
      } catch (error: any) {
        setAlumniError(error instanceof Error ? error.message : 'Failed to delete alumni profile');
        throw error;
      } finally {
        setAlumniLoading(false);
      }
    },
    [selectedAlumniProfile]
  );

  const updateAlumniStatus = useCallback(
    async (alumniId: string, status: AlumniStatus) => {
      setAlumniLoading(true);
      setAlumniError(null);
      try {
        const updatedProfile = await AlumniDirectoryService.updateAlumniStatus(alumniId, status);
        setAlumniProfiles((prev) => prev.map((p) => (p.alumniId === alumniId ? updatedProfile : p)));
        if (selectedAlumniProfile?.alumniId === alumniId) {
          setSelectedAlumniProfile(updatedProfile);
        }
        return updatedProfile;
      } catch (error: any) {
        setAlumniError(error instanceof Error ? error.message : 'Failed to update alumni status');
        throw error;
      } finally {
        setAlumniLoading(false);
      }
    },
    [selectedAlumniProfile]
  );

  const fetchAlumniDirectory = useCallback(async () => {
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const directory = await AlumniDirectoryService.getAlumniDirectory();
      setAlumniDirectory(directory);
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to fetch alumni directory');
    } finally {
      setAlumniLoading(false);
    }
  }, []);

  const searchAlumni = useCallback(async (query: string, filters: AlumniSearchFilters, page: number = 1) => {
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const searchResults = await AlumniDirectoryService.searchAlumni(query, filters, page);
      setAlumniSearch(searchResults);
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to search alumni');
    } finally {
      setAlumniLoading(false);
    }
  }, []);

  const fetchAlumniConnections = useCallback(async () => {
    if (!currentAlumniId) return;
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const connections = await AlumniDirectoryService.getConnectionsByAlumniId(currentAlumniId);
      setAlumniConnections(connections);
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to fetch alumni connections');
    } finally {
      setAlumniLoading(false);
    }
  }, [currentAlumniId]);

  const createConnection = useCallback(
    async (toAlumniId: string, message?: string) => {
      if (!currentAlumniId) throw new Error('Current alumni ID is required');
      setAlumniLoading(true);
      setAlumniError(null);
      try {
        const newConnection = await AlumniDirectoryService.createConnection(currentAlumniId, toAlumniId, message);
        setAlumniConnections((prev) => [...prev, newConnection]);
        return newConnection;
      } catch (error: any) {
        setAlumniError(error instanceof Error ? error.message : 'Failed to create connection');
        throw error;
      } finally {
        setAlumniLoading(false);
      }
    },
    [currentAlumniId]
  );

  const updateConnectionStatus = useCallback(async (connectionId: string, status: ConnectionStatus) => {
    setAlumniLoading(true);
    setAlumniError(null);
    try {
      const updatedConnection = await AlumniDirectoryService.updateConnectionStatus(connectionId, status);
      setAlumniConnections((prev) =>
        prev.map((c) => (c.connectionId === connectionId ? updatedConnection : c))
      );
      return updatedConnection;
    } catch (error: any) {
      setAlumniError(error instanceof Error ? error.message : 'Failed to update connection status');
      throw error;
    } finally {
      setAlumniLoading(false);
    }
  }, []);

  // Events Methods
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const eventsData = await EventsService.getAllEvents();
      setEvents(eventsData);
    } catch (error: any) {
      setEventsError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchEventById = useCallback(async (eventId: string) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const event = await EventsService.getEventById(eventId);
      setSelectedEvent(event);
    } catch (error: any) {
      setEventsError(error instanceof Error ? error.message : 'Failed to fetch event');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (event: Partial<AlumniEvent>) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const newEvent = await EventsService.createEvent(event);
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (error: any) {
      setEventsError(error instanceof Error ? error.message : 'Failed to create event');
      throw error;
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<AlumniEvent>) => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const updatedEvent = await EventsService.updateEvent(eventId, updates);
        setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updatedEvent : e)));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(updatedEvent);
        }
        return updatedEvent;
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to update event');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [selectedEvent]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        await EventsService.deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(null);
        }
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to delete event');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [selectedEvent]
  );

  const updateEventStatus = useCallback(
    async (eventId: string, status: EventStatus) => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const updatedEvent = await EventsService.updateEventStatus(eventId, status);
        setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updatedEvent : e)));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(updatedEvent);
        }
        return updatedEvent;
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to update event status');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [selectedEvent]
  );

  const registerForEvent = useCallback(
    async (eventId: string, registration: Partial<EventRegistration>) => {
      if (!currentAlumniId) throw new Error('Current alumni ID is required');
      setEventsLoading(true);
      setEventsError(null);
      try {
        const updatedEvent = await EventsService.registerForEvent(eventId, currentAlumniId, registration);
        setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updatedEvent : e)));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(updatedEvent);
        }
        return updatedEvent;
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to register for event');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [currentAlumniId, selectedEvent]
  );

  const cancelRegistration = useCallback(
    async (eventId: string, registrationId: string) => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const updatedEvent = await EventsService.cancelRegistration(eventId, registrationId);
        setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updatedEvent : e)));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(updatedEvent);
        }
        return updatedEvent;
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to cancel registration');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [selectedEvent]
  );

  const checkInAttendee = useCallback(
    async (eventId: string, registrationId: string) => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const updatedEvent = await EventsService.checkInAttendee(eventId, registrationId);
        setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updatedEvent : e)));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(updatedEvent);
        }
        return updatedEvent;
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to check in attendee');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [selectedEvent]
  );

  const submitEventFeedback = useCallback(
    async (eventId: string, feedback: EventFeedback) => {
      if (!currentAlumniId) throw new Error('Current alumni ID is required');
      setEventsLoading(true);
      setEventsError(null);
      try {
        const updatedEvent = await EventsService.submitEventFeedback(eventId, currentAlumniId, feedback);
        setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updatedEvent : e)));
        if (selectedEvent?.eventId === eventId) {
          setSelectedEvent(updatedEvent);
        }
        return updatedEvent;
      } catch (error: any) {
        setEventsError(error instanceof Error ? error.message : 'Failed to submit event feedback');
        throw error;
      } finally {
        setEventsLoading(false);
      }
    },
    [currentAlumniId, selectedEvent]
  );

  const fetchReunions = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const reunionsData = await EventsService.getAllReunions();
      setReunions(reunionsData);
    } catch (error: any) {
      setEventsError(error instanceof Error ? error.message : 'Failed to fetch reunions');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const createReunion = useCallback(async (reunion: Partial<Reunion>) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const newReunion = await EventsService.createReunion(reunion);
      setReunions((prev) => [...prev, newReunion]);
      return newReunion;
    } catch (error: any) {
      setEventsError(error instanceof Error ? error.message : 'Failed to create reunion');
      throw error;
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Jobs Methods
  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const jobsData = await JobsService.getAllJobs();
      setJobs(jobsData);
    } catch (error: any) {
      setJobsError(error instanceof Error ? error.message : 'Failed to fetch jobs');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchJobById = useCallback(async (jobId: string) => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const job = await JobsService.getJobById(jobId);
      setSelectedJob(job);
    } catch (error: any) {
      setJobsError(error instanceof Error ? error.message : 'Failed to fetch job');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const createJob = useCallback(async (job: Partial<AlumniJob>) => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const newJob = await JobsService.createJob(job);
      setJobs((prev) => [...prev, newJob]);
      return newJob;
    } catch (error: any) {
      setJobsError(error instanceof Error ? error.message : 'Failed to create job');
      throw error;
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const updateJob = useCallback(
    async (jobId: string, updates: Partial<AlumniJob>) => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const updatedJob = await JobsService.updateJob(jobId, updates);
        setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updatedJob : j)));
        if (selectedJob?.jobId === jobId) {
          setSelectedJob(updatedJob);
        }
        return updatedJob;
      } catch (error: any) {
        setJobsError(error instanceof Error ? error.message : 'Failed to update job');
        throw error;
      } finally {
        setJobsLoading(false);
      }
    },
    [selectedJob]
  );

  const deleteJob = useCallback(
    async (jobId: string) => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        await JobsService.deleteJob(jobId);
        setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
        if (selectedJob?.jobId === jobId) {
          setSelectedJob(null);
        }
      } catch (error: any) {
        setJobsError(error instanceof Error ? error.message : 'Failed to delete job');
        throw error;
      } finally {
        setJobsLoading(false);
      }
    },
    [selectedJob]
  );

  const applyForJob = useCallback(
    async (jobId: string, application: Partial<JobApplication>) => {
      if (!currentAlumniId) throw new Error('Current alumni ID is required');
      setJobsLoading(true);
      setJobsError(null);
      try {
        const updatedJob = await JobsService.applyForJob(jobId, currentAlumniId, application);
        setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updatedJob : j)));
        if (selectedJob?.jobId === jobId) {
          setSelectedJob(updatedJob);
        }
        return updatedJob;
      } catch (error: any) {
        setJobsError(error instanceof Error ? error.message : 'Failed to apply for job');
        throw error;
      } finally {
        setJobsLoading(false);
      }
    },
    [currentAlumniId, selectedJob]
  );

  const updateApplicationStatus = useCallback(
    async (jobId: string, applicationId: string, status: ApplicationStatus) => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const updatedJob = await JobsService.updateApplicationStatus(jobId, applicationId, status);
        setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updatedJob : j)));
        if (selectedJob?.jobId === jobId) {
          setSelectedJob(updatedJob);
        }
        return updatedJob;
      } catch (error: any) {
        setJobsError(error instanceof Error ? error.message : 'Failed to update application status');
        throw error;
      } finally {
        setJobsLoading(false);
      }
    },
    [selectedJob]
  );

  const createJobAlert = useCallback(
    async (alert: Partial<JobAlert>) => {
      if (!currentAlumniId) throw new Error('Current alumni ID is required');
      setJobsLoading(true);
      setJobsError(null);
      try {
        const newAlert = await JobsService.createJobAlert(currentAlumniId, alert);
        setJobAlerts((prev) => [...prev, newAlert]);
        return newAlert;
      } catch (error: any) {
        setJobsError(error instanceof Error ? error.message : 'Failed to create job alert');
        throw error;
      } finally {
        setJobsLoading(false);
      }
    },
    [currentAlumniId]
  );

  const fetchJobAlerts = useCallback(async () => {
    if (!currentAlumniId) return;
    setJobsLoading(true);
    setJobsError(null);
    try {
      const alerts = await JobsService.getJobAlertsByAlumniId(currentAlumniId);
      setJobAlerts(alerts);
    } catch (error: any) {
      setJobsError(error instanceof Error ? error.message : 'Failed to fetch job alerts');
    } finally {
      setJobsLoading(false);
    }
  }, [currentAlumniId]);

  const saveJob = useCallback(
    async (jobId: string, notes?: string) => {
      if (!currentAlumniId) throw new Error('Current alumni ID is required');
      setJobsLoading(true);
      setJobsError(null);
      try {
        const saved = await JobsService.saveJob(jobId, currentAlumniId, notes);
        setSavedJobs((prev) => [...prev, saved]);
        return saved;
      } catch (error: any) {
        setJobsError(error instanceof Error ? error.message : 'Failed to save job');
        throw error;
      } finally {
        setJobsLoading(false);
      }
    },
    [currentAlumniId]
  );

  const fetchSavedJobs = useCallback(async () => {
    if (!currentAlumniId) return;
    setJobsLoading(true);
    setJobsError(null);
    try {
      const saved = await JobsService.getSavedJobsByAlumniId(currentAlumniId);
      setSavedJobs(saved);
    } catch (error: any) {
      setJobsError(error instanceof Error ? error.message : 'Failed to fetch saved jobs');
    } finally {
      setJobsLoading(false);
    }
  }, [currentAlumniId]);

  const unsaveJob = useCallback(async (savedId: string) => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      await JobsService.unsaveJob(savedId);
      setSavedJobs((prev) => prev.filter((s) => s.savedId !== savedId));
    } catch (error: any) {
      setJobsError(error instanceof Error ? error.message : 'Failed to unsave job');
      throw error;
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // Analytics Methods
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const analyticsData = await AlumniAnalyticsService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchEngagement = useCallback(async (alumniId: string) => {
    setAnalyticsLoading(true);
    try {
      const engagementData = await AlumniAnalyticsService.getAlumniEngagement(alumniId);
      setEngagement(engagementData);
    } catch (error: any) {
      console.error('Failed to fetch engagement:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Settings Methods
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const settingsData = await AlumniSettingsService.getSettings();
      setSettings(settingsData);
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AlumniNetworkSettings>) => {
    setSettingsLoading(true);
    try {
      const updatedSettings = await AlumniSettingsService.updateSettings(updates);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Utility Methods
  const clearSelectedAlumniProfile = useCallback(() => {
    setSelectedAlumniProfile(null);
  }, []);

  const clearSelectedEvent = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const clearSelectedJob = useCallback(() => {
    setSelectedJob(null);
  }, []);

  const clearErrors = useCallback(() => {
    setAlumniError(null);
    setEventsError(null);
    setJobsError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchAlumniProfiles();
    fetchAlumniDirectory();
    fetchEvents();
    fetchReunions();
    fetchJobs();
    fetchAnalytics();
    fetchSettings();
    if (currentAlumniId) {
      fetchAlumniConnections();
      fetchJobAlerts();
      fetchSavedJobs();
    }
  }, [
    fetchAlumniProfiles,
    fetchAlumniDirectory,
    fetchEvents,
    fetchReunions,
    fetchJobs,
    fetchAnalytics,
    fetchSettings,
    fetchAlumniConnections,
    fetchJobAlerts,
    fetchSavedJobs,
    currentAlumniId,
  ]);

  return {
    // Alumni Directory State
    alumniProfiles,
    selectedAlumniProfile,
    alumniDirectory,
    alumniSearch,
    alumniConnections,
    alumniLoading,
    alumniError,

    // Events State
    events,
    selectedEvent,
    reunions,
    eventsLoading,
    eventsError,

    // Jobs State
    jobs,
    selectedJob,
    jobAlerts,
    savedJobs,
    jobsLoading,
    jobsError,

    // Analytics State
    analytics,
    engagement,
    analyticsLoading,

    // Settings State
    settings,
    settingsLoading,

    // Alumni Directory Methods
    fetchAlumniProfiles,
    fetchAlumniProfileById,
    createAlumniProfile,
    updateAlumniProfile,
    deleteAlumniProfile,
    updateAlumniStatus,
    fetchAlumniDirectory,
    searchAlumni,
    fetchAlumniConnections,
    createConnection,
    updateConnectionStatus,

    // Events Methods
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    registerForEvent,
    cancelRegistration,
    checkInAttendee,
    submitEventFeedback,
    fetchReunions,
    createReunion,

    // Jobs Methods
    fetchJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    applyForJob,
    updateApplicationStatus,
    createJobAlert,
    fetchJobAlerts,
    saveJob,
    fetchSavedJobs,
    unsaveJob,

    // Analytics Methods
    fetchAnalytics,
    fetchEngagement,

    // Settings Methods
    fetchSettings,
    updateSettings,

    // Utility Methods
    clearSelectedAlumniProfile,
    clearSelectedEvent,
    clearSelectedJob,
    clearErrors,
  };
}
