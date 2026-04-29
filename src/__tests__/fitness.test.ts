import { describe, it, expect } from 'vitest';
import { evaluateFitness } from '../ga/fitness';
import { RecommendationSet, FitnessWeights, BehaviorRecord } from '../types';

const defaultWeights: FitnessWeights = {
  rating: 0.3,
  view: 0.1,
  click: 0.3,
  purchase: 0.3,
};

describe('evaluateFitness', () => {
  it('returns 0.0 for an empty product set', () => {
    const set: RecommendationSet = { productIds: [], fitnessScore: 0 };
    const ratings = new Map<string, number>();
    const behavior = new Map<string, BehaviorRecord>();

    const score = evaluateFitness(set, 1, ratings, behavior, defaultWeights);
    expect(score).toBe(0.0);
  });

  it('returns 0.0 when no interaction data exists for the user (Req 4.4)', () => {
    const set: RecommendationSet = { productIds: [10, 20, 30], fitnessScore: 0 };
    const ratings = new Map<string, number>();
    const behavior = new Map<string, BehaviorRecord>();

    const score = evaluateFitness(set, 1, ratings, behavior, defaultWeights);
    expect(score).toBe(0.0);
  });

  it('computes correct fitness with full interaction data', () => {
    const set: RecommendationSet = { productIds: [1, 2], fitnessScore: 0 };
    const userId = 5;

    // Product 1: rating 5 (normalized 1.0), viewed 1, clicked 1, purchased 1
    // Product 2: rating 3 (normalized 0.6), viewed 1, clicked 0, purchased 0
    const ratings = new Map<string, number>([
      ['5-1', 5],
      ['5-2', 3],
    ]);
    const behavior = new Map<string, BehaviorRecord>([
      ['5-1', { user_id: 5, product_id: 1, viewed: 1, clicked: 1, purchased: 1 }],
      ['5-2', { user_id: 5, product_id: 2, viewed: 1, clicked: 0, purchased: 0 }],
    ]);

    // avgRating = (1.0 + 0.6) / 2 = 0.8
    // avgView = (1 + 1) / 2 = 1.0
    // avgClick = (1 + 0) / 2 = 0.5
    // avgPurchase = (1 + 0) / 2 = 0.5
    // rawScore = 0.3*0.8 + 0.1*1.0 + 0.3*0.5 + 0.3*0.5
    //          = 0.24 + 0.1 + 0.15 + 0.15 = 0.64
    // weightSum = 0.3 + 0.1 + 0.3 + 0.3 = 1.0
    // normalized = 0.64 / 1.0 = 0.64

    const score = evaluateFitness(set, userId, ratings, behavior, defaultWeights);
    expect(score).toBeCloseTo(0.64, 5);
  });

  it('handles partial interaction data (some products have no data)', () => {
    const set: RecommendationSet = { productIds: [1, 2], fitnessScore: 0 };
    const userId = 5;

    // Only product 1 has data; product 2 has none → contributes 0.0
    const ratings = new Map<string, number>([['5-1', 5]]);
    const behavior = new Map<string, BehaviorRecord>([
      ['5-1', { user_id: 5, product_id: 1, viewed: 1, clicked: 1, purchased: 1 }],
    ]);

    // avgRating = (1.0 + 0) / 2 = 0.5
    // avgView = (1 + 0) / 2 = 0.5
    // avgClick = (1 + 0) / 2 = 0.5
    // avgPurchase = (1 + 0) / 2 = 0.5
    // rawScore = 0.3*0.5 + 0.1*0.5 + 0.3*0.5 + 0.3*0.5
    //          = 0.15 + 0.05 + 0.15 + 0.15 = 0.5
    // normalized = 0.5 / 1.0 = 0.5

    const score = evaluateFitness(set, userId, ratings, behavior, defaultWeights);
    expect(score).toBeCloseTo(0.5, 5);
  });

  it('normalizes correctly when weights do not sum to 1.0', () => {
    const set: RecommendationSet = { productIds: [1], fitnessScore: 0 };
    const userId = 1;

    // Perfect scores: rating 5 (1.0), all behavior 1
    const ratings = new Map<string, number>([['1-1', 5]]);
    const behavior = new Map<string, BehaviorRecord>([
      ['1-1', { user_id: 1, product_id: 1, viewed: 1, clicked: 1, purchased: 1 }],
    ]);

    const unevenWeights: FitnessWeights = {
      rating: 1.0,
      view: 1.0,
      click: 1.0,
      purchase: 1.0,
    };

    // All avg scores = 1.0
    // rawScore = 1*1 + 1*1 + 1*1 + 1*1 = 4.0
    // weightSum = 4.0
    // normalized = 4.0 / 4.0 = 1.0

    const score = evaluateFitness(set, userId, ratings, behavior, unevenWeights);
    expect(score).toBeCloseTo(1.0, 5);
  });

  it('returns 0.0 when all weights are zero', () => {
    const set: RecommendationSet = { productIds: [1], fitnessScore: 0 };
    const ratings = new Map<string, number>([['1-1', 5]]);
    const behavior = new Map<string, BehaviorRecord>([
      ['1-1', { user_id: 1, product_id: 1, viewed: 1, clicked: 1, purchased: 1 }],
    ]);

    const zeroWeights: FitnessWeights = { rating: 0, view: 0, click: 0, purchase: 0 };
    const score = evaluateFitness(set, 1, ratings, behavior, zeroWeights);
    expect(score).toBe(0.0);
  });

  it('score is always in [0.0, 1.0] range', () => {
    const set: RecommendationSet = { productIds: [1], fitnessScore: 0 };
    const userId = 1;

    // Perfect interaction data
    const ratings = new Map<string, number>([['1-1', 5]]);
    const behavior = new Map<string, BehaviorRecord>([
      ['1-1', { user_id: 1, product_id: 1, viewed: 1, clicked: 1, purchased: 1 }],
    ]);

    const score = evaluateFitness(set, userId, ratings, behavior, defaultWeights);
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(1.0);
  });

  it('handles rating-only data (no behavior records)', () => {
    const set: RecommendationSet = { productIds: [1, 2], fitnessScore: 0 };
    const userId = 1;

    const ratings = new Map<string, number>([
      ['1-1', 4],
      ['1-2', 2],
    ]);
    const behavior = new Map<string, BehaviorRecord>();

    // avgRating = (4/5 + 2/5) / 2 = (0.8 + 0.4) / 2 = 0.6
    // avgView = 0, avgClick = 0, avgPurchase = 0
    // rawScore = 0.3 * 0.6 = 0.18
    // normalized = 0.18 / 1.0 = 0.18

    const score = evaluateFitness(set, userId, ratings, behavior, defaultWeights);
    expect(score).toBeCloseTo(0.18, 5);
  });
});
