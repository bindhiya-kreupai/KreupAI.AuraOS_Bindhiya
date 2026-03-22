import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BackgroundCheckService,
  CandidateApplicationService,
  HiringPipelineService,
  InterviewFeedbackService,
  InterviewService,
  JobOfferService,
  JobPostingService,
  JobRequisitionService,
  RecruitmentSettingsService,
  RecruitmentAnalyticsService,
} from '@/app/dashboard/recruitment/services';

describe('dashboard recruitment services', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads dashboard job postings from the v1 recruitment jobs route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'job-1',
              title: 'Senior Frontend Engineer',
              department: 'Engineering',
              location: 'Remote',
              type: 'full_time',
              status: 'Active',
              createdAt: '2026-03-22T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
              _count: { candidateApplications: 7 },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const postings = await JobPostingService.getPostings({ isActive: true });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/jobs');
    expect(postings).toEqual([
      expect.objectContaining({
        id: 'job-1',
        jobTitle: 'Senior Frontend Engineer',
        isActive: true,
        applicationCount: 7,
        employmentMode: 'remote',
      }),
    ]);
  });

  it('maps requisitions from the v1 requisitions route into dashboard requisition types', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'req-1',
              jobTitle: 'Platform Engineer',
              department: 'Engineering',
              location: 'Remote',
              employmentType: 'full_time',
              numberOfPositions: 2,
              priority: 'High',
              status: 'Pending Approval',
              requestedDate: '2026-03-20T00:00:00.000Z',
              createdAt: '2026-03-20T00:00:00.000Z',
              updatedAt: '2026-03-21T00:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const requisitions = await JobRequisitionService.getRequisitions({ departmentId: 'Engineering' as any });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/requisitions');
    expect(requisitions).toEqual([
      expect.objectContaining({
        id: 'req-1',
        jobTitle: 'Platform Engineer',
        departmentName: 'Engineering',
        locationName: 'Remote',
        status: 'pending_approval',
        priority: 'high',
      }),
    ]);
  });

  it('unwraps requisition create responses and maps the returned record', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'req-1',
            jobTitle: 'Platform Engineer',
            department: 'Engineering',
            location: 'Remote',
            employmentType: 'full_time',
            numberOfPositions: 2,
            priority: 'High',
            status: 'Draft',
            requestedDate: '2026-03-20T00:00:00.000Z',
            createdAt: '2026-03-20T00:00:00.000Z',
            updatedAt: '2026-03-20T00:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const requisition = await JobRequisitionService.createRequisition({
      id: 'draft',
      requisitionNumber: 'REQ-DRAFT',
      jobTitle: 'Platform Engineer',
      departmentId: 'eng',
      departmentName: 'Engineering',
      locationId: 'remote',
      locationName: 'Remote',
      hiringManagerId: 'mgr-1',
      hiringManagerName: 'Manager One',
      jobType: 'full_time',
      experienceLevel: 'mid_level',
      employmentMode: 'remote',
      numberOfPositions: 2,
      positionsFilled: 0,
      status: 'draft',
      priority: 'high',
      jobDescription: 'Build platform systems',
      responsibilities: [],
      qualifications: [],
      skills: ['TypeScript'],
      salaryRange: { min: 100000, max: 140000, currency: 'USD' },
      requestedDate: '2026-03-20T00:00:00.000Z',
      createdAt: '2026-03-20T00:00:00.000Z',
      updatedAt: '2026-03-20T00:00:00.000Z',
    });
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toEqual(expect.objectContaining({
      jobTitle: 'Platform Engineer',
      department: 'Engineering',
      location: 'Remote',
      employmentType: 'full_time',
      priority: 'High',
      status: 'Draft',
    }));
    expect(requisition).toMatchObject({
      id: 'req-1',
      jobTitle: 'Platform Engineer',
      status: 'draft',
    });
  });

  it('maps v1 recruitment candidate payloads into dashboard applications', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'cand-1',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              phone: '+15551234567',
              location: 'Remote',
              source: 'linkedin',
              skills: ['React'],
              createdAt: '2026-03-01T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
              applications: [
                {
                  id: 'app-1',
                  candidateId: 'cand-1',
                  jobPostingId: 'job-1',
                  currentStage: 'SCREENING',
                  status: 'SCREENING',
                  appliedDate: '2026-03-01T00:00:00.000Z',
                  jobPosting: { id: 'job-1', title: 'Senior Frontend Engineer' },
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const applications = await CandidateApplicationService.getApplications({ status: 'screening' });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/candidates');
    expect(applications).toEqual([
      expect.objectContaining({
        id: 'cand-1',
        candidateId: 'cand-1',
        firstName: 'Jane',
        lastName: 'Doe',
        jobTitle: 'Senior Frontend Engineer',
        currentStage: 'screening',
        status: 'screening',
      }),
    ]);
  });

  it('translates screening updates into the legacy application update contract', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: 'app-1',
            candidateId: 'cand-1',
            candidate: {
              id: 'cand-1',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              createdAt: '2026-03-01T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
            },
            jobPosting: { id: 'job-1', title: 'Senior Frontend Engineer' },
            status: 'interview',
            currentStage: 'interview',
            appliedDate: '2026-03-01T00:00:00.000Z',
            updatedAt: '2026-03-22T00:00:00.000Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const application = await CandidateApplicationService.updateApplication('cand-1', {
      screeningStatus: 'shortlisted',
    } as any);
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/candidates/cand-1/stage');
    expect(requestInit.method).toBe('PUT');
    expect(body).toEqual({
      stage: 'HIRING_MANAGER_INTERVIEW',
      reason: undefined,
      notes: undefined,
    });
    expect(application).toMatchObject({
      id: 'cand-1',
      currentStage: 'interview',
      status: 'interview',
    });
  });

  it('uses the dedicated v1 stage route for dashboard stage moves', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'app-1',
            candidateId: 'cand-1',
            currentStage: 'HIRED',
            status: 'HIRED',
            appliedDate: '2026-03-01T00:00:00.000Z',
            candidate: {
              id: 'cand-1',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              createdAt: '2026-03-01T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
            },
            jobPosting: { id: 'job-1', title: 'Senior Frontend Engineer' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const application = await CandidateApplicationService.moveToStage('cand-1', 'hired', 'hired');
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/candidates/cand-1/stage');
    expect(requestInit.method).toBe('PUT');
    expect(body).toEqual({ stage: 'HIRED', status: 'hired' });
    expect(application).toMatchObject({ id: 'cand-1', currentStage: 'hired', status: 'hired' });
  });

  it('loads dashboard interviews from the v1 recruitment interviews route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'int-1',
              applicationId: 'app-1',
              type: 'technical',
              status: 'scheduled',
              scheduledDate: '2026-03-22T09:00:00.000Z',
              duration: 60,
              interviewerIds: ['emp-1'],
              interviewerNames: ['Alice Interviewer'],
              notes: 'Bring portfolio',
              createdAt: '2026-03-20T00:00:00.000Z',
              updatedAt: '2026-03-21T00:00:00.000Z',
              application: {
                candidate: { firstName: 'Jane', lastName: 'Doe' },
                jobPosting: { title: 'Senior Frontend Engineer' },
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const interviews = await InterviewService.getInterviews({ applicationId: 'app-1' });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/interviews');
    expect(interviews).toEqual([
      expect.objectContaining({
        id: 'int-1',
        applicationId: 'app-1',
        candidateName: 'Jane Doe',
        jobTitle: 'Senior Frontend Engineer',
        type: 'technical',
        status: 'scheduled',
      }),
    ]);
  });

  it('schedules dashboard interviews through the v1 recruitment interviews route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'int-1',
            applicationId: 'app-1',
            type: 'video',
            status: 'scheduled',
            scheduledDate: '2026-03-22T09:00:00.000Z',
            duration: 45,
            interviewerIds: ['emp-1'],
            interviewerNames: ['Alice Interviewer'],
            createdAt: '2026-03-20T00:00:00.000Z',
            updatedAt: '2026-03-20T00:00:00.000Z',
            application: {
              candidate: { firstName: 'Jane', lastName: 'Doe' },
              jobPosting: { title: 'Senior Frontend Engineer' },
            },
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const interview = await InterviewService.scheduleInterview({
      id: 'draft',
      applicationId: 'app-1',
      candidateName: 'Jane Doe',
      jobTitle: 'Senior Frontend Engineer',
      type: 'video',
      status: 'scheduled',
      scheduledDate: '2026-03-22T09:00:00.000Z',
      duration: 45,
      interviewers: [
        { id: 'emp-1', name: 'Alice Interviewer', email: 'alice@example.com', role: 'Recruiter', isPrimary: true },
      ],
      createdAt: '2026-03-20T00:00:00.000Z',
      updatedAt: '2026-03-20T00:00:00.000Z',
    });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/interviews');
    expect(requestInit.method).toBe('POST');
    expect(body).toEqual(expect.objectContaining({
      applicationId: 'app-1',
      type: 'video',
      scheduledDate: '2026-03-22T09:00:00.000Z',
      duration: 45,
      interviewerIds: ['emp-1'],
      interviewerNames: ['Alice Interviewer'],
    }));
    expect(interview).toMatchObject({
      id: 'int-1',
      candidateName: 'Jane Doe',
      jobTitle: 'Senior Frontend Engineer',
    });
  });

  it('keeps dashboard interview status updates on the legacy mutation route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: 'int-1',
            applicationId: 'app-1',
            type: 'technical',
            status: 'cancelled',
            scheduledDate: '2026-03-22T09:00:00.000Z',
            duration: 60,
            interviewerIds: ['emp-1'],
            interviewerNames: ['Alice Interviewer'],
            notes: 'Candidate withdrew',
            createdAt: '2026-03-20T00:00:00.000Z',
            updatedAt: '2026-03-21T00:00:00.000Z',
            application: {
              candidate: { firstName: 'Jane', lastName: 'Doe' },
              jobPosting: { title: 'Senior Frontend Engineer' },
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const interview = await InterviewService.cancelInterview('int-1', 'Candidate withdrew');
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/recruitment/interviews');
    expect(requestInit.method).toBe('PUT');
    expect(body).toEqual(expect.objectContaining({
      id: 'int-1',
      status: 'cancelled',
      notes: 'Candidate withdrew',
    }));
    expect(interview).toMatchObject({ id: 'int-1', status: 'cancelled' });
  });

  it('loads dashboard interview feedback from the legacy feedback route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'fb-1',
              interviewId: 'int-1',
              interviewerId: 'emp-1',
              interviewerName: 'Alice Interviewer',
              recommendation: 'HIRE',
              comments: 'Strong performance',
              strengths: 'System design',
              weaknesses: 'Domain context',
              criteria: {
                technicalSkills: 4,
                communication: 5,
                problemSolving: 4,
                cultureFit: 5,
              },
              submittedAt: '2026-03-22T10:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const feedback = await InterviewFeedbackService.getFeedback('int-1');
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/recruitment/interviews/feedback?interviewId=int-1');
    expect(feedback).toEqual([
      expect.objectContaining({
        id: 'fb-1',
        interviewId: 'int-1',
        interviewerName: 'Alice Interviewer',
        recommendation: 'hire',
        technicalSkills: 4,
        communicationSkills: 5,
      }),
    ]);
  });

  it('maps dashboard offers from the legacy offers route into dashboard offer types', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'offer-1',
              applicationId: 'app-1',
              candidateName: 'Jane Doe',
              jobTitle: 'Senior Frontend Engineer',
              department: 'Engineering',
              employmentType: 'full_time',
              salary: '120000',
              currency: 'USD',
              benefits: ['Health'],
              status: 'draft',
              startDate: '2026-04-01T00:00:00.000Z',
              createdAt: '2026-03-20T00:00:00.000Z',
              updatedAt: '2026-03-20T00:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const offers = await JobOfferService.getOffers();

    expect(offers).toEqual([
      expect.objectContaining({
        id: 'offer-1',
        candidateName: 'Jane Doe',
        departmentName: 'Engineering',
        jobType: 'full_time',
        salary: 120000,
        status: 'draft',
      }),
    ]);
  });

  it('maps dashboard background checks from the v1 singular route into page-friendly fields', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'bg-1',
              applicationId: 'app-1',
              candidateId: 'cand-1',
              checkType: 'criminal',
              provider: 'Checkr',
              status: 'in_progress',
              requestDate: '2026-03-20T00:00:00.000Z',
              result: null,
              notes: 'Pending vendor review',
              createdAt: '2026-03-20T00:00:00.000Z',
              updatedAt: '2026-03-21T00:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const checks = await BackgroundCheckService.getBackgroundChecks('app-1');
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/background-check?applicationId=app-1');
    expect(checks).toEqual([
      expect.objectContaining({
        id: 'bg-1',
        applicationId: 'app-1',
        candidateName: 'cand-1',
        vendorName: 'Checkr',
        status: 'in-progress',
        checkType: 'criminal',
        provider: 'Checkr',
        requestDate: '2026-03-20T00:00:00.000Z',
      }),
    ]);
  });

  it('maps hiring pipelines from the pipeline items envelope', async () => {
    const pipelineResponse = new Response(
      JSON.stringify({
        success: true,
        items: [
          {
            id: 'default-pipeline',
            name: 'Default Hiring Pipeline',
            isDefault: true,
            createdDate: '2026-03-20T00:00:00.000Z',
            updatedDate: '2026-03-21T00:00:00.000Z',
            stages: [
              { id: 'stage-1', name: 'Application Received', order: 1, isRequired: true, count: 10, type: 'Application' },
              { id: 'stage-2', name: 'Screening', order: 2, isRequired: true, count: 4, type: 'Screening' },
            ],
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    vi.mocked(fetch)
      .mockResolvedValueOnce(pipelineResponse.clone())
      .mockResolvedValueOnce(pipelineResponse.clone());

    const pipelines = await HiringPipelineService.getPipelines();
    const defaultPipeline = await HiringPipelineService.getDefaultPipeline();
    const firstRequestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(firstRequestUrl).toContain('/api/v1/recruitment/pipeline');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(pipelines).toEqual([
      expect.objectContaining({
        id: 'default-pipeline',
        name: 'Default Hiring Pipeline',
        isDefault: true,
        stages: [
          expect.objectContaining({ name: 'Application Received', order: 1, isRequired: true }),
          expect.objectContaining({ name: 'Screening', order: 2, isRequired: true }),
        ],
      }),
    ]);
    expect(defaultPipeline).toMatchObject({ id: 'default-pipeline', isDefault: true });
  });

  it('maps recruitment settings payloads into the flattened dashboard settings shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'settings-tenant-1',
          tenantId: 'tenant-1',
          general: { companyName: 'AuraOS Technologies' },
          applicationSettings: {
            customApplicationFields: [
              { id: 'field-1', question: 'Portfolio URL', isRequired: false, isDisqualifying: false },
            ],
          },
          offerSettings: { defaultOfferExpiryDays: 21 },
          backgroundCheckSettings: { requireForAllPositions: true },
          updatedDate: '2026-03-22T00:00:00.000Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const settings = await RecruitmentSettingsService.getSettings();
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/recruitment/settings');
    expect(settings).toMatchObject({
      defaultPipelineId: 'default-pipeline',
      applicationExpiryDays: 365,
      offerExpiryDays: 21,
      requireBackgroundCheck: true,
      screeningQuestions: [
        expect.objectContaining({ id: 'field-1', question: 'Portfolio URL' }),
      ],
    });
  });

  it('maps updated recruitment settings responses into the same flattened shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'settings-tenant-1',
          tenantId: 'tenant-1',
          general: { companyName: 'AuraOS Technologies' },
          offerSettings: { defaultOfferExpiryDays: 30 },
          backgroundCheckSettings: { requireForAllPositions: false },
          emailTemplates: [
            { id: 'email-1', name: 'Application Received', subject: 'Thanks', body: 'We received it', type: 'application_received' },
          ],
          updatedDate: '2026-03-22T00:00:00.000Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const settings = await RecruitmentSettingsService.updateSettings({ offerExpiryDays: 30 });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/recruitment/settings');
    expect(requestInit.method).toBe('PUT');
    expect(body).toEqual(expect.objectContaining({ offerExpiryDays: 30 }));
    expect(settings).toMatchObject({
      offerExpiryDays: 30,
      requireBackgroundCheck: false,
      emailTemplates: [
        expect.objectContaining({ id: 'email-1', name: 'Application Received' }),
      ],
    });
  });

  it('initiates background checks through the v1 singular route with mapped payloads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'bg-1',
            applicationId: 'app-1',
            candidateId: 'cand-1',
            checkType: 'criminal',
            provider: 'Checkr',
            status: 'pending',
            requestDate: '2026-03-20T00:00:00.000Z',
            notes: 'Run criminal check',
            createdAt: '2026-03-20T00:00:00.000Z',
            updatedAt: '2026-03-20T00:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const check = await BackgroundCheckService.initiateBackgroundCheck({
      id: 'draft',
      applicationId: 'app-1',
      candidateName: 'Jane Doe',
      status: 'not_started' as any,
      checks: [],
      vendorName: 'Checkr',
      requestedDate: '2026-03-20T00:00:00.000Z',
      createdAt: '2026-03-20T00:00:00.000Z',
      updatedAt: '2026-03-20T00:00:00.000Z',
      notes: 'Run criminal check',
      checkType: 'criminal',
      provider: 'Checkr',
      candidateId: 'cand-1',
    } as any);
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/background-check');
    expect(requestInit.method).toBe('POST');
    expect(body).toEqual(expect.objectContaining({
      applicationId: 'app-1',
      candidateId: 'cand-1',
      checkType: 'criminal',
      provider: 'Checkr',
      notes: 'Run criminal check',
    }));
    expect(check).toMatchObject({
      id: 'bg-1',
      applicationId: 'app-1',
      status: 'pending',
      provider: 'Checkr',
    });
  });

  it('updates background checks through the v1 item route with normalized payloads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'bg-1',
            applicationId: 'app-1',
            candidateId: 'cand-1',
            checkType: 'criminal',
            provider: 'Checkr',
            status: 'completed',
            requestDate: '2026-03-20T00:00:00.000Z',
            completionDate: '2026-03-22T00:00:00.000Z',
            result: 'clear',
            notes: 'Cleared',
            createdAt: '2026-03-20T00:00:00.000Z',
            updatedAt: '2026-03-22T00:00:00.000Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const check = await BackgroundCheckService.updateBackgroundCheck('bg-1', {
      status: 'completed' as any,
      overallResult: 'clear',
      notes: 'Cleared',
      provider: 'Checkr',
    } as any);
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/background-check/bg-1');
    expect(requestInit.method).toBe('PUT');
    expect(body).toEqual(expect.objectContaining({
      status: 'completed',
      result: 'clear',
      notes: 'Cleared',
      provider: 'Checkr',
    }));
    expect(check).toMatchObject({
      id: 'bg-1',
      status: 'completed',
      overallResult: 'clear',
      result: 'clear',
    });
  });

  it('uses the v1 offer e-sign action route for offer status updates', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: 'offer-1',
            applicationId: 'app-1',
            candidateName: 'Jane Doe',
            jobTitle: 'Senior Frontend Engineer',
            department: 'Engineering',
            employmentType: 'full_time',
            salary: '120000',
            currency: 'USD',
            benefits: ['Health'],
            status: 'sent',
            sentDate: '2026-03-22T00:00:00.000Z',
            startDate: '2026-04-01T00:00:00.000Z',
            createdAt: '2026-03-20T00:00:00.000Z',
            updatedAt: '2026-03-22T00:00:00.000Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const offer = await JobOfferService.sendOffer('offer-1');
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/offers/e-sign');
    expect(requestInit.method).toBe('POST');
    expect(body).toEqual(expect.objectContaining({
      offerId: 'offer-1',
      action: 'send',
    }));
    expect(offer).toMatchObject({ id: 'offer-1', status: 'sent' });
  });

  it('submits dashboard interview feedback through the v1 per-interview route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'fb-1',
            interviewId: 'int-1',
            interviewerId: 'emp-1',
            recommendation: 'HIRE',
            rating: 4.5,
            strengths: 'System design',
            weaknesses: 'Domain context',
            comments: 'Strong performance',
            criteria: {
              technicalSkills: 4,
              communication: 5,
              problemSolving: 4,
              cultureFit: 5,
            },
            submittedAt: '2026-03-22T10:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const feedback = await InterviewFeedbackService.submitFeedback({
      id: 'draft',
      interviewId: 'int-1',
      interviewerId: 'emp-1',
      interviewerName: 'Alice Interviewer',
      rating: 'yes',
      technicalSkills: 4,
      communicationSkills: 5,
      problemSolving: 4,
      cultureFit: 5,
      strengths: 'System design',
      concerns: 'Domain context',
      recommendation: 'hire',
      notes: 'Strong performance',
      submittedDate: '2026-03-22T10:00:00.000Z',
    });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/v1/recruitment/interviews/int-1/feedback');
    expect(requestInit.method).toBe('POST');
    expect(body).toEqual(expect.objectContaining({
      recommendation: 'HIRE',
      rating: 4.5,
      strengths: 'System design',
      weaknesses: 'Domain context',
      notes: 'Strong performance',
      technicalSkillsRating: 4,
      communicationRating: 5,
      cultureFitRating: 5,
      criteria: { problemSolving: 4 },
    }));
    expect(feedback).toMatchObject({
      id: 'fb-1',
      interviewId: 'int-1',
      recommendation: 'hire',
      technicalSkills: 4,
      communicationSkills: 5,
    });
  });

  it('loads dashboard analytics from the v1 recruitment stats route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            totalOpenPositions: 6,
            totalApplications: 24,
            totalInterviewsScheduled: 5,
            totalOffersMade: 2,
            totalHired: 1,
            averageTimeToHire: 18,
            offerAcceptanceRate: 50,
            sourceEffectiveness: [
              { source: 'linkedin', count: 10 },
            ],
            pipelineFunnel: [
              { stage: 'screening', count: 8 },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const analytics = await RecruitmentAnalyticsService.getStats();
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/v1/recruitment/stats');
    expect(analytics).toMatchObject({
      openRequisitions: 6,
      totalApplications: 24,
      interviewsScheduled: 5,
      offersExtended: 2,
      hires: 1,
      averageTimeToHire: 18,
      offerAcceptanceRate: 50,
      applicationsBySource: { linkedin: 10 },
      applicationsByStatus: { screening: 8 },
    });
  });
});