import { describe, it, expect } from 'vitest';
import { mutate } from '../ga/mutation';
import { RecommendationSet } from '../types';

describe('mutate', () => {
  const catalog = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns a new RecommendationSet with fitnessScore 0', () => {
    const set: RecommendationSet = { productIds: [1, 2, 3], fitnessScore: 0.8 };
    const result = mutate(set, 0, catalog);
    expect(result.fitnessScore).toBe(0);
    expect(result).not.toBe(set); // new object
  });

  it('does not mutate any position when mutationRate is 0', () => {
    const set: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const result = mutate(set, 0, catalog);
    expect(result.productIds).toEqual([1, 2, 3, 4, 5]);
  });

  it('mutates all positions when mutationRate is 1', () => {
    const set: RecommendationSet = { productIds: [1, 2, 3], fitnessScore: 0.5 };
    const result = mutate(set, 1, catalog);
    // Every product should be replaced with one NOT in the original set
    for (const id of result.productIds) {
      expect(catalog).toContain(id);
    }
    // No duplicates
    expect(new Set(result.productIds).size).toBe(result.productIds.length);
  });

  it('produces no duplicate products', () => {
    const set: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      const result = mutate(set, 0.5, catalog);
      expect(new Set(result.productIds).size).toBe(result.productIds.length);
    }
  });

  it('replacement products come from the catalog', () => {
    const set: RecommendationSet = { productIds: [1, 2, 3], fitnessScore: 0.5 };
    for (let i = 0; i < 50; i++) {
      const result = mutate(set, 1, catalog);
      for (const id of result.productIds) {
        expect(catalog).toContain(id);
      }
    }
  });

  it('preserves set length', () => {
    const set: RecommendationSet = { productIds: [1, 2, 3, 4, 5], fitnessScore: 0.5 };
    const result = mutate(set, 0.5, catalog);
    expect(result.productIds.length).toBe(5);
  });

  it('does not modify the original set', () => {
    const original = [1, 2, 3, 4, 5];
    const set: RecommendationSet = { productIds: [...original], fitnessScore: 0.5 };
    mutate(set, 1, catalog);
    expect(set.productIds).toEqual(original);
  });

  it('handles case where catalog equals the set (no replacements possible)', () => {
    const smallCatalog = [1, 2, 3];
    const set: RecommendationSet = { productIds: [1, 2, 3], fitnessScore: 0.5 };
    // With rate 1, all positions try to mutate but no candidates available
    const result = mutate(set, 1, smallCatalog);
    expect(result.productIds).toEqual([1, 2, 3]);
    expect(new Set(result.productIds).size).toBe(3);
  });
});
