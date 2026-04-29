import { describe, it, expect, vi } from 'vitest';
import { singlePointCrossover } from '../ga/crossover';
import { RecommendationSet } from '../types';

describe('singlePointCrossover', () => {
  const catalog = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  it('returns two offspring with fitnessScore 0', () => {
    const p1: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.9 };
    const p2: RecommendationSet = { productIds: [6, 7, 8, 9, 10], fitnessScore: 0.8 };

    const [o1, o2] = singlePointCrossover(p1, p2, catalog);

    expect(o1.fitnessScore).toBe(0);
    expect(o2.fitnessScore).toBe(0);
  });

  it('offspring have the same length as parents', () => {
    const p1: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const p2: RecommendationSet = { productIds: [6, 7, 8, 9, 10], fitnessScore: 0.5 };

    const [o1, o2] = singlePointCrossover(p1, p2, catalog);

    expect(o1.productIds.length).toBe(5);
    expect(o2.productIds.length).toBe(5);
  });

  it('offspring contain no duplicate product IDs', () => {
    const p1: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const p2: RecommendationSet = { productIds: [3, 4, 5, 6, 7], fitnessScore: 0.5 };

    const [o1, o2] = singlePointCrossover(p1, p2, catalog);

    expect(new Set(o1.productIds).size).toBe(o1.productIds.length);
    expect(new Set(o2.productIds).size).toBe(o2.productIds.length);
  });

  it('all offspring products come from the catalog', () => {
    const p1: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const p2: RecommendationSet = { productIds: [3, 4, 5, 6, 7], fitnessScore: 0.5 };
    const catalogSet = new Set(catalog);

    const [o1, o2] = singlePointCrossover(p1, p2, catalogSet.size ? catalog : catalog);

    for (const id of o1.productIds) {
      expect(catalogSet.has(id)).toBe(true);
    }
    for (const id of o2.productIds) {
      expect(catalogSet.has(id)).toBe(true);
    }
  });

  it('offspring inherit products from both parents at a known crossover point', () => {
    // Fix Math.random to produce a known crossover point
    // With length 5, crossoverPoint = 1 + Math.floor(random * 4)
    // If random returns 0.5 → crossoverPoint = 1 + Math.floor(2) = 3
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const p1: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const p2: RecommendationSet = { productIds: [6, 7, 8, 9, 10], fitnessScore: 0.5 };

    const [o1, o2] = singlePointCrossover(p1, p2, catalog);

    // crossoverPoint = 3: o1 = p1[0..3] + p2[3..5] = [1,2,3,9,10]
    expect(o1.productIds).toEqual([1, 2, 3, 9, 10]);
    // o2 = p2[0..3] + p1[3..5] = [6,7,8,4,5]
    expect(o2.productIds).toEqual([6, 7, 8, 4, 5]);

    mockRandom.mockRestore();
  });

  it('handles parents with overlapping products by replacing duplicates', () => {
    // Parents share products 3, 4, 5 — crossover will create duplicates
    const mockRandom = vi.spyOn(Math, 'random');
    // First call: crossover point → 0.25 → 1 + floor(0.25*4) = 2
    // Subsequent calls: for picking replacements from candidates
    mockRandom.mockReturnValueOnce(0.25);

    const p1: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const p2: RecommendationSet = { productIds: [3, 4, 5, 6, 7], fitnessScore: 0.5 };

    // After crossover point 2:
    // raw o1 = [1, 2] + [5, 6, 7] = [1, 2, 5, 6, 7] — no duplicates
    // raw o2 = [3, 4] + [3, 4, 5] = [3, 4, 3, 4, 5] — duplicates at positions 2, 3

    // For replacement picks, mock returns 0 (first candidate)
    mockRandom.mockReturnValue(0);

    const [o1, o2] = singlePointCrossover(p1, p2, catalog);

    // o1 should have no duplicates
    expect(new Set(o1.productIds).size).toBe(5);
    // o2 should have no duplicates
    expect(new Set(o2.productIds).size).toBe(5);

    mockRandom.mockRestore();
  });

  it('works with parents of length 2 (minimum meaningful crossover)', () => {
    const p1: RecommendationSet = { productIds: [1, 2], fitnessScore: 0.5 };
    const p2: RecommendationSet = { productIds: [3, 4], fitnessScore: 0.5 };

    const [o1, o2] = singlePointCrossover(p1, p2, catalog);

    expect(o1.productIds.length).toBe(2);
    expect(o2.productIds.length).toBe(2);
    expect(new Set(o1.productIds).size).toBe(2);
    expect(new Set(o2.productIds).size).toBe(2);
  });
});
