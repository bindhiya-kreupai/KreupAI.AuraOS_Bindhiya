/**
 * Gamification service-layer tests (AURA-086..092).
 *
 * Focus: services must unwrap the `{ success, data, meta }` envelope into plain
 * arrays/objects, and the mutation endpoints must hit the right routes with the
 * right payloads. Mirrors the engagement service tests.
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
  PointsService,
  BadgesService,
  ChallengesService,
  LeaderboardsService,
  MissionsService,
  VirtualCurrencyService,
  LevelsService,
} from '../services';

const wrapped = (data: unknown) => ({ success: true, data, meta: { timestamp: 'x' } });

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  put.mockReset();
});

describe('wrapped-envelope unwrapping', () => {
  it('PointsService.getAllAccounts returns array from wrapped list', async () => {
    get.mockResolvedValueOnce(wrapped([{ userId: 'e1' }, { userId: 'e2' }]));
    const accounts = await PointsService.getAllAccounts();
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts).toHaveLength(2);
  });

  it('PointsService.getAccount unwraps wrapped item', async () => {
    get.mockResolvedValueOnce(wrapped({ userId: 'e1', currentBalance: 500 }));
    const acc = await PointsService.getAccount('e1');
    expect(acc).toMatchObject({ userId: 'e1', currentBalance: 500 });
  });

  it('BadgesService.getBadges unwraps wrapped list', async () => {
    get.mockResolvedValueOnce(wrapped([{ badgeId: 'b1', title: 'First Steps' }]));
    const badges = await BadgesService.getBadges();
    expect(badges).toEqual([{ badgeId: 'b1', title: 'First Steps' }]);
  });

  it('ChallengesService.getChallenges tolerates empty list', async () => {
    get.mockResolvedValueOnce(wrapped([]));
    const challenges = await ChallengesService.getChallenges();
    expect(challenges).toEqual([]);
  });

  it('LeaderboardsService.getLeaderboards passes scope and unwraps', async () => {
    get.mockResolvedValueOnce(wrapped([{ rank: 1, name: 'A' }]));
    const board = await LeaderboardsService.getLeaderboards('team');
    expect(get).toHaveBeenCalledWith('/gamification/leaderboards', { scope: 'team' });
    expect(board).toHaveLength(1);
  });

  it('MissionsService.getMissions unwraps wrapped list', async () => {
    get.mockResolvedValueOnce(wrapped([{ missionId: 'm1' }]));
    const missions = await MissionsService.getMissions();
    expect(missions).toEqual([{ missionId: 'm1' }]);
  });

  it('LevelsService.getLevelDefinitions unwraps wrapped list', async () => {
    get.mockResolvedValueOnce(wrapped([{ level: 1 }, { level: 2 }]));
    const levels = await LevelsService.getLevelDefinitions();
    expect(levels).toHaveLength(2);
  });
});

describe('mutation endpoints', () => {
  it('PointsService.redeemPoints posts to redeem endpoint', async () => {
    post.mockResolvedValueOnce(wrapped({ transactionId: 't1' }));
    await PointsService.redeemPoints('e1', 100, 'reward');
    expect(post).toHaveBeenCalledWith('/gamification/points/transactions/redeem', {
      userId: 'e1',
      points: 100,
      reason: 'reward',
    });
  });

  it('ChallengesService.joinChallenge posts to join endpoint', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'p1' }));
    await ChallengesService.joinChallenge('e1', 'Name', 'c1');
    expect(post).toHaveBeenCalledWith('/gamification/challenges/join', {
      userId: 'e1',
      userName: 'Name',
      challengeId: 'c1',
    });
  });

  it('VirtualCurrencyService.transfer posts recipient and amount', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'x' }));
    await VirtualCurrencyService.transfer('e2', 50, 'gift');
    expect(post).toHaveBeenCalledWith('/gamification/currency/transfer', {
      toUserId: 'e2',
      amount: 50,
      note: 'gift',
    });
  });

  it('VirtualCurrencyService.cashOut posts amount', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'x', usdValue: 0.5 }));
    await VirtualCurrencyService.cashOut(50);
    expect(post).toHaveBeenCalledWith('/gamification/currency/cashout', { amount: 50 });
  });

  it('MissionsService.startMission posts to start endpoint', async () => {
    post.mockResolvedValueOnce(wrapped({ id: 'um1' }));
    await MissionsService.startMission('e1', 'Name', 'm1');
    expect(post).toHaveBeenCalledWith('/gamification/missions/start', {
      userId: 'e1',
      userName: 'Name',
      missionId: 'm1',
    });
  });
});
