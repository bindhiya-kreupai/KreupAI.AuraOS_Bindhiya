/**
 * Engagement service-layer tests.
 *
 * Focus: the AURA-094 wrapped-envelope bug — services must return plain
 * arrays/objects even when the API responds with `{ success, data, meta }`.
 * Also verifies the mutation endpoints and payloads wired in AURA-095..104.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type * as ApiClientModule from '@/lib/api-client';

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('@/lib/api-client');
  return {
    APIClient: {
      get: (...a: unknown[]) => get(...a),
      post: (...a: unknown[]) => post(...a),
      put: (...a: unknown[]) => put(...a),
      unwrapList: actual.APIClient.unwrapList,
      unwrapItem: actual.APIClient.unwrapItem,
    },
  };
});

import {
  SurveyService,
  EventService,
  InnovationService,
  CSRService,
  ClassifiedService,
  RewardService,
  ReferralService,
} from '../services';

const wrapped = (data: unknown) => ({ success: true, data, meta: { timestamp: 'x' } });

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  put.mockReset();
});

describe('wrapped-list unwrapping (AURA-094)', () => {
  it('SurveyService.getSurveys returns array from { success, data, meta }', async () => {
    get.mockResolvedValueOnce(wrapped([{ id: 's1' }, { id: 's2' }]));
    const surveys = await SurveyService.getSurveys();
    expect(Array.isArray(surveys)).toBe(true);
    expect(surveys).toHaveLength(2);
  });

  it('EventService.getEvents unwraps wrapped list', async () => {
    get.mockResolvedValueOnce(wrapped([{ id: 'e1' }]));
    const events = await EventService.getEvents();
    expect(events).toEqual([{ id: 'e1' }]);
  });

  it('returns [] when payload is empty envelope', async () => {
    get.mockResolvedValueOnce(wrapped([]));
    expect(await InnovationService.getIdeas()).toEqual([]);
  });
});

describe('mutations hit the right endpoints (AURA-095..104)', () => {
  it('submitResponse posts to /engagement/survey-responses', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'r1' }));
    await SurveyService.submitResponse({ surveyId: 's1', answers: { rating: 5 }, sentiment: 5 });
    expect(post).toHaveBeenCalledWith('/engagement/survey-responses', {
      surveyId: 's1',
      answers: { rating: 5 },
      sentiment: 5,
    });
  });

  it('createRSVP posts to /engagement/rsvps without a client id', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'rsvp1' }));
    await EventService.createRSVP({ eventId: 'e1', status: 'GOING' });
    expect(post).toHaveBeenCalledWith('/engagement/rsvps', { eventId: 'e1', status: 'GOING' });
  });

  it('voteIdea posts to the idea vote sub-route', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'i1', voteCount: 3 }));
    const updated = await InnovationService.voteIdea('i1', 'up');
    expect(post).toHaveBeenCalledWith('/engagement/ideas/i1/vote', { voteType: 'up' });
    expect(updated).toEqual({ id: 'i1', voteCount: 3 });
  });

  it('CSRService.volunteer posts to the volunteer sub-route', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'c1', volunteersRegistered: 1 }));
    await CSRService.volunteer('c1');
    expect(post).toHaveBeenCalledWith('/engagement/csr-activities/c1/volunteer', {});
  });

  it('ClassifiedService uses the dedicated classifieds endpoint (AURA-102)', async () => {
    get.mockResolvedValueOnce(wrapped([{ id: 'ad1' }]));
    const ads = await ClassifiedService.getClassifieds();
    expect(get).toHaveBeenCalledWith('/engagement/classifieds');
    expect(ads).toEqual([{ id: 'ad1' }]);
  });

  it('RewardService.getBalance unwraps a numeric balance (AURA-103)', async () => {
    get.mockResolvedValueOnce(wrapped({ balance: 120 }));
    const bal = await RewardService.getBalance();
    expect(get).toHaveBeenCalledWith('/engagement/rewards/balance');
    expect(bal.balance).toBe(120);
  });

  it('ReferralService.getReferrals uses the referrals endpoint (AURA-104)', async () => {
    get.mockResolvedValueOnce(wrapped([{ id: 'ref1', candidateName: 'Jane' }]));
    const refs = await ReferralService.getReferrals();
    expect(get).toHaveBeenCalledWith('/engagement/referrals');
    expect(refs[0].candidateName).toBe('Jane');
  });
});
