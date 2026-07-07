import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CourseService,
  EnrollmentService,
  MentoringService,
  TrainingSessionService,
  ExternalTrainingService,
} from '@/app/dashboard/learning/services';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('learning dashboard services', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unwraps the { success, data } envelope for courses into a plain array', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [{ id: 'c1', title: 'Safety' }] })
    );

    const courses = await CourseService.getCourses();

    expect(Array.isArray(courses)).toBe(true);
    expect(courses).toHaveLength(1);
    expect(courses[0]).toMatchObject({ id: 'c1', title: 'Safety' });
  });

  it('returns an empty array when the courses payload is empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: [] }));

    const courses = await CourseService.getCourses();

    expect(courses).toEqual([]);
  });

  it('flattens active + past mentorship matches from the v1 mentorship endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          userId: 'emp-1',
          activeMatches: [{ id: 'm1', status: 'active' }],
          pastMatches: [{ id: 'm2', status: 'completed' }],
          availableMentors: [],
        },
      })
    );

    const programs = await MentoringService.getMentoringPrograms({ menteeId: 'emp-1' });

    expect(programs.map((p: { id: string }) => p.id)).toEqual(['m1', 'm2']);

    // Verify the mentorship service targets the v1 route, not a missing legacy one.
    const calledUrl = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(calledUrl).toContain('/api/v1/learning/mentorship');
  });

  it('calls the training-sessions attendance sub-route when marking attendance', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [{ id: 'att-1', status: 'present' }] })
    );

    await TrainingSessionService.markAttendance('sess-1', 'emp-1', 'present');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain('/api/learning/training-sessions/sess-1/attendance');
    expect(init?.method).toBe('POST');
  });

  it('routes external-training approval through the approve sub-route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 'ext-1', status: 'approved' } })
    );

    const result = await ExternalTrainingService.approveExternalTraining('ext-1', 'approve');

    expect(result).toMatchObject({ id: 'ext-1', status: 'approved' });
    const calledUrl = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(calledUrl).toContain('/api/learning/external-training/ext-1/approve');
  });

  it('maps enrollment approve/reject to the correct status updates', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { id: 'e1', status: 'in_progress' } })
      )
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { id: 'e1', status: 'withdrawn' } })
      );

    const approved = await EnrollmentService.approveEnrollment('e1');
    expect(approved).toMatchObject({ status: 'in_progress' });

    const rejected = await EnrollmentService.rejectEnrollment('e1');
    expect(rejected).toMatchObject({ status: 'withdrawn' });

    const rejectBody = JSON.parse(String(vi.mocked(fetch).mock.calls[1][1]?.body));
    expect(rejectBody).toMatchObject({ id: 'e1', status: 'withdrawn' });
  });
});
