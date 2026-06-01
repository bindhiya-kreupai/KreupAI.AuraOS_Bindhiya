/**
 * Interview Scheduler Service
 * AI-powered interview scheduling with smart slot matching and conflict detection
 *
 * Features:
 * - Available slot management for interviewers
 * - Smart candidate-interviewer matching based on skills
 * - Conflict detection and resolution
 * - Timezone handling for global teams
 * - Panel interview coordination
 * - Automated reminder scheduling
 * - Calendar integration support
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TimeSlot {
  start: Date;
  end: Date;
  timezone: string;
}

export interface InterviewerProfile {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  department: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  interviewTypes: InterviewType[];
  maxInterviewsPerDay: number;
  preferredTimes: PreferredTime[];
  timezone: string;
  unavailableDates: Date[];
  currentLoad: number;
}

export interface PreferredTime {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startHour: number;
  endHour: number;
}

export type InterviewType =
  | 'phone_screen'
  | 'technical'
  | 'behavioral'
  | 'cultural_fit'
  | 'panel'
  | 'case_study'
  | 'presentation'
  | 'final_round'
  | 'hr_round';

export interface InterviewRequest {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateTimezone: string;
  jobId: string;
  jobTitle: string;
  requiredSkills: string[];
  interviewType: InterviewType;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferredDateRange: {
    start: Date;
    end: Date;
  };
  requiredInterviewers?: string[]; // Specific interviewer IDs
  panelSize?: number; // For panel interviews
  notes?: string;
}

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  interviewType: InterviewType;
  slot: TimeSlot;
  interviewers: InterviewerAssignment[];
  meetingLink?: string;
  location?: string;
  status: InterviewStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reminders: ScheduledReminder[];
}

export type InterviewStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

export interface InterviewerAssignment {
  interviewerId: string;
  interviewerName: string;
  role: 'lead' | 'panel_member' | 'observer';
  confirmed: boolean;
  confirmedAt?: Date;
}

export interface ScheduledReminder {
  id: string;
  type: 'email' | 'sms' | 'push';
  recipient: 'candidate' | 'interviewer' | 'all';
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}

export interface SlotSuggestion {
  slot: TimeSlot;
  interviewers: InterviewerProfile[];
  score: number;
  reasons: string[];
  reasonsAr: string[];
  conflicts: ConflictInfo[];
}

export interface ConflictInfo {
  type: 'interviewer_busy' | 'candidate_preference' | 'time_constraint' | 'load_limit';
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SchedulingResult {
  success: boolean;
  interview?: ScheduledInterview;
  suggestions?: SlotSuggestion[];
  message: string;
  messageAr: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendees: string[];
  location?: string;
  meetingLink?: string;
  reminderMinutes: number[];
}

export interface InterviewMetrics {
  totalScheduled: number;
  averageTimeToSchedule: number; // hours
  schedulingSuccessRate: number;
  rescheduleRate: number;
  noShowRate: number;
  averageInterviewsPerInterviewer: number;
  peakSchedulingTimes: { hour: number; count: number }[];
  interviewTypeDistribution: { type: InterviewType; count: number }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INTERVIEW_TYPE_LABELS: Record<InterviewType, { en: string; ar: string }> = {
  phone_screen: { en: 'Phone Screen', ar: 'مقابلة هاتفية' },
  technical: { en: 'Technical Interview', ar: 'مقابلة تقنية' },
  behavioral: { en: 'Behavioral Interview', ar: 'مقابلة سلوكية' },
  cultural_fit: { en: 'Cultural Fit', ar: 'ملاءمة ثقافية' },
  panel: { en: 'Panel Interview', ar: 'مقابلة جماعية' },
  case_study: { en: 'Case Study', ar: 'دراسة حالة' },
  presentation: { en: 'Presentation', ar: 'عرض تقديمي' },
  final_round: { en: 'Final Round', ar: 'الجولة النهائية' },
  hr_round: { en: 'HR Round', ar: 'جولة الموارد البشرية' },
};

const DEFAULT_DURATIONS: Record<InterviewType, number> = {
  phone_screen: 30,
  technical: 60,
  behavioral: 45,
  cultural_fit: 45,
  panel: 90,
  case_study: 120,
  presentation: 60,
  final_round: 60,
  hr_round: 30,
};

const PRIORITY_WEIGHTS = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const SENIORITY_WEIGHTS = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  executive: 5,
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class InterviewSchedulerService {
  private interviewers: Map<string, InterviewerProfile> = new Map();
  private scheduledInterviews: Map<string, ScheduledInterview> = new Map();
  private interviewerCalendars: Map<string, TimeSlot[]> = new Map();

  /**
   * Register an interviewer with their availability
   */
  registerInterviewer(interviewer: InterviewerProfile): void {
    this.interviewers.set(interviewer.id, interviewer);
    if (!this.interviewerCalendars.has(interviewer.id)) {
      this.interviewerCalendars.set(interviewer.id, []);
    }
  }

  /**
   * Update interviewer availability
   */
  updateInterviewerAvailability(
    interviewerId: string,
    unavailableDates: Date[]
  ): void {
    const interviewer = this.interviewers.get(interviewerId);
    if (interviewer) {
      interviewer.unavailableDates = unavailableDates;
    }
  }

  /**
   * Add busy time to interviewer's calendar
   */
  addBusyTime(interviewerId: string, slot: TimeSlot): void {
    const calendar = this.interviewerCalendars.get(interviewerId) || [];
    calendar.push(slot);
    this.interviewerCalendars.set(interviewerId, calendar);
  }

  /**
   * Find optimal interviewers for a job based on skills
   */
  findMatchingInterviewers(
    requiredSkills: string[],
    interviewType: InterviewType,
    count: number = 1
  ): InterviewerProfile[] {
    const availableInterviewers = Array.from(this.interviewers.values())
      .filter(interviewer => interviewer.interviewTypes.includes(interviewType));

    // Score interviewers based on skill match and load
    const scored = availableInterviewers.map(interviewer => {
      const skillMatch = this.calculateSkillMatch(interviewer.skills, requiredSkills);
      const loadScore = 1 - (interviewer.currentLoad / interviewer.maxInterviewsPerDay);
      const seniorityScore = SENIORITY_WEIGHTS[interviewer.seniority] / 5;

      return {
        interviewer,
        score: (skillMatch * 0.5) + (loadScore * 0.3) + (seniorityScore * 0.2),
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(s => s.interviewer);
  }

  /**
   * Calculate skill match percentage
   */
  private calculateSkillMatch(interviewerSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 0.5;

    const normalizedInterviewerSkills = interviewerSkills.map(s => s.toLowerCase());
    const matches = requiredSkills.filter(skill =>
      normalizedInterviewerSkills.some(is =>
        is.includes(skill.toLowerCase()) || skill.toLowerCase().includes(is)
      )
    );

    return matches.length / requiredSkills.length;
  }

  /**
   * Find available time slots for interview
   */
  findAvailableSlots(
    request: InterviewRequest,
    interviewers: InterviewerProfile[]
  ): SlotSuggestion[] {
    const suggestions: SlotSuggestion[] = [];
    const { preferredDateRange, durationMinutes, candidateTimezone } = request;

    // Generate potential slots within date range
    const potentialSlots = this.generatePotentialSlots(
      preferredDateRange.start,
      preferredDateRange.end,
      durationMinutes,
      candidateTimezone
    );

    for (const slot of potentialSlots) {
      const availableInterviewers = this.getAvailableInterviewers(
        slot,
        interviewers
      );

      if (availableInterviewers.length > 0) {
        const score = this.scoreSlot(slot, availableInterviewers, request);
        const conflicts = this.detectConflicts(slot, interviewers);

        suggestions.push({
          slot,
          interviewers: availableInterviewers,
          score,
          reasons: this.generateSlotReasons(slot, score, 'en'),
          reasonsAr: this.generateSlotReasons(slot, score, 'ar'),
          conflicts,
        });
      }
    }

    // Sort by score descending
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * Generate potential time slots
   */
  private generatePotentialSlots(
    start: Date,
    end: Date,
    durationMinutes: number,
    timezone: string
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const current = new Date(start);

    // Business hours: 9 AM - 6 PM
    const businessStart = 9;
    const businessEnd = 18;

    while (current < end) {
      const dayOfWeek = current.getDay();

      // Skip weekends (Friday/Saturday for GCC, Saturday/Sunday for others)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        for (let hour = businessStart; hour < businessEnd; hour++) {
          const slotStart = new Date(current);
          slotStart.setHours(hour, 0, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

          // Only add if within business hours
          if (slotEnd.getHours() <= businessEnd) {
            slots.push({
              start: slotStart,
              end: slotEnd,
              timezone,
            });
          }
        }
      }

      // Move to next day
      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  /**
   * Get interviewers available for a specific slot
   */
  private getAvailableInterviewers(
    slot: TimeSlot,
    interviewers: InterviewerProfile[]
  ): InterviewerProfile[] {
    return interviewers.filter(interviewer => {
      // Check if date is unavailable
      const slotDate = slot.start.toDateString();
      const isUnavailable = interviewer.unavailableDates.some(
        d => new Date(d).toDateString() === slotDate
      );
      if (isUnavailable) return false;

      // Check load limit
      if (interviewer.currentLoad >= interviewer.maxInterviewsPerDay) return false;

      // Check calendar conflicts
      const calendar = this.interviewerCalendars.get(interviewer.id) || [];
      const hasConflict = calendar.some(
        busy => this.slotsOverlap(slot, busy)
      );
      if (hasConflict) return false;

      // Check preferred times
      const dayOfWeek = slot.start.getDay();
      const hour = slot.start.getHours();
      const hasPreference = interviewer.preferredTimes.some(
        pref => pref.dayOfWeek === dayOfWeek &&
                hour >= pref.startHour &&
                hour < pref.endHour
      );

      return hasPreference || interviewer.preferredTimes.length === 0;
    });
  }

  /**
   * Check if two time slots overlap
   */
  private slotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return slot1.start < slot2.end && slot2.start < slot1.end;
  }

  /**
   * Score a time slot based on various factors
   */
  private scoreSlot(
    slot: TimeSlot,
    availableInterviewers: InterviewerProfile[],
    request: InterviewRequest
  ): number {
    let score = 0;

    // More available interviewers = better
    score += Math.min(availableInterviewers.length / 3, 1) * 0.2;

    // Prefer morning slots (9-12)
    const hour = slot.start.getHours();
    if (hour >= 9 && hour <= 12) {
      score += 0.15;
    } else if (hour >= 14 && hour <= 16) {
      score += 0.1;
    }

    // Prefer mid-week (Tuesday-Thursday)
    const dayOfWeek = slot.start.getDay();
    if (dayOfWeek >= 2 && dayOfWeek <= 4) {
      score += 0.15;
    }

    // Skill match of available interviewers
    const avgSkillMatch = availableInterviewers.reduce((sum, int) => {
      return sum + this.calculateSkillMatch(int.skills, request.requiredSkills);
    }, 0) / availableInterviewers.length;
    score += avgSkillMatch * 0.3;

    // Priority boost for urgent requests
    score += PRIORITY_WEIGHTS[request.priority] * 0.05;

    // Prefer slots sooner rather than later
    const daysUntil = Math.ceil(
      (slot.start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, (14 - daysUntil) / 14) * 0.15;

    return Math.min(score, 1);
  }

  /**
   * Detect potential conflicts for a slot
   */
  private detectConflicts(
    slot: TimeSlot,
    interviewers: InterviewerProfile[]
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    for (const interviewer of interviewers) {
      // Check calendar conflicts
      const calendar = this.interviewerCalendars.get(interviewer.id) || [];
      const busySlot = calendar.find(busy => this.slotsOverlap(slot, busy));

      if (busySlot) {
        conflicts.push({
          type: 'interviewer_busy',
          description: `${interviewer.name} has another commitment`,
          descriptionAr: `${interviewer.nameAr || interviewer.name} لديه التزام آخر`,
          severity: 'high',
        });
      }

      // Check load limit
      if (interviewer.currentLoad >= interviewer.maxInterviewsPerDay) {
        conflicts.push({
          type: 'load_limit',
          description: `${interviewer.name} has reached daily interview limit`,
          descriptionAr: `${interviewer.nameAr || interviewer.name} وصل للحد الأقصى اليومي`,
          severity: 'medium',
        });
      }
    }

    // Check time constraints
    const hour = slot.start.getHours();
    if (hour < 9 || hour >= 18) {
      conflicts.push({
        type: 'time_constraint',
        description: 'Outside business hours',
        descriptionAr: 'خارج ساعات العمل',
        severity: 'medium',
      });
    }

    return conflicts;
  }

  /**
   * Generate human-readable reasons for slot score
   */
  private generateSlotReasons(
    slot: TimeSlot,
    score: number,
    language: 'en' | 'ar'
  ): string[] {
    const reasons: string[] = [];
    const hour = slot.start.getHours();
    const dayOfWeek = slot.start.getDay();

    if (language === 'en') {
      if (hour >= 9 && hour <= 12) {
        reasons.push('Morning slot - typically better focus');
      }
      if (dayOfWeek >= 2 && dayOfWeek <= 4) {
        reasons.push('Mid-week - optimal scheduling day');
      }
      if (score > 0.8) {
        reasons.push('High availability of matching interviewers');
      }
    } else {
      if (hour >= 9 && hour <= 12) {
        reasons.push('فترة صباحية - تركيز أفضل عادة');
      }
      if (dayOfWeek >= 2 && dayOfWeek <= 4) {
        reasons.push('منتصف الأسبوع - يوم جدولة مثالي');
      }
      if (score > 0.8) {
        reasons.push('توفر عالي للمقابلين المناسبين');
      }
    }

    return reasons;
  }

  /**
   * Schedule an interview
   */
  async scheduleInterview(
    request: InterviewRequest,
    selectedSlot?: SlotSuggestion
  ): Promise<SchedulingResult> {
    try {
      // Find matching interviewers if not specified
      const interviewerCount = request.panelSize || 1;
      let interviewers: InterviewerProfile[];

      if (request.requiredInterviewers && request.requiredInterviewers.length > 0) {
        interviewers = request.requiredInterviewers
          .map(id => this.interviewers.get(id))
          .filter((i): i is InterviewerProfile => i !== undefined);
      } else {
        interviewers = this.findMatchingInterviewers(
          request.requiredSkills,
          request.interviewType,
          interviewerCount
        );
      }

      if (interviewers.length === 0) {
        return {
          success: false,
          message: 'No available interviewers found for the required skills',
          messageAr: 'لم يتم العثور على مقابلين متاحين للمهارات المطلوبة',
        };
      }

      // Use provided slot or find best available
      let slotToUse: SlotSuggestion;
      if (selectedSlot) {
        slotToUse = selectedSlot;
      } else {
        const suggestions = this.findAvailableSlots(request, interviewers);
        if (suggestions.length === 0) {
          return {
            success: false,
            suggestions: [],
            message: 'No available time slots found in the requested date range',
            messageAr: 'لم يتم العثور على أوقات متاحة في النطاق الزمني المطلوب',
          };
        }
        slotToUse = suggestions[0];
      }

      // Create the interview
      const interview: ScheduledInterview = {
        id: this.generateId(),
        candidateId: request.candidateId,
        candidateName: request.candidateName,
        candidateEmail: request.candidateEmail,
        jobId: request.jobId,
        jobTitle: request.jobTitle,
        interviewType: request.interviewType,
        slot: slotToUse.slot,
        interviewers: slotToUse.interviewers.map((int, index) => ({
          interviewerId: int.id,
          interviewerName: int.name,
          role: index === 0 ? 'lead' : 'panel_member',
          confirmed: false,
        })),
        status: 'scheduled',
        notes: request.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: this.createDefaultReminders(slotToUse.slot),
      };

      // Store the interview
      this.scheduledInterviews.set(interview.id, interview);

      // Update interviewer calendars and load
      for (const int of slotToUse.interviewers) {
        this.addBusyTime(int.id, slotToUse.slot);
        const interviewer = this.interviewers.get(int.id);
        if (interviewer) {
          interviewer.currentLoad++;
        }
      }

      return {
        success: true,
        interview,
        message: `Interview scheduled for ${this.formatDateTime(slotToUse.slot.start)}`,
        messageAr: `تم جدولة المقابلة في ${this.formatDateTime(slotToUse.slot.start)}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to schedule interview: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageAr: 'فشل في جدولة المقابلة',
      };
    }
  }

  /**
   * Reschedule an interview
   */
  async rescheduleInterview(
    interviewId: string,
    newSlot: TimeSlot
  ): Promise<SchedulingResult> {
    const interview = this.scheduledInterviews.get(interviewId);
    if (!interview) {
      return {
        success: false,
        message: 'Interview not found',
        messageAr: 'المقابلة غير موجودة',
      };
    }

    // Release old slot from interviewer calendars
    for (const assignment of interview.interviewers) {
      const calendar = this.interviewerCalendars.get(assignment.interviewerId);
      if (calendar) {
        const index = calendar.findIndex(
          slot => slot.start.getTime() === interview.slot.start.getTime()
        );
        if (index >= 0) {
          calendar.splice(index, 1);
        }
      }
    }

    // Update interview with new slot
    interview.slot = newSlot;
    interview.status = 'rescheduled';
    interview.updatedAt = new Date();
    interview.reminders = this.createDefaultReminders(newSlot);

    // Update interviewer confirmations
    interview.interviewers.forEach(int => {
      int.confirmed = false;
      int.confirmedAt = undefined;
    });

    // Add new slot to calendars
    for (const assignment of interview.interviewers) {
      this.addBusyTime(assignment.interviewerId, newSlot);
    }

    return {
      success: true,
      interview,
      message: `Interview rescheduled to ${this.formatDateTime(newSlot.start)}`,
      messageAr: `تم إعادة جدولة المقابلة إلى ${this.formatDateTime(newSlot.start)}`,
    };
  }

  /**
   * Cancel an interview
   */
  cancelInterview(
    interviewId: string,
    reason?: string
  ): SchedulingResult {
    const interview = this.scheduledInterviews.get(interviewId);
    if (!interview) {
      return {
        success: false,
        message: 'Interview not found',
        messageAr: 'المقابلة غير موجودة',
      };
    }

    // Release slot from interviewer calendars
    for (const assignment of interview.interviewers) {
      const calendar = this.interviewerCalendars.get(assignment.interviewerId);
      if (calendar) {
        const index = calendar.findIndex(
          slot => slot.start.getTime() === interview.slot.start.getTime()
        );
        if (index >= 0) {
          calendar.splice(index, 1);
        }
      }

      // Decrement interviewer load
      const interviewer = this.interviewers.get(assignment.interviewerId);
      if (interviewer && interviewer.currentLoad > 0) {
        interviewer.currentLoad--;
      }
    }

    interview.status = 'cancelled';
    interview.notes = reason ? `${interview.notes || ''}\nCancellation reason: ${reason}` : interview.notes;
    interview.updatedAt = new Date();

    return {
      success: true,
      interview,
      message: 'Interview cancelled successfully',
      messageAr: 'تم إلغاء المقابلة بنجاح',
    };
  }

  /**
   * Confirm interviewer participation
   */
  confirmInterviewer(interviewId: string, interviewerId: string): boolean {
    const interview = this.scheduledInterviews.get(interviewId);
    if (!interview) return false;

    const assignment = interview.interviewers.find(
      int => int.interviewerId === interviewerId
    );
    if (!assignment) return false;

    assignment.confirmed = true;
    assignment.confirmedAt = new Date();
    interview.updatedAt = new Date();

    // If all interviewers confirmed, update status
    if (interview.interviewers.every(int => int.confirmed)) {
      interview.status = 'confirmed';
    }

    return true;
  }

  /**
   * Update interview status
   */
  updateInterviewStatus(
    interviewId: string,
    status: InterviewStatus
  ): boolean {
    const interview = this.scheduledInterviews.get(interviewId);
    if (!interview) return false;

    interview.status = status;
    interview.updatedAt = new Date();
    return true;
  }

  /**
   * Create default reminders for an interview
   */
  private createDefaultReminders(slot: TimeSlot): ScheduledReminder[] {
    const reminders: ScheduledReminder[] = [];
    const slotTime = slot.start.getTime();

    // 24 hours before
    reminders.push({
      id: this.generateId(),
      type: 'email',
      recipient: 'all',
      scheduledFor: new Date(slotTime - 24 * 60 * 60 * 1000),
      sent: false,
    });

    // 1 hour before
    reminders.push({
      id: this.generateId(),
      type: 'email',
      recipient: 'all',
      scheduledFor: new Date(slotTime - 60 * 60 * 1000),
      sent: false,
    });

    // 15 minutes before
    reminders.push({
      id: this.generateId(),
      type: 'push',
      recipient: 'all',
      scheduledFor: new Date(slotTime - 15 * 60 * 1000),
      sent: false,
    });

    return reminders;
  }

  /**
   * Generate calendar event for interview
   */
  generateCalendarEvent(interview: ScheduledInterview): CalendarEvent {
    const attendees = [
      interview.candidateEmail,
      ...interview.interviewers.map(int => {
        const interviewer = this.interviewers.get(int.interviewerId);
        return interviewer?.email || '';
      }).filter(Boolean),
    ];

    const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType];

    return {
      id: interview.id,
      title: `${typeLabel.en}: ${interview.candidateName} - ${interview.jobTitle}`,
      description: `Interview Type: ${typeLabel.en}\nCandidate: ${interview.candidateName}\nPosition: ${interview.jobTitle}\n\nInterviewers:\n${interview.interviewers.map(int => `- ${int.interviewerName} (${int.role})`).join('\n')}${interview.notes ? `\n\nNotes: ${interview.notes}` : ''}`,
      start: interview.slot.start,
      end: interview.slot.end,
      attendees,
      location: interview.location,
      meetingLink: interview.meetingLink,
      reminderMinutes: [1440, 60, 15], // 24h, 1h, 15min
    };
  }

  /**
   * Get upcoming interviews for a candidate
   */
  getCandidateInterviews(candidateId: string): ScheduledInterview[] {
    return Array.from(this.scheduledInterviews.values())
      .filter(int => int.candidateId === candidateId && int.status !== 'cancelled')
      .sort((a, b) => a.slot.start.getTime() - b.slot.start.getTime());
  }

  /**
   * Get upcoming interviews for an interviewer
   */
  getInterviewerInterviews(interviewerId: string): ScheduledInterview[] {
    return Array.from(this.scheduledInterviews.values())
      .filter(int =>
        int.interviewers.some(i => i.interviewerId === interviewerId) &&
        int.status !== 'cancelled'
      )
      .sort((a, b) => a.slot.start.getTime() - b.slot.start.getTime());
  }

  /**
   * Get interview metrics
   */
  getMetrics(): InterviewMetrics {
    const interviews = Array.from(this.scheduledInterviews.values());
    const completed = interviews.filter(i => i.status === 'completed');
    const cancelled = interviews.filter(i => i.status === 'cancelled');
    const rescheduled = interviews.filter(i => i.status === 'rescheduled');
    const noShows = interviews.filter(i => i.status === 'no_show');

    // Calculate average time to schedule (mock calculation)
    const avgTimeToSchedule = 4.5; // hours

    // Calculate interviews per interviewer
    const interviewerCounts: Record<string, number> = {};
    interviews.forEach(int => {
      int.interviewers.forEach(i => {
        interviewerCounts[i.interviewerId] = (interviewerCounts[i.interviewerId] || 0) + 1;
      });
    });
    const avgPerInterviewer = Object.values(interviewerCounts).length > 0
      ? Object.values(interviewerCounts).reduce((a, b) => a + b, 0) / Object.values(interviewerCounts).length
      : 0;

    // Peak scheduling times
    const hourCounts: Record<number, number> = {};
    interviews.forEach(int => {
      const hour = int.slot.start.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    // Interview type distribution
    const typeCounts: Record<InterviewType, number> = {} as Record<InterviewType, number>;
    interviews.forEach(int => {
      typeCounts[int.interviewType] = (typeCounts[int.interviewType] || 0) + 1;
    });
    const typeDistribution = Object.entries(typeCounts)
      .map(([type, count]) => ({ type: type as InterviewType, count }));

    return {
      totalScheduled: interviews.length,
      averageTimeToSchedule: avgTimeToSchedule,
      schedulingSuccessRate: interviews.length > 0
        ? (completed.length + interviews.filter(i => i.status === 'scheduled' || i.status === 'confirmed').length) / interviews.length
        : 0,
      rescheduleRate: interviews.length > 0 ? rescheduled.length / interviews.length : 0,
      noShowRate: interviews.length > 0 ? noShows.length / interviews.length : 0,
      averageInterviewsPerInterviewer: avgPerInterviewer,
      peakSchedulingTimes: peakTimes,
      interviewTypeDistribution: typeDistribution,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format date time for display
   */
  private formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get interview type label
   */
  getInterviewTypeLabel(type: InterviewType, language: 'en' | 'ar' = 'en'): string {
    return INTERVIEW_TYPE_LABELS[type][language];
  }

  /**
   * Get default duration for interview type
   */
  getDefaultDuration(type: InterviewType): number {
    return DEFAULT_DURATIONS[type];
  }
}

// Export singleton instance
export const interviewSchedulerService = new InterviewSchedulerService();

// Export types
export type { InterviewSchedulerService };
