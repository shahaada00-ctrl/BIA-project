import { describe, it, expect } from 'vitest';
import { tournamentSelection, selectParents } from '../ga/selection';
import { RecommendationSet } from '../types';

function makeSet(ids: number[], fitness: number): RecommendationSet {
  return { productIds: ids, fitnessScore: fitness };
}

describe('tournamentSelection', () => {
  it('throws on empty population', () => {
    expect(() => tournamentSelection([], 3)).toThrow('Population must not be empty');
  });

  it('returns the only individual when population size is 1', () => {
    const pop = [makeSet([1, 2], 0.5)];
    const result = tournamentSelection(pop, 3);
    expect(result).toBe(pop[0]);
  });

  it('always returns the fittest when tournament size equals population size', () => {
    const pop = [
      makeSet([1, 2], 0.2),
      makeSet([3, 4], 0.9),
      makeSet([5, 6], 0.5),
    ];
    // With tournament size = population size, the fittest must always win
    for (let i = 0; i < 20; i++) {
      const result = tournamentSelection(pop, pop.length);
      expect(result.fitnessScore).toBe(0.9);
    }
  });

  it('returns a member of the population', () => {
    const pop = [
      makeSet([1], 0.1),
      makeSet([2], 0.4),
      makeSet([3], 0.7),
    ];
    for (let i = 0; i < 20; i++) {
      const result = tournamentSelection(pop, 2);
      expect(pop).toContain(result);
    }
  });

  it('clamps tournament size to population size', () => {
    const pop = [
      makeSet([1], 0.3),
      makeSet([2], 0.8),
    ];
    // Tournament size larger than population — should still work and pick the best
    for (let i = 0; i < 20; i++) {
      const result = tournamentSelection(pop, 100);
      expect(result.fitnessScore).toBe(0.8);
    }
  });

  it('clamps tournament size to at least 1', () => {
    const pop = [makeSet([1], 0.5)];
    const result = tournamentSelection(pop, 0);
    expect(result).toBe(pop[0]);
  });
});

describe('selectParents', () => {
  it('throws when population has fewer than 2 individuals', () => {
    expect(() => selectParents([makeSet([1], 0.5)], 3)).toThrow(
      'Population must have at least 2 individuals'
    );
  });

  it('returns two members of the population', () => {
    const pop = [
      makeSet([1], 0.2),
      makeSet([2], 0.5),
      makeSet([3], 0.8),
    ];
    const [p1, p2] = selectParents(pop, 2);
    expect(pop).toContain(p1);
    expect(pop).toContain(p2);
  });

  it('selects two distinct parents when population has distinct fitness scores', () => {
    const pop = [
      makeSet([1], 0.1),
      makeSet([2], 0.5),
      makeSet([3], 0.9),
    ];
    // Run multiple times — at least some should produce distinct parents
    let distinctCount = 0;
    for (let i = 0; i < 50; i++) {
      const [p1, p2] = selectParents(pop, 2);
      if (p1 !== p2) {
        distinctCount++;
      }
    }
    expect(distinctCount).toBeGreaterThan(0);
  });

  it('handles population of size 2', () => {
    const pop = [
      makeSet([1, 2], 0.3),
      makeSet([3, 4], 0.7),
    ];
    const [p1, p2] = selectParents(pop, 2);
    expect(pop).toContain(p1);
    expect(pop).toContain(p2);
  });
});
