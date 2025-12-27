/**
 * Performance Management Client Service
 * Centralized API calls for all performance management operations
 */

// ===== Performance Goals =====
export const performanceGoals = {
  async getGoals(params?: {
    employeeId?: string;
    status?: string;
    cycleId?: string;
    type?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/goals?${query}`);
    return response.json();
  },

  async createGoal(data: {
    title: string;
    description?: string;
    type: 'INDIVIDUAL' | 'TEAM' | 'ORGANIZATIONAL';
    category?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    weightage?: number;
    startDate: string;
    dueDate: string;
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
    progress?: number;
    cycleId?: string;
    employeeId: string;
  }) {
    const response = await fetch('/api/performance/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateGoal(data: {
    id: string;
    title?: string;
    description?: string;
    type?: 'INDIVIDUAL' | 'TEAM' | 'ORGANIZATIONAL';
    category?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    weightage?: number;
    startDate?: string;
    dueDate?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
    progress?: number;
    cycleId?: string;
  }) {
    const response = await fetch('/api/performance/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteGoal(id: string) {
    const response = await fetch(`/api/performance/goals?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ===== Review Cycles =====
export const reviewCycles = {
  async getCycles(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/cycles?${query}`);
    return response.json();
  },

  async createCycle(data: {
    name: string;
    description?: string;
    type: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'PROBATION';
    startDate: string;
    endDate: string;
    reviewDueDate: string;
    status?: 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED';
  }) {
    const response = await fetch('/api/performance/cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateCycle(data: {
    id: string;
    name?: string;
    description?: string;
    type?: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'PROBATION';
    startDate?: string;
    endDate?: string;
    reviewDueDate?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED';
  }) {
    const response = await fetch('/api/performance/cycles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteCycle(id: string) {
    const response = await fetch(`/api/performance/cycles?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ===== Performance Reviews =====
export const performanceReviews = {
  async getReviews(params?: {
    employeeId?: string;
    reviewerId?: string;
    cycleId?: string;
    status?: string;
    reviewType?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/reviews?${query}`);
    return response.json();
  },

  async createReview(data: {
    cycleId: string;
    employeeId: string;
    reviewerId: string;
    reviewType: 'SELF' | 'MANAGER' | 'PEER' | 'SUBORDINATE' | 'THREE_SIXTY';
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    overallRating?: number;
    overallComments?: string;
    strengths?: string;
    areasForImprovement?: string;
    selfAssessment?: any;
    managerAssessment?: any;
    competencyRatings?: any;
  }) {
    const response = await fetch('/api/performance/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateReview(data: {
    id: string;
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    overallRating?: number;
    overallComments?: string;
    strengths?: string;
    areasForImprovement?: string;
    selfAssessment?: any;
    managerAssessment?: any;
    competencyRatings?: any;
    approvedBy?: string;
  }) {
    const response = await fetch('/api/performance/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteReview(id: string) {
    const response = await fetch(`/api/performance/reviews?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async submitReview(id: string) {
    return this.updateReview({ id, status: 'SUBMITTED' });
  },

  async approveReview(id: string, approvedBy: string) {
    return this.updateReview({ id, status: 'APPROVED', approvedBy });
  },

  async rejectReview(id: string) {
    return this.updateReview({ id, status: 'REJECTED' });
  },
};

// ===== Competencies =====
export const performanceCompetencies = {
  async getCompetencies(params?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/competencies?${query}`);
    return response.json();
  },

  async createCompetency(data: {
    name: string;
    description?: string;
    category: string;
    type: 'TECHNICAL' | 'CORE' | 'LEADERSHIP';
    levels: Array<{
      level: number;
      name: string;
      description: string;
    }>;
    isActive?: boolean;
  }) {
    const response = await fetch('/api/performance/competencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Feedback =====
export const performanceFeedback = {
  async getFeedback(params?: {
    employeeId?: string;
    providedBy?: string;
    type?: string;
    isPrivate?: boolean;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/feedback?${query}`);
    return response.json();
  },

  async createFeedback(data: {
    employeeId: string;
    providedBy: string;
    type: 'RECOGNITION' | 'CONSTRUCTIVE' | 'CONTINUOUS' | 'FORMAL';
    content: string;
    isPrivate?: boolean;
    isAnonymous?: boolean;
    tags?: string[];
  }) {
    const response = await fetch('/api/performance/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Development Plans =====
export const developmentPlans = {
  async getPlans(params?: {
    employeeId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/development-plans?${query}`);
    return response.json();
  },

  async createPlan(data: {
    employeeId: string;
    title: string;
    description?: string;
    goals: Array<{
      title: string;
      targetDate: string;
      status: string;
    }>;
    actions: Array<{
      action: string;
      dueDate: string;
      status: string;
    }>;
    resources?: {
      budget?: number;
      currency?: string;
      materials?: string[];
    };
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    targetDate: string;
    progress?: number;
  }) {
    const response = await fetch('/api/performance/development-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updatePlan(data: {
    id: string;
    title?: string;
    description?: string;
    goals?: Array<{
      title: string;
      targetDate: string;
      status: string;
    }>;
    actions?: Array<{
      action: string;
      dueDate: string;
      status: string;
    }>;
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    progress?: number;
  }) {
    const response = await fetch('/api/performance/development-plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== One-on-One Meetings =====
export const oneOnOneMeetings = {
  async getMeetings(params?: {
    employeeId?: string;
    managerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/one-on-one?${query}`);
    return response.json();
  },

  async scheduleMeeting(data: {
    employeeId: string;
    managerId: string;
    scheduledDate: string;
    duration: number;
    agenda?: Array<{
      topic: string;
      duration: number;
    }>;
  }) {
    const response = await fetch('/api/performance/one-on-one', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateMeeting(data: {
    id: string;
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
    notes?: string;
    actionItems?: Array<{
      action: string;
      owner: string;
      dueDate: string;
    }>;
    nextSteps?: string;
  }) {
    const response = await fetch('/api/performance/one-on-one', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async completeMeeting(id: string, notes: string, actionItems: Array<{ action: string; owner: string; dueDate: string }>, nextSteps?: string) {
    return this.updateMeeting({
      id,
      status: 'COMPLETED',
      notes,
      actionItems,
      nextSteps
    });
  },
};

// ===== Calibration =====
export const calibration = {
  async getSessions(params?: {
    cycleId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/performance/calibration?${query}`);
    return response.json();
  },

  async createSession(data: {
    cycleId: string;
    name: string;
    participants: string[];
    meetingDate: string;
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  }) {
    const response = await fetch('/api/performance/calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateSession(data: {
    id: string;
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    decisions?: {
      adjustments: Array<{
        employeeId: string;
        originalRating: number;
        calibratedRating: number;
        reason: string;
      }>;
    };
    notes?: string;
  }) {
    const response = await fetch('/api/performance/calibration', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
